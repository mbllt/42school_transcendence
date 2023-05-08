import React from 'react';
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import HomeIcon from '@mui/icons-material/Home';
import IconButton from "@mui/material/IconButton";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Container } from "@mui/system";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { Autocomplete, Card, TextField, Tooltip } from "@mui/material";
import { Logout } from "@mui/icons-material";
import { getUsers } from '../services/user/UserService';
import { useQuery } from 'react-query';

export default function Appbar() {
  const { user, logout } = React.useContext(AuthContext);
  const [players, setPlayers] = React.useState<string[]>([]);
  const navigate = useNavigate();

  useQuery(["getUsers"], getUsers, { // need parameter to refetch when list of users changes
    onSuccess: (data: string[]) => {
      setPlayers(data);
      //console.log("users :", players);
    },
    onError: (err) => {
      // //console.log(err);
    },
  });

  return (
    <Box>
      <Card sx={{ border: 2, borderRadius: "8px"  }}>
        <AppBar position="static" sx={{width:'100%'}}>
            <Container  sx={{width:'100%', display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Link to={"/profile/" + user?.username} style={{ textDecoration:'none' }}>
                  <IconButton
                    size="large"
                    aria-label="menu"
                    sx={{display:'flex'}}
                    >
                    <Tooltip title="profile" placement="bottom-end">
                      <AccountCircleIcon/>
                    </Tooltip>
                  </IconButton>
                </Link>
                <Link to="/" style={{ textDecoration:'none' }}>
                  <IconButton
                    size="large"
                    aria-label="menu"
                    sx={{display:'flex'}}
                    >
                    <Tooltip title="home" placement="bottom-end">
                      <HomeIcon/>
                    </Tooltip>
                  </IconButton>
                </Link>
                <IconButton
                  size="large"
                  aria-label="menu"
                  onClick={() => logout()}
                  sx={{display:'flex'}}
                  >
                  <Tooltip title="logout" placement="bottom-end">
                    <Logout/>
                  </Tooltip>
                </IconButton>
            </Container>
            <Autocomplete
              options={players}
              sx={{ width:'100%', height:'' }}
              onChange={(event: any, newValue: any) => {
                if (newValue) {navigate('/profile/' + newValue);}
              }}
              renderInput={(params) => <TextField sx={{}} {...params} label="Search" />}
            />
        </AppBar>
      </Card>
    </Box>
  );
}
