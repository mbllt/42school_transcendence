import { AuthService } from "./../auth.service";
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { authenticator } from "otplib";

type SavedAuth = {
  code: string;
  jwt: string;
  twofa_secret: string;
};

let savedauth: SavedAuth[] = [];

@Injectable()
export class Oauth22faGuard implements CanActivate {
  constructor(@Inject(AuthService) private authService: AuthService) {}
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    let code = request.query.code;
    let code2fa = request.query.code2fa;

    savedauth.map((el: SavedAuth) => {
      if (el.code == code) {
        let isOk = false;
        isOk = this.authService.isTwoFactorAuthenticationCodeValid(
          code2fa as string,
          el.twofa_secret
        );
        if (isOk) {
          throw new HttpException(el.jwt, HttpStatus.ACCEPTED);
        }
      }
    });
    return true;
  }
}

export { savedauth };
export type { SavedAuth };
