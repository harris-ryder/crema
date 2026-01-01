export const palette = {
  neutral0: "#FFFFFF",
  neutral50: "#FAFAFA",
  neutral100: "#F5F5F5",
  neutral200: "#EEEEEE",
  neutral300: "#E0E0E0",
  neutral400: "#BDBDBD",
  neutral500: "#9E9E9E",
  neutral600: "#757575",
  neutral700: "#616161",
  neutral800: "#424242",
  neutral900: "#212121",
  neutral1000: "#000",
  brandRed: "#FF1616",
  brandGreen: "#1CB31F",
} as const;

type ColorScheme = {
  surface: {
    primary: string;
    onPrimary: string;
    secondary: string;
    tertiary: string;
  };
  content: {
    primary: string;
    tertiary: string;
    inverse: string;
  };
  brand: {
    red: string;
    green: string;
  };
};

export const lightColors: ColorScheme = {
  surface: {
    primary: palette.neutral0,
    onPrimary: palette.neutral1000,
    secondary: palette.neutral100,
    tertiary: palette.neutral300,
  },
  content: {
    primary: palette.neutral1000,
    tertiary: palette.neutral600,
    inverse: palette.neutral0,
  },
  brand: {
    red: palette.brandRed,
    green: palette.brandGreen,
  },
};

export const darkColors: ColorScheme = {
  surface: {
    primary: palette.neutral1000,
    onPrimary: palette.neutral0,
    secondary: palette.neutral900,
    tertiary: palette.neutral600,
  },
  content: {
    primary: palette.neutral0,
    tertiary: palette.neutral100,
    inverse: palette.neutral1000,
  },
  brand: {
    red: palette.brandRed,
    green: palette.brandGreen,
  },
};
