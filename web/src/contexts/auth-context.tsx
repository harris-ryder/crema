import type { InferResponseType } from "hono/client";
import { client } from "@/api/client";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type AuthError = { message: string };

export type User = InferResponseType<
  (typeof client.users)[":id"]["$get"]
>["user"];

export interface AuthContextType {
  user: User;
  header: { authorization: string };
  isLoading: boolean;
  googleSignIn(idToken: string): Promise<void>;
  signOut: () => Promise<void>;
  errors: AuthError[];
  getMe: () => Promise<void>;
}

const TOKEN_KEY = "auth-token";

const AuthContext = createContext<AuthContextType>({
  user: null,
  header: { authorization: `` },
  isLoading: true,
  googleSignIn: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  errors: [],
  getMe: () => Promise.resolve(),
});

const saveAuthToken = async (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

const clearAuthToken = async () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const loadAuthToken = async () => {
  return localStorage.getItem(TOKEN_KEY);
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [errors, setErrors] = useState<AuthError[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  const getMe = async () => {
    const _token = await loadAuthToken();

    if (!_token) {
      setIsLoading(false);
      setUser(null);
      setToken(null);
      return;
    }
    setToken(_token);
    setIsLoading(true);

    try {
      const res = await client.users.me.$get({
        header: {
          authorization: `Bearer ${_token || ""}`,
        },
      });

      const response = await res.json();
      if (response.success) {
        setUser(response.data);
      } else {
        setUser(null);
        setToken(null);
        await clearAuthToken();
      }
    } catch (error) {
      setUser(null);
      setToken(null);
      await clearAuthToken();
    }
    setIsLoading(false);
  };

  const googleSignIn = async (idToken: string) => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    setErrors([]);

    try {
      const res = await client.oauth.google.$post({
        json: { token: idToken },
      });

      if (!res.ok) {
        console.error("OAuth response not OK:", res.status);
        const errorText = await res.text();
        console.error("Error response:", errorText);
        setErrors([
          { message: "Failed to sign in with Google - server error" },
        ] as AuthError[]);
        setIsLoading(false);
        return;
      }

      const response = await res.json();
      if (response.success) {
        await saveAuthToken(response.token);
        setToken(response.token);
        await getMe();
        window.location.href = "/setup-profile";
      } else {
        setErrors([
          { message: "Failed to sign in with Google - server error" },
        ] as AuthError[]);
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);
      setErrors([
        { message: "Failed to sign in with Google - network error" },
      ] as AuthError[]);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await clearAuthToken();
      setToken(null);
      setUser(null);
      setErrors([]);
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getMe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        errors,
        googleSignIn,
        signOut,
        getMe,
        header: { authorization: `Bearer ${token || ""}` },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};
