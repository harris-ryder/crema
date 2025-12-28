export const palette = {
  neutral0:  "#FFFFFF",
  neutral50: "#F5F5F5",
  neutral300:"#E0E0E0",
  neutral400:"#BDBDBD",
  neutral700:"#757575",
  neutral900:"#000000",
  brandRed:  "#FF1616",
  brandGreen:"#1CB31F",
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
  border: string;
};

export const lightColors: ColorScheme = {
  surface: {
    primary: palette.neutral0,
    onPrimary: palette.neutral50,
    inverse: palette.neutral900,
    inverseOn: palette.neutral0,
  },
  content: {
    primary: palette.neutral900,
    tertiary: palette.neutral700,
    inverse: palette.neutral0,
  },
  brand: {
    red: palette.brandRed,
    green: palette.brandGreen,
  },
  border: palette.neutral300,
};

export const darkColors: ColorScheme = {
  surface: {
    primary: palette.neutral900,
    onPrimary: palette.neutral0,
    inverse: palette.neutral0,
    inverseOn: palette.neutral900,
  },
  content: {
    primary: palette.neutral0,
    tertiary: palette.neutral50,
    inverse: palette.neutral900,
  },
  brand: {
    red: palette.brandRed,
    green: palette.brandGreen,
  },
  border: palette.neutral700,
};