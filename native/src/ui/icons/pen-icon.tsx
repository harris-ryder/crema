import React from "react";
import Svg, { G, Path, Defs, ClipPath, Rect } from "react-native-svg";

interface PenIconProps {
  width?: number;
  height?: number;
  fill?: string;
}

export default function PenIcon({
  width = 24,
  height = 24,
  fill = "#FAFAFA",
}: PenIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <G clipPath="url(#clip0_125_6424)">
        <Path
          d="M3 17.2501V21.0001H6.75L17.81 9.94006L14.06 6.19006L3 17.2501ZM20.71 7.04006C21.1 6.65006 21.1 6.02006 20.71 5.63006L18.37 3.29006C17.98 2.90006 17.35 2.90006 16.96 3.29006L15.13 5.12006L18.88 8.87006L20.71 7.04006Z"
          fill={fill}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_125_6424">
          <Rect width="24" height="24" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
