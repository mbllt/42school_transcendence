import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserService } from "../../user/user.service";
import { Socket } from "socket.io";
import { WsException } from "@nestjs/websockets";
import { JwtPayload } from "./jwt.strategy";
import { SocketAddress } from "net";
import { stringify } from "flatted";

//let test = new Map<number, Socket>();

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const hash = this.configService.getOrThrow("JWT_HASH_PHRASE");
    let jwtPayload: JwtPayload;
    try {
      jwtPayload = await this.jwtService.verifyAsync(
        client.handshake.auth["authorization"],
        { secret: hash }
      );
    } catch (err) {
      throw new WsException("Bad JWT");
    }
    context.switchToWs().getClient().user = this.userService.getUser(
      jwtPayload.id
    );
    return true;
  }
}
