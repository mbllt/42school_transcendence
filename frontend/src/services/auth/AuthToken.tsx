import LocalStore from "./LocalStore";

class AuthToken {
  private _token: string | null;

  constructor() {
    this._token = LocalStore.getItem("token");
  }

  public getToken(): string | null {
    return this._token;
  }

  public setToken(token: string | null): void {
    LocalStore.setItem("token", token);
    this._token = token;
  }

  public hasToken = (): boolean => this.getToken() != null;
}

export default AuthToken;
