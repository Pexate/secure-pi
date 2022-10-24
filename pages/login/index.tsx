import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import styles from "/styles/Login.module.css";

import CustomNavbar from "/components/navbar/navbar";
import { useThemeContext } from "/context/context";

import { Form, FormInput, FormGroup, Button } from "shards-react";

import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "/firebase/firebaseconf";

import { useEffect, useState } from "react";
import router from "next/router";

const Login: NextPage = () => {
  const context = useThemeContext();
  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    if (loading) {
      console.log("loading");
    }
    console.log(user);
  }, [user, loading]);

  const login = async () => {
    await signInWithEmailAndPassword(email, password);
    router.push("dashboard");
  };
  return (
    <div className={styles.wrapper}>
      <Head>
        <title>Prijava - securePi</title>
        <meta name="description" content="Login website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className={styles.view_one}
        style={{ background: context.theme === "dark" ? "#212121" : "#ffffff" }}
      >
        <CustomNavbar />
        <main className={styles.main}>
          <div className={styles.content_wrapper}>
            <Form>
              <h3
                style={{
                  marginBottom: 32,
                  color: context.theme === "dark" ? "white" : "",
                }}
              >
                <b>Prijava</b>
              </h3>
              <FormGroup>
                <label
                  htmlFor="#email"
                  style={{ color: context.theme === "dark" ? "white" : "" }}
                >
                  E-mail
                </label>
                <FormInput
                  id="#email"
                  placeholder="Unesi ovdje"
                  style={
                    context.theme === "dark"
                      ? {
                          color: "white",
                          background: "#232323",
                        }
                      : {}
                  }
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <label
                  htmlFor="#password"
                  style={{ color: context.theme === "dark" ? "white" : "" }}
                >
                  Lozinka
                </label>
                <FormInput
                  type="password"
                  id="#password"
                  placeholder="Unesi ovdje"
                  style={
                    context.theme === "dark"
                      ? { color: "white", background: "#232323" }
                      : {}
                  }
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormGroup>
              <Button
                theme={context.theme === "dark" ? "white" : "dark"}
                outline
                block
                onClick={() => {
                  login();
                }}
              >
                <b>Prijava</b>
              </Button>
              <p>
                <br />
                Nemaš račun? <Link href="/register">Registriraj se ovdje.</Link>
              </p>
            </Form>
          </div>
        </main>
      </div>

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

export default Login;
