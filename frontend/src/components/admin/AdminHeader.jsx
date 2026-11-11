import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/contexts";

export const AdminHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="border-b border-white/10 bg-[#0B0F19]/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/xolnet.png" alt="XOLNET Technologies logo" className="w-9 h-9 rounded-lg object-contain" />
          <div>
            <p className="font-display font-bold leading-none">XOLNET CRM</p>
            <p className="text-xs text-slate-400">Lead Management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400 hidden sm:block">{user.name}</span>
          <Button data-testid="admin-content-link" size="sm" onClick={() => navigate("/admin/content")} className="bg-[#84CC16] text-[#0B0F19] hover:bg-white font-semibold rounded-full">
            Edit Website Content
          </Button>
          <Button data-testid="admin-logout" variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); }} className="text-slate-300 hover:text-white hover:bg-white/10">
            <LogOut className="w-4 h-4 mr-1.5" /> Logout
          </Button>
        </div>
      </div>
    </header>
  );
};
