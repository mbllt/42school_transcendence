import { Oauth2faGuard } from './auth/strategy/oauth2fa.guard';

describe('Oauth2faGuard', () => {
  it('should be defined', () => {
    expect(new Oauth2faGuard()).toBeDefined();
  });
});
