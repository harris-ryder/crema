import CoffeeBanner from "@/components/coffee-banner";
import LottieAnimation from "@/components/lottie-animation";

export default function Home() {
  return (
    <div className="w-full h-[100dvh] flex flex-col justify-center items-center bg-surface-primary">
      <div className="flex-1" />
      <div className="flex-1 flex flex-col justify-center items-center">
        <LottieAnimation />
        <h1 className="uppercase text-display-2 font-climate text-black">
          CREMA
        </h1>
      </div>

      <div className="flex-1 flex flex-col justify-end items-center gap-24">
        <div className="flex flex-col gap-8 justify-center items-center">
          <div className="mt-8 w-screen">
            <CoffeeBanner />
          </div>
          <a
            href="https://app.crema.love"
            className="bg-black text-white font-inter text-body rounded-[128px] px-8 py-4"
          >
            Go to app
          </a>
        </div>
        <p className="text-content-primary pb-2 pl-2 self-start text-caption font-inter">
          &copy;2025 Designed in London
        </p>
      </div>
    </div>
  );
}
