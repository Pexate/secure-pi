import type { Context } from "react";
import { createContext, useContext, useEffect } from "react";

//@ts-ignore
export let ThemeContext: Context<{ changeTheme: () => void; theme: string }> =
  createContext("light");
export const useThemeContext: Function = () => useContext(ThemeContext);
