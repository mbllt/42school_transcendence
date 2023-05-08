import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { FC, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { AuthContext } from "../../contexts/AuthContext";
import { ChatContext } from "../../contexts/ChatContext";
import {
  addUserToChannel,
  changePassword,
  changeType,
  ChannelRole,
  ChannelType,
  createDuel,
  createSanctionUser,
  deleteChannel,
  demoteAdmin,
  leaveChannel,
  promoteAdmin,
} from "../../services/channel/ChannelService";
import { User } from "../../services/user/UserService";
import DoneIcon from "@mui/icons-material/Done";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import StarIcon from "@mui/icons-material/Star";
import { Link } from "react-router-dom";

const channelRolesIcon: Record<ChannelRole, any> = {
  OWNER: (
    <Tooltip title="Owner">
      <StarIcon />
    </Tooltip>
  ),
  ADMIN: (
    <Tooltip title="Administrateur">
      <SupervisorAccountIcon />
    </Tooltip>
  ),
  USER: <></>,
};

const ChatPanel = () => {
  const { selected, myRole } = useContext(ChatContext);

  const handleLeave = () => {
    if (selected?.id) return leaveChannel(selected.id);
  };

  const LeaveButton = () => {
    return (
      <Grid item>
        <Button variant="contained" color="error" onClick={handleLeave}>
          Leave group
        </Button>
      </Grid>
    );
  };

  const DeleteButton = () => {
    const handleDelete = () => {
      if (selected?.id) return deleteChannel(selected.id);
    };

    return (
      <Grid item>
        <Button variant="contained" color="error" onClick={handleDelete}>
          Delete group
        </Button>
      </Grid>
    );
  };

  return (
    <Card sx={{ p: 1 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography sx={{ fontWeight: "bold" }}>{selected?.id}</Typography>
          <Box>
            <Typography>{selected?.users.length} membres</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {selected?.users.map((el: User, key: number) => {
                return <ChatMemberCard user={el} key={key}></ChatMemberCard>;
              })}
            </Box>
          </Box>
        </Box>
        {myRole == "OWNER" && selected?.type == "PRIVATE_WITH_PASSWORD" && (
          <GroupPasswordSelector />
        )}
        {myRole == "OWNER" && <GroupTypeSelector />}
        {(myRole == "OWNER" || myRole == "ADMIN") && <GroupAdd />}
        {myRole == "OWNER" && <DeleteButton></DeleteButton>}
        {myRole != "OWNER" && <LeaveButton></LeaveButton>}
      </Box>
    </Card>
  );
};

const GroupAdd = () => {
  const queryClient = useQueryClient();
  const { selected, myRole } = useContext(ChatContext);
  const [username, setUsername] = useState<string>("");

  const fetchAddUser = () => {
    if (selected) return addUserToChannel(selected?.id, username);
  };

  const { refetch: handleAddUser } = useQuery("addUser", fetchAddUser, {
    enabled: false,
    onSuccess: () => {
      //queryClient.refetchQueries("getSelectedChannel");
    }
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography>Add user</Typography>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <TextField
          sx={{ flexGrow: 1 }}
          value={username}
          onChange={(data) => setUsername(data.target.value)}
          onKeyDown={(e) => {if (e.key == 'Enter') handleAddUser();}}
        />
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box>
            <IconButton onClick={() => handleAddUser()}>
              <DoneIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const GroupPasswordSelector = () => {
  const { selected, myRole } = useContext(ChatContext);
  const queryClient = useQueryClient();
  const [password, setPassword] = useState<string>("");

  const fetchChangePassword = () => {
    if (selected) return changePassword(selected?.id, password);
  };
  const { refetch: handleChangePassword } = useQuery(
    "ChangePassword",
    fetchChangePassword,
    {
      enabled: false,
      onSuccess: () => {
        //queryClient.refetchQueries("getSelectedChannel");
        setPassword("");
      },
    }
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography>Change password</Typography>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <TextField
          sx={{ flexGrow: 1 }}
          value={password}
          onChange={(data) => setPassword(data.target.value)}
        />
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box>
            <IconButton onClick={() => handleChangePassword()}>
              <DoneIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
const GroupTypeSelector = () => {
  const [type, setType] = useState<ChannelType>();
  const { selected, myRole } = useContext(ChatContext);
  const queryClient = useQueryClient();

  const fetchChangeGroupType = ({ signal, queryKey }: any) => {
    if (selected?.id != undefined)
      return changeType(selected.id, queryKey[1] as ChannelType);
  };

  const { refetch: handleChangeType } = useQuery(
    ["ChangeType", type],
    fetchChangeGroupType,
    {
      enabled: false,
      onSuccess: () => {
        queryClient.refetchQueries("getSelectedChannel");
        queryClient.refetchQueries("getPrivateChannel");
      },
    }
  );
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography>Groupe type</Typography>
      <ToggleButtonGroup
        color="primary"
        value={type}
        exclusive
        onChange={(_, s) => setType(s as ChannelType)}
      >
        <ToggleButton value="PUBLIC">Public</ToggleButton>
        <ToggleButton value="PRIVATE_WITH_PASSWORD">
          Privée avec mot de passe
        </ToggleButton>
        <ToggleButton value="PRIVATE">Privée</ToggleButton>
      </ToggleButtonGroup>
      <Button
        variant="contained"
        disabled={type == undefined}
        onClick={() => handleChangeType()}
      >
        Valider
      </Button>
    </Box>
  );
};

//<TextField sx={{ flexGrow: 1 }} value={selected?.password} />
type ChatMemberCardProps = {
  user: User;
};
const ChatMemberCard: FC<ChatMemberCardProps> = (props) => {
  const { selected, myRole, getChannelRole } = useContext(ChatContext);
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [role, setRole] = useState<ChannelRole>("USER");

  useEffect(() => {
    setRole(getChannelRole(props.user.username, selected));
  });

  type SanctionButtonProps = {
    type: "MUTE" | "BAN";
  };
  const SanctionButton: FC<SanctionButtonProps> = ({ type }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [duration, setDuration] = useState<number>(10);

    const fetchSanctionUser = () => {
      if (selected && props.user.username)
        return createSanctionUser(
          selected.id,
          props.user.username,
          type,
          duration
        );
    };
    const { refetch: handleSanction } = useQuery("banUser", fetchSanctionUser, {
      enabled: false,
      onSuccess: () => {
        queryClient.refetchQueries("getSelectedChannel");
        if (type == "BAN") queryClient.refetchQueries("getPrivateChannel");
      },
    });

    return (
      <>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>
            Choisir une durée de {type.toLocaleLowerCase()} en seconde.
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Select
                value={duration}
                onChange={(e) => setDuration(e.target.value as number)}
                input={<OutlinedInput label="Age" />}
              >
                <MenuItem value={10}>10 secondes</MenuItem>
                <MenuItem value={100}>100 secondes</MenuItem>
                <MenuItem value={1000000000}>1000000000 secondes</MenuItem>
              </Select>
              <Button variant="contained" onClick={() => handleSanction()}>
                Valider
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
        <Grid item>
          <Button variant="contained" onClick={() => setOpen(true)}>
            {type}
          </Button>
        </Grid>
      </>
    );
  };

  const DuelButton = () => {
    const handleDuel = () => {};
    return (
      <Grid item>
        <Button
          variant="contained"
          onClick={() =>
            createDuel(
              selected?.id ? selected.id : "-1",
              props.user.id ? props.user.id : -1
            )
          }
        >
          Duel
        </Button>
      </Grid>
    );
  };

  const DemoteButton = () => {
    const fetchDemoteAdmin = () => {
      if (selected && props.user.username) {
        return demoteAdmin(selected.id, props.user.username);
      }
    };

    const { refetch: handleDemote } = useQuery(
      "channelPromote",
      fetchDemoteAdmin,
      {
        onSuccess: () => {
          queryClient.refetchQueries("getSelectedChannel");
        },
        enabled: false,
      }
    );
    return (
      <Grid item>
        <Button variant="contained" onClick={() => handleDemote()}>
          Demote admin
        </Button>
      </Grid>
    );
  };

  const PromoteButton = () => {
    const fetchPromoteAdmin = () => {
      if (selected && props.user.username)
        return promoteAdmin(selected.id, props.user.username);
    };

    const { refetch: handlePromote } = useQuery(
      "channelPromote",
      fetchPromoteAdmin,
      {
        enabled: false,
        onSuccess: () => {
          queryClient.refetchQueries("getSelectedChannel");
        },
      }
    );
    return (
      <Grid item>
        <Button onClick={() => handlePromote()} variant="contained">
          Promote admin
        </Button>
      </Grid>
    );
  };

  const KickButton = () => {
    const fetchKickUser = () => {
      if (selected && props.user.username)
        return createSanctionUser(selected.id, props.user.username, "BAN", 0);
    };
    return (
      <Grid item>
        <Button onClick={() => fetchKickUser()} variant="contained">
          Kick
        </Button>
      </Grid>
    );
  };

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "left",
        p: 2,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex" }}>
          <Box sx={{ display: "flex", flexGrow: 1, gap: 1 }}>
            <Link to={"/profile/" + props.user.username}>
              <Typography sx={{ fontWeight: "bold" }}>
                {props.user.username}
              </Typography>
            </Link>
          </Box>
          <Box>
            <Typography>{channelRolesIcon[role]}</Typography>
          </Box>
        </Box>
        <Box>
          <Grid container spacing={1}>
            {props.user.username != user?.username &&
              (myRole == "ADMIN" || myRole == "OWNER") &&
              role == "USER" && <SanctionButton type="MUTE" />}
            {props.user.username != user?.username &&
              (myRole == "ADMIN" || myRole == "OWNER") &&
              role == "USER" && <SanctionButton type="BAN" />}
            {props.user.username != user?.username &&
              (myRole == "ADMIN" || myRole == "OWNER") &&
              role == "USER" && <KickButton />}
            {props.user.username != user?.username &&
              myRole == "OWNER" &&
              role == "USER" && <PromoteButton />}

            {props.user.username != user?.username &&
              myRole == "OWNER" &&
              role == "ADMIN" && <DemoteButton />}
            {props.user.username != user?.username && <DuelButton />}
          </Grid>
        </Box>
      </Box>
    </Card>
  );
};

export { ChatPanel };
