import { GameroomService } from "./../gameroom/gameroom.service";
import { ChannelService } from "./../channel/channel.service";
import { PrismaService } from "./../prisma/prisma.service";
import { UserService } from "./../user/user.service";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "../user/user.module";
import { JwtService } from "@nestjs/jwt";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";

@Module({
  providers: [
    ChatService,
    ChatController,
    JwtService,
    UserService,
    PrismaService,
    ChannelService,
    GameroomService,
  ],
  controllers: [],
  imports: [UserModule, ConfigModule],
  exports: [ChatService],
})
export class ChatModule {}
