import { client } from "@/api/client";
import { useAuth } from "@/contexts/auth-context";
import { useCallback, useRef, useState } from "react";

const DEBOUNCE_DELAY = 500;

const clientSideNameValidation = (name: string) => {
  const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

  if (name.length < 3) return false;
  if (name.length > 30) return false;
  if (!USERNAME_REGEX.test(name)) return false;

  return true;
};

export const useDebounceNameChecker = () => {
  const { user, header } = useAuth();
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "checking" | "valid" | "invalid" | "error"
  >("idle");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validateName = useCallback(
    async (name: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setValidationStatus("idle");

      const trimmedName = name.trim();

      // Early exit - If input string is empty
      if (!trimmedName) {
        return;
      }

      // Early exit - If input name is same as current name
      if (user?.username == trimmedName) {
        setValidationStatus("valid");
        return;
      }

      // Early exit - Fails client side validation
      if (!clientSideNameValidation(trimmedName)) {
        setValidationStatus("invalid");
        return;
      }

      debounceTimer.current = setTimeout(async () => {
        try {
          const res = await client.users["check-username"].$post(
            {
              json: { username: trimmedName },
            },
            { headers: header }
          );

          const response = await res.json();

          if (response.success) {
            setValidationStatus("valid");
            return;
          }

          setValidationStatus("invalid");
          return;
        } catch (error) {
          console.error("Username validation error:", error);
          setValidationStatus("error");
        }
      }, DEBOUNCE_DELAY);
    },
    [header.authorization, user?.username]
  );

  return { validateName, validationStatus };
};
