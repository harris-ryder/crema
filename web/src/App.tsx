import CoffeeScroll from "./components/CoffeeScroll";

export default function App() {
  return (
    <div className="w-full h-svh flex flex-col justify-center items-center">
      <div className="flex-1" />
      <div className="flex-1 flex flex-col justify-center items-center">
        <img src="./icon.svg" className="w-12 h-12"></img>
        <h1
          className="mt-4 uppercase text-[36px] leading-none tracking-[-0.03em] font-climate"
        >
          CREMA
        </h1>
      </div>

      <div className="flex-1 flex flex-col justify-end items-center gap-24">
        <div className="flex flex-col gap-8 justify-center items-center">
          <div className="mt-8 w-screen">
            <CoffeeScroll />
          </div>
          <img
            src="./google-play-badge.svg"
            alt="Get it on Google Play"
            className="h-12"
          />
        </div>
        <p
          className="text-content-primary pb-2 pl-2 self-start font-inter text-[12px] tracking-[-0.03em]"
        >
          ©2025 Designed in London
        </p>
      </div>
    </div>
  );
}
