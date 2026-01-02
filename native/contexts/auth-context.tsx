import { InferResponseType } from "hono/client";
import { client } from "@/api/client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { ZodIssue } from "zod";
import { router } from "expo-router";

export type User = InferResponseType<
  (typeof client.users)[":id"]["$get"]
>["user"];
export interface AuthContextType {
  user: User;
  header: { authorization: string };
  isLoading: boolean;
  googleSignIn(idToken: string): Promise<void>;
  signOut: () => Promise<void>;
  errors: ZodIssue[];
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

const saveAuthToken = async (_token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, _token);
};

const clearAuthToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

export const loadAuthToken = async () => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};
interface AuthProviderProps {
  children: ReactNode;
}
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [errors, setErrors] = useState<ZodIssue[]>([]);
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
        ] as ZodIssue[]);
        setIsLoading(false);
        return;
      }

      const response = await res.json();
      if (response.success) {
        await saveAuthToken(response.token);
        setToken(response.token);
        await getMe();
        router.push("/(profile)/name-setup");
      } else {
        setErrors([
          { message: "Failed to sign in with Google - server error" },
        ] as ZodIssue[]);
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);
      setErrors([
        { message: "Failed to sign in with Google - network error" },
      ] as ZodIssue[]);
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
