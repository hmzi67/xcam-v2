'use client'

import React from "react";
import { useSession } from "next-auth/react";
import EarningsPage from "@/components/pricing/earning-page";
import ViewerTokenPage from "@/components/pricing/viewer-token-page";

export default function page() {
  const { data: session, status } = useSession();

  return (
    <div>
      { session?.user && ((session.user as any).role === "CREATOR") && (<EarningsPage/>) }
      { session?.user && ((session.user as any).role === "VIEWER")  && (<ViewerTokenPage />) }
      { session?.user && ((session.user as any).role === "ADMIN") && (<ViewerTokenPage />) }
    </div>
  );
}
