import type { Context } from "react";
import { createContext, useContext, useEffect } from "react";

export const ThemeContext: Context<string> = createContext("light");
export const useThemeContext: Function = () => useContext(ThemeContext);
