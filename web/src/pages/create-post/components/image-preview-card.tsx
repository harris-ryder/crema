import { Loader2, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { HeartIcon } from "@/shared/icons";
import { Button } from "@/shared/primitives/button";
import { Calendar } from "@/shared/primitives/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/primitives/popover";

type UploadStatus = "pending" | "uploading" | "success" | "failed";

export function ImagePreviewCard({
  url,
  date,
  defaultDate,
  status,
  disabled,
  onDateChange,
}: {
  url: string;
  date: string;
  defaultDate: string;
  status?: UploadStatus;
  disabled: boolean;
  onDateChange: (date: string) => void;
}) {
  return (
    <div className="relative aspect-square rounded-4xl overflow-hidden">
      <img
        src={url}
        alt=""
        className="w-full h-full object-cover"
      />
      {status && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${status === "failed"
            ? "bg-red-500/30"
            : "bg-black/40"
            }`}
        >
          {status === "uploading" && (
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          )}
          {status === "success" && (
            <HeartIcon className="w-12 h-12 text-brand-red" />
          )}
          {status === "failed" && (
            <AlertCircle className="w-10 h-10 text-white" />
          )}
        </div>
      )}
      <Popover>
        <PopoverTrigger
          disabled={disabled}
          render={
            <Button
              variant="secondary"
              size="sm"
              className="absolute bg-surface-primary h-12 top-2 left-2 justify-start rounded-full disabled:opacity-50 w-fit px-4 typo-body"
            />
          }
        >
          {format(
            parse(date || defaultDate, "yyyy-MM-dd", new Date()),
            "MMM d, yyyy"
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={parse(date || defaultDate, "yyyy-MM-dd", new Date())}
            onSelect={(d) => {
              if (d) {
                onDateChange(format(d, "yyyy-MM-dd"));
              }
            }}
            disabled={{ after: new Date(), before: new Date(2020, 0, 1) }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
