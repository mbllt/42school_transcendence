import { createTheme, ThemeProvider } from "@mui/material";
import { SnackbarProvider } from "notistack";
import Appbar from "./layouts/Appbar";
import { AuthContextProvider } from "./contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";
import Router from "./router/Router";
import { ReactQueryDevtools } from "react-query/devtools";
import { ChatContextProvider } from "./contexts/ChatContext";
import Chat from "./layouts/chat/Chat";
import { IoProvider } from "socket.io-react-hook";
import { AxiosInterceptor } from "./services/AxiosInterceptor";

const theme = createTheme({
  palette: {
    mode: "light",
  },
});

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <SnackbarProvider maxSnack={3}>
            <IoProvider>
              <QueryClientProvider client={queryClient}>
                <AuthContextProvider>
                  <Appbar></Appbar>
                  <Router />
                  <ChatContextProvider>
                    <Chat />
                  </ChatContextProvider>
                </AuthContextProvider>
                <ReactQueryDevtools initialIsOpen={false} />
              </QueryClientProvider>
            </IoProvider>
            <AxiosInterceptor />
          </SnackbarProvider>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
