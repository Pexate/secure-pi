import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import CustomNavbar from "components/navbar/navbar";

import { useThemeContext } from "context/context";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/firebaseconf";

import { useEffect } from "react";
import router from "next/router";
import { useFirebaseState } from "hooks/useFirebaseCredentials";
import { User } from "firebase/auth";
import Link from "next/link";

const Home: NextPage = () => {
  const context = useThemeContext();
  const [user, loading, error] = useAuthState(auth);
  useEffect(() => {
    if (user && loading === false) router.push("/dashboard");
  }, [user, loading, error]);
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
          className={`${styles.content_wrapper} ${
            context.theme === "dark"
              ? styles.dark_wrapper
              : styles.light_wrapper
          }`}
        >
          <h1
            className={styles.main_header}
            style={{ color: context.theme === "dark" ? "white" : "black" }}
          >
            SecurePi - sustav za nadzor objekta
          </h1>
          <h3 style={{ color: context.theme === "dark" ? "white" : "black" }}>
            Gdje započeti?
          </h3>
          <p>
            Da biste pristupili mogućnostima sustava, registrirajte se ili
            prijavite na sljedećoj poveznici: <Link href="/login">Prijava</Link>{" "}
            ili <Link href="/register">Registracija</Link>
          </p>
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
