import type { NextPage } from "next";
import Head from "next/head";

import styles from "/styles/Register.module.css";

import CustomNavbar from "components/navbar/navbar";
import { useThemeContext } from "context/context";

import { Form, FormInput, FormGroup, Button } from "shards-react";

import {
  SendEmailVerificationHook,
  useAuthState,
  useCreateUserWithEmailAndPassword,
  useSendEmailVerification,
} from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebaseconf";
import {
  updateUserProfile,
  setRegistrationInfo,
} from "../../firebase/firebaseMethods";

import { MouseEventHandler, useEffect, useState } from "react";

import Link from "next/link";

import { useRouter } from "next/router";

import { sendEmailVerification } from "firebase/auth";

import { ToastContainer, toast } from "react-toastify";

const Register: NextPage = () => {
  const context = useThemeContext();
  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);
  const [user2, loading2, error2] = useAuthState(auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  //const [sendEmailVerification, sending, error1]: SendEmailVerificationHook =
  //  useSendEmailVerification(auth);

  useEffect(() => {
    if (user2) {
      router.push("/dashboard");
    }
  }, [user2]);

  useEffect(() => {
    if (user) {
      updateUserProfile({ displayName: username });
      sendEmailVerification(user.user);
      try {
        //@ts-ignore
        setRegistrationInfo(username, user.user.uid);
      } catch (e) {
        //@ts-ignore
        setRegistrationInfo(username, user.uid);
      }
    }
  }, [user]);

  const registerClick = async (): Promise<void> => {
    email &&
      password &&
      createUserWithEmailAndPassword &&
      //@ts-ignore
      (await createUserWithEmailAndPassword(email, password));
    //const _user = await updateUserProfile({ displayName: username });
  };

  return (
    <div className={styles.wrapper}>
      <Head>
        <title>Register</title>
        <meta name="description" content="Login website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className={styles.view_one}
        style={{ background: context.theme === "dark" ? "#212121" : "#ffffff" }}
      >
        <CustomNavbar />
        <main
          className={styles.main}
          style={{
            background: context.theme === "dark" ? "#212121" : "#ffffff",
          }}
        >
          <div className={styles.content_wrapper}>
            <Form className={styles.register_form}>
              <h3
                style={{
                  marginBottom: 32,
                  color: context.theme === "dark" ? "white" : "",
                }}
              >
                <b>Registriraj se</b>
              </h3>
              <FormGroup>
                <label
                  htmlFor="#username"
                  style={{ color: context.theme === "dark" ? "white" : "" }}
                >
                  Korisničko ime
                </label>
                <FormInput
                  className={styles.form_input}
                  type="text"
                  id="#username"
                  placeholder="Unjeti ovdje"
                  style={
                    context.theme === "dark"
                      ? {
                          color: "white",
                          background: "#232323",
                        }
                      : {}
                  }
                  onChange={(e) =>
                    setUsername((e.target as HTMLTextAreaElement).value)
                  }
                />
              </FormGroup>
              <FormGroup>
                <label
                  htmlFor="#email"
                  style={{ color: context.theme === "dark" ? "white" : "" }}
                >
                  E-mail adresa
                </label>
                <FormInput
                  className={styles.form_input}
                  type="email"
                  id="#email"
                  placeholder="Unjeti ovdje"
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
                  placeholder="Unjeti ovdje"
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
                onClick={() =>
                  toast.promise(
                    registerClick,
                    {
                      pending: "Registracija u tijeku...",
                      success:
                        "Uspješno je napravljen korisnički račun! Provjerite svoju e-poštu kako biste potvrdili svoju e-adresu!",
                      error:
                        "Dogodila se greška tijekom stvaranja korisničkog računa...",
                    },
                    { autoClose: 7000 }
                  ) as unknown as MouseEventHandler
                }
              >
                <b>Registriraj</b>
              </Button>
              <p>
                <br />
                Već registriran? <Link href="/login">Prijavi se ovdje.</Link>
              </p>
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

export default Register;
