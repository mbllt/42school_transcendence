import { Oauth22faGuard } from './auth/strategy/oauth2-2fa.guard';

describe('Oauth22faGuard', () => {
  it('should be defined', () => {
    expect(new Oauth22faGuard()).toBeDefined();
  });
});
