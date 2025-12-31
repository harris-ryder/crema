import { client } from "@/api/client";
import { useAuth } from "@/contexts/auth-context";
import { useCallback, useEffect, useRef, useState } from "react";

const DEBOUNCE_DELAY = 500;

const clientSideNameValidation = (name: string) => {
  const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

  if (name.length < 3) return false;
  if (name.length > 30) return false;
  if (!USERNAME_REGEX.test(name)) return false;

  return true;
};

export type validationStatusType = "idle" | "valid" | "invalid" | "error";

export default function useNameValidatorAndUpdater() {
  const { user, header } = useAuth();
  const [validationStatus, setValidationStatus] =
    useState<validationStatusType>("idle");
  const [username, setUsername] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [usernameUpdateStatus, setUsernameUpdateStatus] = useState<
    "loading" | "error" | "success" | "idle"
  >("idle");

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const validateName = useCallback(
    async (name: string) => {
      setUsername(name);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      const trimmedName = name.trim();

      // Early exit - If input string is empty
      if (!trimmedName) {
        setValidationStatus("idle");
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

      // Only clear status when we need to check with server
      setValidationStatus("idle");

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
    [header.authorization, user?.username, username]
  );

  const updateName = async () => {
    try {
      const res = await client.users.username.$put(
        {
          json: { username: username.trim() },
        },
        { headers: header }
      );

      const response = await res.json();

      if (response.success) {
        setUsernameUpdateStatus("success");
      }
    } catch (error) {
      console.error("Username update error:", error);
      setUsernameUpdateStatus("error");
    }
  };

  return {
    validateName,
    validationStatus,
    updateName,
    usernameUpdateStatus,
  };
}
