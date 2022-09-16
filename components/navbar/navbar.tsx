import Image from "next/image";
import styles from "/styles/components/Navbar.module.css";

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
} from "shards-react";

import "bootstrap/dist/css/bootstrap.min.css";
import "shards-ui/dist/css/shards.min.css";

import { useState } from "react";
import { useThemeContext } from "/context/context";

const CustomNavbar: FunctionComponent = () => {
  const [dropdown, setDropdown] = useState(false);
  const context = useThemeContext();

  const toggleDropdown = () => {
    setDropdown(!dropdown);
  };

  return (
    <Navbar type={context.theme} theme="transparent" expand="md">
      <NavbarBrand href="#">Shards React</NavbarBrand>

      <Collapse open={toggleDropdown} navbar>
        <Nav navbar>
          <NavItem>
            <NavLink href="#">Active</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#">Disabled</NavLink>
          </NavItem>
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
                  context.theme === "dark" ? "invert(100%)" : "invert(0%)",
              }}
            />
          </button>
        </Nav>
      </Collapse>
    </Navbar>
  );
};

export default CustomNavbar;

//      <NavbarToggler onClick={this.toggleNavbar} />
