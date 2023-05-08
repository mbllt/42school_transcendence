import axios from "axios";
import moment from "moment";
import AuthToken from "../auth/AuthToken";

type Message = {
  content: string;
  groupId: string;
  createdAt: string;
  sender: {
    username: string;
    id: number;
  };
};

type Channel = {
  id: string;
  type: ChannelType;
  Message: Message[];
  users: {
    username: string;
  }[];
  admin: {
    username: string;
  }[];
  owner: {
    username: string;
  };
  password: string;
};

type ChannelType = "PUBLIC" | "PRIVATE_WITH_PASSWORD" | "PRIVATE";
type ChannelRole = "OWNER" | "ADMIN" | "USER";

const getPublicChannel = (): Promise<Channel[]> => {
  return axios
    .get(import.meta.env.VITE_BACKEND_HOST + "/channel/public", {
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
      },
    })
    .then((rep) => rep.data);
};

const getPrivateChannel = (): Promise<Channel[]> => {
  return axios
    .get(import.meta.env.VITE_BACKEND_HOST + "/channel/me", {
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
      },
    })
    .then((rep) => rep.data);
};

const getChannel = (id: string): Promise<Channel> => {
  return axios
    .get(import.meta.env.VITE_BACKEND_HOST + "/channel?id=" + id, {
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
      },
    })
    .then((rep) => rep.data);
};

const deleteChannel = (id: string): Promise<Channel> => {
  return axios
    .delete(import.meta.env.VITE_BACKEND_HOST + "/channel/delete", {
      data: {
        group_id: id,
      },
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
      },
    })
    .then((rep) => rep.data);
};

const leaveChannel = (id: string): Promise<Channel> => {
  return axios
    .delete(import.meta.env.VITE_BACKEND_HOST + "/channel/leave", {
      data: {
        group_id: id,
      },
      headers: {
        Authorization: "Bearer " + new AuthToken().getToken(),
      },
    })
    .then((rep) => rep.data);
};

const promoteAdmin = (group_id: string, target_username: string) => {
  return axios
    .post(
      import.meta.env.VITE_BACKEND_HOST + "/channel/promote",
      { group_id: group_id, target_username: target_username },
      {
        headers: {
          Authorization: "Bearer " + new AuthToken().getToken(),
        },
      }
    )
    .then((rep) => rep.data);
};

const createDuel = (channel: string, opponent_id: number) => {
  return axios
    .post(
      import.meta.env.VITE_BACKEND_HOST + "/channel/duel",
      { channel: channel, opponent_id: opponent_id },
      {
        headers: {
          Authorization: "Bearer " + new AuthToken().getToken(),
        },
      }
    )
    .then((rep) => rep.data);
};

const demoteAdmin = (group_id: string, target_username: string) => {
  return axios
    .post(
      import.meta.env.VITE_BACKEND_HOST + "/channel/demote",
      { group_id: group_id, target_username: target_username },
      {
        headers: {
          Authorization: "Bearer " + new AuthToken().getToken(),
        },
      }
    )
    .then((rep) => rep.data);
};

const createSanctionUser = (
  group_id: string,
  target_username: string,
  sanctionType: "BAN" | "MUTE",
  duration_in_m: number
) => {
  //console.log(sanctionType);
  let duration_in_m_ts = moment(new Date()).add(duration_in_m, "s").toDate();
  //console.log(duration_in_m_ts);
  return axios
    .post(
      import.meta.env.VITE_BACKEND_HOST + "/channel/sanction",
      {
        group_id: group_id,
        username: target_username,
        type: sanctionType,
        expire_at: duration_in_m_ts,
      },
      {
        headers: {
          Authorization: "Bearer " + new AuthToken().getToken(),
        },
      }
    )
    .then((rep) => rep.data);
};

const changeType = (group_id: string, groupType: ChannelType) => {
  return axios
    .post(
      import.meta.env.VITE_BACKEND_HOST + "/channel/changeType",
      {
        group_id: group_id,
        newtype: groupType,
      },
      {
        headers: {
          Authorization: "Bearer " + new AuthToken().getToken(),
        },
      }
    )
    .then((rep) => rep.data);
};

const changePassword = (group_id: string, password: string) => {
  return axios
    .post(
      import.meta.env.VITE_BACKEND_HOST + "/channel/changePassword",
      {
        group_id: group_id,
        password: password,
      },
      {
        headers: {
          Authorization: "Bearer " + new AuthToken().getToken(),
        },
      }
    )
    .then((rep) => rep.data);
};

const addUserToChannel = (group_id: string, username: string) => {
  return axios
    .post(
      import.meta.env.VITE_BACKEND_HOST + "/channel/addUser",
      {
        group_id: group_id,
        username: username,
      },
      {
        headers: {
          Authorization: "Bearer " + new AuthToken().getToken(),
        },
      }
    )
    .then((rep) => rep.data);
};

const createChannel = (groupType: ChannelType, password?: string) => {
  return axios
    .post(
      import.meta.env.VITE_BACKEND_HOST + "/channel",
      {
        type: groupType,
        password: password,
      },
      {
        headers: {
          Authorization: "Bearer " + new AuthToken().getToken(),
        },
      }
    )
    .then((rep) => rep.data);
};

const joinChannel = (group_id: string, password?: string) => {
  return axios
    .post(
      import.meta.env.VITE_BACKEND_HOST + "/channel/join",
      {
        group_id: group_id,
        password: password,
      },
      {
        headers: {
          Authorization: "Bearer " + new AuthToken().getToken(),
        },
      }
    )
    .then((rep) => rep.data);
};

export {
  getPublicChannel,
  getPrivateChannel,
  getChannel,
  demoteAdmin,
  promoteAdmin,
  createSanctionUser,
  changeType,
  createChannel,
  changePassword,
  deleteChannel,
  leaveChannel,
  joinChannel,
  addUserToChannel,
  createDuel,
};
export type { Channel, ChannelType, ChannelRole, Message };
