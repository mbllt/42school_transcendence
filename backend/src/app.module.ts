import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UserModule } from "./user/user.module";
import { ChannelModule } from "./channel/channel.module";
import { ChatModule } from "./chat/chat.module";
import { GameroomModule } from "./gameroom/gameroom.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    PrismaModule,
    UserModule,
    ChannelModule,
    ChatModule,
    GameroomModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
