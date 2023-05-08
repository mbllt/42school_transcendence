import axios from "axios";
import { useEffect } from "react";
import { useSnackbar } from "notistack";

type ErrorMessage = {
  //{"statusCode":400,"message":"No user found."}
  statusCode: number;
  message: string;
};
const AxiosInterceptor = ({ children }: any) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    const resInterceptor = (response: any) => {
      /*
      if (typeof response.data == "string") {
        enqueueSnackbar(response.data, { variant: "success" });
      }
      */
      if (response?.data?.message != undefined) {
        let m = response.data.message as string;
        if (m.length < 50)
          enqueueSnackbar(response?.data?.message, {
            preventDuplicate: true,
            variant: "success",
          });
      }
      return response;
    };

    const errInterceptor = (error: any) => {
      let msg = error.response?.data?.message;
      if (msg != undefined) {
        if (msg != "You are not in this channel.")
          enqueueSnackbar(error.response?.data?.message, {
            preventDuplicate: true,
            variant: "error",
          });
      }
      return Promise.reject(error);
    };

    const interceptor = axios.interceptors.response.use(
      resInterceptor,
      errInterceptor
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);
  return children;
};

export { AxiosInterceptor };
