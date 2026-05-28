"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/data", label: "Data" },
  { href: "/forecasts", label: "Forecasts" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/ai", label: "AI Copilot" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-6">
      <Link href="/" className="flex items-center gap-2 font-semibold text-teal-700">
        <TrendingUp className="w-5 h-5" />
        DClaw Forecast
      </Link>
      <div className="flex gap-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              pathname === l.href
                ? "bg-teal-50 text-teal-700"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
