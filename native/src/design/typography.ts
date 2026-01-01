const tracking = (fontSize: number, percent = -3) => fontSize * (percent / 100);

export const fonts = {
  climate: "ClimateCrisis",
  inter: "Inter_400Regular",
  interSemiBold: "Inter_600SemiBold",
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
    fontFamily: fonts.interSemiBold,
    fontSize: 16,
    letterSpacing: tracking(16, -3),
  },
  body: {
    fontFamily: fonts.inter,
    fontSize: 16,
    letterSpacing: tracking(16, -3),
  },
  weak: {
    fontFamily: fonts.inter,
    fontSize: 16,
    letterSpacing: tracking(16, -3),
  },
} as const;

export type TextVariant = keyof typeof type;
