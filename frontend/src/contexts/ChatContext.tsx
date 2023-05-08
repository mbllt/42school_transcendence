import { createContext, FC, useContext, useEffect, useState } from "react";
import { setLogger, useQuery, useQueryClient } from "react-query";
import { useChatDrawer } from "../layouts/chat/ChatDrawer";
import {
  Channel,
  ChannelRole,
  ChannelType,
  getChannel,
  getPrivateChannel,
  Message,
} from "../services/channel/ChannelService";
import { AuthContext } from "./AuthContext";
import io, { Socket } from "socket.io-client";
import { Manager } from "socket.io-client";
import AuthToken from "../services/auth/AuthToken";
import { useAuthenticatedSocket } from "../hook/SocketHook";
import { useSocketEvent } from "socket.io-react-hook";
import {
  BlockedUser,
  getBlockedUser,
  User,
} from "../services/user/UserService";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

type DuelMessage = {
  gameroom_id: string;
  players: number[];
};

type ChatProviderProps = {
  children?: any;
};

type ChatContextProps = {
  selected: Channel | undefined;
  setSelectedChannel: any;
  myChannel: Channel[];
  myRole: ChannelRole;
  getChannelRole: any;
  sendMessageToSelectedChannel: any;
  blockedUser: BlockedUser[];
};

const ChatContext = createContext<ChatContextProps>({} as ChatContextProps);

const ChatContextProvider: FC<ChatProviderProps> = (props) => {
  const [pendingSelected, setPendingSelected] = useState<string>();
  const [selected, setSelected] = useState<Channel>();
  const [myChannel, setMyChannel] = useState<Channel[]>([]);
  const [blockedUser, setBlockUser] = useState<BlockedUser[]>([]);
  const [myRole, setMyRole] = useState<ChannelRole>("USER");
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { socket, connected, error } = useAuthenticatedSocket("/chat");
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const { lastMessage } = useSocketEvent(socket, "subscribed");
  const { lastMessage: lastStatusUpdate } = useSocketEvent(
    socket,
    "statusUpdate"
  );

  const { lastMessage: lastDuelMessage } = useSocketEvent<DuelMessage>(
    socket,
    "duel"
  );

  useQuery(["getBlockedUser"], getBlockedUser, {
    onSuccess(data: BlockedUser[]) {
      setBlockUser(data);
    },
  });

  useEffect(() => {
    if (lastDuelMessage) {
      if (
        lastDuelMessage.players[0] == user?.id ||
        lastDuelMessage.players[1] == user?.id
      ) {
        let key = enqueueSnackbar("You have a dududududuel ! CLICK HERE", {
          variant: "warning",
          autoHideDuration: 15000,
          onClick: () => {
            navigate("/game/" + lastDuelMessage.gameroom_id);
            closeSnackbar(key);
            //window.location.reload();
          },
        });
        //onst w = window.open("/game/" + lastDuelMessage.gameroom_id, "_blank");

        //if (window) w?.focus();
      }
    }
  }, [lastDuelMessage]);

  useEffect(() => {
    //console.log("status update");
    queryClient.refetchQueries("getPrivateChannel");
    queryClient.refetchQueries("getPublicChannel");
    socket.emit("subscribe");
    handleFetchingSelectedChannel();
  }, [lastStatusUpdate]);

  useEffect(() => {
    if (connected) socket.emit("subscribe");
  }, [connected]);

  useEffect(() => {
    //console.log("message recu");

    if (selected) {
      let m = lastMessage as Message;
      if (m.groupId == selected.id) {
        let s: Channel = structuredClone(selected);
        s.Message.push(lastMessage as Message);
        setSelected(s);
      }
    }
  }, [lastMessage]);

  /*
  const onMessage = (message: Message) => {
    //console.log("message recu");
    //console.log(selected);
    let s: Channel = structuredClone(selected);
    s.Message.push(message);
    setSelected(s);
  };
  */
  const { sendMessage } = useSocketEvent(socket, "createMessage");

  const sendMessageToSelectedChannel = (message: string) => {
    sendMessage({
      text: message,
      channel: selected?.id,
    });
  };

  const fetchPrivateChannel = () => {
    return getPrivateChannel();
  };
  useQuery("getPrivateChannel", fetchPrivateChannel, {
    onSuccess: (data: Channel[]) => {
      setMyChannel(data);
    },
  });

  const fetchSelectedChannel = ({ signal, queryKey }: any) => {
    if (queryKey[1] != undefined) return getChannel(queryKey[1]);
    else return Promise.reject("selected channel not found");
  };

  const { refetch: handleFetchingSelectedChannel } = useQuery(
    ["getSelectedChannel", pendingSelected],
    fetchSelectedChannel,
    {
      enabled: true,
      onSuccess: (data: Channel) => {
        setSelected(data);
        setMyRole(getChannelRole(user?.username, data));
      },
      onError: () => {
        setSelected(undefined);
      },
    }
  );

  const setSelectedChannel = (id: string) => {
    setPendingSelected(id);
  };

  const getChannelRole = (
    username: string | undefined,
    channel: Channel
  ): ChannelRole => {
    if (channel.owner.username == username) return "OWNER";

    let isAdmin: Boolean[] = channel.admin.map((el) => el.username == username);
    if (isAdmin.indexOf(true) != -1) return "ADMIN";

    return "USER";
  };

  return (
    <ChatContext.Provider
      value={{
        selected: selected,
        setSelectedChannel: setSelectedChannel,
        getChannelRole: getChannelRole,
        myChannel: myChannel,
        myRole: myRole,
        sendMessageToSelectedChannel: sendMessageToSelectedChannel,
        blockedUser: blockedUser,
      }}
    >
      {props.children}
    </ChatContext.Provider>
  );
};

export { ChatContextProvider, ChatContext };
