import type { NextPage } from "next";
import Head from "next/head";

import styles from "/styles/Register.module.css";

import CustomNavbar from "/components/navbar/navbar";
import { useThemeContext } from "/context/context";

import { Form, FormInput, FormGroup, Button } from "shards-react";

import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "/firebase/firebaseconf";
import { updateUserProfile } from "/firebase/firebaseMethods";

import { useEffect, useState } from "react";

import Link from "next/link";

const Register: NextPage = () => {
  const context = useThemeContext();
  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (loading) {
      console.log("loading");
    }
    console.log(user);
  }, [user, loading]);

  const registerClick: Function = async () => {
    await createUserWithEmailAndPassword(email, password);
    const _user = await updateUserProfile({ displayName: username });
    console.log(_user);
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
            <Form>
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
                  onChange={(e) => setUsername(e.target.value)}
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
                  placeholder="Unjeti ovdje"
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
                onClick={registerClick}
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

export default Register;
