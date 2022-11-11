import Image from "next/image";
import styles from "/styles/components/Navbar.module.css";
import Link from "next/link";

import { FunctionComponent } from "react";

import {
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  FormInput,
  Collapse,
  Button,
  Badge,
} from "shards-react";

import "bootstrap/dist/css/bootstrap.min.css";
import "shards-ui/dist/css/shards.min.css";

import { useState, useEffect } from "react";
import { useThemeContext } from "/context/context";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "/firebase/firebaseconf";
import router from "next/router";
import { connectFirestoreEmulator } from "firebase/firestore";

const CustomNavbar: FunctionComponent = () => {
  const [dropdown, setDropdown] = useState(false);
  const context: { theme: string; changeTheme: () => void } = useThemeContext();
  const [user, loading, error] = useAuthState(auth);
  const [profileNameColor, setProfileNameColor] = useState(false);

  const toggleDropdown = () => {
    setDropdown(!dropdown);
  };

  const changeProfileNameColor = () => {
    setProfileNameColor(!profileNameColor);
    console.log(profileNameColor, context.theme);
  };

  useEffect(() => {
    console.log(localStorage.getItem("theme"), context.theme);
    if (
      localStorage.getItem("theme") &&
      context.theme !== localStorage.getItem("theme")
    )
      context.changeTheme();
  }, []);

  return (
    <Navbar type={context.theme} theme="transparent" expand="sm">
      <NavbarBrand>
        <Link href="/">
          <Image
            src="/scurepi.png"
            width={48}
            height={48}
            style={
              context.theme === "dark"
                ? { filter: "invert(100%)", cursor: "pointer" }
                : { cursor: "pointer" }
            }
          ></Image>
        </Link>
      </NavbarBrand>

      <Collapse navbar>
        <Nav navbar>
          <Link
            href="/register"
            className={styles.navlink}
            style={{ textDecoration: "none" }}
          >
            <NavLink style={{ cursor: "pointer" }}>Registriraj se</NavLink>
          </Link>
          <Dropdown open={dropdown} toggle={toggleDropdown}>
            <DropdownToggle nav caret>
              Dropdown
            </DropdownToggle>
            <DropdownMenu
              className={context.theme === "dark" ? styles.dropdown_dark : ""}
            >
              <DropdownItem
                className={
                  context.theme === "dark" ? styles.dropdown_item_dark : ""
                }
              >
                Action
              </DropdownItem>
              <DropdownItem
                className={
                  context.theme === "dark" ? styles.dropdown_item_dark : ""
                }
              >
                Another action
              </DropdownItem>
              <DropdownItem
                className={
                  context.theme === "dark" ? styles.dropdown_item_dark : ""
                }
              >
                Something else here
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Nav>
        <Nav navbar className="ml-auto">
          <NavItem>
            {user ? (
              <Badge
                theme={
                  context.theme === "dark"
                    ? profileNameColor
                      ? "dark"
                      : "light"
                    : profileNameColor
                    ? "light"
                    : "dark"
                }
                style={{ marginRight: 8, cursor: "pointer", fontSize: 12 }}
                onMouseOver={() => changeProfileNameColor()}
                onMouseOut={() => changeProfileNameColor()}
                onClick={() => router.push("/dashboard")}
              >
                {user.displayName}
              </Badge>
            ) : (
              ""
            )}
          </NavItem>
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
              /*
              onMouseOver={(e) => {
                e.target.style.filter = "invert(60%)";
              }}
              onMouseOut={(e) => {
                e.target.style.filter = "invert(0%)";
              }}*
              */
            >
              <Image
                src="/moon.png"
                width={24}
                height={24}
                style={{
                  filter:
                    context.theme === "dark" ? "invert(100%)" : "invert(0%)",
                }}
              />
            </button>
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  );
};

export default CustomNavbar;

//      <NavbarToggler onClick={this.toggleNavbar} />
