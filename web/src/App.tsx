import CoffeeBanner from "./components/CoffeeScroll";
import Lottie from "lottie-react";
import animationData from "./shared/icons/heart-slice-lottie.json";
import GooglePlayIcon from "./shared/icons/google-play-icon";

export default function App() {
  return (
    <div className="w-full h-[100dvh] flex flex-col justify-center items-center bg-surface-primary">
      <div className="flex-1" />
      <div className="flex-1 flex flex-col justify-center items-center">
        <Lottie
          animationData={animationData}
          autoplay
          loop={false}
          style={{ width: 48, height: 48 }}
        />
        <h1 className="uppercase text-[36px] leading-none tracking-[-0.03em] font-climate text-content-primary">
          CREMA
        </h1>
      </div>

      <div className="flex-1 flex flex-col justify-end items-center gap-24">
        <div className="flex flex-col gap-8 justify-center items-center">
          <div className="mt-8 w-screen">
            <CoffeeBanner />
          </div>
          <GooglePlayIcon />
        </div>
        <p className="text-content-primary pb-2 pl-2 self-start font-inter text-[12px] tracking-[-0.03em]">
          ©2025 Designed in London
        </p>
      </div>
    </div>
  );
}
