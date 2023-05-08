import { UserStatus } from "@prisma/client";
import { JwtPayload } from "./../auth/strategy/jwt.strategy";
import { User, Game } from "@prisma/client";
import { JwtGuard } from "./../auth/strategy/jwt.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserService } from "./user.service";
import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Req,
  Patch,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
  HttpStatus,
  Res,
  Param,
  HttpException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "./decorator/getcurrentuser.decorator";
import e from "express";
import { MagicNumberValidator } from "./magicnumber.validator";
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from "class-validator";

type OutputUserI = Pick<
  User,
  "id" | "username" | "image_url" | "created_at" | "enable2fa"
>;

class PatchUserForm {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(2, 20)
  username: string;
}

class OutputUserIS {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(2, 20)
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  image_url: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  created_at: Date;

  @ApiProperty()
  @IsBoolean()
  @IsString()
  enable2fa: boolean;
}

class InputFileIS {
  // custom class validator
  @ApiProperty({ type: "string", format: "binary" })
  file: Express.Multer.File;
}

type GameStats = Game & {
  // custom class validator
  players: {
    username: string;
  }[];

  winner: boolean;
};

class Stats {
  @ApiProperty()
  @IsBoolean()
  @IsNumber()
  numberParty: number;

  @ApiProperty()
  @IsBoolean()
  @IsNumber()
  numberPartyHardcore: number;

  @ApiProperty()
  @IsBoolean()
  @IsNumber()
  numberPartyHardcoreWon: number;

  @ApiProperty()
  @IsBoolean()
  @IsNumber()
  numberWin: number;

  @ApiProperty()
  @IsBoolean()
  @IsNumber()
  winRatio: number;

  @ApiProperty()
  @IsBoolean()
  @IsNumber()
  hardcoreWinRatio: number;
}

class MatchHistory {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  hardcore: boolean;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  created_at: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oponent: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  winner: boolean;
}
[];

class FriendsList {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;
}
[];

type userFriends = User & {
  // custom class validator
  friends: {
    username: string;
  }[];
};

/// ROUTES ///

