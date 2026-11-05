import React from "react";
import { COMPANY } from "@/data/siteData";

const MSG = "Hi XOLNET Technologies, I'd like to know more about your services.";

export const WhatsAppButton = () => (
  <a
    href={`https://wa.me/91${COMPANY.phone}?text=${encodeURIComponent(MSG)}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with us on WhatsApp"
    data-testid="whatsapp-float-btn"
    className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] text-white shadow-xl shadow-black/20 pl-3.5 pr-3.5 sm:pr-5 h-14 hover:scale-105 active:scale-95 transition-transform"
  >
    <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
    <svg viewBox="0 0 32 32" className="w-7 h-7 relative" fill="currentColor" aria-hidden>
      <path d="M16.04 3C9.4 3 4 8.38 4 15c0 2.12.56 4.2 1.62 6.02L4 29l8.2-1.6A12.06 12.06 0 0 0 16.04 27C22.66 27 28 21.62 28 15S22.66 3 16.04 3Zm0 21.9c-1.8 0-3.56-.48-5.1-1.4l-.36-.22-4.86.95.98-4.72-.24-.38A9.84 9.84 0 0 1 6.2 15c0-5.42 4.42-9.84 9.84-9.84 5.4 0 9.78 4.42 9.78 9.84 0 5.42-4.38 9.9-9.78 9.9Zm5.4-7.36c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.47 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.48.71.31 1.27.5 1.7.63.71.23 1.36.2 1.88.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
    </svg>
    <span className="hidden sm:inline relative font-semibold text-sm">Chat with us</span>
  </a>
);
