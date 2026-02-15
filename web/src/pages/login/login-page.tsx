import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import Lottie from "lottie-react";
import { useAuth } from "@/contexts/auth-context";
import animationData from "@/shared/icons/heart-slice-lottie.json";
import { GoogleIcon } from "@/shared/icons/google-icon";
import { Button } from "@/shared/primitives";

const GOOGLE_CLIENT_ID =
  "157821791942-m36u8iqssodtm9440adgr8noq3vmut9m.apps.googleusercontent.com";

function LoginContent() {
  const { googleSignIn, errors, isLoading } = useAuth();

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      googleSignIn(tokenResponse.access_token);
    },
    onError: () => {
      console.log("Google Login Failed");
    },
  });

  return (
    <div className="w-full h-[100dvh] flex flex-col justify-center items-center bg-surface-primary gap-8">
      <div className="flex flex-col items-center">
      <Lottie
        animationData={animationData}
        autoplay
        loop={false}
        style={{ width: 96, height: 96 }}
      />
      <h1 className="typo-heading-1 font-climate text-content-primary uppercase">
        CREMA
      </h1>
      </div>
      <Button onClick={() => login()}>
        <GoogleIcon />
        Sign in with Google
      </Button>
      {isLoading && (
        <p className="typo-caption text-content-secondary">Signing in...</p>
      )}
      {errors.length > 0 && (
        <div className="flex flex-col gap-1">
          {errors.map((error, i) => (
            <p key={i} className="typo-caption text-brand-red">
              {error.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginContent />
    </GoogleOAuthProvider>
  );
}
