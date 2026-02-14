"use client";

import Lottie from "lottie-react";
import animationData from "@/shared/icons/heart-slice-lottie.json";

export default function LottieAnimation() {
  return (
    <Lottie
      animationData={animationData}
      autoplay
      loop={false}
      style={{ width: 48, height: 48 }}
    />
  );
}
