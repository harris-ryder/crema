import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useAuth } from "@/contexts/auth-context";

const GOOGLE_CLIENT_ID =
  "157821791942-m36u8iqssodtm9440adgr8noq3vmut9m.apps.googleusercontent.com";

export function LoginPage() {
  const { googleSignIn, errors, isLoading } = useAuth();

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="w-full h-[100dvh] flex flex-col justify-center items-center bg-surface-primary gap-8">
        <h1 className="text-display-2 font-climate text-content-primary uppercase">
          CREMA
        </h1>
        <div>
          <GoogleLogin
            width={300}
            onSuccess={async (payload) => {
              if (!payload.credential) return;
              await googleSignIn(payload.credential);
            }}
            onError={() => {
              console.log("Google Login Failed");
            }}
          />
        </div>
        {isLoading && (
          <p className="text-caption text-content-secondary">Signing in...</p>
        )}
        {errors.length > 0 && (
          <div className="flex flex-col gap-1">
            {errors.map((error, i) => (
              <p key={i} className="text-caption text-brand-red">
                {error.message}
              </p>
            ))}
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}
