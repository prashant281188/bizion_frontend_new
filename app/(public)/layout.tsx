import PublicFooter from "@/components/navigation/public/PublicFooter";
import PublicNavbar from "@/components/navigation/public/PublicNavbar";
import { Metadata } from "next";

import { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hini.in"
  ),
  title: {
    default: "Hini | Premium Hardware Collection",
    template: "%s | Hini",
  },
  description:
    "Hini offers premium door handles, cabinet hardware, aluminium profiles, and architectural hardware. Explore our full range by category and brand.",
  keywords: [
    "door handles",
    "cabinet hardware",
    "aluminium profiles",
    "architectural hardware",
    "hardware fittings",
    "Hini",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Hini",
    title: "Hini | Premium Hardware Collection",
    description:
      "Premium door handles, cabinet hardware, aluminium profiles, and architectural hardware.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hini | Premium Hardware Collection",
    description:
      "Premium door handles, cabinet hardware, aluminium profiles, and architectural hardware.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-neutral-50 w-full">
      <PublicNavbar />
      {children}
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
