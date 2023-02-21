import type { NextPage } from "next";
import Head from "next/head";
import styles from "/styles/Dashboard.module.css";
import CustomNavbar from "components/navbar/navbar";
import Loading from "components/loading/loading";

import { useThemeContext } from "context/context";
import { useEffect, useState, useRef } from "react";
import { AuthStateHook, useAuthState } from "react-firebase-hooks/auth";
import { auth, storage } from "../../firebase/firebaseconf";

import {
  Alert,
  Badge,
  Button,
  FormInput,
  Modal,
  ModalBody,
  ModalHeader,
  Popover,
  PopoverBody,
  PopoverHeader,
  Tooltip,
} from "shards-react";

import {
  changeDeviceName,
  changeUsername,
  logOut,
  setProfilePicture,
  requestPermission,
  addNotificationId,
  deleteUserAndUserData,
  changePassword,
} from "../../firebase/firebaseMethods";

import { useRouter } from "next/router";

import { changeNotificationStatus, getRecentPis } from "../../firebase/webrtc";

import ReactCrop from "react-image-crop";
import type { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  createURLFromCrop,
  centerAspectCrop,
} from "../../components/picture_upload/uploadPictureCrop";

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { User } from "firebase/auth";

import { HiPencilAlt } from "react-icons/hi";
import {
  MdOutlineNotificationsActive,
  MdOutlineNotificationsOff,
} from "react-icons/md";
import { TbCopy } from "react-icons/tb";

import { toast } from "react-toastify";

