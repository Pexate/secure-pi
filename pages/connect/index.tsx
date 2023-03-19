import type { NextPage } from "next";
import Head from "next/head";
import styles from "/styles/Connect.module.css";
import CustomNavbar from "components/navbar/navbar";

import { useThemeContext } from "context/context";

import { stream, connect } from "../../firebase/webrtc";
import { auth } from "../../firebase/firebaseconf";
import { getAllUserIds, getDeviceName } from "../../firebase/firebaseMethods";

import { FormEvent, useEffect, useRef, useState } from "react";

import {
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  FormInput,
  Button,
} from "shards-react";

import { useAuthState } from "react-firebase-hooks/auth";

import { useRouter } from "next/router";

const Home: NextPage = () => {
  const context: { theme: string; setTheme: () => void } = useThemeContext();
  const [id, setId] = useState<null | string>(null);
  const [name, setName] = useState<null | string>(null);
  const videoRef = useRef(null);
  let dontTryAgain = false;

  const router = useRouter();

  const [user, loading, error] = useAuthState(auth);
  const { pid } = router.query;

  useEffect(() => {
    try {
      console.log(pid, Array.isArray(pid), pid[0], user, !dontTryAgain);
    } catch (e) {}
    if (pid && Array.isArray(pid) && pid[0] && user && !dontTryAgain) {
      dontTryAgain = true;
      connect(pid[0], user?.uid, videoRef);
      getDeviceName(pid[0]).then((deviceName) => setName(deviceName));
    }
  }, []);

  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
    }
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>SecurePi</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main
        className={styles.main}
        style={{ background: context.theme === "dark" ? "#212121" : "#ffffff" }}
      >
        <CustomNavbar />
        <div
          className={`${
            context.theme === "dark"
              ? styles.dark_wrapper
              : styles.light_wrapper
          } ${styles.wrapper}`}
        >
          <div className={styles.watch_wrapper}>
            <div
              className={name ? styles.watch_wrapper_info : styles.display_none}
            >
              <b style={{ textAlign: "center" }}>{name ? name : ""}</b>
              <p>{pid ? pid : id}</p>
            </div>
            <video
              className={`${styles.stream_video} ${
                context.theme === "dark"
                  ? styles.stream_video_light
                  : styles.stream_video_dark
              }`}
              id="streamVideo"
              autoPlay
              ref={videoRef}
              style={{ display: name ? "block" : "none" }}
            ></video>
            <InputGroup className={name ? styles.display_none : ""}>
              <FormInput
                className={`${styles.id_input} ${
                  context.theme === "dark"
                    ? styles.id_input_dark
                    : styles.id_input_light
                }`}
                onChange={(e: FormEvent<any>) => {
                  const target = e.target as HTMLInputElement;
                  target && setId(target.value);
                }}
                placeholder="Pi id"
                size="lg"
                style={
                  context.theme === "dark"
                    ? { color: "white", background: "#232323" }
                    : {}
                }
              />
              <InputGroupAddon type="append">
                <Button
                  theme={context.theme === "dark" ? "light" : "dark"}
                  onClick={async () => {
                    if (id && user) await connect(id, user?.uid, videoRef);
                    id &&
                      getDeviceName(id).then((deviceName) =>
                        setName(deviceName)
                      );
                  }}
                >
                  Gledaj
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      </main>

      <footer
        className={styles.footer}
        style={
          context.theme === "dark"
            ? {
                backgroundColor: "#1d1d1d",
                border: "none",
                color: "white",
              }
            : {
                border: "none",
                backgroundColor: "#eee",
                color: "black",
              }
        }
      >
        Tonči Crljen &copy; 2023{" "}
      </footer>
    </div>
  );
};

export default Home;
