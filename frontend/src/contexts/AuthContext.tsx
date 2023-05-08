import React, { createContext, FC, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthToken from "../services/auth/AuthToken";
import { getMe, User } from "../services/user/UserService";
import { Login } from "../pages/login/Connection";
import { useQuery, useQueryClient } from "react-query";

export type AuthContextProps = {
  connected: boolean;
  user: User | undefined;
  logout: Function;
  setConnected: Function;
};

export type AuthProviderProps = {
  children?: any;
};

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

const useQueryParams = () => {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
};

const AuthContextProvider: FC<AuthProviderProps> = (props) => {
  const [connected, setConnected] = useState<boolean>(false);
  const [user, setUser] = useState<User | undefined>(undefined);

  const navigate = useNavigate();

  const logout = () => {
    new AuthToken().setToken(null);
    setConnected(false);
    setUser(undefined);
    navigate("/");
  };

  const { refetch: fetchGetMe } = useQuery(["getMe", connected], getMe, {
		enabled: false,
		onSuccess: (data) => {
      	setUser(data);
      },
      onError: (err) => {
        // //console.log(err)
      },
    });
    
    const successConnect = () => {
      fetchGetMe()
      setConnected(true);
  }

  useEffect(() => {
    if (connected || new AuthToken().hasToken()) {
      successConnect();
    }
  }, [connected]);

  return (
    <AuthContext.Provider
      value={{
        connected: connected,
        user: user,
        logout: logout,
        setConnected: setConnected,
      }}
    >
      {user == undefined ? <Login /> : props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextProvider, useQueryParams };
