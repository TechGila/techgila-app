import React, { createContext, useContext, useState, useCallback } from "react";

type AutoRefreshContextType = {
  enabled: boolean;
  intervalSeconds: number;
  setEnabled: (v: boolean) => void;
  setIntervalSeconds: (n: number) => void;
};

const AutoRefreshContext = createContext<AutoRefreshContextType | undefined>(
  undefined
);

export function AutoRefreshProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enabled, setEnabled] = useState(true);
  const [intervalSeconds, setIntervalSeconds] = useState(5);

  return (
    <AutoRefreshContext.Provider
      value={{ enabled, intervalSeconds, setEnabled, setIntervalSeconds }}
    >
      {children}
    </AutoRefreshContext.Provider>
  );
}

export function useAutoRefresh() {
  const ctx = useContext(AutoRefreshContext);
  if (!ctx)
    throw new Error("useAutoRefresh must be used within AutoRefreshProvider");
  return ctx;
}
