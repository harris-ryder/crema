const coffeeImages = Array.from({ length: 28 }, (_, i) => i + 1);

export default function CoffeeBanner() {
  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex animate-infinite-scroll"
        style={{ width: "max-content" }}
      >
        {coffeeImages.map((num) => (
          <img
            key={`first-${num}`}
            src={`/coffee-thumbnails/${num}.webp`}
            alt={`Coffee ${num}`}
            className="w-[120px] h-[120px] object-cover mx-[1px] flex-shrink-0"
          />
        ))}
        {coffeeImages.map((num) => (
          <img
            key={`second-${num}`}
            src={`/coffee-thumbnails/${num}.webp`}
            alt={`Coffee ${num}`}
            className="w-[120px] h-[120px] object-cover mx-[1px] flex-shrink-0"
          />
        ))}
      </div>
    </div>
  );
}
