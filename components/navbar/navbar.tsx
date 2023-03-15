import Image from "next/image";
import styles from "/styles/components/Navbar.module.css";
import Link from "next/link";

import { FunctionComponent } from "react";

import {
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Collapse,
  Badge,
} from "shards-react";

import "bootstrap/dist/css/bootstrap.min.css";
import "shards-ui/dist/css/shards.min.css";

import { useState, useEffect } from "react";
import { useThemeContext } from "context/context";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebaseconf";
import router from "next/router";
import { connectFirestoreEmulator } from "firebase/firestore";
import useWindowDimensions from "hooks/useWindowDimensions";

import { BiMenuAltRight } from "react-icons/bi";
import { Flex } from "rebass";

const CustomNavbar: FunctionComponent = () => {
  const context: { theme: string; changeTheme: () => void } = useThemeContext();
  const [user, loading, error] = useAuthState(auth);
  const [profileNameColor, setProfileNameColor] = useState<boolean>(false);
  const { height, width } = useWindowDimensions();
  const [dropdownMenu, setDropdownMenu] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [photoURL, setPhotoURL] = useState<string>(
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
  );

  const changeProfileNameColor = () => {
    setProfileNameColor(!profileNameColor);
  };

  useEffect(() => {
    if (
      localStorage.getItem("theme") &&
      context.theme !== localStorage.getItem("theme")
    )
      context.changeTheme();
  }, []);

  return (
    <Navbar
      type={
        context.theme === "dark" || context.theme === "light"
          ? context.theme
          : "light"
      }
      theme={"transparent"}
      expand="sm"
      className={styles.navbar}
    >
      <NavbarBrand>
        <Link href={user ? "/dashboard" : "/"}>
          <Image
            src="/scurepi.png"
            width={48}
            height={48}
            style={
              context.theme === "dark"
                ? { filter: "invert(100%)", cursor: "pointer" }
                : { cursor: "pointer" }
            }
            alt={"Secure pi logo"}
          ></Image>
        </Link>
      </NavbarBrand>
      {width && width < 576 ? (
        <>
          <Nav className="ml-auto">
            <NavItem style={{ display: "flex" }}>
              <button
                style={{
                  border: "none",
                  background: "transparent",
                }}
                onClick={context.changeTheme}
              >
                <Image
                  src="/moon.png"
                  width={24}
                  height={24}
                  style={{
                    filter:
                      context.theme === "dark" ? "invert(100%)" : "invert(0%)",
                    margin: "0 16px 0 0",
                  }}
                  alt={"Change theme"}
                />
              </button>
              {user && (
                <NavItem>
                  <img
                    className={`${styles.profileImage} ${
                      context.theme === "dark"
                        ? styles.profileImage_dark
                        : styles.profileImage_light
                    }`}
                    src={user?.photoURL ? user?.photoURL : photoURL}
                    alt="profile picture"
                    onClick={() => router.push("/dashboard")}
                  />
                </NavItem>
              )}
              <button
                style={{
                  border: 0,
                  background: "none",
                  padding: "2px 0 2px 16px",
                }}
                onClick={() => {
                  setDropdownMenu(!dropdownMenu);
                  console.log(dropdownMenu);
                }}
                className={`${styles.dropdown_menu_button} ${
                  context.theme === "dark"
                    ? styles.dropdown_menu_button_dark
                    : styles.dropdown_menu_button_light
                }`}
              >
                <BiMenuAltRight
                  style={{ width: 26, height: 26, marginLeft: -8 }}
                />
              </button>
            </NavItem>
          </Nav>
          {dropdownMenu && (
            <div
              className={`${styles.menu_dropdown} ${
                context.theme === "dark"
                  ? styles.menu_dropdown_dark
                  : styles.menu_dropdown_light
              }`}
            >
              {user ? (
                <>
                  <Link href="/pi-setup">
                    <div
                      className={`${styles.menu_dropdown_item} ${
                        context.theme === "dark"
                          ? styles.menu_dropdown_item_dark
                          : styles.menu_dropdown_item_light
                      }`}
                    >
                      Streamaj
                    </div>
                  </Link>
                  <Link href="/connect">
                    <div
                      className={`${styles.menu_dropdown_item} ${
                        context.theme === "dark"
                          ? styles.menu_dropdown_item_dark
                          : styles.menu_dropdown_item_light
                      }`}
                    >
                      Gledaj
                    </div>
                  </Link>
                  <Link href="/help">
                    <div
                      className={`${styles.menu_dropdown_item} ${
                        context.theme === "dark"
                          ? styles.menu_dropdown_item_dark
                          : styles.menu_dropdown_item_light
                      }`}
                    >
                      Upute
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/register" className={styles.menu_dropdown_link}>
                    <div
                      className={`${styles.menu_dropdown_item} ${
                        context.theme === "dark"
                          ? styles.menu_dropdown_item_dark
                          : styles.menu_dropdown_item_light
                      }`}
                    >
                      Registriraj se
                    </div>
                  </Link>
                  <Link href="/login">
                    <div
                      className={`${styles.menu_dropdown_item} ${
                        context.theme === "dark"
                          ? styles.menu_dropdown_item_dark
                          : styles.menu_dropdown_item_light
                      }`}
                    >
                      Prijavi se
                    </div>
                  </Link>
                  <Link href="/help">
                    <div
                      className={`${styles.menu_dropdown_item} ${
                        context.theme === "dark"
                          ? styles.menu_dropdown_item_dark
                          : styles.menu_dropdown_item_light
                      }`}
                    >
                      Upute
                    </div>
                  </Link>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <Collapse navbar>
            {!loading ? (
              <Nav navbar>
                {user ? (
                  <>
                    {[
                      ["pi-setup", "Streamaj"],
                      ["connect", "Gledaj"],
                      ["help", "Upute"],
                    ].map((x, i) => {
                      return (
                        <Link
                          href={`/${x[0]}`}
                          className={styles.navlink}
                          style={{ textDecoration: "none" }}
                        >
                          <NavLink style={{ cursor: "pointer" }}>
                            {x[1]}
                          </NavLink>
                        </Link>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {[
                      ["register", "Registriraj se"],
                      ["login", "Prijavi se"],
                      ["help", "Upute"],
                    ].map((x, i) => {
                      return (
                        <Link
                          href={`/${x[0]}`}
                          className={styles.navlink}
                          style={{ textDecoration: "none" }}
                        >
                          <NavLink style={{ cursor: "pointer" }}>
                            {x[1]}
                          </NavLink>
                        </Link>
                      );
                    })}
                  </>
                )}
              </Nav>
            ) : (
              ""
            )}

            <Nav navbar className={`ml-auto ${styles.right_side_of_nav}`}>
              <NavItem>
                <button
                  style={{
                    border: "none",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={context.changeTheme}
                >
                  <Image
                    src="/moon.png"
                    width={24}
                    height={24}
                    style={{
                      filter:
                        context.theme === "dark"
                          ? "invert(100%)"
                          : "invert(0%)",
                      marginRight: 12,
                    }}
                    alt={"Change theme"}
                  />
                </button>
              </NavItem>
              <NavItem>
                {user ? (
                  <img
                    className={`${styles.profileImage} ${
                      context.theme === "dark"
                        ? styles.profileImage_dark
                        : styles.profileImage_light
                    }`}
                    src={user?.photoURL ? user?.photoURL : photoURL}
                    alt="profile picture"
                    onClick={() => router.push("/dashboard")}
                  />
                ) : (
                  ""
                )}
              </NavItem>
            </Nav>
          </Collapse>
        </>
      )}
    </Navbar>
  );
};

export default CustomNavbar;

//      <NavbarToggler onClick={this.toggleNavbar} />
