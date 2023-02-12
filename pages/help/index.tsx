import CustomNavbar from "components/navbar/navbar";
import { useThemeContext } from "context/context";
import Head from "next/head";
import { useState } from "react";
import { Collapse } from "shards-react";
import styles from "styles/Help.module.css";

import { IoMdArrowDropdown } from "react-icons/io";
import { NodeNextRequest } from "next/dist/server/base-http/node";

const Help = () => {
  const context: { theme: string; setTheme: () => void } = useThemeContext();
  const [open, setOpen] = useState<boolean>(false);
  const [open2, setOpen2] = useState<boolean>(false);
  const [open3, setOpen3] = useState<boolean>(false);
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
        <div className={styles.view_one}>
          <button
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              marginBottom: 16,
            }}
            onClick={() => setOpen(!open)}
          >
            <b style={{ color: context.theme === "dark" ? "white" : "black" }}>
              Prijenos video sadržaja s Raspberry Pia
            </b>
            <IoMdArrowDropdown
              style={{
                width: 24,
                height: 24,
                filter: context.theme === "dark" ? "invert(100%)" : "s",
                transform: open ? "rotate(0deg)" : "rotate(-90deg)",
              }}
            />
          </button>

          <Collapse open={open}>
            <p
              style={{
                color: context.theme === "dark" ? "white" : "black",
                padding: "0px 16px 16px 16px",
              }}
            >
              Prije prijenosa video sadržaja mora se osigurati stabilna
              internetska veza (preporučuje se žičana). <br />
              <br />
              Kada se prijavite u svoj korisnički račun na Raspberry Piu, morate
              stisnuti gumb "Streamaj" koji će vas odvesti na stranicu za
              prijenos video sadržaja. Morate pritisnuti gumb "Streamaj video
              sadržaj" i nakon što ste ga pritisnuli preglednik će vas pitati za
              pristup kameri i mirkofonu, obavezno prihvatite i ubrzo će vam se
              pokrenuti prijenos. Iznad gumba će vam se pojaviti okvir u kojem
              možete vidjeti što prenosite i unutar njega se nalazi kôd koji
              trebate za povezivanje s drugog uređaja.
            </p>
          </Collapse>

          <button
            style={{ border: "none", background: "none", cursor: "pointer" }}
            onClick={() => setOpen2(!open2)}
          >
            <b style={{ color: context.theme === "dark" ? "white" : "black" }}>
              Povezivanje na Raspberry Pi
            </b>
            <IoMdArrowDropdown
              style={{
                width: 24,
                height: 24,
                filter: context.theme === "dark" ? "invert(100%)" : "s",
                transform: open2 ? "rotate(0deg)" : "rotate(-90deg)",
              }}
            />
          </button>

          <Collapse open={open2}>
            <p
              style={{
                color: context.theme === "dark" ? "white" : "black",
                padding: 16,
              }}
            >
              Kada se prijavite u vaš račun, morati stisnuti gumb "Gledaj" koji
              će vas odvesti na stranicu za gledanje video sadržaja. Kako biste
              se mogli povezati na Raspberry Pi morate znati kôd od tog uređaja
              i u polje za unos na stranici morate unjeti taj kôd i pritisnuti
              "Gledaj". Ubrzo će nestati polje za unos i biti će zamjenuto sa
              okvirom u kojem se nalazi video prijenos kamere i iznad nje ime
              uređaja. Bitno je za napomenuti da korisnikov id (koji se može
              nači na stranici koriničkog računa) treba biti unutar liste
              dozvoljenih korisnika kako bi mogao pristupiti video sadržaju.
            </p>
          </Collapse>
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
  );
};

export default Help;
