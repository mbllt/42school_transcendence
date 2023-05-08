import { FC, useEffect, useState } from "react";
import {
  User,
  addFriend,
  blockUser,
  deleteFriend,
  getAvatar,
  getBlockedUser,
  getFriends,
  unblockUser,
  Friend,
} from "../../services/user/UserService";
import useProfileSettings from "./useProfileSettings";
import { useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import AuthToken from "../../services/auth/AuthToken";
import axios from "axios";
import {
  Avatar,
  Box,
  Card,
  IconButton,
  Tooltip,
  Typography,
  useRadioGroup,
} from "@mui/material";

import TuneIcon from "@mui/icons-material/Tune";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import BlockIcon from "@mui/icons-material/Block";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import useProfileFriends from "./useProfileFriends";

export type ProfileCardProps = {
  user: User;
  isMyProfile: boolean;
};

const ProfileCard: FC<ProfileCardProps> = (props) => {
  const [settings, handleOpenSettings, handleCloseSettings] = useProfileSettings();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [friends, setFriends] = useState<Array<Friend>>([]);
  const [friendsList, handleOpenFriends, handleCloseFriends] = useProfileFriends({ friends });
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [avatar, setAvatar] = useState("");

  useQuery(["getFriends", props.user], getFriends, {
    onSuccess: (data: Friend[]) => {
      setIsFriend(false);
      setFriends(data);
      let user_username = props.user.username;
      data.map((friend: Friend) => {
        if (friend.username === user_username) setIsFriend(true)
      });
    },
    onError: (err) => {
      // //console.log(err);
    },
  });
  
  useQuery(["getBlockedUser", props.user], getBlockedUser, {
    onSuccess: (data: User[]) => {
      setIsBlocked(false);
      let user_blocked = props.user.username;
      data.map((blocked: User) => {
        if (blocked.username === user_blocked) setIsBlocked(true);
      });
    },
    onError: (err) => {
      // //console.log(err);
    },
  });

  const fetchAvatar = () => {
    return getAvatar(props.user.username);
  };

  const {} = useQuery(["getAvatar", props.user], fetchAvatar, {
    onSuccess: (data: any) => {
      setAvatar(data);
    },
    onError: (err) => {
      // //console.log(err);
    },
  });

  const postAddFriend = () => {
    let pseudo = props.user.username;
    if (pseudo) return addFriend(pseudo);
  };

  const { refetch: handleAddFriend, isFetching: addingFriendFetching } =
    useQuery(["addFriend"], postAddFriend, {
      enabled: false,
      onSuccess: () => {
        //console.log("here");
        setIsFriend(true);
        queryClient.refetchQueries("getFriends");
        queryClient.refetchQueries("getMe");
        navigate("../../profile/" + props.user.username);
      },
      onError: (err: any) => {
        // //console.log(err);
      },
    });

  const postRmvFriend = () => {
    return deleteFriend(props.user.username);
  };

  const { refetch: handleRmvFriend, isFetching: deletingFriendFetching } =
    useQuery(["deleteFriend"], postRmvFriend, {
      enabled: false,
      onSuccess: () => {
        setIsFriend(false);
        queryClient.refetchQueries("getFriends");
        queryClient.refetchQueries("getMe");
        navigate("../../profile/" + props.user.username);
      },
      onError: (err) => {
        // //console.log(err);
      },
    });

  const postBlockUser = () => {
    return blockUser(props.user.username);
  };

  const { refetch: handleBlockUser, isFetching: blockingUserFetching } =
    useQuery(["blockUser"], postBlockUser, {
      enabled: false,
      onSuccess: () => {
        setIsBlocked(true);
        queryClient.refetchQueries("getMe");
        queryClient.refetchQueries("getBlockedUser");
        navigate("../../profile/" + props.user.username);
      },
      onError: (err: any) => {
        // //console.log(err);
      },
    });

  const postUnblockUser = () => {
    return unblockUser(props.user.username);
  };

  const { refetch: handleUnblockUser, isFetching: unblockingUserFetching } =
    useQuery(["unblockUser"], postUnblockUser, {
      enabled: false,
      onSuccess: () => {
        setIsBlocked(false);
        queryClient.refetchQueries("getMe");
        queryClient.refetchQueries("getBlockedUser");
        navigate("../../profile/" + props.user.username);
      },
      onError: (err: any) => {
        // //console.log(err);
      },
    });

  return (
    <>
      {settings}
      {friendsList}
      <Card sx={{ p: 5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexDirection: "column",
            }}
          >
            <Avatar
              alt={props.user.username}
              src={avatar}
              sizes="small"
            />
            <Typography>{props.user.username}</Typography>
          </Box>
          {!props.isMyProfile ? (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {isFriend ? (
                <IconButton
                  onClick={() => {
                    handleRmvFriend();
                  }}
                  disabled={deletingFriendFetching}
                >
                  <Tooltip title="remove friend" placement="bottom-end">
                    <PersonRemoveIcon/>
                  </Tooltip>
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => {
                    handleAddFriend();
                  }}
                  disabled={addingFriendFetching}
                >
                  <Tooltip title="add friend" placement="bottom-end">
                    <PersonAddIcon/>
                  </Tooltip>
                </IconButton>
              )}
              {isBlocked ? (
                <IconButton
                  onClick={() => {
                    handleUnblockUser();
                  }}
                  disabled={unblockingUserFetching}
                >
                  <Tooltip title="unblock user" placement="bottom-end">
                    <AddCircleIcon/>
                  </Tooltip>
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => {
                    handleBlockUser();
                  }}
                  disabled={blockingUserFetching}
                >
                  <Tooltip title="block user" placement="bottom-end">
                    <BlockIcon/>
                  </Tooltip>
                </IconButton>
              )}
            </Box>
          ) : (
            <Box>
              <IconButton onClick={() => handleOpenFriends()}>
                <Tooltip title="friend list" placement="bottom-end">
                    <PeopleAltIcon />
                </Tooltip>
              </IconButton>
              <IconButton onClick={() => handleOpenSettings()}>
                <Tooltip title="settings" placement="bottom-end">
                    <TuneIcon />
                </Tooltip>
              </IconButton>
            </Box>
          )}
        </Box>
      </Card>
    </>
  );
};

export default ProfileCard;
