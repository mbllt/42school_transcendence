import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "./../auth/strategy/jwt.strategy";
import { WsException } from "@nestjs/websockets";
import { PrismaService } from "./../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { MessageInputObject } from "./chat.controller";
import { Group, Message } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { ChannelService } from "../channel/channel.service";
import { UserService } from "../user/user.service";

@Injectable()
export class ChatService {
  constructor(
    private prismaService: PrismaService,
    private channelService: ChannelService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private userService: UserService
  ) {}

  server: Server;

  setServer(s: Server) {
    this.server = s;
  }

  async sendMessage(messageInput: MessageInputObject, user_id: number) {
    let message = await this.createMessageInDB(messageInput, user_id);
    this.distribMessage(message);
    return message;
  }

  async createMessageInDB(
    message: MessageInputObject,
    sender_id: number
  ): Promise<Message> {
    try {
      return await this.prismaService.message.create({
        data: {
          sender: {
            connect: {
              id: sender_id,
            },
          },
          Group: {
            connect: {
              id: message.channel,
            },
          },
          content: message.text,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    } catch (error) {
      // //console.log(error);
    }
  }

  async subscribeToRoom(user_id: number, socket: Socket) {
    //console.log("Subscribe to room");
    const channel: Group[] = await this.channelService.getChannelByUser(
      user_id
    );
    channel.map((el: Group) => {
      socket.join(el.id);
    });
  }

  async distribMessage(message: Message) {
    this.server.to(message.groupId).emit("subscribed", message);
  }

  async jwtToUserProfile(jwt: string) {
    const hash = this.configService.getOrThrow("JWT_HASH_PHRASE");
    let jwtPayload: JwtPayload;
    try {
      jwtPayload = await this.jwtService.verifyAsync(jwt, { secret: hash });
      return this.userService.getUser(jwtPayload.id);
    } catch (err) {
      throw new Error("Bad JWT");
    }
  }
}
