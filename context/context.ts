import type { Context } from "react";
import { createContext, useContext } from "react";

//@ts-ignore
export const ThemeContext: Context<{ changeTheme: () => void; theme: string }> =
  createContext("light");
export const useThemeContext: Function = () => useContext(ThemeContext);
