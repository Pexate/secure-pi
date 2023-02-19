import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import styles from "/styles/Reset-password.module.css";

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

import { User, UserCredential } from "firebase/auth";

import { toast, ToastContainer } from "react-toastify";
import { resetPassword } from "../../firebase/firebaseMethods";

const ResetPassword: NextPage = () => {
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

  return (
    <div className={styles.wrapper}>
      <Head>
        <title>Resetiraj lozinku - securePi</title>
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
                <b>Resetiraj lozinku</b>
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
                  placeholder="Unesi ovdje"
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
              <Button
                //@ts-ignore
                theme={context.theme === "dark" ? "white" : "dark"}
                outline
                block
                onClick={() => {
                  toast.promise(
                    async () => {
                      await resetPassword(email);
                    },
                    {
                      pending: "Slanje e-maila u tijeku...",
                      success: "Poruka uspješno poslana!",
                      error: "Dogodila se greška tijekom slanja...",
                    }
                  );
                }}
              >
                <b>Pošalji e-mail</b>
              </Button>
            </Form>
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

export default ResetPassword;
