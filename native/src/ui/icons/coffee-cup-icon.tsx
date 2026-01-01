import React from "react";
import Svg, { Path } from "react-native-svg";

interface CoffeeCupIconProps {
  width?: number;
  height?: number;
  fill?: string;
}

export default function CoffeeCupIcon({
  width = 24,
  height = 24,
  fill = "#E0E0E0",
}: CoffeeCupIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18.5 4.49805H6C4.9 4.49805 4 5.39805 4 6.49805V12.208C4 16.038 6.95 19.388 10.78 19.498C14.74 19.618 18 16.438 18 12.498V11.498H18.5C20.43 11.498 22 9.92805 22 7.99805C22 6.06805 20.43 4.49805 18.5 4.49805ZM16 6.49805V9.49805H6V6.49805H16ZM18.5 9.49805H18V6.49805H18.5C19.33 6.49805 20 7.16805 20 7.99805C20 8.82805 19.33 9.49805 18.5 9.49805Z"
        fill={fill}
      />
    </Svg>
  );
}