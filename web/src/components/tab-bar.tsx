import type { Tab } from "@/App";
import { CoffeeCupIcon, HeartIcon, ProfileIcon } from "@/shared/icons"

const TABS: { id: Tab; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { id: "home", icon: CoffeeCupIcon },
  { id: "activity", icon: HeartIcon },
  { id: "profile", icon: ProfileIcon },
];

const TAB_WIDTH = 72;

export function TabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const activeIndex = TABS.findIndex((t) => t.id === activeTab);
  const indicatorOffset = activeIndex * TAB_WIDTH;

  return (
    <div className="fixed bottom-12 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <div className="relative h-[60px] rounded-full px-1 flex items-center overflow-hidden bg-surface-inverse pointer-events-auto">
        {/* Sliding active indicator */}
        <div
          className="absolute w-[72px] h-[52px] rounded-full bg-surface-primary transition-transform duration-200 ease-out"
          style={{
            left: 4,
            transform: `translateX(${indicatorOffset}px)`,
          }}
        />

        {/* Tab buttons */}
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative z-10 w-[72px] h-[52px] flex items-center justify-center rounded-full mix-blend-difference"
          >
            <tab.icon className="w-6 h-6 text-white" />
          </button>
        ))}
      </div>
    </div>
  );
}
