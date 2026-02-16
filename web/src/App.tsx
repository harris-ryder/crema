import { useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { LoginPage } from "@/pages/login/login-page";
import { AccountSetupPage } from "@/pages/account-setup/account-setup-page";
import { ProfilePage } from "@/pages/profile/profile-page";
import { TabBar, type Tab } from "@/components/tab-bar";

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

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

  if (!localStorage.getItem(`setup-completed-${user.id}`)) {
    return <AccountSetupPage />;
  }

  return (
    <>
      {activeTab === "home" && (
        <div className="w-full min-h-[100dvh] flex flex-col justify-center items-center bg-surface-primary">
          <p className="typo-body text-content-tertiary">Home</p>
        </div>
      )}
      {activeTab === "activity" && (
        <div className="w-full min-h-[100dvh] flex flex-col justify-center items-center bg-surface-primary">
          <p className="typo-body text-content-tertiary">Activity</p>
        </div>
      )}
      {activeTab === "profile" && <ProfilePage />}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
}

export default function App() {
  return (
    <div className="max-w-3xl mx-auto min-h-[100dvh]">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  );
}
