import { AuthGuard } from "@nestjs/passport";
import {
  Controller,
  Get,
  Post,
  UnauthorizedException,
  Req,
  Res,
  UseGuards,
  HttpCode,
  Param,
  HttpException,
  HttpStatus,
  Body,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiBody, ApiProperty } from "@nestjs/swagger";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";
import { JwtGuard } from "./strategy/jwt.guard";
import { Oauth2Guard } from "./strategy/oauth2.guard";
import { profile } from "console";
import { User } from "@prisma/client";
import {
  Oauth22faGuard,
  SavedAuth,
  savedauth,
} from "./strategy/oauth2-2fa.guard";
import { IsNotEmpty, IsOptional, IsString, Length, Max, Min } from "class-validator";

class RegisterForm {
  @ApiProperty()
  @Length(2,20)
  @IsString()
  @IsNotEmpty()
  username: string;
  
  @ApiProperty()
  @Length(2,20)
  @IsString()
  @IsNotEmpty()
  password: string;
}

class LoginForm {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;
  
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
  
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  twofa: string;
}

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  @Get("login42")
  @UseGuards(Oauth2Guard)
  @UseGuards(Oauth22faGuard)
  async login42(@Req() req: any, @Res() res: any): Promise<any> {
    const { accessToken, refreshToken } = req.user;
    const profile42 = await this.authService.get42Profile(accessToken);

    let alreadyTakeID = await this.userService.getUserBy42ID(profile42.id);

    let alreadyTakeUsername = await this.userService.getUserByUsername(
      profile42.login
    );

    if (!alreadyTakeID && alreadyTakeUsername)
      throw new HttpException(
        "A user with this login already exist sorry, you can't play",
        HttpStatus.BAD_REQUEST
      );

    try {
      await this.userService.createUser(
        profile42.login,
        profile42.id,
        undefined
      );
    } catch (error) {}

    let user: User = await this.userService.getUserBy42ID(profile42.id);

    const jwt = await this.authService.generateJwtToken(
      user.id,
      "accessToken",
      "refreshToken"
    );

    if (user.enable2fa) {
      let sa: SavedAuth = {
        code: req.query.code,
        jwt: jwt,
        twofa_secret: user.secret2fa,
      };
      savedauth.push(sa);
      throw new HttpException(
        "You need to put your 2fa code.",
        HttpStatus.FORBIDDEN
      );
    }
    throw new HttpException(jwt, HttpStatus.ACCEPTED);
  }

  @Post("registerLocal")
  @ApiBody({ type: RegisterForm })
  async registerLocal(
    @Body() body: RegisterForm,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    let user = await this.userService.getUserByUsername(body.username);
    if (user)
      throw new HttpException(
        "This user already exist.",
        HttpStatus.BAD_REQUEST
      );
    else {
      await this.userService.createUser(
        body.username,
        undefined,
        body.password
      );
      throw new HttpException(
        "Your account has been created.",
        HttpStatus.ACCEPTED
      );
    }
  }

  @Post("loginLocal")
  @ApiBearerAuth()
  @ApiBody({ type: LoginForm })
  async loginLocal(
    @Body() body: LoginForm,
    @Req() req: any,
    @Res() res: any
  ): Promise<any> {
    const user = await this.authService.validateUserLocal(
      body.username,
      body.password
    );
    if (user) {
      if (user.enable2fa) {
        const twofaIsOk = this.authService.isTwoFactorAuthenticationCodeValid(
          body.twofa,
          user.secret2fa
        );
        if (!twofaIsOk)
          throw new HttpException(
            "You must provide your 2fa code",
            HttpStatus.FORBIDDEN
          );
      }
      const jwt = await this.authService.generateJwtToken(
        user.id,
        "accessToken",
        "refreshToken"
      );
      throw new HttpException(jwt, HttpStatus.ACCEPTED);
    } else {
      throw new HttpException(
        "No user found (can be a password error)",
        HttpStatus.NOT_FOUND
      );
    }
  }

  /// 2FA ///

  @Get("2fa/turn-on/:code")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  async turnOnTwoFactorAuthentication(@Req() req, @Param("code") code : string) {
    const user = await this.userService.getUser(req.user.id);
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      code,
      user.secret2fa
    );
    if (!isCodeValid)
      throw new UnauthorizedException("Wrong authentication code");
      else {
        await this.userService.turnOnTwoFactorAuthentication(req.user.id);
        throw new HttpException(
        "Your 2fa has been activated",
        HttpStatus.ACCEPTED
      );}
    }
    
    @Get("2fa/turn-off/:code")
    @ApiBearerAuth()
    @UseGuards(JwtGuard)
    async turnOffTwoFactorAuthentication(@Req() req: any, @Param("code") code : string) {
      const user = await this.userService.getUser(req.user.id);
      const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
        code,
        user.secret2fa
      );
      if (!isCodeValid)
        throw new UnauthorizedException("Wrong authentication code");
      else {
        await this.userService.turnOffTwoFactorAuthentication(req.user.id);
        throw new HttpException(
          "Your 2fa has been deactivated",
          HttpStatus.ACCEPTED
      );}
  }

  @Get("2fa/generate")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  async register(@Res() response, @Req() request) {
    const otpAuthUrl =
      await this.authService.generateTwoFactorAuthenticationSecret(
        request.user
      );

    return response.json(
      await this.authService.generateQrCodeDataURL(otpAuthUrl.otpauthUrl)
    );
  }
}
