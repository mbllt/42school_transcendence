import { Injectable, UseGuards } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { gameboard, GameroomService } from "../gameroom.service";
import { WsGuard } from "../../auth/strategy/ws.guard";
import { CurrentUser } from "../../user/decorator/getcurrentuser.decorator";
import { JwtPayload } from "../../auth/strategy/jwt.strategy";
import { setGameSocketServer } from "./gameboard.engine";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

class PlayerInputObject {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  up: boolean;
  
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gameroom_id: string;
};

@Injectable()
@WebSocketGateway({
  namespace: "game",
  cors: {
    origin: "*",
  },
})
export class GameboardController {
  constructor(private gameroomService: GameroomService) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.gameroomService.setServer(server);
    setGameSocketServer(server);
  }

  async handleConnection(client: Socket) {
    let gameroom_id: string | string[] = client.handshake.auth["gameroom"];
    if (!(typeof gameroom_id == "string")) return "Bad format";

    client.join(gameroom_id);
  }

  @SubscribeMessage("playerInput")
  @UseGuards(WsGuard)
  async playerInput(
    @ConnectedSocket() client: Socket,
    @CurrentUser() user: JwtPayload,
    @MessageBody() input: PlayerInputObject
  ) {
    ////console.log("input " + input.gameroom_id + " -- " + input.up);
    client.join(input.gameroom_id);
    //try {
    //check if gameroom exist
    let exist = gameboard.has(input.gameroom_id);

    if (!exist) {
      ////console.log("n'existe pas + " + input.gameroom_id);
      return;
    }

    gameboard.get(input.gameroom_id).movePaddle(user.id, input.up);
    gameboard.get(input.gameroom_id).setReady(user.id);
    //} catch {
    // trycatchthrow throw new HttpException("", HttpStatus.BAD_REQUEST);
    //}
  }
}
