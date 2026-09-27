import { twMerge } from "tailwind-merge";
import { useEffect, useState, useRef } from "react";
import { WifiIcon, WifiOffIcon, XIcon } from "lucide-react";
import type { Component } from "@/utils/types";

function IsOffline(): Component {
  const [isVisible, setIsVisible] = useState<boolean>(false),
    [isOffline, setIsOffline] = useState<boolean>(false),
    timerRef = useRef<ReturnType<typeof setTimeout> | null>(null),
    handleOnline = (): void => {
      setIsOffline(false);
      setIsVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setIsVisible(false), 5000);
    },
    handleOffline = (): void => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsOffline(true);
      setIsVisible(true);
    };

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    addEventListener("online", handleOnline);
    addEventListener("offline", handleOffline);

    return () => {
      removeEventListener("online", handleOnline);
      removeEventListener("offline", handleOffline);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!isVisible) return <></>;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end text-white p-4">
      <div
        className={twMerge(
          isOffline ? "bg-red-500" : "bg-green-500",
          "flex justify-center items-center p-4 rounded-xl gap-x-4"
        )}
      >
        <div className="flex items-center space-x-2">
          {isOffline ? (
            <>
              <WifiOffIcon className="w-5 h-5" />
              <span className="text-sm font-medium">
                Estás desconectado
              </span>
            </>
          ) : (
            <>
              <WifiIcon className="w-5 h-5" />
              <span className="text-sm font-medium">
                ¡Recuperaste la conexión!
              </span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-red-200 transition-colors"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default IsOffline;
