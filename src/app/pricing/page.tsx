'use client'

import React from "react";
import { useSession } from "next-auth/react";
import ViewerTokenPage from "../viewer-tokens/page";
import EarningsPage from "../earnings/page";

export default function page() {
  const { data: session, status } = useSession();

  return (
    <div>
      { session?.user && ((session.user as any).role === "CREATOR") && (<EarningsPage />) }
      { session?.user && ((session.user as any).role === "VIEWER") && (<ViewerTokenPage />) }
    </div>
  );
}
