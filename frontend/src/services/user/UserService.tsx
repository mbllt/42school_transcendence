import axios from "axios";
import AuthToken from "../auth/AuthToken";

type User = {
  id?: number;
  username?: string;
  image_url?: string;
  created_at?: string;
  enable2fa?: boolean;
};

type Friend = {
  username: string;
  image_url: string;
  id: number;
  user_status: UserStatus;
};

type UserStatus = "IN_GAME" | "CONNECTED" | "DISCONNECTED";

type BlockedUser = Pick<User, "username" | "id">[];

const getMe = (): Promise<User> => {
  return axios
    .get(import.meta.env.VITE_BACKEND_HOST + "/user/me", {
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
      },
    })
    .then((rep) => rep.data);
};

const getOtherUser = (username: string | undefined): Promise<User> => {
  return axios
    .get(import.meta.env.VITE_BACKEND_HOST + "/user/other/" + username, {
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
      },
    })
    .then((rep) => rep.data);
};

// ---- SETTINGS ----

const changeUsername = (username: string): Promise<any> => {
  return axios
    .patch(
      import.meta.env.VITE_BACKEND_HOST + "/user?username=" + username,
      {},
      {
        headers: {
          Authorization: "Bearer " + new AuthToken().getToken(),
        },
      }
    )
    .then((rep) => rep.data);
};

const postAvatar = (file: File): Promise<any> => {
  let form = new FormData();
  form.append("file", file);
  return axios
    .post(import.meta.env.VITE_BACKEND_HOST + "/user/avatar", form, {
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
        "Content-Type": "multipart/form-data",
      },
    })
    // .then(() => //console.log("image has been changed in db"));
};

const getAvatar = async (pseudo : string | undefined): Promise<any> => {
  return axios
    .get(import.meta.env.VITE_BACKEND_HOST + "/user/avatar?pseudo=" + pseudo, {
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
      },
      responseType: "blob",
    })
    .then((rep) => {
      //console.log("rep.data :", rep.data);
      var image_url = URL.createObjectURL(rep.data);
      return image_url;
    });
};

// ---- FRIENDS ----

const addFriend = (pseudo: string | undefined) => {
  return axios
    .post(
      import.meta.env.VITE_BACKEND_HOST + "/user/addFriend?pseudo=" + pseudo,
      {},
      {
        headers: {
          Authorization: "Bearer " + new AuthToken().getToken(),
        },
      }
    )
    .then((rep) => rep.data);
};

const deleteFriend = (pseudo: string | undefined): Promise<any> => {
  return axios
    .post(
      import.meta.env.VITE_BACKEND_HOST + "/user/deleteFriend?pseudo=" + pseudo,
      {},
      {
        headers: {
          Authorization: "Bearer " + new AuthToken().getToken(),
        },
      }
    )
    // .then(() => //console.log("friend deleted"));
};

const blockUser = (pseudo: string | undefined): Promise<any> => {
  return axios
    .post(
      import.meta.env.VITE_BACKEND_HOST + "/user/blockUser?pseudo=" + pseudo,
      {},
      {
        headers: {
          Authorization: "Bearer " + new AuthToken().getToken(),
        },
      }
    )
    // .then(() => //console.log("user blocked"));
};

const unblockUser = (pseudo: string | undefined): Promise<any> => {
  return axios
    .post(
      import.meta.env.VITE_BACKEND_HOST + "/user/unblockUser?pseudo=" + pseudo,
      {},
      {
        headers: {
          Authorization: "Bearer " + new AuthToken().getToken(),
        },
      }
    )
    // .then(() => //console.log("user unblocked"));
};

const getFriends = (): Promise<Friend[]> => {
  return axios
    .get(import.meta.env.VITE_BACKEND_HOST + "/user/getFriends/", {
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
      },
    })
    .then((rep) => rep.data);
};

const getBlockedUser = (): Promise<BlockedUser[]> => {
  return axios
    .get(import.meta.env.VITE_BACKEND_HOST + "/user/getBlockedUser/", {
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
      },
    })
    .then((rep) => rep.data);
};


const getUsers = (): Promise<string[]> => {
  return axios
    .get(import.meta.env.VITE_BACKEND_HOST + "/user/getUsers/", {
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
      },
    })
    .then((rep) => rep.data);
};

export {
  getMe,
  getOtherUser,
  changeUsername,
  postAvatar,
  getAvatar,
  addFriend,
  deleteFriend,
  blockUser,
  unblockUser,
  getFriends,
  getBlockedUser,
  getUsers,
};

export type { User, UserStatus, Friend };
