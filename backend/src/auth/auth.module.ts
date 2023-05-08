import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserService } from "../user/user.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtModule } from "@nestjs/jwt";
import { OAuth2Strategy } from "./strategy/oauth2.strategy";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { WsGuard } from "./strategy/ws.guard";

const jwtConfig = JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    return {
      secret: configService.getOrThrow<string>("JWT_HASH_PHRASE"),
      signOptions: {
        expiresIn: "10d",
      },
    };
  },
  inject: [ConfigService],
});

@Module({
  imports: [ConfigModule, jwtConfig],
  controllers: [AuthController],
  providers: [
    OAuth2Strategy,
    JwtStrategy,
    PrismaService,
    AuthService,
    UserService,
    WsGuard,
  ],
})
export class AuthModule {}
