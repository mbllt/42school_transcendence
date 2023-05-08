import { GameroomService } from "src/gameroom/gameroom.service";
import { ChatService } from "./../chat/chat.service";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiProperty, ApiTags } from "@nestjs/swagger";
import { Group, GroupType, SanctionType } from "@prisma/client";
import { JwtGuard } from "../auth/strategy/jwt.guard";
import { JwtPayload } from "../auth/strategy/jwt.strategy";
import { CurrentUser } from "../user/decorator/getcurrentuser.decorator";
import { ChannelService } from "./channel.service";
import {
  IsAlphanumeric,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  isDate,
} from "class-validator";
const bcrypt = require("bcrypt");

@ValidatorConstraint({ name: "IsGroupType" })
class IsGroupType implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (
      value === "PUBLIC" ||
      value === "PRIVATE" ||
      value === "PRIVATE_WITH_PASSWORD"
    )
      return true;
    return false;
  }
}

@ValidatorConstraint({ name: "IsSanctionType" })
class IsSanctionType implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (value === "BAN" || value === "MUTE") return true;
    return false;
  }
}

class CreateChannelForm {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Validate(IsGroupType, { message: "the channel type does not exist" })
  type: GroupType; // custom class validator

  @ApiProperty()
  @IsOptional()
  @IsString()
  password?: string;
}

class AddUserForm {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  group_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  username: string;
}

class LeaveUserForm {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  group_id: string;
}

class CreateSanctionForm {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  group_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  expire_at: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Validate(IsSanctionType, { message: "the sanction type does not exist" })
  type: SanctionType; // custom class validator
}

class DeleteChannelForm {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  group_id: string;
}

class JoinChannelForm {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  group_id: string;

  @ApiProperty()
  @Length(2, 20)
  @IsOptional()
  @IsString()
  password?: string;
}

class PromoteDemoteForm {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  group_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  target_username: string;
}

class changePasswordForm {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  group_id: string;

  @ApiProperty()
  @Length(2, 20)
  @IsNotEmpty()
  @IsString()
  password: string;
}

class ChangeTypeChannelForm {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  group_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Validate(IsGroupType, { message: "the channel type does not exist" })
  newtype: GroupType; // custom class validator
}

class DuelInputObject {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  opponent_id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  channel: string;
}

@Controller("channel")
@ApiTags("channel")
export class ChannelController {
  constructor(
    private ChannelService: ChannelService,
    private ChatService: ChatService,
    private GameroomService: GameroomService
  ) {}

