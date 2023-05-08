import styled from "@emotion/styled";
import { Avatar, Badge } from "@mui/material";
import { Box } from "@mui/system";
import { FC, useState } from "react";
import { User, UserStatus } from "../services/user/UserService";
import { useQuery } from "react-query";

const ConnectedBadge = styled(Badge)(({ theme }: any) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#49FF00",
    color: "#49FF00",
  },
}));

const DisconnectedBadge = styled(Badge)(({ theme }: any) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#FF0000",
    color: "#FF0000",
  },
}));

const InGameBadge = styled(Badge)(({ theme }: any) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#003EFF",
    color: "#003EFF",
  },
}));

type AvatarWithBadgeProps = {
  id: number | undefined;
  username: string | undefined;
  src: string | undefined;
  status: string;
};
const AvatarWithBadge: FC<AvatarWithBadgeProps> = (props) => {
  let badge;

  switch (props.status) {
    case "CONNECTED":
      badge = ConnectedBadge;
      break;
    case "IN_GAME":
      badge = InGameBadge;
      break;

    case "DISCONNECTED":
      badge = DisconnectedBadge;
      break;

    default:
      badge = DisconnectedBadge;
      break;
  }

  return (
    <>
      <Box
        component={badge}
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        variant="dot"
        sx={{cursor:'pointer'}}
      >
        <Avatar
          alt={props.username}
          src={props.src}
          sizes="small"
          />
      </Box>
    </>
  );
};

export default AvatarWithBadge;
