import {
  Avatar,
  Box,
  Card,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { ChatContext } from "../../contexts/ChatContext";
import { FC, useContext, useEffect, useState } from "react";
import { Message } from "../../services/channel/ChannelService";
import { BlockedUser } from "../../services/user/UserService";

const ChatBox = () => {
  const { selected, blockedUser } = useContext(ChatContext);
  const [message, setMessage] = useState<Message[]>([]);

  useEffect(() => {
    if (selected != undefined) setMessage(selected.Message);
  }, [selected]);
  return (
    <>
      <Card>
        {message.map((el, key) => {
          let isB = false;
          blockedUser.map((bu: BlockedUser) => {
            if (el.sender.id == bu.id) {
              isB = true;
            }
          });
          if (!isB)
            return <ChatBoxMessage message={el} key={key}></ChatBoxMessage>;
        })}

        <ChatBoxInput />
      </Card>
    </>
  );
};

type ChatBoxMessageProps = {
  message: Message;
};
const ChatBoxMessage: FC<ChatBoxMessageProps> = (props) => {
  return (
    <Box sx={{ p: 1 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Avatar>{props.message.sender.username[0]}</Avatar>
        <Box>
          <Typography sx={{ fontWeight: "bold" }}>
            {props.message.sender.username}
          </Typography>
          <Typography>{props.message.content}</Typography>
        </Box>
      </Box>
    </Box>
  );
};
const ChatBoxInput = () => {
  const { sendMessageToSelectedChannel } = useContext(ChatContext);
  const [message, setMessage] = useState<string>("");

  const handleSendMessage = () => {
    if (message) sendMessageToSelectedChannel(message);
    setMessage("");
  };
  return (
    <Card sx={{ p: 1, backgroundColor: "primary.main", borderRadius: "0px" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          alignItems: "center",
          paddingLeft: 1,
        }}
      >
        <TextField
          variant="standard"
          sx={{ flexGrow: 1 }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {if (e.key == 'Enter') handleSendMessage();}}
        />
        <IconButton onClick={() => handleSendMessage()}>
          <SendIcon sx={{ color: "white" }} />
        </IconButton>
      </Box>
    </Card>
  );
};

export { ChatBox };
