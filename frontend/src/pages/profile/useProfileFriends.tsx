import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  Typography,
  Divider,
  AppBar,
  Toolbar,
} from "@mui/material";
import AvatarWithBadge from "../../components/AvatarWithBadge";
import { Box } from "@mui/system";
import { Friend, getAvatar } from "../../services/user/UserService";
import { Link } from "react-router-dom";

type useProfileFriendsProps = {
  friends: Array<Friend>;
};

const useProfileFriends = (props: useProfileFriendsProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleOpen = (): void => {
    setOpen(true);
  };

  return [
    <>
      <Dialog onClose={handleClose} open={open} fullWidth={true}>
        <DialogTitle
          sx={{ display: "flex", justifyContent: "center", fontWeight: "bold" }}
        >
          Friends
        </DialogTitle>
        <Divider />
        <Box
          sx={{
            display: "flex",
            p: 3,
            alignItems: "center",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {props.friends.map((friend, key) => (
            <Box key={key} sx={{ flexGrow: 1, minWidth: 250 }}>
              <AppBar
                sx={{ border: 2, borderRadius: "8px", borderColor: "black" }}
                position="static"
              >
                <Link to={"/profile/" + friend.username}>
                  <Toolbar sx={{ display: "flex", alignItems: "center", cursor:'pointer' }} onClick={() => setOpen(false)}>
                    <AvatarWithBadge
                      status={friend.user_status}
                      id={friend.id}
                      username={friend.username}
                      src={import.meta.env.VITE_BACKEND_HOST + "/user/avatar?pseudo=" + friend.username}
                    ></AvatarWithBadge>
                    <Typography
                      align="center"
                      sx={{ flexGrow: 1, marginRight: 5 }}
                    >
                      {friend.username}
                    </Typography>
                  </Toolbar>
                  </Link>
              </AppBar>
            </Box>
          ))}
        </Box>
      </Dialog>
    </>,
    handleOpen,
    handleClose,
  ];
};

export default useProfileFriends;