  @Post("changeType")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: ChangeTypeChannelForm })
  async changeType(
    @CurrentUser() user: JwtPayload,
    @Body() body: ChangeTypeChannelForm
  ) {
    try {
      const havePerm = await this.ChannelService.isChannelOwnerByID(
        body.group_id,
        user.id
      );
      if (havePerm) {
        const d = await this.ChannelService.changeType(
          body.group_id,
          body.newtype
        );
        if (!d) {
          throw new HttpException(
            "Error while changing the group type.",
            HttpStatus.UNAUTHORIZED
          );
        } else {
          //.to(message.groupId).emit("subscribed", message);
          this.ChatService.server.emit("statusUpdate", { text: "text" });
          return "Group type changed";
        }
      } else {
        throw new HttpException(
          "You must be owner of the channel to do that.",
          HttpStatus.UNAUTHORIZED
        );
      }
    } catch {
      // trycatchthrow throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }

  @Post("")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: CreateChannelForm })
  async createChannel(
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateChannelForm
  ) {
    try {
      if (body.type == GroupType.PRIVATE_WITH_PASSWORD)
        if (body.password == null)
          throw new HttpException(
            "You must put a password.",
            HttpStatus.BAD_REQUEST
          );
      await this.ChannelService.createChannel(
        user.id,
        body.type,
        body.password
      );
      // ajouter securisation
      this.ChatService.server.emit("statusUpdate", { text: "text" });
    } catch {
      // trycatchthrow throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }

  @Post("duel")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: CreateChannelForm })
  async duelPlayer(
    @CurrentUser() user: JwtPayload,
    @Body() body: DuelInputObject
  ) {
    try {
      let isInTheChannel = await this.ChannelService.isChannelUserByID(
        body.channel,
        user.id
      );
      let opponentIsInTheChannel = await this.ChannelService.isChannelUserByID(
        body.channel,
        body.opponent_id
      );

      if (isInTheChannel && opponentIsInTheChannel) {
        let players: number[] = [body.opponent_id, user.id];
        let gr = await this.GameroomService.createGameroom(
          user.id,
          false,
          false
        );
        await this.GameroomService.addUserToGameroom(body.opponent_id, gr.id);
        this.ChatService.server.emit("duel", { gameroom_id: gr.id, players });
        // //console.log("lauched game here : " + gr.id);
      }
    } catch {
      // trycatchthrow throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }

  @Post("addUser")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: AddUserForm })
  async addUserToChannel(
    @CurrentUser() user: JwtPayload,
    @Body() body: AddUserForm
  ) {
    const havePerm = await this.ChannelService.isAdminOrOwnerByID(
      body.group_id,
      user.id
    );
    if (havePerm) {
      const rt = await this.ChannelService.addUserToChannelByUsername(
        body.group_id,
        body.username
      );
      if (rt) {
        this.ChatService.server.emit("statusUpdate", { text: "text" });
        throw new HttpException(
          "You successfully add this user.",
          HttpStatus.ACCEPTED
        );
      } else
        throw new HttpException(
          "The arguments you passed is incorrect.",
          HttpStatus.BAD_REQUEST
        );
    } else
      throw new HttpException(
        "You don't have permission to do that.",
        HttpStatus.UNAUTHORIZED
      );
  }

  @Post("sanction")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: CreateSanctionForm })
  async createSanction(
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateSanctionForm
  ) {
    const expireAt = new Date(body.expire_at);
    const havePerm = await this.ChannelService.isAdminOrOwnerByID(
      body.group_id,
      user.id
    );

    if (havePerm) {
      const targetIsOwnerOrAdmin =
        await this.ChannelService.isAdminOrOwnerByUsername(
          body.group_id,
          body.username
        );

      if (targetIsOwnerOrAdmin)
        throw new HttpException(
          "This user is admin or owner.",
          HttpStatus.UNAUTHORIZED
        );

      const ret = await this.ChannelService.createSanction(
        body.group_id,
        body.username,
        body.type,
        expireAt
      );
      if (ret) {
        this.ChatService.server.emit("statusUpdate", { text: "text" });

        throw new HttpException(
          "You successfully create sanction for this user.",
          HttpStatus.ACCEPTED
        );
      } else
        throw new HttpException(
          "Error while creating this sanction.",
          HttpStatus.BAD_REQUEST
        );
    }
  }

  @Delete("leave")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: LeaveUserForm })
  async removeUserToChannel(
    @CurrentUser() user: JwtPayload,
    @Body() body: LeaveUserForm
  ) {
    try {
      let sucess = await this.ChannelService.removeUserToChannelByID(
        body.group_id,
        user.id
      );
      if (sucess) {
        this.ChatService.server.emit("statusUpdate", { text: "text" });
        return "You successfully leave this channel";
      } else
        throw new HttpException(
          "This channel is incorrect.",
          HttpStatus.BAD_REQUEST
        );
    } catch {
      // trycatchthrow throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }

  @Post("promote")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: PromoteDemoteForm })
  async promoteAdmin(
    @CurrentUser() user: JwtPayload,
    @Body() body: PromoteDemoteForm
  ) {
    if (await this.ChannelService.isChannelOwnerByID(body.group_id, user.id)) {
      if (
        await this.ChannelService.isChannelUserByUsername(
          body.group_id,
          body.target_username
        )
      ) {
        const res = await this.ChannelService.setAdminByUsername(
          body.group_id,
          body.target_username
        );
        if (res) {
          this.ChatService.server.emit("statusUpdate", { text: "text" });

          throw new HttpException(
            "You successfully add " + body.target_username + " as admin.",
            HttpStatus.ACCEPTED
          );
        } else
          throw new HttpException(
            "Error while try to promote this user as admin.",
            HttpStatus.BAD_REQUEST
          );
      } else
        throw new HttpException(
          "The target isn't in this channel.",
          HttpStatus.BAD_REQUEST
        );
    } else
      throw new HttpException(
        "You are not the channel owner.",
        HttpStatus.UNAUTHORIZED
      );
  }

  @Post("demote")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: PromoteDemoteForm })
  async demoteAdmin(
    @CurrentUser() user: JwtPayload,
    @Body() body: PromoteDemoteForm
  ) {
    if (await this.ChannelService.isChannelOwnerByID(body.group_id, user.id)) {
      if (
        await this.ChannelService.isChannelUserByUsername(
          body.group_id,
          body.target_username
        )
      ) {
        const res = await this.ChannelService.unsetAdminByUsername(
          body.group_id,
          body.target_username
        );
        if (res) {
          this.ChatService.server.emit("statusUpdate", { text: "text" });
          throw new HttpException(
            "You successfully remove " + body.target_username + " as admin",
            HttpStatus.ACCEPTED
          );
        } else
          throw new HttpException(
            "Error while try to demote this user as admin.",
            HttpStatus.BAD_REQUEST
          );
      } else
        throw new HttpException(
          "The target isn't in this channel.",
          HttpStatus.BAD_REQUEST
        );
    } else
      throw new HttpException(
        "You are not the channel owner.",
        HttpStatus.UNAUTHORIZED
      );
  }

  @Post("changePassword")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: changePasswordForm })
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() body: changePasswordForm
  ) {
    if (await this.ChannelService.isChannelOwnerByID(body.group_id, user.id)) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(body.password, salt);
      let password = hash;
      let rep = await this.ChannelService.changePassword(
        body.group_id,
        password
      );
      if (rep) {
        this.ChatService.server.emit("statusUpdate", { text: "text" });
        throw new HttpException(
          "You successfully set a new password",
          HttpStatus.ACCEPTED
        );
      } else
        throw new HttpException(
          "Error while setting the new password",
          HttpStatus.BAD_REQUEST
        );
    } else
      throw new HttpException(
        "You are not the channel owner.",
        HttpStatus.UNAUTHORIZED
      );
  }

  @Delete("delete")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: DeleteChannelForm })
  async deleteChannel(
    @CurrentUser() user: JwtPayload,
    @Body() body: DeleteChannelForm
  ) {
    try {
      if (
        await this.ChannelService.isChannelOwnerByID(body.group_id, user.id)
      ) {
        let sucess = await this.ChannelService.deleteChannel(body.group_id);
        if (sucess) {
          this.ChatService.server.emit("statusUpdate", { text: "text" });
          return "You successfully delete this channel";
        } else
          throw new HttpException(
            "This channel not exist.",
            HttpStatus.BAD_REQUEST
          );
      } else
        throw new HttpException(
          "You are not the channel owner.",
          HttpStatus.BAD_REQUEST
        );
    } catch {
      // trycatchthrow throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }

  @Get("me")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  async getUserChannel(@CurrentUser() user: JwtPayload) {
    try {
      return await this.ChannelService.getChannelByUser(user.id);
    } catch {
      // trycatchthrow throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }

  @Get("")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  async getChannel(@Query("id") id: string, @CurrentUser() user: JwtPayload) {
    if (!(await this.ChannelService.isChannelUserByID(id, user.id)))
      throw new HttpException(
        "You are not in this channel.",
        HttpStatus.UNAUTHORIZED
      );
    let chan: Group = await this.ChannelService.getChannel(id);
    chan.password = undefined;
    if (chan == null)
      throw new HttpException(
        "This channel doesn't exist.",
        HttpStatus.BAD_REQUEST
      );
    return chan;
    try {
    } catch {
      // trycatchthrow throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }

  @Get("public")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  async getPublicChannel(@CurrentUser() user: JwtPayload) {
    try {
      let result = await this.ChannelService.getPublicChannel(user.id);
      if (result) return result;
      else
        throw new HttpException(
          "Error while fetching the public channel.",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
    } catch {
      // trycatchthrow throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }

  @Post("join")
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBody({ type: JoinChannelForm })
  async joinPublicChannel(
    @CurrentUser() user: JwtPayload,
    @Body() form: JoinChannelForm
  ) {
    const channel = await this.ChannelService.getChannel(form.group_id);
    if (channel) {
      if (
        !(await this.ChannelService.isSanctioned(
          channel.id,
          user.id,
          SanctionType.BAN
        ))
      ) {
        if (channel.type == GroupType.PUBLIC) {
          await this.ChannelService.addUserToChannelByID(
            form.group_id,
            user.id
          );
          this.ChatService.server.emit("statusUpdate", { text: "text" });
          throw new HttpException(
            "You successfuly join this channel.",
            HttpStatus.ACCEPTED
          );
        } else if (channel.type == GroupType.PRIVATE_WITH_PASSWORD) {
          let sucess = false;
          if (user) {
            if (channel.password != null)
              sucess = await bcrypt.compare(form.password, channel.password);
          }
          if (sucess) {
            await this.ChannelService.addUserToChannelByID(
              form.group_id,
              user.id
            );
            this.ChatService.server.emit("statusUpdate", { text: "text" });
            throw new HttpException(
              "You successfuly join this channel.",
              HttpStatus.ACCEPTED
            );
          } else
            throw new HttpException(
              "This isn't the good password.",
              HttpStatus.FORBIDDEN
            );
        } else
          throw new HttpException(
            "This channel is private.",
            HttpStatus.FORBIDDEN
          );
      } else
        throw new HttpException(
          "You can't join this channel because you are banned.",
          HttpStatus.FORBIDDEN
        );
    } else
      throw new HttpException(
        "This channel doesn't exist.",
        HttpStatus.FORBIDDEN
      );
  }
}
