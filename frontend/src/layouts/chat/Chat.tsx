import { Grid } from "@mui/material";
import { useContext } from "react";
import { ChatContext } from "../../contexts/ChatContext";
import { ChatBox } from "./ChatBox";
import { useChatDrawer } from "./ChatDrawer";

const Chat = () => {
  const [chatDrawer, handleOpen, handleClose] = useChatDrawer();
  const { selected } = useContext(ChatContext);
  return <>{chatDrawer}</>;
};

export default Chat;
