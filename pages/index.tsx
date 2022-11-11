import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import CustomNavbar from "/components/navbar/navbar";

import { useThemeContext } from "/context/context";

const Home: NextPage = () => {
  const context = useThemeContext();
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
          className={
            context.theme === "dark"
              ? styles.dark_wrapper
              : styles.light_wrapper
          }
        >
          <h1>Hello</h1>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tonči Crljen &copy; 2022{" "}
        </a>
      </footer>
    </div>
  );
};

export default Home;