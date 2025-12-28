import { darkColors, lightColors } from "./colors";
import { spacing } from "./spacing";

export const lightTheme = {
  colors: lightColors,
  spacing,
} as const;

export const darkTheme: typeof lightTheme = {
  colors: darkColors,
  spacing,
};

export type Theme = typeof lightTheme;