const Dashboard: NextPage = () => {
  const context = useThemeContext();

  const [selectedFile, setSelectedFile] = useState<null | File>(null);
  const [photoURL, setPhotoURL] = useState<string>(
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
  );
  const [image, setImage] = useState("http://example.com/initialimage.jpg");
  const [shown, setShown] = useState(false);
  const [pis, setPis] = useState(null);

  const [imgSrc, setImgSrc] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [open, setOpen] = useState<boolean>(false);
  const [opened, setOpened] = useState<boolean>(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userID, setUserID] = useState<string | null>(null);
  const [messagingId, setMessagingId] = useState<string | null>(null);
  const [deleteButtonClick, setDeleteButtonClick] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [stopDetection, setStopDetection] = useState<boolean>(false);
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  const router = useRouter();

  const logOutClick = async () => {
    await logOut();
    router.push("/");
  };
  const [user, loading, error]: AuthStateHook = useAuthState(auth);

  useEffect(() => {
    if ((user === null && loading === false) || error) router.push("/");
    if (user?.photoURL) setPhotoURL(user.photoURL);
    if (user) {
      console.log(user.emailVerified);
    }
  }, [user, loading, error, shown]);

  useEffect(() => {
    if (user) {
      !pis && getRecentPis(user?.uid, setPis);
      setUserID(user.uid);
    }
    console.log(pis);
    const messaging = getMessaging();
    getToken(messaging, {
      vapidKey:
        "BJnYciQ4kxWGLqhO6yjjaKirXUO4SRCxtnYq12sLsVjb_asgy2Md5A-wqrUR96lQO41M-Inhp_klVczuRT-7_Mg",
    })
      .then((currentToken) => {
        if (currentToken) {
          setMessagingId(currentToken);
          user && addNotificationId(currentToken, user.uid);
          console.log("TOKEN ZA SLANJE OBAVIJESTI:", currentToken);
        } else {
          requestPermission();
          toast.error(
            "Morate prihvatiti da SecurePi može slati obavjesti kako biste mogli primati obavjesti pri detekciji pokreta!"
          );
        }
      })
      .catch((err) => {
        requestPermission();
        toast.error(
          "Morate prihvatiti da SecurePi može slati obavjesti kako biste mogli primati obavjesti pri detekciji pokreta!"
        );
      });

    onMessage(messaging, (payload) => {
      payload.data && new Notification("Pokret detektiran!");
    });
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>SecurePi</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main
        className={styles.main}
        style={{
          background: context.theme === "dark" ? "#212121" : "#ffffff",
        }}
      >
        <CustomNavbar />
        <div
          className={
            context.theme === "dark"
              ? styles.dark_wrapper + " " + styles.wrapper
              : styles.light_wrapper + " " + styles.wrapper
          }
        >
          <div
            style={{
              color: context.theme === "dark" ? "white" : "",
            }}
            className={styles.view_wrapper}
          >
            {loading || user === null ? (
              <Loading />
            ) : (
              <>
                <div className={styles.upper_section}>
                  <button
                    onClick={() => {
                      setOpened(true);
                    }}
                    className={styles.profile_picture_button}
                  >
                    <img
                      src={photoURL}
                      className={styles.profile_picture_wrapper}
                    />
                  </button>
                  <div className={styles.display_name_and_email}>
                    {user && (
                      <>
                        <b className={styles.text_display_name}>
                          Prijavljen kao{" "}
                          {
                            //@ts-ignore
                            user?.displayName
                          }
                        </b>{" "}
                        <span
                          style={{
                            fontSize: 20,
                          }}
                        >
                          (
                          {
                            //@ts-ignore
                            user?.email
                          }
                          )
                          <HiPencilAlt
                            className={styles.pencil_edit_button}
                            onClick={() => {
                              setOpen(true);
                            }}
                          />
                        </span>
                        <div style={{ textAlign: "center" }}>
                          {"Korisnikov ID: " + userID}
                        </div>
                        <div className={styles.messaging_id_and_button}>
                          Messaging ID:
                          {messagingId
                            ? " " + messagingId?.slice(0, 20) + "..."
                            : "??"}
                          <button
                            onClick={() => {
                              setStopDetection(!stopDetection);
                              if (user)
                                (async () =>
                                  await changeNotificationStatus(
                                    user?.uid,
                                    stopDetection
                                  ))();
                            }}
                            style={{
                              background: 0,
                              padding: 0,
                              border: 0,
                              marginBottom: 8,
                            }}
                            className={styles.notif_button}
                          >
                            {stopDetection ? (
                              <MdOutlineNotificationsActive
                                style={{
                                  filter:
                                    context.theme === "dark"
                                      ? "invert(100%)"
                                      : "",
                                  margin: 0,
                                }}
                                className={styles.pencil_edit_button}
                                id="notif"
                              />
                            ) : (
                              <MdOutlineNotificationsOff
                                style={{
                                  filter:
                                    context.theme === "dark"
                                      ? "invert(100%)"
                                      : "",
                                  margin: 0,
                                }}
                                className={styles.pencil_edit_button}
                                id="notif"
                              />
                            )}
                          </button>
                          <Tooltip
                            open={tooltipOpen}
                            target="#notif"
                            toggle={() => setTooltipOpen(!tooltipOpen)}
                            className={styles.notif_tooltip}
                          >
                            Ovim gumbom možete privremeno ugasiti ili upaliti
                            slanje notifikacija <b>svim</b> uređajima
                          </Tooltip>
                        </div>
                      </>
                    )}
                  </div>

                  <div></div>

                  <Button
                    //@ts-ignore
                    theme={context.theme === "dark" ? "light" : "dark"}
                    className={`${styles.log_out_button} ${
                      context.theme === "dark"
                        ? styles.log_out_button_dark
                        : styles.log_out_button_light
                    }`}
                    outline
                    block
                    onClick={() => logOutClick()}
                  >
                    Odjavi se
                  </Button>
                </div>

                <div className={styles.recently_connected_pis}>
                  <div className={styles.recently_connected_pis_content}>
                    <p style={{ fontSize: 24, marginRight: 8 }}>
                      Prethodno povezani Pievi
                    </p>{" "}
                    <div className={styles.pi_container_container}>
                      {pis !== null
                        ? pis.map((e: Object, i: Key) => {
                            if (e)
                              return (
                                <div
                                  className={`${styles.pi_container} ${
                                    context.theme === "dark"
                                      ? styles.pi_container_dark
                                      : styles.pi_container_light
                                  }`}
                                  key={i}
                                >
                                  <div className={styles.pi_container_top}>
                                    <p className={styles.pi_name}>
                                      <b style={{ fontWeight: 600 }}>
                                        {e.name}
                                      </b>
                                    </p>
                                    <p className={styles.pi_name}>{e.id}</p>
                                  </div>
                                  <Button
                                    theme={
                                      context.theme === "dark"
                                        ? "light"
                                        : "dark"
                                    }
                                    pill
                                    className={styles.pi_connect_button}
                                    onClick={() => router.push(`/connect/${e}`)}
                                  >
                                    Poveži
                                  </Button>
                                </div>
                              );
                          })
                        : "Nema prethodno povezanih Pieva"}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <Modal
          open={open}
          toggle={() => {
            setOpen(!open);
          }}
          backdrop={true}
          size={"lg"}
          modalContentClassName={styles.dropdown_modal_prompt}
          modalClassName={styles.dropdown_modal}
          backdropClassName={styles.dropdown_modal_backdrop}
        >
          <ModalHeader
            className={`${styles.dropdown_modal_header} ${
              context.theme === "dark"
                ? styles.dropdown_modal_header_dark
                : styles.dropdown_modal_header_light
            }`}
          >
            <h4
              style={{
                color: context.theme === "dark" ? "white" : "#232323",
              }}
            >
              {" "}
              Promjeni korisničke podatke
            </h4>
          </ModalHeader>
          <ModalBody
            className={
              context.theme === "dark"
                ? styles.dropdown_modal_body_dark
                : styles.dropdown_modal_body_light
            }
          >
            <p
              style={{
                color: context.theme === "dark" ? "white" : "#232323",
              }}
            >
              U donjem polju za unos možeš promjeniti svoje korisničko ime.
            </p>
            <FormInput
              placeholder={"Unesi novo korisničko ime"}
              style={
                context.theme === "dark"
                  ? {
                      color: "white",
                      background: "#232323",
                    }
                  : {}
              }
              onChange={(e) =>
                setUsername((e.target as HTMLInputElement).value)
              }
            ></FormInput>
            <Button
              block
              outline
              //@ts-ignore
              theme={context.theme === "dark" ? "white" : "dark"}
              style={{ margin: "12px 0 32px 0" }}
              onClick={() => {
                user &&
                  username &&
                  toast.promise(
                    async () => {
                      await changeUsername(username);
                      setOpen(false);
                    },
                    {
                      pending: "Promjena korisničkog imena u tijeku...",
                      success: "Uspješno promjenjeno korisničko ime!",
                      error:
                        "Dogodila se greška tijekom promjene korisničkog imena...",
                    }
                  );
              }}
            >
              <b>Promjeni korisničko ime</b>
            </Button>
            <p
              style={{
                color: context.theme === "dark" ? "white" : "#232323",
              }}
            >
              U donjem polju za unos možeš promjeniti ime svog uređaja
              (Raspberry Pia).
            </p>
            <FormInput
              placeholder={"Unesite novo ime uređaja"}
              style={
                context.theme === "dark"
                  ? {
                      color: "white",
                      background: "#232323",
                    }
                  : {}
              }
              onChange={(e) =>
                setDeviceName((e.target as HTMLInputElement).value)
              }
            ></FormInput>
            <Button
              block
              outline
              //@ts-ignore
              theme={context.theme === "dark" ? "white" : "dark"}
              style={{ marginTop: 12, marginBottom: 32 }}
              onClick={() => {
                user &&
                  deviceName &&
                  toast.promise(
                    async () => {
                      await changeDeviceName(deviceName, user.uid);
                      setOpen(false);
                    },
                    {
                      success: "Uspješno promjenjeno ime uređaja!",
                      error:
                        "Dogodila se pogreška tijekom mjenajnja imena uređaja...",
                      pending: "Promjena imena u tijeku...",
                    }
                  );
              }}
            >
              <b>Postavi ime uređaja</b>
            </Button>
            <p
              style={{
                color: context.theme === "dark" ? "white" : "#232323",
              }}
            >
              U donjem polju za unos možeš promjeniti svoju lozinku.
            </p>
            <FormInput
              placeholder={"Unesite novu lozinku"}
              style={
                context.theme === "dark"
                  ? {
                      color: "white",
                      background: "#232323",
                    }
                  : {}
              }
              onChange={(e) =>
                setNewPassword((e.target as HTMLInputElement).value)
              }
              type="password"
            ></FormInput>
            <Button
              block
              outline
              //@ts-ignore
              theme={context.theme === "dark" ? "white" : "dark"}
              style={{ marginTop: 12, marginBottom: 50 }}
              onClick={() => {
                user &&
                  newPassword &&
                  toast.promise(
                    async () => {
                      await changePassword(newPassword, user);
                      setOpen(false);
                    },
                    {
                      success: "Uspješno promjenjena lozinka!",
                      error:
                        "Dogodila se pogreška tijekom mjenajnja lozinke...",
                      pending: "Promjena lozinke u tijeku...",
                    }
                  );
              }}
            >
              <b>Promjeni lozinku</b>
            </Button>
            <Button
              theme="danger"
              block
              id="delete_account_button"
              onClick={() => {
                setDeleteButtonClick(!deleteButtonClick);
              }}
            >
              Izbriši korisnički račun
            </Button>
            <Popover
              placement="top"
              open={deleteButtonClick}
              //toggle={() => {
              //  setDeleteButtonClick(!deleteButtonClick);
              //}}
              target="#delete_account_button"
            >
              <PopoverHeader>
                <b style={{ lineHeight: "120%" }}>
                  {" "}
                  Jeste li sigurni da želite izbristati korisnički račun?
                </b>
              </PopoverHeader>
              <PopoverBody>
                Nakon što izbrišete korisnički račun,{" "}
                <b style={{ fontWeight: 900 }}>nema vračanja</b>! Brišu se svi
                korisnički podatci vezani uz korisnički račun i sami korisnički
                račun. Nakon što izbršete račun, jedini način kako možete opet
                koristiti SecurePi funkcijonalnosti jest ponovno stvaranje
                korisničkog računa
                <Button
                  style={{ marginTop: 8 }}
                  theme={"danger"}
                  onClick={() => {
                    console.log(user);
                    user && deleteUserAndUserData(user);
                  }}
                >
                  Želim izbrisati korisnički račun
                </Button>
              </PopoverBody>
            </Popover>
          </ModalBody>
        </Modal>

        <Modal
          open={opened}
          toggle={() => {
            setOpened(!opened);
          }}
          backdrop={true}
          size={"lg"}
          modalContentClassName={styles.dropdown_modal_prompt}
          modalClassName={styles.dropdown_modal}
          backdropClassName={styles.dropdown_modal_backdrop}
        >
          <ModalHeader
            className={`${styles.dropdown_modal_header} ${
              context.theme === "dark"
                ? styles.dropdown_modal_header_dark
                : styles.dropdown_modal_header_light
            }`}
          >
            <b
              style={{
                fontSize: 35,
                color: context.theme === "dark" ? "white" : "black",
              }}
            >
              Promjeni profilu sliku
            </b>
          </ModalHeader>
          <ModalBody
            className={`${styles.dropdown_modal_body} ${
              context.theme === "dark"
                ? styles.dropdown_modal_body_dark
                : styles.dropdown_modal_body_light
            }`}
          >
            {!!imgSrc ? (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                style={{ maxHeight: 700, maxWidth: 700 }}
                className={styles.react_crop_modal}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  onLoad={(e) =>
                    setCrop(
                      centerAspectCrop(
                        e.currentTarget.width,
                        e.currentTarget.height,
                        1
                      )
                    )
                  }
                />
              </ReactCrop>
            ) : (
              ""
            )}
            <div className={styles.upload_buttons_container}>
              <label
                htmlFor="file-upload"
                className={styles.custom_file_upload}
                style={{
                  border:
                    context.theme === "dark"
                      ? "1px solid #ffffff"
                      : "1px solid #232323",
                }}
              >
                Odaberi sliku
              </label>
              <input
                className={`${styles.file_input} ${
                  context.theme === "dark"
                    ? styles.file_input_dark
                    : styles.file_input_light
                }`}
                id="file-upload"
                style={{ opacity: 0, width: 0 }}
                type="file"
                onChange={(e) => {
                  if (e.target.files) {
                    setSelectedFile(e.target.files[0]);
                    const reader = new FileReader();
                    reader.readAsDataURL(e.target.files[0]);
                    reader.onload = () => {
                      setImgSrc(reader.result?.toString() || "");
                    };
                  }
                }}
              />
              <input id="file-upload" style={{ display: "none" }} type="file" />
              <Button
                //@ts-ignore
                theme={context.theme === "dark" ? "white" : "dark"}
                outline
                onClick={async () => {
                  if (imgRef.current && completedCrop) {
                    toast.promise(
                      async () => {
                        const cropURL = await createURLFromCrop(
                          //@ts-ignore
                          imgRef.current,
                          completedCrop
                        );

                        if (cropURL && user) {
                          const url = await setProfilePicture(cropURL, user);
                          setPhotoURL(url);
                        }
                        setOpened(false);
                      },
                      {
                        success: "Uspješno promjenjena profilna slika!",
                        error:
                          "Dogodila se greška tijekom promjene profilne slike...",
                        pending: "Promjena profilne slike u tijeku...",
                      }
                    );
                  }
                }}
              >
                Promjeni
              </Button>
            </div>
          </ModalBody>
        </Modal>
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

export default Dashboard;
/*
<p className={styles.pi_id}>{e}</p>
*/
/*
<div
                  className={styles.avatar_upload_container}
                  style={{
                    opacity: shown ? 1 : 0,
                    zIndex: shown ? 5 : -5,
                    background:
                      context.theme === "dark" ? "#1d1d1d" : "#ededed",
                    boxShadow:
                      context.theme === "dark"
                        ? "0px 0px 50px 2px rgba(255, 255, 255, 0.25);"
                        : "0px 0px 50px 2px black",
                  }}
                >
                  <button
                    className={styles.exit_button}
                    onClick={() => setShown(false)}
                  >
                    x
                  </button>
                  <b style={{ fontSize: 35 }}>Promjeni profilu sliku</b>
                  {!!imgSrc ? (
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={1}
                      style={{ maxHeight: 600, maxWidth: 400 }}
                    >
                      <img
                        ref={imgRef}
                        alt="Crop me"
                        src={imgSrc}
                        onLoad={(e) =>
                          setCrop(
                            centerAspectCrop(
                              e.currentTarget.width,
                              e.currentTarget.height,
                              1
                            )
                          )
                        }
                      />
                    </ReactCrop>
                  ) : (
                    ""
                  )}
                  <div className={styles.upload_buttons_container}>
                    <label
                      htmlFor="file-upload"
                      className={styles.custom_file_upload}
                      style={{
                        border:
                          context.theme === "dark"
                            ? "1px solid #ffffff"
                            : "1px solid #232323",
                      }}
                    >
                      Odaberi sliku
                    </label>
                    <input
                      className={`${styles.file_input} ${
                        context.theme === "dark"
                          ? styles.file_input_dark
                          : styles.file_input_light
                      }`}
                      id="file-upload"
                      style={{ opacity: 0, width: 0 }}
                      type="file"
                      onChange={(e) => {
                        if (e.target.files) {
                          setSelectedFile(e.target.files[0]);
                          const reader = new FileReader();
                          reader.readAsDataURL(e.target.files[0]);
                          reader.onload = () => {
                            setImgSrc(reader.result?.toString() || "");
                          };
                        }
                      }}
                    />
                    <input
                      id="file-upload"
                      style={{ display: "none" }}
                      type="file"
                    />
                    <Button
                      //@ts-ignore
                      theme={context.theme === "dark" ? "white" : "dark"}
                      outline
                      onClick={async () => {
                        if (imgRef.current && completedCrop) {
                          const cropURL = await createURLFromCrop(
                            imgRef.current,
                            completedCrop
                          );

                          if (cropURL && user) {
                            const url = await setProfilePicture(cropURL, user);
                            setPhotoURL(url);
                          }
                        }
                      }}
                    >
                      Promjeni
                    </Button>
                  </div>
                </div>
*/
