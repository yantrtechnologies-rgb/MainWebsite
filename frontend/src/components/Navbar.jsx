import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Moon, Sun, ChevronRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, useEnquiry, useAuth } from "@/context/contexts";

const LINKS = [
  { to: "/digital-marketing", label: "Digital Marketing" },
  { to: "/it-products", label: "IT Products" },
  { to: "/it-training", label: "IT Training" },
  { to: "/work", label: "Our Work" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();
  const { openEnquiry } = useEnquiry();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" data-testid="nav-brand-logo" className="flex items-center gap-2 group">
          <img src="/logo.webp" alt="Yantr Technologies logo" className="w-9 h-9 rounded-lg object-cover group-hover:scale-105 transition-transform" />
          <span className="font-display font-extrabold text-xl tracking-tight text-white">YANTR</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.to.replace("/", "")}`}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive ? "text-[#84CC16]" : "text-slate-300 hover:text-white"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            data-testid="theme-toggle"
            onClick={toggle}
            aria-label="Toggle theme"
            className="hidden sm:grid place-items-center w-9 h-9 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {user && (user.role === "admin" || user.role === "staff") && (
            <Button
              data-testid="nav-admin-btn"
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="hidden sm:flex text-slate-300 hover:text-white hover:bg-white/10"
            >
              <LayoutDashboard className="w-4 h-4 mr-1.5" /> Dashboard
            </Button>
          )}
          <Button
            data-testid="nav-enquire-btn"
            onClick={() => openEnquiry("marketing")}
            className="hidden sm:flex bg-[#84CC16] text-[#0B0F19] hover:bg-[#2563EB] hover:text-white font-semibold rounded-full px-5"
          >
            Enquire Now <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <button
            data-testid="mobile-menu-toggle"
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden grid place-items-center w-10 h-10 rounded-md text-white hover:bg-white/10"
            aria-label="Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div data-testid="mobile-menu" className="lg:hidden bg-[#0B0F19] border-t border-white/10 px-4 py-4 space-y-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block px-3 py-3 rounded-md text-slate-200 hover:bg-white/5 font-medium"
            >
              {l.label}
            </NavLink>
          ))}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => { setOpen(false); openEnquiry("marketing"); }}
              className="flex-1 bg-[#84CC16] text-[#0B0F19] font-semibold rounded-full"
            >
              Enquire Now
            </Button>
            <Button variant="outline" onClick={toggle} className="border-white/20 text-white bg-transparent">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
          {user && (user.role === "admin" || user.role === "staff") && (
            <Button onClick={() => { setOpen(false); navigate("/admin"); }} variant="ghost" className="w-full text-white mt-1">
              <LayoutDashboard className="w-4 h-4 mr-1.5" /> Admin Dashboard
            </Button>
          )}
        </div>
      )}
    </header>
  );
};
