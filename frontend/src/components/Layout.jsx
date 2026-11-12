import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import api from "@/lib/api";

export const Layout = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = window.setTimeout(() => {
      api.post("/analytics/page-view", { path: pathname.toLowerCase().replace(/\/$/, "") || "/" }).catch(() => {});
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};
