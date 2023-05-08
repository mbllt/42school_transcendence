import { Module } from "@nestjs/common";
import { GameroomController } from "./gameroom.controller";
import { GameroomService } from "./gameroom.service";
import { PrismaService } from "../prisma/prisma.service";
import { GameboardController } from "./gameboard/gameboard.controller";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { ConfigService } from "@nestjs/config";
import { UserModule } from "../user/user.module";

@Module({
  controllers: [GameroomController],
  providers: [
    PrismaService,
    GameroomService,
    GameboardController,
    JwtService,
    ConfigService,
  ],
  imports: [UserModule],
})
export class GameroomModule {}