@Controller("user")
@ApiTags("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("me")
  @ApiResponse({ status: 200, type: OutputUserIS })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  async me(
    @Req() req: any,
    @CurrentUser() user: JwtPayload
  ): Promise<OutputUserI> {
    try {
      const profile = await this.userService.getUser(user.id);
      return {
        id: profile.id,
        username: profile.username,
        image_url: profile.image_url,
        created_at: profile.created_at,
        enable2fa: profile.enable2fa,
      };
    } catch {
      // trycatchthrow throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }

  @Get("other/:username")
  @ApiResponse({ status: 200, type: OutputUserIS })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  async getUser(
    @Req() req: any,
    @Param("username") username: string
  ): Promise<OutputUserI> {
    try {
      const profile = await this.userService.getUserByUsername(username);
      return {
        id: profile.id,
        username: profile.username,
        image_url: profile.image_url,
        created_at: profile.created_at,
        enable2fa: profile.enable2fa,
      };
    } catch (error) {
      throw new HttpException("No user found.", HttpStatus.BAD_REQUEST);
    }
  }

  @Patch("")
  @ApiQuery({ name: "username", type: String, required: false })
  @ApiResponse({ status: 200, type: OutputUserIS })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  async modify(
    @Query() query: PatchUserForm,
    @Req() req: any,
    @CurrentUser() user: JwtPayload
  ): Promise<OutputUserI> {
    let rep = await this.userService.modifyUser(user.id, {
      username: query.username,
    });
    if (rep != undefined)
      throw new HttpException(
        "Your profile was successfully edited.",
        HttpStatus.ACCEPTED
      );
    else
      throw new HttpException(
        "Error while edition of profile.",
        HttpStatus.BAD_REQUEST
      );
  }

  @Post("avatar")
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: InputFileIS })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor("file"))
  uploadAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 }),
          new FileTypeValidator({ fileType: "png" }),
          new MagicNumberValidator({}),
        ],
      })
    )
    file: Express.Multer.File,
    @Req() request
  ): void {
    try {
      const user_id = <number>request.user.id;
      this.userService.modifyUser(user_id, { image_url: file.filename });
    } catch {
      // trycatchthrow throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
    throw new HttpException(
      "You succesfully changed your avatar !",
      HttpStatus.ACCEPTED
    );
  }

  @Get("avatar")
  @ApiBearerAuth()
  @ApiQuery({ name: "pseudo", required: true, type: String })
  async getAvatar(
    @Req() request,
    @Res() response,
    @Query("pseudo") pseudo: string
  ) {
    try {
      const file_name = (await this.userService.getUserByUsername(pseudo))
        .image_url;
      if (file_name) response.sendFile(file_name, { root: "./avatar" });
      else response.send();
    } catch (error) {
      ////console.log(error);
      response.send();
      //response.sendFile("default_avatar.png", { root: "./avatar" });
    }
    //response.send();
  }

  /// STATS ///

  /// STATS ///

  @Get("matchHistory")
  @ApiBearerAuth()
  @ApiQuery({ name: "pseudo", required: true, type: String })
  @UseGuards(JwtGuard)
  async getMatchHistory(@Req() request, @Query("pseudo") pseudo: string) {
    try {
      let matchHistory = await this.userService.getUserMatchData(pseudo);
      if (matchHistory) return matchHistory;
    } catch (error) {
      throw new HttpException("No user found.", HttpStatus.BAD_REQUEST);
    }
  }

  @Get("stats/:pseudo")
  @ApiBearerAuth()
  @ApiQuery({ name: "pseudo", required: true, type: String })
  @UseGuards(JwtGuard)
  async getStats(@Req() request, @Param("pseudo") pseudo: string) {
    try {
      const stats: Stats = {
        numberParty: 0,
        numberWin: 0,
        winRatio: 0,
        numberPartyHardcore: 0,
        numberPartyHardcoreWon: 0,
        hardcoreWinRatio: 0,
      };

      const userToWatch = pseudo
        ? await this.userService.getUserByUsername(pseudo)
        : await this.userService.getUser(request.user.id);

      const userMatchHistory = await this.userService.getUserStat(
        userToWatch.id
      );
      if (userMatchHistory.length == 0) return stats;

      userMatchHistory.forEach(function (game) {
        stats.numberParty++;
        if (game.hardcore) stats.numberPartyHardcore++;
        if (
          (game.is_player_a_winner &&
            game.players.at(0).username == userToWatch.username) ||
          (!game.is_player_a_winner &&
            game.players.at(1).username == userToWatch.username)
        ) {
          stats.numberWin++;
          if (game.hardcore == true) {
            //console.log(game.hardcore);
            stats.numberPartyHardcoreWon++;
          }
        }
      });
      stats.winRatio = stats.numberWin / stats.numberParty;
      stats.hardcoreWinRatio =
        stats.numberPartyHardcoreWon / stats.numberPartyHardcore;

      return stats;
    } catch (error) {
      throw new HttpException("No user found.", HttpStatus.BAD_REQUEST);
    }
  }

  @Get("getUsers")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  async getUsers(@Req() request) {
    try {
      var playersList = [];
      const userList = await this.userService.getUsers();
      userList.forEach((user) => {
        playersList.push(user.username);
      });
      return playersList;
    } catch {
      // trycatchthrow throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }

  /// USER FRIENDS RELATION ///

  @Get("getFriends")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  async getFriends(@Req() request) {
    try {
      var friendsListClean = [];
      var i = 0;
      const friendsListBazar = await this.userService.getUserFriends(
        request.user.id
      );
      friendsListBazar.forEach((e) => {
        e.friends.forEach((d) => {
          friendsListClean.push(e.friends.at(i));
          i++;
        });
      });
      return friendsListClean;
    } catch {
      // trycatchthrow throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }

  @Get("getBlockedUser")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  async getBlockedUser(@Req() request) {
    try {
      const BlockedUserListBazar = await this.userService.getBlockedUser(
        request.user.id
      );
      return BlockedUserListBazar.blocked_user;
    } catch {
      // trycatchthrow throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }

  /*
  @Get("getUserStatus/:pseudo?")
  @ApiBearerAuth()
  @ApiQuery({ name: "pseudo", required: false, type: Number })
  @UseGuards(JwtGuard)
  async getUserStatus(
    @CurrentUser() user: JwtPayload,
    @Param("pseudo") pseudo?: number
  ) {
    try {
      //console.log(pseudo);
      if (!pseudo) return this.userService.getUserStatus(user.id);
      else return this.userService.getUserStatus(pseudo);
    } catch {
        // trycatchthrow throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }
  */

  @Post("addFriend")
  @ApiBearerAuth()
  @ApiQuery({ name: "pseudo", type: String })
  @UseGuards(JwtGuard)
  async addFriend(@Req() request, @Query("pseudo") pseudo: string) {
    try {
      const friendToAdd = await this.userService.getUserByUsername(pseudo);
      await this.userService.addFriend(request.user.id, friendToAdd.id);
    } catch (error) {
      throw new HttpException("No user found.", HttpStatus.BAD_REQUEST);
    }
    throw new HttpException(
      "You successfully add this friend.",
      HttpStatus.ACCEPTED
    );
  }

  @Post("deleteFriend")
  @ApiBearerAuth()
  @ApiQuery({ name: "pseudo", type: String })
  @UseGuards(JwtGuard)
  async deleteFriend(@Req() request, @Query("pseudo") pseudo: string) {
    try {
      const friendToAdd = await this.userService.getUserByUsername(pseudo);
      await this.userService.deleteFriend(request.user.id, friendToAdd.id);
    } catch (error) {
      throw new HttpException("No user found.", HttpStatus.BAD_REQUEST);
    }
    throw new HttpException(
      "You successfully delete this friend.",
      HttpStatus.ACCEPTED
    );
  }

  @Post("blockUser")
  @ApiBearerAuth()
  @ApiQuery({ name: "pseudo", type: String })
  @UseGuards(JwtGuard)
  async blockUser(@Req() request, @Query("pseudo") pseudo: string) {
    try {
      const userToBlock = await this.userService.getUserByUsername(pseudo);
      await this.userService.blockUser(request.user.id, userToBlock.id);
    } catch (error) {
      throw new HttpException("No user found.", HttpStatus.BAD_REQUEST);
    }
    throw new HttpException(
      "You successfully block this friend.",
      HttpStatus.ACCEPTED
    );
  }

  @Post("unblockUser")
  @ApiBearerAuth()
  @ApiQuery({ name: "pseudo", type: String })
  @UseGuards(JwtGuard)
  async unblockUser(@Req() request, @Query("pseudo") pseudo: string) {
    try {
      const userToUnblock = await this.userService.getUserByUsername(pseudo);
      await this.userService.unblockUser(request.user.id, userToUnblock.id);
    } catch (error) {
      throw new HttpException("No user found.", HttpStatus.BAD_REQUEST);
    }
    throw new HttpException(
      "You successfully unblock this friend.",
      HttpStatus.ACCEPTED
    );
  }
}
