import React from "react";
import { Link } from "react-router-dom";
import { PageHero } from "@/components/PageHero";

// Shown for unknown URLs. The server answers these with a 404 status (see public/.htaccess)
// and Seo.jsx marks them noindex.
export default function NotFound() {
  return (
    <PageHero eyebrow="/// 404" title="Page not found." desc="This page does not exist or has moved.">
      <Link to="/" className="inline-flex mt-8 items-center rounded-full bg-[#84CC16] text-[#0B0F19] hover:bg-white font-semibold px-7 h-12">
        Go to the homepage
      </Link>
    </PageHero>
  );
}
