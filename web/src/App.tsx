import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { LoginPage } from "@/pages/login/login-page";

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="w-full h-[100dvh] flex flex-col justify-center items-center bg-surface-primary">
        <p className="typo-body text-content-secondary">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="w-full h-[100dvh] flex flex-col justify-center items-center bg-surface-primary">
      <h1 className="text-display-2 font-climate text-content-primary uppercase">
        CREMA
      </h1>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
