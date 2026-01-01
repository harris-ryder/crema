const tracking = (fontSize: number, percent = -3) => fontSize * (percent / 100);

export const fonts = {
  climate: "ClimateCrisis",
  inter: "Inter",
} as const;

export const type = {
  display1: {
    fontFamily: fonts.climate,
    fontSize: 120,
    letterSpacing: tracking(120, -3),
    includeFontPadding: false,
  },
  heading1: {
    fontFamily: fonts.climate,
    fontSize: 32,
    letterSpacing: tracking(36, -3),
    includeFontPadding: false,
  },
  title: {
    fontFamily: fonts.inter,
    fontSize: 16,
    letterSpacing: tracking(16, -3),
    fontWeight: "600" as const,
  },
  body: {
    fontFamily: fonts.inter,
    fontSize: 16,
    letterSpacing: tracking(16, -3),
    fontWeight: "400" as const,
  },
  weak: {
    fontFamily: fonts.inter,
    fontSize: 16,
    letterSpacing: tracking(16, -3),
    fontWeight: "400" as const,
  },
} as const;

export type TextVariant = keyof typeof type;
