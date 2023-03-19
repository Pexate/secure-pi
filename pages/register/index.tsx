import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import styles from "/styles/Register.module.css";

import CustomNavbar from "components/navbar/navbar";
import { useThemeContext } from "context/context";

import {
  Form,
  FormInput,
  FormGroup,
  Button,
  InputGroup,
  InputGroupAddon,
  Modal,
  ModalHeader,
  ModalBody,
  Alert,
} from "shards-react";

import {
  AuthStateHook,
  SendEmailVerificationHook,
  SignInWithPopupHook,
  useAuthState,
  useCreateUserWithEmailAndPassword,
  useSendEmailVerification,
  useSignInWithGithub,
  useSignInWithGoogle,
  useSignInWithMicrosoft,
} from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebaseconf";
import {
  updateUserProfile,
  setRegistrationInfo,
} from "../../firebase/firebaseMethods";

import { MouseEventHandler, useEffect, useState } from "react";

import Link from "next/link";

import { useRouter } from "next/router";

import {
  GithubAuthProvider,
  OAuthProvider,
  sendEmailVerification,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

import { ToastContainer, toast } from "react-toastify";

const Register: NextPage = () => {
  const context = useThemeContext();
  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);
  const [user2, loading2, error2]: AuthStateHook = useAuthState(auth);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [smsSent, setSmsSent] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();
  const [
    signInWithGoogle,
    googleUser,
    googleLoading,
    googleError,
  ]: SignInWithPopupHook = useSignInWithGoogle(auth);

  const [
    signInWithGithub,
    githubUser,
    githubLoading,
    githubError,
  ]: SignInWithPopupHook = useSignInWithGithub(auth);

  const [
    signInWithMicrosoft,
    microsoftUser,
    microsoftLoading,
    microsoftError,
  ]: SignInWithPopupHook = useSignInWithMicrosoft(auth);

  //const [sendEmailVerification, sending, error1]: SendEmailVerificationHook =
  //  useSendEmailVerification(auth);

  useEffect(() => {
    if (user2 || githubUser || googleUser || microsoftUser) {
      if (user2 && !user2.displayName) {
        updateUserProfile({ displayName: username });
        console.log(user2, user2.displayName);
      }

      router.push("/dashboard");
    }
    console.log(githubUser, githubError, githubLoading);
  }, [user2, githubUser, googleUser, microsoftUser]);

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

  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "phone_number_submit_button",
      {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log(response);
        },
      },
      auth
    );
  }, []);

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
                theme={context.theme === "dark" ? "light" : "dark"}
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
                className={`${styles.register_button} ${
                  context.theme === "dark"
                    ? styles.register_button_dark
                    : styles.register_button_light
                }`}
              >
                Registriraj
              </Button>
              <p
                style={{ color: context.theme === "dark" ? "white" : "black" }}
              >
                <br />
                Već registrirani? <Link href="/login">Prijavite se ovdje.</Link>
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
                Prijavi se putem Google-a{" "}
              </button>
              <button
                onClick={() => {
                  setOpen(!open);
                }}
                className={`${styles.phone_login_button} ${styles.login_button}`}
                //id="sign-in-button"
              >
                <Image
                  src={"/phone.png"}
                  width={22}
                  height={22}
                  alt="Phone logo"
                  style={{ marginRight: 16, filter: "invert(100%)" }}
                  onClick={() => setOpen(!open)}
                />
                Prijavite se putem mobilnog broja{" "}
              </button>
              <button
                onClick={() => {
                  const provider = new OAuthProvider("microsoft.com");
                  provider.setCustomParameters({
                    prompt: "consent",
                    tenant: "db9ff83d-26f8-4204-99c9-73cb3476ea01",
                  });
                  signInWithPopup(auth, provider)
                    .then((result) => {
                      // User is signed in.
                      // IdP data available in result.additionalUserInfo.profile.

                      // Get the OAuth access token and ID Token
                      const credential =
                        OAuthProvider.credentialFromResult(result);
                      const accessToken = credential?.accessToken;
                      const idToken = credential?.idToken;
                      console.log(credential, accessToken, idToken);
                    })
                    .catch((error) => {
                      // Handle error.
                      console.log(error);
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
                Prijavi se putem Microsoft-a{" "}
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
                Prijavi se putem GitHub-a{" "}
              </button>
            </div>
          </div>
        </main>
      </div>
      <Modal
        className={`${styles.phone_number_login_wrapper} ${
          context.theme === "dark"
            ? styles.phone_number_login_wrapper_dark
            : styles.phone_number_login_wrapper_light
        }`}
        open={open}
        toggle={() => {
          setOpen(!open);
        }}
      >
        <ModalHeader
          className={
            context.theme === "dark"
              ? styles.modal_header_dark
              : styles.modal_header_light
          }
        >
          <p
            style={{
              color: context.theme === "dark" ? "white" : "black",
              margin: 0,
              padding: 0,
            }}
          >
            {" "}
            Prijava mobilnim brojem
          </p>
        </ModalHeader>
        <ModalBody
          className={`${styles.phone_number_login_bottom} ${
            context.theme === "dark"
              ? styles.phone_number_login_bottom_dark
              : styles.phone_number_login_bottom_light
          }`}
        >
          {!smsSent ? (
            <>
              {" "}
              <FormInput
                placeholder="Korisničko ime"
                onChange={(e) =>
                  setUsername((e.target as HTMLTextAreaElement).value)
                }
                style={
                  context.theme === "dark"
                    ? {
                        color: "white",
                        background: "#232323",
                        marginBottom: 6,
                      }
                    : {
                        marginBottom: 6,
                      }
                }
              />
              <FormInput
                className={styles.mobile_phone_input}
                type="tel"
                placeholder="Broj mobilnog telefona"
                style={
                  context.theme === "dark"
                    ? {
                        color: "white",
                        background: "#232323",
                        marginBottom: 12,
                      }
                    : {
                        marginBottom: 12,
                      }
                }
                onChange={(e) =>
                  setPhoneNumber((e.target as HTMLTextAreaElement).value)
                }
              />
              <Button
                block
                theme={context.theme === "dark" ? "light" : "dark"}
                style={{
                  marginBottom: 16,
                }}
                onClick={() => {
                  signInWithPhoneNumber(
                    auth,
                    phoneNumber,
                    window.recaptchaVerifier
                  )
                    .then((confirmationResult) => {
                      // SMS sent. Prompt user to type the code from the message, then sign the
                      // user in with confirmationResult.confirm(code).
                      window.confirmationResult = confirmationResult;
                      setSmsSent(true);
                      toast.info(
                        'SMS poruka je poslana na vaš mobilni broj, unesite je i pritisnite "Podnesi" kako biste se prijavili mobilnim brojem'
                      );
                      // ...
                    })
                    .catch((error) => {
                      // Error; SMS not sent
                      // ...
                    });
                }}
                //id="phone_number_submit_button"
              >
                Pošalji verifikacijski kôd
              </Button>
              <Alert
                theme={context.theme}
                style={{ color: context.theme === "dark" ? "white" : "black" }}
              >
                Broj se mora napisati u obliku pozivnog broja države te mobilnog
                broja isključujući početnu nulu i bez razmaka! Npr.
                +385951234567
              </Alert>
            </>
          ) : (
            <InputGroup>
              <FormInput
                className={styles.mobile_phone_input}
                type="tel"
                placeholder="Verifikacijski kôd"
                style={
                  context.theme === "dark"
                    ? {
                        color: "white",
                        background: "#232323",
                      }
                    : {}
                }
                onChange={(e) =>
                  setVerificationCode((e.target as HTMLTextAreaElement).value)
                }
              />
              <InputGroupAddon type="append">
                <Button
                  theme={context.theme === "dark" ? "light" : "dark"}
                  onClick={() => {
                    window.confirmationResult.confirm(verificationCode);
                  }}
                >
                  Podnesi
                </Button>
              </InputGroupAddon>
            </InputGroup>
          )}
        </ModalBody>
      </Modal>
      <div id="phone_number_submit_button"></div>

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
