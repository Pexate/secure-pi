import type { NextPage } from "next";
import Head from "next/head";
import styles from "/styles/Contact.module.css";
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
  Form,
  FormGroup,
  FormTextarea,
} from "shards-react";

import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";

const Contact: NextPage = () => {
  const context: { theme: string; setTheme: () => void } = useThemeContext();
  const [user, loading, error] = useAuthState(auth);
  const [text, setText] = useState<string>("");

  return (
    <div className={styles.container}>
      <Head>
        <title>SecurePi</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.view_one}>
        <main
          className={styles.main}
          style={{
            background: context.theme === "dark" ? "#212121" : "#ffffff",
          }}
        >
          <CustomNavbar />
          <div className={styles.content_wrapper}>
            <Form className={styles.login_form}>
              <h3
                style={{
                  marginBottom: 32,
                  color: context.theme === "dark" ? "white" : "",
                }}
              >
                <b>Kontakt</b>
              </h3>

              <FormTextarea
                placeholder="Unesite svoju poruku"
                onChange={(e) => {
                  setText(e.target.value);
                }}
                style={{
                  marginBottom: 16,
                  background: context.theme === "dark" ? "#232323" : "#ffffff",
                  height: "128px",
                  color: context.theme === "dark" ? "#ffffff" : "#000000",
                }}
                className={styles.form_text_area}
              />
              <Button
                theme={context.theme === "dark" ? "light" : "dark"}
                outline
                block
                onClick={() => {
                  window.location.href = `mailto:phantomforcesbetaaa@gmail.com?subject=Poruka od ${
                    user?.email ? user.email : "Anonimnog korisnika"
                  }&body=${text}`;
                }}
              >
                Pošaljite e-poštu
              </Button>
            </Form>
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
    </div>
  );
};

export default Contact;
