import { Strategy } from 'passport-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy, 'oauth2'){
    constructor(configService: ConfigService) {
        super({
            authorizationURL: configService.getOrThrow<string>('42_APP_AUTHORIZATION_URL'),
            tokenURL: configService.getOrThrow<string>('42_APP_TOKEN_URL'),
            clientID: configService.getOrThrow<string>('42_APP_CLIENT_ID'),
            clientSecret: configService.getOrThrow<string>('42_APP_CLIENT_SECRET'),
            callbackURL: configService.getOrThrow<string>('42_APP_REDIRECT_URL')
        })
    }

    validate = async (accessToken: string, refreshToken: string) => {
        return { accessToken, refreshToken }
    }
}