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
  brandRed: "#FF1616",
  brandGreen: "#1CB31F",
} as const;

type ColorScheme = {
  surface: {
    primary: string;
    onPrimary: string;
    inverse: string;
    inverseOn: string;
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
    onPrimary: palette.neutral100,
    inverse: palette.neutral900,
    inverseOn: palette.neutral0,
  },
  content: {
    primary: palette.neutral900,
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
    primary: palette.neutral900,
    onPrimary: palette.neutral800,
    inverse: palette.neutral0,
    inverseOn: palette.neutral900,
  },
  content: {
    primary: palette.neutral0,
    tertiary: palette.neutral100,
    inverse: palette.neutral900,
  },
  brand: {
    red: palette.brandRed,
    green: palette.brandGreen,
  },
};
