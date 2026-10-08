"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { LiveState } from "./types";
type Result = { message: string; id?: string };
export type NoticeTone = "success" | "error" | "info";
type Context = {
  state: LiveState | null;
  ready: boolean;
  notice: string;
  noticeTone: NoticeTone;
  connectionError: string;
  notify: (s: string, tone?: NoticeTone) => void;
  refresh: () => Promise<LiveState | null>;
  act: (
    input: Record<string, unknown>,
    onError?: (message: string) => void,
  ) => Promise<Result | null>;
  busy: boolean;
};
const LiveContext = createContext<Context | null>(null);
export function LiveProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LiveState | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState<NoticeTone>("info");
  const [connectionError, setConnectionError] = useState("");
  const notify = (message: string, tone: NoticeTone = "info") => {
    setNotice(message);
    setNoticeTone(tone);
  };
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/state", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setState(data);
      setConnectionError("");
      return data as LiveState;
    } catch (error) {
      setConnectionError(
        error instanceof Error ? error.message : "Falha de conexão.",
      );
      return null;
    } finally {
      setReady(true);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => {
      if (!document.hidden) void refresh();
    }, 30000);
    return () => clearInterval(timer);
  }, [refresh]);
  const act = async (
    input: Record<string, unknown>,
    onError?: (message: string) => void,
  ) => {
    if (busy) return null;
    setBusy(true);
    try {
      const response = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      notify(data.message, "success");
      await refresh();
      return data as Result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha de conexão.";
      onError?.(message);
      notify(message, "error");
      return null;
    } finally {
      setBusy(false);
    }
  };
  return (
    <LiveContext.Provider
      value={{
        state,
        ready,
        notice,
        noticeTone,
        connectionError,
        notify,
        refresh,
        act,
        busy,
      }}
    >
      {children}
    </LiveContext.Provider>
  );
}
export function useLive() {
  const value = useContext(LiveContext);
  if (!value) throw new Error("LiveProvider ausente");
  return value;
}
