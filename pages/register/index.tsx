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
                className={styles.register_button}
              >
                <b>Registriraj</b>
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
                Prijavi se Googlom{" "}
              </button>
              <button
                onClick={() => {}}
                className={`${styles.phone_login_button} ${styles.login_button}`}
                //id="sign-in-button"
              >
                <Image
                  src={"/phone.png"}
                  width={22}
                  height={22}
                  alt="Phone logo"
                  style={{ marginRight: 16, filter: "invert(100%)" }}
                />
                Prijavite se mobilnim brojem{" "}
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
                Prijavi se Microsoftom{" "}
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
                Prijavi se GitHubom{" "}
              </button>
            </div>
            <div
              className={`${styles.phone_number_login_wrapper} ${
                context.theme === "dark"
                  ? styles.phone_number_login_wrapper_dark
                  : styles.phone_number_login_wrapper_light
              }`}
            >
              <h2
                style={{
                  color: context.theme === "dark" ? "white" : "black",
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                Prijava mobilnim brojem
              </h2>
              <div className={styles.phone_number_login_bottom}>
                {!smsSent ? (
                  <InputGroup>
                    <FormInput
                      className={styles.mobile_phone_input}
                      type="tel"
                      placeholder="Broj mobilnog telefona"
                      style={
                        context.theme === "dark"
                          ? {
                              color: "white",
                              background: "#232323",
                            }
                          : {}
                      }
                      onChange={(e) =>
                        setPhoneNumber((e.target as HTMLTextAreaElement).value)
                      }
                    />
                    <InputGroupAddon type="append">
                      <button
                        id="phone_number_submit_button"
                        style={{ border: 0, background: "none" }}
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
                      >
                        <Button
                          theme={context.theme === "dark" ? "light" : "dark"}
                          id="phone_number_submit_button"
                        >
                          Pošalji verifikacijski kôd
                        </Button>
                      </button>
                    </InputGroupAddon>
                  </InputGroup>
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
                        setVerificationCode(
                          (e.target as HTMLTextAreaElement).value
                        )
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
              </div>
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

export default Register;
