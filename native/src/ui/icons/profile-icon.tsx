import React from "react";
import Svg, { Path, G, Defs, ClipPath, Rect } from "react-native-svg";

interface ProfileIconProps {
  width?: number;
  height?: number;
  fill?: string;
}

export default function ProfileIcon({
  width = 24,
  height = 24,
  fill = "#E0E0E0",
}: ProfileIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <G clipPath="url(#clip0_134_11967)">
        <Path
          d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20C4 20 6 21.5 12 21.5C18 21.5 20 20 20 20V18C20 15.34 14.67 14 12 14Z"
          fill={fill}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_134_11967">
          <Rect width="24" height="24" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}