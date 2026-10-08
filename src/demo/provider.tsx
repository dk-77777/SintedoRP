"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { initialState, type DemoState } from "./data";

const STORAGE = "conecta-sintedorp-prototype-v1";
type ContextValue = {
  state: DemoState;
  setState: Dispatch<SetStateAction<DemoState>>;
  ready: boolean;
  reset: () => void;
  notice: string;
  notify: (message: string) => void;
};
const DemoContext = createContext<ContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(false);
  const [notice, notify] = useState("");
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE);
      if (stored) {
        const value = JSON.parse(stored) as DemoState;
        if (
          Array.isArray(value.jobs) &&
          Array.isArray(value.applications) &&
          Array.isArray(value.experiences) &&
          value.profile &&
          value.employer
        )
          setState(value);
      }
    } catch {
      /* Storage is optional; this demonstration also works in memory. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        sessionStorage.setItem(STORAGE, JSON.stringify(state));
      } catch {
        /* No server persistence in this prototype. */
      }
    }
  }, [state, ready]);
  function reset() {
    setState(initialState());
    notify("Demonstração reiniciada. Os dados de exemplo foram restaurados.");
  }
  return (
    <DemoContext.Provider
      value={{ state, setState, ready, reset, notice, notify }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("DemoProvider ausente");
  return context;
}
