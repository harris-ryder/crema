import { useColorScheme } from "react-native";
import { darkTheme, lightTheme } from "./theme";

export function useTheme() {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkTheme : lightTheme;
}