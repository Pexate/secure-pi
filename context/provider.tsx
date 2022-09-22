import type { Dispatch, SetStateAction } from "react";

import { useState } from "react";

import { ThemeContext } from "./context";

export const Provider = ({ children }) => {
  const [theme, setTheme]: Array<String | Dispatch<SetStateAction<string>>> =
    useState("light");

  const changeTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
