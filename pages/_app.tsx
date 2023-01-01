import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "/context/provider";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <Component {...pageProps} />;
    </Provider>
  );
}

export default MyApp;
