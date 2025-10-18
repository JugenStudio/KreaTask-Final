
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { LanguageProvider } from "@/providers/language-provider";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePathname } from 'next/navigation';
import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import type { User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/bottom-nav";
import { TaskDataProvider, useTaskData } from "@/hooks/use-task-data.tsx";
import { useSpotlightEffect } from "@/hooks/use-spotlight";
// import { FirebaseClientProvider } from "@/firebase/client-provider"; // Temporarily disabled

// 1. Create the context
const UserContext = createContext<{ currentUser: User | null }>({
  currentUser: null,
});

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentUserData, isLoading: isTaskDataLoading } = useTaskData();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  useSpotlightEffect();
  
  const currentUser = currentUserData;


  if (pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
      return <>{children}</>
  }
  
  // The main loading state now only depends on the user loading process
  const isLoading = isTaskDataLoading;

  if (isLoading) {
    return (
        <div className="flex min-h-screen w-full bg-background">
           {!isMobile && (
             <div className="w-64 flex-col border-r border-border bg-card p-4">
                <Skeleton className="h-10 w-3/4 mb-12" />
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full rounded-full" />
                  <Skeleton className="h-10 w-full rounded-full" />
                  <Skeleton className="h-10 w-full rounded-full" />
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
             </div>
           )}
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-40 flex h-16 w-full items-center gap-4 border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-lg">
                <div className="flex-1">
                    <Skeleton className="h-8 w-48" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
            </header>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              <Skeleton className="h-[500px] w-full" />
            </main>
          </div>
        </div>
    )
  }

  return (
      <UserContext.Provider value={{ currentUser }}>
        <div className={cn("min-h-screen w-full bg-background")}>
          <div className="flex min-h-screen w-full">
            {!isMobile && currentUser && <AppSidebar user={currentUser} />}
            <div className="flex flex-1 flex-col bg-transparent">
              {currentUser && <Header />}
              <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-6">
                {children}
              </main>
            </div>
          </div>
          {isMobile && currentUser && <BottomNav />}
        </div>
      </UserContext.Provider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
    return <LanguageProvider>{children}</LanguageProvider>;
  }
  
  return (
    // <FirebaseClientProvider> // Temporarily disabled
      <LanguageProvider>
        <TaskDataProvider>
          <AppLayoutContent>{children}</AppLayoutContent>
        </TaskDataProvider>
      </LanguageProvider>
    // </FirebaseClientProvider> // Temporarily disabled
  );
}

// 2. Create a custom hook to use the context
export const useCurrentUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within a AppLayout');
  }
  return context;
};
