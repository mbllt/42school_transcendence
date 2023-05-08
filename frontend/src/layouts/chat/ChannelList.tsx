import {
  Button,
  Card,
  CardActionArea,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { FC, useContext, useState } from "react";
import { useQuery } from "react-query";
import { ChatContext } from "../../contexts/ChatContext";
import {
  Channel,
  ChannelType,
  getPublicChannel,
  joinChannel,
} from "../../services/channel/ChannelService";
import GroupIcon from "@mui/icons-material/Group";
import HttpsIcon from "@mui/icons-material/Https";
import ShieldIcon from "@mui/icons-material/Shield";
import PublicIcon from "@mui/icons-material/Public";
import { SettingsApplicationsOutlined } from "@mui/icons-material";

type ChannelListCategoryProps = {
  title: string;
  children?: any;
};
const ChannelListCategory: FC<ChannelListCategoryProps> = (props) => {
  return (
    <Box>
      <Typography sx={{ fontWeight: "bold", color: "white" }}>
        {props.title}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          overflowY: "scroll",
          gap: 0.2,
        }}
      >
        {props.children}
      </Box>
    </Box>
  );
};
const ChannelList = () => {
  const [publicChannel, setPublicChannel] = useState<Channel[]>([]);
  const { selected, setSelectedChannel, myChannel } = useContext(ChatContext);
  const [dialog, openJoin, closeJoin] = useJoinDialog();

  const fetchPublicChannel = () => {
    return getPublicChannel();
  };
  useQuery("getPublicChannel", fetchPublicChannel, {
    onSuccess: (data: Channel[]) => {
      setPublicChannel(data);
    },
  });

  return (
    <>
      {dialog}
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: 1,
          backgroundColor: "primary.main",
        }}
      >
        <ChannelListCategory title="Vos channels">
          {myChannel.map((el: Channel, key: number) => (
            <ChannelItem
              key={key}
              channel={el}
              selectable={true}
              onClick={setSelectedChannel}
            ></ChannelItem>
          ))}
        </ChannelListCategory>
        <ChannelListCategory title="Channels publiques ou protégés par un mot de passe">
          {publicChannel.map((el: Channel, key: number) => (
            <ChannelItem
              key={key}
              channel={el}
              selectable={true}
              onClick={() => openJoin(el)}
            ></ChannelItem>
          ))}
        </ChannelListCategory>
      </Card>
    </>
  );
};

const useJoinDialog = () => {
  const [password, setPassword] = useState<string>("");
  const [channel, setChannel] = useState<Channel>();
  const [open, setOpen] = useState<boolean>(false);

  const handleJoinChannel = (c: Channel) => {
    if (c.type == "PRIVATE_WITH_PASSWORD") joinChannel(c.id, password);
    else joinChannel(c.id);
    closeDialog();
  };

  const openDialog = (c: Channel) => {
    setChannel(c);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  return [
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Join the channel {channel?.id}</DialogTitle>
      <DialogContent>
        {channel?.type == "PRIVATE_WITH_PASSWORD" && (
          <TextField
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            fullWidth
            variant="standard"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleJoinChannel(channel)}>Join</Button>
      </DialogActions>
    </Dialog>,
    openDialog,
    closeDialog,
  ];
};

type ChannelItemProps = {
  channel: Channel;
  selectable: boolean;
  onClick: any;
};
const ChannelItem: FC<ChannelItemProps> = (props) => {
  const { selected } = useContext(ChatContext);

  const channelPrivacy: Record<ChannelType, any> = {
    PUBLIC: <PublicIcon />,
    PRIVATE: <ShieldIcon />,
    PRIVATE_WITH_PASSWORD: <HttpsIcon />,
  };

  return (
    <CardActionArea
      disabled={!props.selectable}
      onClick={() => props.onClick(props.channel.id)}
    >
      <Card
        sx={{
          padding: 2,
          ...(selected === props.channel && {
            color: "primary.main",
          }),
        }}
      >
        <Box sx={{ display: "flex" }}>
          <Box sx={{ display: "flex", flexGrow: 1, gap: 2 }}>
            <GroupIcon />
            <Typography>
              {props.channel.users.map((el) => el.username).join(" ")}
            </Typography>
          </Box>
          {channelPrivacy[props.channel.type]}
        </Box>
      </Card>
    </CardActionArea>
  );
};

export { ChannelList };
