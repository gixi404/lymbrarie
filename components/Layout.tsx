import AllPopups from "./AllPopups";
import Background from "./Background";
import FooterIndex from "./FooterIndex";
import HeaderIndex from "./HeaderIndex";
import IsOffline from "./alerts/IsOfflineAlert";
import JustClient from "./JustClient";
import SuggestionsBtn from "./btns/SuggestionsBtn";
import { PAGES } from "@/utils/consts";
import { Toaster } from "react-hot-toast";
import { twJoin } from "tailwind-merge";
import { usePathname } from "next/navigation";
import "@fontsource/poppins";
import { useRouter } from "next/router";
import { useEffect, type PropsWithChildren } from "react";
import { useUser, withUser, type User } from "next-firebase-auth";
import type { Component } from "@/utils/types";
import { runResumableNotesMigration } from "@/utils/userEncryption";

export default withUser()(Layout);

function Layout({ children }: PropsWithChildren): Component {
  const user: User = useUser();
  const path: string = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (user?.id) {
      runResumableNotesMigration(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    const handleRouteChangeError = (err: { cancelled?: boolean }) => {
      if (err?.cancelled) {
        // Silently swallow route cancellation when user navigates quickly
      }
    };
    router?.events?.on("routeChangeError", handleRouteChangeError);
    return () => {
      router?.events?.off("routeChangeError", handleRouteChangeError);
    };
  }, [router]);

  return (
    <JustClient>
      <div
        className={twJoin(
          !path?.includes(PAGES.LOGIN) && "md:pt-6",
          "relative overflow-y-hidden overflow-x-hidden min-h-screen w-full bg-slate-950 font-mono flex flex-col justify-start items-center"
        )}
      >
        <Background />
        <IsOffline />
        <Toaster
          reverseOrder={false}
          position="top-right"
          toastOptions={{
            style: {
              background: "#090d16",
              color: "#f8fafc",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              padding: "10px 18px",
              borderRadius: "12px",
              fontSize: "14px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
            },
            success: {
              iconTheme: {
                primary: "#a855f7",
                secondary: "#090d16",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#090d16",
              },
            },
            loading: {
              iconTheme: {
                primary: "#a855f7",
                secondary: "#090d16",
              },
            },
          }}
        />
        <div className="relative z-10 w-full flex flex-col justify-start items-center flex-1">
          <HeaderIndex />
          {children}
          {path != PAGES.LOGIN && <FooterIndex />}
        </div>
        {!path?.includes(PAGES.LOGIN) && <SuggestionsBtn />}
        <AllPopups UID={user?.id as string} />
      </div>
    </JustClient>
  );
}
