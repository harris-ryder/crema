import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { useTheme, type, palette, Theme } from "@/src/design";

type Variant = "primary" | "secondary";
type Size = "sm" | "md" | "lg";

type Props = Omit<PressableProps, "style" | "disabled"> & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  left?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
};

function withAlpha(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const BUTTON_SIZES: Record<Size, ViewStyle> = {
  sm: { minHeight: 36, paddingHorizontal: 12 },
  md: { minHeight: 44, paddingHorizontal: 16 },
  lg: { minHeight: 60, paddingHorizontal: 32 },
};

type VariantStyles = {
  container: ViewStyle;
  label: TextStyle;
  spinnerColor: string;
  pressed?: ViewStyle;
};

function getButtonVariants(theme: Theme): Record<Variant, VariantStyles> {
  const pressedOverlay = withAlpha(theme.colors.content.primary, 0.08);

  return {
    primary: {
      container: {
        backgroundColor: theme.colors.surface.inverse,
      },
      label: { color: theme.colors.surface.inverseOn },
      spinnerColor: theme.colors.surface.inverseOn,
      pressed: { opacity: 0.9 },
    },

    secondary: {
      container: {
        backgroundColor: theme.colors.surface.primary,
      },
      label: { color: theme.colors.content.primary },
      spinnerColor: theme.colors.content.primary,
      pressed: { backgroundColor: pressedOverlay },
    },
  };
}

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  left,
  onPress,
  style,
  textStyle,
  ...rest
}: Props) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const variants = getButtonVariants(theme);
  const v = variants[variant];

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      onPress={isDisabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        BUTTON_SIZES[size],
        {
          borderRadius: theme.spacing[96],
          borderWidth: 1,
          gap: theme.spacing[2],
        },
        v.container,
        pressed && !isDisabled ? v.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      <View style={styles.row}>
        {left ? <View style={styles.slot}>{left}</View> : null}

        {loading ? (
          <ActivityIndicator size="small" color={v.spinnerColor} />
        ) : (
          <Text numberOfLines={1} style={[type.body, v.label, textStyle]}>
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  slot: {
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.55,
  },
});
