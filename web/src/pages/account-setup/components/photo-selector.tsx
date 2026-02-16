import { useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { useAuth, loadAuthToken } from "@/contexts/auth-context";
import { LatteArtIcon } from "@/shared/icons/latte-art-icon";
import config from "@/config";
import type { ClassValue } from "clsx";
import { cn } from "@/lib/utils";



const postImage = async (file: File) => {
  const token = await loadAuthToken();

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${config.backendUrl}/images/users/profile-picture`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const result = await response.json();

  if (result.success) {
    return result;
  } else {
    throw new Error("Failed to update image");
  }
};

export default function PhotoSelector({ className }: { className: ClassValue }) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await postImage(file);
      if (response.success) {
        setLocalImageUri(URL.createObjectURL(file));
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  };

  const imageUri =
    localImageUri ||
    (user?.avatar_uri
      ? `${config.backendUrl}/images/users/${user.id}?v=${user.updated_at}`
      : null);

  return (
    <div className={cn(className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="w-64 h-64 relative">
        {imageUri ? (
          <img
            src={imageUri}
            alt="Profile"
            className="w-64 h-64 rounded-full object-cover"
          />
        ) : (
          <div className="w-64 h-64 rounded-full bg-surface-secondary flex items-center justify-center">
            <LatteArtIcon width={180} height={180} className="text-content-tertiary" />
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-2.5 right-2.5 w-14 h-14 rounded-full bg-surface-inverse-primary flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
        >
          <Pencil className="w-6 h-6 text-content-inverse-primary" />
        </button>
      </div>
    </div>
  );
}
