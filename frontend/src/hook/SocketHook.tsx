import { useSocket } from "socket.io-react-hook";
import AuthToken from "../services/auth/AuthToken";

export const useAuthenticatedSocket = (
  namespace: string,
  gameroom_id?: string
) => {
  if (gameroom_id) {

    return useSocket("ws://" + import.meta.env.VITE_BACKEND_IP + namespace, {
      autoConnect: true,
      enabled: true,
      auth: {
        authorization: new AuthToken().getToken(),
        gameroom: gameroom_id,
      },
    });
  } else {
    return useSocket("ws://" + import.meta.env.VITE_BACKEND_IP + namespace, {
      enabled: true,
      auth: {
        authorization: new AuthToken().getToken(),
      },
    });
  }
};
