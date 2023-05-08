import React, { useEffect, useState } from "react";
import { Card, Grid, Paper, Typography, styled } from "@mui/material";
import { Match } from "../services/stats/StatsService";
import Brightness1Icon from "@mui/icons-material/Brightness1";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#000000" : "#ffffff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#000000",
  border: 1.5,
  borderColor: "black",
}));

const SubBoxMatch = (props: { text: any }) => {
  return (
    <Grid item md={3} xs={12}>
      <Item elevation={24} sx={{}}>
        {props.text}
      </Item>
    </Grid>
  );
};

type MatchBoxProps = {
  keyn: number;
  match: Match;
  username: string | undefined;
};

const MatchBox = (props: MatchBoxProps) => {
  const [isWinner, setIsWinner] = useState<boolean>(false);

  useEffect(() => {
    //clear();
    //console.log("--------" + props.username + "------------");
    //console.log(props.match.is_player_a_winner);
    //console.log(
    //  props.match.players[props.match.is_player_a_winner ? 0 : 1].username
    //);
    if (
      props.match.players[props.match.is_player_a_winner ? 0 : 1].username ==
      props.username
    ) {
      setIsWinner(true);
    } else {
      setIsWinner(false);
    }
    //console.log("refresh is winner");
    //console.log("--------------------");
  });

  return (
    <Card elevation={0} sx={{ backgroundColor: "inherit", margin: "10px" }}>
      <Typography sx={{ fontFamily: "Arial", fontSize: "15px" }}>
        MATCH {props.keyn}
      </Typography>
      <Grid container key={props.keyn} spacing={1} sx={{ padding: "10px" }}>
        <SubBoxMatch
          text={
            <Typography>
              {props.match.players[0].username} VS{" "}
              {props.match.players[1].username}
            </Typography>
          }
        />
        <SubBoxMatch
          text={
            <>
              <Typography sx={{ paddingRight: "20px" }}>
                {isWinner ? "Win" : "Loose"}
              </Typography>
              {isWinner ? (
                <Brightness1Icon sx={{ color: "#4fb80f", fontSize: "20px" }} />
              ) : (
                <Brightness1Icon sx={{ color: "#c72e2e", fontSize: "20px" }} />
              )}
            </>
          }
        />
        <SubBoxMatch
          text={
            <Typography>
              {props.match.hardcore ? "Hardcore Mode" : "Classic Mode"}
            </Typography>
          }
        />
        <SubBoxMatch
          text={
            <Typography>
              {new Date(props.match.created_at).toLocaleDateString()}
            </Typography>
          }
        />
      </Grid>
    </Card>
  );
};

export default MatchBox;
