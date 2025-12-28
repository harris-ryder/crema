import CoffeeScroll from "./components/CoffeeScroll";

export default function App() {
  return (
    <div className="w-full h-svh flex flex-col justify-center items-center">
      <img src="./icon.svg" className="w-12 h-12"></img>
      <h1
        style={{
          fontFamily: "Climate Crisis",
          fontSize: "36px",
          letterSpacing: "-0.03em",
          lineHeight: "1",
        }}
        className="mt-4 uppercase"
      >
        CREMA
      </h1>
      <div className="mt-8 w-full">
        <CoffeeScroll />
      </div>
    </div>
  );
}
