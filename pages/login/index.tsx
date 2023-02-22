import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import styles from "/styles/Login.module.css";

import CustomNavbar from "components/navbar/navbar";
import { useThemeContext } from "context/context";

import { Form, FormInput, FormGroup, Button } from "shards-react";

import {
  useAuthState,
  useSignInWithEmailAndPassword,
} from "react-firebase-hooks/auth";
import { useLoginFirebaseState } from "hooks/useFirebaseCredentials";
import { auth } from "../../firebase/firebaseconf";

import { useEffect, useState } from "react";
import router from "next/router";

import { getApps } from "firebase/app";

import {
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
  User,
  UserCredential,
} from "firebase/auth";

import { toast, ToastContainer } from "react-toastify";

const Login: NextPage = () => {
  const context = useThemeContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth);

  const [user2, loading2, error2] = useAuthState(auth);

  useEffect(() => {
    user2 && router.push("/dashboard");
  }, [user2]);

  useEffect(() => {
    if (error) {
      toast.error("Dogodila se greška...");
    }

    console.log(user);
  }, [user, loading, error]);

  const login = async () => {
    try {
      await signInWithEmailAndPassword(email, password);

      if (error) {
        console.log(error);
        throw Error();
      }
    } catch (e) {
      console.log(e);
      throw Error();
    }
    //console.log(test, "TESAfasjnodiwsa");
    //router.push("/dashboard");
  };

  function signInWithGoogle(): void {
    throw new Error("Function not implemented.");
  }

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
            <Form className={styles.login_form}>
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
                  className={styles.form_input}
                  id="#email"
                  placeholder="Unesite ovdje"
                  style={
                    context.theme === "dark"
                      ? {
                          color: "white",
                          background: "#232323",
                        }
                      : {}
                  }
                  onChange={(e) =>
                    setEmail((e.target as HTMLTextAreaElement).value)
                  }
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
                  className={styles.form_input}
                  type="password"
                  id="#password"
                  placeholder="Unesite ovdje"
                  style={
                    context.theme === "dark"
                      ? { color: "white", background: "#232323" }
                      : {}
                  }
                  onChange={(e) =>
                    setPassword((e.target as HTMLTextAreaElement).value)
                  }
                />
              </FormGroup>
              <Button
                //@ts-ignore
                theme={context.theme === "dark" ? "white" : "dark"}
                outline
                block
                onClick={() => {
                  toast.promise(login, {
                    pending: "Prijava u tijeku...",
                    success: "Prijava uspješno izvršena!",
                    error: "Dogodila se greška tijekom prijave...",
                  });
                }}
                className={styles.registration_button}
              >
                <b>Prijavite se</b>
              </Button>
              <p className={styles.bottom_text}>
                <br />
                Nemate račun?{" "}
                <Link href="/register">Registrirajte se ovdje.</Link>
                <br />
                Zaboravili ste lozinku?{" "}
                <Link href="/reset-password">Zatražite promjenu lozinke.</Link>
              </p>
            </Form>
            <div
              style={{
                width: "0.6px",
                background:
                  context.theme === "dark"
                    ? "rgba(255, 255, 255, 0.15)"
                    : "rgba(0, 0, 0, 0.35)",
              }}
            ></div>
            <div className={styles.login_buttons}>
              <button
                onClick={() => signInWithGoogle()}
                className={`${styles.google_login_button} ${styles.login_button}`}
              >
                <Image
                  src={"/google_logo.png"}
                  width={22}
                  height={22}
                  alt="Google logo"
                  style={{ marginRight: 16 }}
                />
                Prijavi se s Googlom{" "}
              </button>
              <button
                onClick={() => {
                  const provider = new OAuthProvider("microsoft.com");
                  signInWithPopup(auth, provider)
                    .then((result) => {
                      // User is signed in.
                      // IdP data available in result.additionalUserInfo.profile.

                      // Get the OAuth access token and ID Token
                      const credential =
                        OAuthProvider.credentialFromResult(result);
                      const accessToken = credential?.accessToken;
                      const idToken = credential?.idToken;
                    })
                    .catch((error) => {
                      // Handle error.
                    });
                }}
                className={`${styles.microsoft_login_button} ${styles.login_button}`}
              >
                <Image
                  src={"/microsoft.png"}
                  width={20}
                  height={20}
                  alt="Google logo"
                  style={{ marginRight: 16 }}
                />
                Prijavi se s Microsoftom{" "}
              </button>
              <button
                onClick={() => {
                  const provider = new GithubAuthProvider();
                  signInWithPopup(auth, provider)
                    .then((result) => {
                      // This gives you a GitHub Access Token. You can use it to access the GitHub API.
                      const credential =
                        GithubAuthProvider.credentialFromResult(result);
                      const token = credential?.accessToken;
                      console.log(credential, token, result);

                      // The signed-in user info.
                      const user = result.user;
                      console.log(user);
                      // IdP data available using getAdditionalUserInfo(result)
                      // ...
                    })
                    .catch((error) => {
                      // Handle Errors here.
                      const errorCode = error.code;
                      const errorMessage = error.message;
                      // The email of the user's account used.
                      const email = error.customData.email;
                      // The AuthCredential type that was used.
                      const credential =
                        GithubAuthProvider.credentialFromError(error);
                      console.log(errorMessage, errorCode, email, credential);
                      // ...
                    });
                }}
                className={`${styles.github_login_button} ${styles.login_button}`}
              >
                <Image
                  src={"/github.svg"}
                  width={22}
                  height={22}
                  alt="Github logo"
                  style={{ marginRight: 16, filter: "invert(100%)" }}
                />
                Prijavi se s GitHubom{" "}
              </button>
            </div>
          </div>
        </main>
      </div>

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

export default Login;
