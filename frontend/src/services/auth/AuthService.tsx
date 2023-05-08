import axios from "axios";
import AuthToken from "./AuthToken";
import { changeUsername, User } from "../user/UserService";

const auth42 = (grant: string, code2fa: string): Promise<SuccessConnection> => {
  return axios
    .get(import.meta.env.VITE_BACKEND_HOST + "/auth/login42", {
      params: {
        code: grant,
        code2fa: code2fa,
      },
    })
    .then((rep) => rep.data);
};

// ---- 2FA ----

const generateQRCode = (): Promise<any> => {
  return axios
    .get(import.meta.env.VITE_BACKEND_HOST + "/auth/2fa/generate/", {
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
      },
    })
    .then((rep) => rep.data);
};

const activate2fa = (code: string): Promise<any> => {
  return axios
    .get(import.meta.env.VITE_BACKEND_HOST + "/auth/2fa/turn-on/" + code, {
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
      },
    })
    // .then(() => //console.log("db has turned on 2fa"));
};

const disactivate2fa = (code: string): Promise<any> => {
  return axios
    .get(import.meta.env.VITE_BACKEND_HOST + "/auth/2fa/turn-off/" + code, {
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
      },
    })
    // .then(() => //console.log("db has turned off 2fa"));
};

const authenticate2fa = (code: string): Promise<any> => {
  return axios
    .post(import.meta.env.VITE_BACKEND_HOST + "/auth/2fa/authenticate/" + code, {})
    .then((rep) => {
      //console.log("db has validated 2fa code");
      return rep.data;
    });
};

type SuccessConnection = {
  statusCode: number;
  message: string;
};
const authLogin = (
  username: string,
  password: string,
  twofa?: string
): Promise<SuccessConnection> => {
  return axios
    .post(import.meta.env.VITE_BACKEND_HOST + "/auth/loginLocal/", {
      username: username,
      password: password,
      twofa: twofa,
    })
    .then((rep) => {
      return rep?.data;
    });
};

const authRegister = (
  username: string,
  password: string
): Promise<SuccessConnection> => {
  return axios
    .post(import.meta.env.VITE_BACKEND_HOST + "/auth/registerLocal/", {
      username: username,
      password: password,
    })
    .then((rep) => {
      return rep?.data;
    });
};

export {
  authLogin,
  authRegister,
  auth42,
  generateQRCode,
  activate2fa,
  disactivate2fa,
  authenticate2fa,
};
export type { SuccessConnection };
