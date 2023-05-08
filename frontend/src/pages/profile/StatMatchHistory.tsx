import { FC, useEffect, useState } from "react";
import { ProfileCardProps } from "./ProfileCard";
import { Card, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import {
  Match,
  Stats,
  getMatchHistory,
  getStats,
} from "../../services/stats/StatsService";
import { useQuery } from "react-query";
import {
  PercentRounded,
  SportsEsportsRounded,
  SentimentVeryDissatisfiedRounded,
} from "@mui/icons-material";
import StatBox from "../../components/StatBox";
import MatchBox from "../../components/MatchBox";

const StatMatchHistory: FC<ProfileCardProps> = (props) => {
  const [matches, setMatches] = useState<Match[]>();
  const [stats, setStats] = useState<Stats>();
  const [username, setUsername] = useState<string | undefined>(undefined);

  useEffect(() => {
    setUsername(props.user.username);
  }, [props.user.username]);

  useEffect(() => {
    //console.log("change pour : " + username);
    if (username != undefined) {
      fetchStats().then((data: Stats) => {
        setStats(data);
      });
      fetchMatchHistory().then((data: Match[]) => {
        setMatches(data);
      });
    }
  }, [username]);

  const fetchStats = () => {
    //console.log("-> " + username);
    return getStats(username);
  };

  const fetchMatchHistory = () => {
    //console.log("-> " + username);
    return getMatchHistory(username);
  };

  const { refetch: handleFetchMatchHistory } = useQuery(
    ["getMatchHistory"],
    fetchMatchHistory,
    {
      enabled: false,
      onSuccess: (data) => {
        setMatches(data);
      },
      onError: (err) => {
        // //console.log(err);
      },
    }
  );

  return (
    <>
      <Box sx={{ flexGrow: 1, paddingTop: 5, textAlign: "center" }}>
        <Card
          sx={{
            backgroundColor: "#1976D2",
            p: 1,
            marginBottom: 2.5,
            border: 1.5,
            borderColor: "black",
            borderRadius: "8px",
          }}
        >
          <Typography
            sx={{ fontFamily: "Arial", fontWeight: "bold", p: "10px" }}
          >
            STATS
          </Typography>
          {stats && (
            <Grid
              container
              spacing={1}
              sx={{
                paddingBottom: 1,
                paddingTop: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <StatBox
                icon={<SportsEsportsRounded />}
                string1="Games Played :"
                val1={stats.numberParty}
                string2="Games Won :"
                val2={stats.numberWin}
              />
              <StatBox
                icon={<SentimentVeryDissatisfiedRounded />}
                string1="Hardcore Games Played :"
                val1={stats.numberPartyHardcore}
                string2="Hardcore Games Won :"
                val2={stats.numberPartyHardcoreWon}
              />
              <StatBox
                icon={<PercentRounded />}
                string1="Win Ratio : "
                val1={stats.winRatio ? stats.winRatio?.toFixed(2) : "N/A"}
                string2="Hardcore Win Ratio : "
                val2={
                  stats.hardcoreWinRatio
                    ? stats.hardcoreWinRatio?.toFixed(2)
                    : "N/A"
                }
              />
            </Grid>
          )}
        </Card>

        <Card
          sx={{
            backgroundColor: "#1976D2",
            p: 1,
            marginBottom: 2.5,
            border: 1.5,
            borderColor: "black",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItem: "center",
          }}
        >
          <Typography
            sx={{ fontFamily: "Arial", fontWeight: "bold", p: "10px" }}
          >
            LAST FIVE GAMES
          </Typography>
          {matches &&
            matches.map((match, key) => (
              <MatchBox
                key={key}
                keyn={key}
                match={match}
                username={username}
              />
            ))}
        </Card>
      </Box>
    </>
  );
};

export default StatMatchHistory;
