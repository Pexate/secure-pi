import type { Dispatch, SetStateAction } from "react";

import { useState } from "react";

import { ThemeContext } from "./context";
import { ToastContainer } from "react-toastify";

import React, { ReactNode } from "react";

export const Provider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme]: Array<string | Dispatch<SetStateAction<string>>> =
    useState("light");

  const changeTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    localStorage.setItem("theme", theme === "light" ? "dark" : "light");
  };
  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
      <ToastContainer
        //@ts-ignore
        theme={theme}
        position="bottom-right"
        autoClose={2500}
        closeOnClick
      />
    </ThemeContext.Provider>
  );
};
