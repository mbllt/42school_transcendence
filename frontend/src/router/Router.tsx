import { Route, Routes } from "react-router-dom";
import { FC } from "react";
import { Navigate, Outlet } from "react-router-dom";
import ProfilePage from "../pages/profile/ProfilePage";
import { GameContextProvider } from "../contexts/GameContext";
import { Game } from "../pages/game/Game";
import Home from "../pages/home/Home";
import Error404 from "../pages/Error404";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile/:username" element={<ProfilePage />} />
      <Route
        path="/game/:id"
        element={
          <GameContextProvider>
            <Game></Game>
          </GameContextProvider>
        }
      />
      <Route path="*" element={<Error404/>}/>
    </Routes>
  );
};

type ProtectedRouteProps = {
  isAllowed: boolean;
  redirectPath: string;
  children?: React.ReactNode;
};

const ProtectedRoute: FC<ProtectedRouteProps> = (props) => {
  if (!props.isAllowed) {
    return <Navigate to={props.redirectPath} replace />;
  }
  return props.children ? <> {props.children} </> : <Outlet />;
};

export default Router;
