export default function GooglePlayIcon({
  className = "h-12",
}: {
  className?: string;
}) {
  return (
    <img
      src="./google-play-badge.svg"
      alt="Get it on Google Play"
      className={className}
      style={{ colorScheme: "light" }}
    />
  );
}
