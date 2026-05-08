import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_MS = 2 * 60 * 1000;  // warn 2 min before

export function useAutoLogout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastIdRef = useRef<string | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (toastIdRef.current) toast.dismiss(toastIdRef.current);
  }, []);

  const resetTimers = useCallback(() => {
    if (!user) return;
    clearTimers();

    warningRef.current = setTimeout(() => {
      toastIdRef.current = toast(
        "You will be logged out in 2 minutes due to inactivity.",
        { duration: 120000, icon: "⚠️" }
      ) as string;
    }, TIMEOUT_MS - WARNING_MS);

    timeoutRef.current = setTimeout(async () => {
      clearTimers();
      await signOut();
      toast.error("You were logged out due to inactivity.");
      navigate("/login");
    }, TIMEOUT_MS);
  }, [user, signOut, navigate, clearTimers]);

  useEffect(() => {
    if (!user) return;

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    const handler = () => resetTimers();

    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetTimers();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      clearTimers();
    };
  }, [user, resetTimers, clearTimers]);
}
