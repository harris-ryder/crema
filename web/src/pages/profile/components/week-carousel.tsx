import { Plus } from "lucide-react";
import config from "@/config";
import type { WeekData } from "../profile-page";

const DAY_NAMES = ["M", "T", "W", "T", "F", "S", "S"];

function getAdjacentDayHasPosts(
  dayIndex: number,
  direction: "prev" | "next",
  week: WeekData
) {
  const targetIndex = direction === "prev" ? dayIndex - 1 : dayIndex + 1;
  if (targetIndex < 0 || targetIndex >= week.days.length) return false;
  return week.days[targetIndex].posts.length > 0;
}

function isFutureDay(todaysDate: string, dayDate: string) {
  return dayDate > todaysDate;
}

function getEmptyDayBorderRadius(dayIndex: number, week: WeekData) {
  const hasPrevPosts = getAdjacentDayHasPosts(dayIndex, "prev", week);
  const isFirstDayOfWeek = dayIndex === 0;
  const hasNextPosts = getAdjacentDayHasPosts(dayIndex, "next", week);
  const isLastDayOfWeek = dayIndex === 6;

  const radii = {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  };

  if (hasPrevPosts || isFirstDayOfWeek) {
    radii.borderTopLeftRadius = 32;
    radii.borderBottomLeftRadius = 32;
  }

  if (hasNextPosts || isLastDayOfWeek) {
    radii.borderTopRightRadius = 32;
    radii.borderBottomRightRadius = 32;
  }

  return radii;
}

export function WeekCarousel({ week }: { week: WeekData }) {
  const todaysDate = new Date().toLocaleDateString("en-CA");

  return (
    <div className="flex flex-row gap-[3px] px-8 overflow-x-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
      {week.days.map((day, index) => {
        const dayName = DAY_NAMES[index];
        const hasPosts = day.posts.length > 0;

        if (hasPosts) {
          const firstPost = day.posts[0];
          return (
            <div
              key={day.localDate}
              className="w-[92px] h-[92px] rounded-full overflow-hidden shrink-0"
            >
              <img
                src={`${config.backendUrl}/images/posts/${firstPost.id}`}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          );
        }

        const radii = getEmptyDayBorderRadius(index, week);
        const future = isFutureDay(todaysDate, day.localDate);

        return (
          <button
            key={day.localDate}
            className="w-16 h-24 bg-surface-secondary flex items-center justify-center shrink-0"
            style={{
              borderTopLeftRadius: radii.borderTopLeftRadius,
              borderBottomLeftRadius: radii.borderBottomLeftRadius,
              borderTopRightRadius: radii.borderTopRightRadius,
              borderBottomRightRadius: radii.borderBottomRightRadius,
              opacity: future ? 0.5 : 1,
            }}
            disabled={future}
          >
            <span className="typo-title text-content-primary">{dayName}</span>
          </button>
        );
      })}
      <button className="w-16 h-24 rounded-full bg-surface-secondary flex items-center justify-center shrink-0">
        <Plus className="w-6 h-6 text-content-primary" />
      </button>
    </div>
  );
}
