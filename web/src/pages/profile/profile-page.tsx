import { useAuth } from "@/contexts/auth-context";
import { client } from "@/api/client";
import config from "@/config";
import { useEffect, useState, useRef, useCallback } from "react";
import type { InferResponseType } from "hono/client";
import type { Page } from "@/App";
import { Settings, Loader2 } from "lucide-react";
import { HeartIcon } from "@/shared/icons/heart-icon";
import { LatteArtIcon } from "@/shared/icons/latte-art-icon";
import { WeekCarousel } from "./components/week-carousel";

type GetPostsByWeeksResponse = InferResponseType<
  (typeof client.posts)[":userId"]["weeks"]["$get"]
>;
export type UserWeeksData = Pick<GetPostsByWeeksResponse, "weeks">["weeks"];
export type WeekData = UserWeeksData[number];

export function ProfilePage({
  navigate,
}: {
  navigate: (page: Page) => void;
}) {
  const { user, signOut, header } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingDateRef = useRef<string>("");

  const [weeks, setWeeks] = useState<UserWeeksData>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<{
    year: number;
    week: number;
  } | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleCreatePost = (defaultDate: string) => {
    pendingDateRef.current = defaultDate;
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      navigate({ name: "create-post", files, defaultDate: pendingDateRef.current });
    }
    e.target.value = "";
  };

  const fetchUserWeeks = useCallback(
    async (cursor?: { year: number; week: number }, append = false) => {
      if (!user?.id || !header) return;
      if (loading) return;

      setLoading(true);

      try {
        const query: { count: string; year?: string; week?: string } = {
          count: "7",
        };
        if (cursor) {
          query.year = cursor.year.toString();
          query.week = cursor.week.toString();
        }

        const res = await client.posts[":userId"].weeks.$get(
          { param: { userId: user.id }, query },
          { headers: header }
        );

        if (!res.ok) {
          console.error("Error response:", await res.text());
          return;
        }

        const data = await res.json();

        if (data.weeks && data.weeks.length > 0) {
          if (append) {
            setWeeks((prev) => [...prev, ...data.weeks]);
          } else {
            setWeeks(data.weeks);
          }

          if (data.next) {
            setNextCursor(data.next);
          } else {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching user weeks:", error);
      } finally {
        setLoading(false);
      }
    },
    [user?.id, header, loading]
  );

  const loadMoreWeeks = useCallback(() => {
    if (hasMore && !loading && nextCursor) {
      fetchUserWeeks(nextCursor, true);
    }
  }, [hasMore, loading, nextCursor, fetchUserWeeks]);

  // Initial load
  useEffect(() => {
    setWeeks([]);
    setHasMore(true);
    setNextCursor(null);
    fetchUserWeeks();
  }, [user?.id, header]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreWeeks();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMoreWeeks]);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="typo-body text-content-primary">
          No user data available
        </p>
      </div>
    );
  }

  const headerSection = (
    <div className="flex flex-row justify-between items-start px-[36px] pt-16 mb-8">
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        <div className="flex flex-col gap-2">
          <h1 className="typo-heading-1 text-content-primary truncate">
            {user.display_name}
          </h1>
          <p className="typo-body text-content-tertiary truncate">
            {"@"}{user.username}
          </p>
        </div>
        <div className="flex flex-row items-center gap-1">
          <HeartIcon className="w-6 h-6 text-content-primary" />
          <span className="typo-body text-content-primary">
            7 coffees made
          </span>
        </div>
      </div>
      <div className="relative w-24 h-24">
        <button
          onClick={signOut}
          className="absolute -bottom-1 -right-1 p-2 z-10 bg-surface-secondary rounded-full"
        >
          <Settings className="w-6 h-6 text-content-primary" />
        </button>
        {user.id ? (
          <img
            src={`${config.backendUrl}/images/users/${user.id}?v=${user.updated_at}`}
            alt={user.username ?? ""}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-surface-secondary flex items-center justify-center">
            <LatteArtIcon className="w-8 h-8 text-content-tertiary" />
          </div>
        )}
      </div>
    </div>
  );

  // Empty state
  if (weeks.length === 0 && !loading) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-surface-primary">
        {headerSection}
        <div className="flex-1 flex items-center justify-center">
          <HeartIcon className="w-[120px] h-[120px] text-brand-red" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-surface-primary pb-[120px]">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />
      {headerSection}
      <div className="flex flex-col gap-4">
        {weeks.map((week, index) => (
          <div
            key={`${week.weekYear}-${week.weekNumber}-${index}`}
            className="flex flex-col gap-3"
          >
            <span className="typo-title text-content-primary pl-[36px]">
              Week {week.weekNumber}
            </span>
            <WeekCarousel week={week} onCreatePost={handleCreatePost} />
          </div>
        ))}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-1" />

      {loading && (
        <div className="flex items-center justify-center py-5">
          <Loader2 className="w-8 h-8 text-content-primary animate-spin" />
        </div>
      )}
    </div>
  );
}
