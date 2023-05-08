import {
  Button,
  Dialog,
  DialogContent,
  Drawer,
  Grid,
  MenuItem,
  Select,
  SpeedDial,
  TextField,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import ChatIcon from "@mui/icons-material/Chat";
import { Box, Container } from "@mui/system";
import { ChatContext } from "../../contexts/ChatContext";
import { ChannelList } from "./ChannelList";
import { ChatBox } from "./ChatBox";
import { ChatPanel } from "./ChatPanel";
import { useQuery, useQueryClient } from "react-query";
import {
  ChannelType,
  createChannel,
} from "../../services/channel/ChannelService";

const useChatDrawer = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const [createdChannelType, setCreatedChannelType] =
    useState<ChannelType>("PUBLIC");
  const [createdChannelPassword, setCreatedChannelPassword] =
    useState<string>("admin");

  const { selected, setSelectedChannel } = useContext(ChatContext);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFetchChannel = () => {
    let p = undefined;
    if (createdChannelType == "PRIVATE_WITH_PASSWORD") {
      p = createdChannelPassword;
    }
    return createChannel(createdChannelType, p);
  };

  const { isFetching: createLoading, refetch: handleCreate } = useQuery(
    "createChannel",
    handleFetchChannel,
    {
      enabled: false,
      onSuccess: () => {
        queryClient.refetchQueries("getPrivateChannel");
        setOpenCreateDialog(false);
      },
    }
  );

  useEffect(() => {
    if (open) {
      queryClient.refetchQueries("getPrivateChannel");
      queryClient.refetchQueries("getPublicChannel");
      queryClient.refetchQueries("getSelectedChannel");
    }
  }, [open]);

  return [
    <>
      {open && (
        <>
          {" "}
          <Drawer
            anchor={"bottom"}
            open={open}
            onClose={handleClose}
            sx={{ height: "70vh" }}
            PaperProps={{
              sx: {
                height: "70vh",
                maxHeight: "70vh",
              },
            }}
          >
            <Container sx={{ paddingTop: 2 }}>
              <Box sx={{ display: "flex", flexDirection: "row" }}>
                <Grid container spacing={1}>
                  <Grid item md={4}>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Button
                        variant="contained"
                        onClick={() => setOpenCreateDialog(true)}
                      >
                        Ajouter un nouveau channel
                      </Button>
                      <ChannelList></ChannelList>
                    </Box>
                  </Grid>
                  {selected && (
                    <>
                      <Grid item md={5}>
                        <ChatBox></ChatBox>
                      </Grid>
                      <Grid item md={3}>
                        <ChatPanel />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            </Container>
          </Drawer>
          <Dialog open={openCreateDialog}>
            <DialogContent>
              <Typography>Choisissez le type de channel</Typography>
              <Select
                value={createdChannelType}
                label="Type"
                onChange={(event: any) =>
                  setCreatedChannelType(event.target.value as ChannelType)
                }
              >
                <MenuItem value={"PUBLIC"}>Public</MenuItem>
                <MenuItem value={"PRIVATE_WITH_PASSWORD"}>
                  Privée avec password
                </MenuItem>
                <MenuItem value={"PRIVATE"}>Privée</MenuItem>
              </Select>
              {createdChannelType == "PRIVATE_WITH_PASSWORD" && (
                <TextField
                  value={createdChannelPassword}
                  onChange={(e: any) =>
                    setCreatedChannelPassword(e.target.value)
                  }
                ></TextField>
              )}
              <Button onClick={() => handleCreate()} disabled={createLoading}>
                Créer maintenant
              </Button>
            </DialogContent>
          </Dialog>
        </>
      )}
      <SpeedDial
        ariaLabel="SpeedDial basic example"
        sx={{ position: "fixed", right: 50, bottom: 30 }}
        icon={<ChatIcon />}
        onClick={handleOpen}
      ></SpeedDial>
    </>,
    handleOpen,
    handleClose,
  ];
};
export { useChatDrawer };
