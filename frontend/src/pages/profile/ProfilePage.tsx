import { useQuery, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

import { User, getOtherUser } from "../../services/user/UserService";
import { AuthContext } from "../../contexts/AuthContext";

import StatMatchHistory from "./StatMatchHistory";
import ProfileCard from "./ProfileCard";
import { Typography } from "@mui/material";

const ProfilePage = () => {
  const { username } = useParams();
  const [isMyProfile, setIsMyProfile] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<User>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (username === user?.username) {
      setIsMyProfile(true);
    } else {
      setIsMyProfile(false);
    }
  }, [username, user]);

  const fetchOtherUser = () => {
    return getOtherUser(username);
  };

  useQuery(["getOtherUser", username], fetchOtherUser, {
    onSuccess: (data: User) => {
      setUserProfile(data);
    },
    onError: () => {
      navigate("/");
    },
  });

  return (
    <>
      {userProfile ? (
        <>
          <ProfileCard
            user={userProfile}
            isMyProfile={isMyProfile}
          ></ProfileCard>
          <StatMatchHistory
            user={userProfile}
            isMyProfile={isMyProfile}
          ></StatMatchHistory>
        </>
      ) : (
        <Typography>
          The profile you tried to access does not exist, sorry.
        </Typography>
      )}
    </>
  );
};

export default ProfilePage;
