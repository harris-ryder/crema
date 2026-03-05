import { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import exifr from "exifr";
import { Button } from "@/shared/primitives/button";
import config from "@/config";
import { ImagePreviewCard } from "./components/image-preview-card";

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
              <ImagePreviewCard
                key={i}
                url={url}
                date={imageDates[i]}
                defaultDate={defaultDate}
                status={uploadStatus[i]}
                disabled={isUploading || uploadStatus[i] === "success"}
                onDateChange={(date) =>
                  setImageDates((prev) => ({ ...prev, [i]: date }))
                }
              />
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
        <div className="flex items-center gap-3 px-[36px] pt-16 pb-6 pointer-events-auto bg-gradient-to-b from-surface-primary to-transparent">
          {!isUploading && (
            <Button onClick={onBack} size="icon" className="bg-surface-inverse">
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
        <div className="px-[36px] pb-12 pt-8 pointer-events-auto bg-gradient-to-t from-surface-primary to-transparent">
          {uploadSummary ? (
            <Button
              onClick={onComplete}
              className="w-full h-14 rounded-full bg-surface-inverse text-content-inverse typo-title"
            >
              Done
            </Button>
          ) : (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full h-14 rounded-full bg-surface-inverse text-content-inverse typo-title disabled:opacity-50"
            >
              {isUploading
                ? "Uploading..."
                : `Upload ${images.length} ${images.length === 1 ? "Image" : "Images"}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
