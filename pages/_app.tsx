import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "context/provider";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import { Chivo } from "@next/font/google";

const chivo = Chivo({ subsets: ["latin-ext"] });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <Component {...pageProps} className={chivo.className} />
    </Provider>
  );
}

export default MyApp;
