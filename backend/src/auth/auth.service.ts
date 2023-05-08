import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import axios from "axios";
import { fortyTwoProfileDto } from "./dto/fortyTwoProfile.dto";
import { JwtPayload } from "./strategy/jwt.strategy";
import { User } from "@prisma/client";
import { authenticator } from "otplib";
import { UserService } from "src/user/user.service";
import { toDataURL } from "qrcode";
const bcrypt = require("bcrypt");

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private userService: UserService
  ) {}

  validateUserLocal = async (
    username: string,
    password: string
  ): Promise<User | null> => {
    let user = await this.userService.getUserByUsername(username);
    let sucess = false;
    if (user) {
      if (user.password != null) sucess = await bcrypt.compare(password, user.password);
    }
    if (sucess) return user;
    else return null;
  };

  generateJwtToken = async (
    id: number,
    accessToken: string,
    refreshToken: string
  ): Promise<string> => {
    const payload: JwtPayload = {
      id: id,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };

    return this.jwtService.sign(payload);
  };

  get42Profile = (
    accessToken: string
  ): Promise<undefined | fortyTwoProfileDto> => {
    const base_url = this.configService.getOrThrow<string>("42_API_URL");
    return axios
      .get(base_url + "/v2/me", {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      })
      .then((rep) => {
        return <fortyTwoProfileDto>{
          id: rep.data.id,
          login: rep.data.login,
          image_url: rep.data.image_url,
        };
      });
  };

  /// 2FA ///

  async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.username, "PONG", secret);

    await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);

    return {
      secret,
      otpauthUrl,
    };
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    userSecret2fa: string
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: userSecret2fa,
    });
  }
}
