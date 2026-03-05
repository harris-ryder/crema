import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Loader2, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import exifr from "exifr";
import { HeartIcon } from "@/shared/icons";
import { Button } from "@/shared/primitives/button";
import { Calendar } from "@/shared/primitives/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/primitives/popover";
import config from "@/config";

type UploadStatus = "pending" | "uploading" | "success" | "failed";

export function CreatePostPage({
  images,
  defaultDate,
  onBack,
  onComplete,
  header,
}: {
  images: File[];
  defaultDate: string;
  onBack: () => void;
  onComplete: () => void;
  header: { authorization: string };
}) {
  const [imageDates, setImageDates] = useState<Record<number, string>>(() =>
    Object.fromEntries(images.map((_, i) => [i, defaultDate]))
  );
  const [uploadStatus, setUploadStatus] = useState<
    Record<number, UploadStatus>
  >({});
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadSummary, setUploadSummary] = useState<{
    successful: number;
    failed: number;
  } | null>(null);

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    Promise.all(
      images.map(async (file) => {
        try {
          const exif = await exifr.parse(file, ["DateTimeOriginal"]);
          if (exif?.DateTimeOriginal) {
            return format(exif.DateTimeOriginal, "yyyy-MM-dd");
          }
        } catch {
          // No EXIF data available
        }
        return defaultDate;
      })
    ).then((dates) => {
      setImageDates(Object.fromEntries(dates.map((d, i) => [i, d])));
    });

    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [images, defaultDate]);

  const handleUpload = useCallback(async () => {
    setIsUploading(true);
    setUploadSummary(null);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < images.length; i++) {
      setUploadStatus((prev) => ({ ...prev, [i]: "uploading" }));

      try {
        const formData = new FormData();
        formData.append("file", images[i]);
        formData.append("postDate", imageDates[i] || defaultDate);

        const res = await fetch(`${config.backendUrl}/posts`, {
          method: "POST",
          headers: header,
          body: formData,
        });

        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

        successCount++;
        setUploadStatus((prev) => ({ ...prev, [i]: "success" }));
      } catch {
        failCount++;
        setUploadStatus((prev) => ({ ...prev, [i]: "failed" }));
      }
    }

    setIsUploading(false);

    if (failCount > 0) {
      setUploadSummary({ successful: successCount, failed: failCount });
    } else {
      onComplete();
    }
  }, [images, imageDates, defaultDate, header, onComplete]);

  return (
    <div className="grid h-dvh bg-surface-primary [grid-template:1fr/1fr]">
      {/* Scrollable image grid — full height, scrolls under header & button */}
      <div className="overflow-y-auto [grid-area:1/1] px-[36px]">
        <div className="pt-28 pb-28">
          <div className="grid grid-cols-2 gap-3">
            {previewUrls.map((url, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="relative aspect-square rounded-2xl overflow-hidden">
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {uploadStatus[i] && (
                    <div
                      className={`absolute inset-0 flex items-center justify-center ${uploadStatus[i] === "failed"
                        ? "bg-red-500/30"
                        : "bg-black/40"
                        }`}
                    >
                      {uploadStatus[i] === "uploading" && (
                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                      )}
                      {uploadStatus[i] === "success" && (
                        <HeartIcon className="w-12 h-12 text-brand-red" />
                      )}
                      {uploadStatus[i] === "failed" && (
                        <AlertCircle className="w-10 h-10 text-white" />
                      )}
                    </div>
                  )}
                </div>
                <Popover>
                  <PopoverTrigger
                    disabled={isUploading || uploadStatus[i] === "success"}
                    render={
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full justify-start typo-caption disabled:opacity-50"
                      />
                    }
                  >
                    <CalendarIcon className="w-4 h-4" />
                    {format(
                      parse(imageDates[i] || defaultDate, "yyyy-MM-dd", new Date()),
                      "MMM d, yyyy"
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={parse(imageDates[i] || defaultDate, "yyyy-MM-dd", new Date())}
                      onSelect={(date) => {
                        if (date) {
                          setImageDates((prev) => ({
                            ...prev,
                            [i]: format(date, "yyyy-MM-dd"),
                          }));
                        }
                      }}
                      disabled={{ after: new Date(), before: new Date(2020, 0, 1) }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </div>

          {/* Summary message */}
          {uploadSummary && (
            <p className="typo-body text-content-secondary mt-4">
              {uploadSummary.successful} of {images.length} uploaded.{" "}
              {uploadSummary.failed} failed.
            </p>
          )}
        </div>
      </div>

      {/* Header — overlaps on top */}
      <div className="[grid-area:1/1] self-start pointer-events-none z-10">
        <div className="flex items-center gap-3 px-[36px] pt-16 pb-6 pointer-events-auto">
          {!isUploading && (
            <Button onClick={onBack} size="icon">
              <ArrowLeft className="w-6 h-6 text-content-inverse" />
            </Button>
          )}
          {(isUploading || uploadSummary) && (
            <span className="typo-title text-content-primary">
              {isUploading ? "Uploading..." : "Upload Complete"}
            </span>
          )}
        </div>
      </div>

      {/* Action button — overlaps on bottom */}
      <div className="[grid-area:1/1] self-end pointer-events-none z-10">
        <div className="px-[36px] pb-12 pt-8 pointer-events-auto">
          {uploadSummary ? (
            <Button
              onClick={onComplete}
              className="w-full h-14 rounded-full bg-surface-inverse text-content-inverse typo-title"
            >
              Done
            </Button>
          ) : (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full h-14 rounded-full bg-surface-inverse text-content-inverse typo-title disabled:opacity-50"
            >
              {isUploading
                ? "Uploading..."
                : `Upload ${images.length} ${images.length === 1 ? "Image" : "Images"}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
