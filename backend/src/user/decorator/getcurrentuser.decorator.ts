import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayload } from "../../auth/strategy/jwt.strategy.js";

export const getCurrentUser = (request: any): JwtPayload => request.user;

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) =>
    getCurrentUser(context.switchToHttp().getRequest())
);
