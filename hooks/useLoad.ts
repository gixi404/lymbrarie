import { useState } from "react";

export default function useLoad(initVal = false): Load {
  const [isLoading, setIsLoading] = useState<boolean>(initVal);
  const startLoading: Void = () => setIsLoading(true);
  const finishLoading: Void = () => setIsLoading(false);
  return { isLoading, startLoading, finishLoading };
}

interface Load {
  isLoading: boolean;
  startLoading: Void;
  finishLoading: Void;
}

type Void = () => void;
