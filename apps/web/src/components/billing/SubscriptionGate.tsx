"use client";

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({ loading: true, active: false, expired: false });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/rpc/billing/getSubscription", {
          credentials: "include",
        });
        const data: any = await res.json();
        const sub = data?.json ?? data ?? {};
        const expired = sub.expiresAt && new Date(sub.expiresAt).getTime() < Date.now();
        if (!cancelled) {
          setState({
            loading: false,
            active: sub.status === "active" && !expired,
            expired: Boolean(expired),
          });
        }
      } catch {
        if (!cancelled) setState({ loading: false, active: false, expired: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        Checking subscription…
      </div>
    );
  }

  if (state.active) return <>{children}</>;

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="font-bold text-2xl text-gray-900">Subscription required</h1>
        <p className="mt-2 text-gray-600">
          {state.expired
            ? "Your subscription has expired. Renew to keep using DiagnoAI."
            : "Your subscription is not active. Choose a plan to continue."}
        </p>
        <Link
          to="/app/billing"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700"
        >
          View plans & subscribe
        </Link>
      </div>
    </div>
  );
}
