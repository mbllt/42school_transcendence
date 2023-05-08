import { UserService } from "src/user/user.service";
import { ChatService } from "./chat.service";
import { JwtPayload } from "../auth/strategy/jwt.strategy";
import { CurrentUser } from "../user/decorator/getcurrentuser.decorator";
import { UseGuards } from "@nestjs/common";
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { WsGuard } from "../auth/strategy/ws.guard";
import { ChannelService } from "../channel/channel.service";
import { SanctionType, User } from "@prisma/client";
import { GameroomService } from "src/gameroom/gameroom.service";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

class MessageInputObject {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  channel: string;
};

@WebSocketGateway({
  namespace: "chat",
  cors: {
    origin: "*",
  },
})
export class ChatController {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly channelService: ChannelService,
    private readonly gameroomService: GameroomService,
    private userService: UserService
  ) {}

  afterInit(server: Server) {
    this.chatService.setServer(server);
  }

  async handleConnection(client: Socket) {
    let token = client.handshake.auth["authorization"];
    let t: User = await this.chatService.jwtToUserProfile(token);
    if (t?.id) {
      let actual = await this.userService.getUserStatus(t.id);
      if (actual != "IN_GAME") {
        this.userService.setUserStatus(t.id, "CONNECTED");
      }
    } else client.disconnect();
  }

  async handleDisconnect(client: Socket) {
    let token = client.handshake.auth["authorization"];
    let t: User = await this.chatService.jwtToUserProfile(token);
    let actual = await this.userService.getUserStatus(t.id);
    if (actual != "IN_GAME")
      this.userService.setUserStatus(t.id, "DISCONNECTED");
  }

  @SubscribeMessage("createMessage") // tryctachthrow
  @UseGuards(WsGuard)
  async create(
    @MessageBody() createMessageDto: MessageInputObject,
    @ConnectedSocket() client: Socket,
    @CurrentUser() user: JwtPayload
  ) {
    let message;
    let mute: Date = await this.channelService.isSanctioned(
      createMessageDto.channel,
      user.id,
      SanctionType.MUTE
    );
    if (mute != undefined) {
      // //console.log("MESSAGE NOT CREATED BECAUSE OF MUTE");
      return false;
    }
    try {
      message = await this.chatService.sendMessage(createMessageDto, user.id);
      // //console.log("MESSAGE CREATED");
      // //console.log(message);
    } catch (error) {
      return false;
    }
    return true;
  }

  @SubscribeMessage("subscribe")
  @UseGuards(WsGuard)
  async subscribe(
    @ConnectedSocket() client: Socket,
    @CurrentUser() user: JwtPayload
  ) {
    try {
      this.chatService.subscribeToRoom(user.id, client);
      return await this.channelService.getCompleteChannelByUser(user.id);
    } catch {
      // trycatchthrow throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }
}

export { MessageInputObject };
