import { useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { LoginPage } from "@/pages/login/login-page";
import { AccountSetupPage } from "@/pages/account-setup/account-setup-page";
import { ProfilePage } from "@/pages/profile/profile-page";
import { CreatePostPage } from "@/pages/create-post/create-post-page";
import { TabBar } from "@/components/tab-bar";

export type Tab = "home" | "activity" | "profile";

export type Page =
  | { name: Tab }
  | { name: "create-post"; files: File[]; defaultDate: string };

function AppContent() {
  const { user, isLoading, header } = useAuth();
  const [page, setPage] = useState<Page>({ name: "profile" });

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center bg-surface-primary">
        <p className="typo-body text-content-secondary">Loading...</p>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  if (!localStorage.getItem(`setup-completed-${user.id}`)) {
    return <AccountSetupPage />;
  }

  if (page.name === "create-post") {
    return (
      <CreatePostPage
        images={page.files}
        defaultDate={page.defaultDate}
        onBack={() => setPage({ name: "profile" })}
        onComplete={() => setPage({ name: "profile" })}
        header={header}
      />
    );
  }

  return (
    <>
      {page.name === "home" && (
        <div className="w-full min-h-full flex flex-col justify-center items-center bg-surface-primary">
          <p className="typo-body text-content-tertiary">Home</p>
        </div>
      )}
      {page.name === "activity" && (
        <div className="w-full min-h-full flex flex-col justify-center items-center bg-surface-primary">
          <p className="typo-body text-content-tertiary">Activity</p>
        </div>
      )}
      {page.name === "profile" && (
        <ProfilePage navigate={setPage} />
      )}
      <TabBar activeTab={page.name} onTabChange={(tab) => setPage({ name: tab })} />

    </>
  );
}

export default function App() {
  return (
    <div className="max-w-xl mx-auto h-full overflow-hidden">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  );
}
