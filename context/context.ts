import { createContext, useContext } from "react";

export const ThemeContext = createContext("light");
export const useThemeContext = () => useContext(ThemeContext);
