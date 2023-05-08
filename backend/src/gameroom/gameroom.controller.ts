import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { GameroomService } from "./gameroom.service";
import { CurrentUser } from "../user/decorator/getcurrentuser.decorator";
import { JwtPayload } from "../auth/strategy/jwt.strategy";
import { JwtGuard } from "../auth/strategy/jwt.guard";
import { ApiBearerAuth, ApiBody, ApiProperty, ApiTags } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

class JoinQueueForm {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  hardcore: boolean;
}

@Controller("gameroom")
@ApiTags("gameroom")
export class GameroomController {
  constructor(private gameroomService: GameroomService) {}

  @ApiBearerAuth()
  @Post("/joinQueue")
  @UseGuards(JwtGuard)
  @ApiBody({ type: JoinQueueForm })
  async joinQueueRoute(
    @CurrentUser() user: JwtPayload,
    @Body() body: JoinQueueForm
  ) {
    let gm = await this.gameroomService.joinGameroomQueue(
      user.id,
      body.hardcore
    );
    if (gm == undefined)
      throw new HttpException(
        "You can't join the queue twice.",
        HttpStatus.FORBIDDEN
      );
    else return gm;
  }

  @ApiBearerAuth()
  @Get("/")
  @UseGuards(JwtGuard)
  async getGameroom(@Query("id") id: string) {
    try {
      let rep = await this.gameroomService.getGameroomByID(id);
      if (rep == undefined)
        throw new HttpException(
          "There is not game with this id.",
          HttpStatus.BAD_REQUEST
        );
      else return rep;
    } catch {
      // trycatchthrow throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }

  @ApiBearerAuth()
  @Get("/inprogress")
  @UseGuards(JwtGuard)
  async getGameroomInProgress() {
    try {
      return await this.gameroomService.getGameroomInProgress();
    } catch {
      // trycatchthrow throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }
}
