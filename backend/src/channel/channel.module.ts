import { GameroomModule } from "./../gameroom/gameroom.module";
import { ChatModule } from "src/chat/chat.module";
import { ChatService } from "./../chat/chat.service";
import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ChannelController } from "./channel.controller";
import { ChannelService } from "./channel.service";
import { GameroomService } from "src/gameroom/gameroom.service";

@Module({
  controllers: [ChannelController],
  providers: [ChannelService, GameroomService],
  imports: [PrismaModule, ChatModule],
})
export class ChannelModule {}
