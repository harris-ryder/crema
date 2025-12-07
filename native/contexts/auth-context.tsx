import { InferRequestType, InferResponseType } from "hono/client";
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

export type User = InferResponseType<
  (typeof client.users)[":id"]["$get"]
>["user"];
type SignUpBody = InferRequestType<
  (typeof client.users)["sign-up"]["$post"]
>["json"];
type loginBody = InferRequestType<
  (typeof client.users)["sign-in"]["$post"]
>["json"];

export interface AuthContextType {
  user: User;
  header: { authorization: string };
  isLoading: boolean;
  signUp(credentials: SignUpBody): Promise<void>;
  logIn(credentials: loginBody): Promise<void>;
  errors: ZodIssue[];
  getMe: () => Promise<void>;
}

const TOKEN_KEY = "auth-token";

const AuthContext = createContext<AuthContextType>({
  user: null,
  header: { authorization: `` },
  isLoading: true,
  signUp: () => Promise.resolve(),
  logIn: () => Promise.resolve(),
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
    const response = await (
      await client.users.me.$get({
        header: {
          authorization: `Bearer ${_token || ""}`,
        },
      })
    ).json();
    if (response.success) {
      setUser(response.data.user);
    } else {
      setUser(null);
      setToken(null);
      await clearAuthToken();
    }
    setIsLoading(false);
  };

  const logIn = async (
    credentials: InferRequestType<
      (typeof client.users)["sign-in"]["$post"]
    >["json"]
  ) => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    const response = await (
      await client.users["sign-in"].$post({
        json: credentials,
      })
    ).json();
    if (response.success) {
      await saveAuthToken(response.token);
      setToken(response.token);
      await getMe();
      setIsLoading(false);
    } else {
      setErrors([...errors, ...response.error]);
    }
  };

  const signUp = async (
    credentials: InferRequestType<
      (typeof client.users)["sign-up"]["$post"]
    >["json"]
  ) => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    const response = await (
      await client.users["sign-up"].$post({
        json: credentials,
      })
    ).json();
    setIsLoading(false);
    if (response.success) {
      await saveAuthToken(response.token);
      setToken(response.token);
      await getMe();
    } else {
      setErrors([...errors, ...response.error]);
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
        signUp,
        logIn,
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
