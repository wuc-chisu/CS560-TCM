"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { adminNav } from "./nav";

export function AdminSidebar() {
  const pathname = usePathname();
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  return (
    <nav className="space-y-2 rounded-3xl border border-red-900/10 bg-white/90 p-4 shadow-lg shadow-red-950/5">
      {adminNav.map((group) => {
        const hasActiveItem = group.items.some((item) => item.href === pathname);
        const isOpen = toggled[group.href] ?? hasActiveItem;
        const panelId = `admin-nav-${group.href.split("/").pop()}`;

        return (
          <div key={group.href}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setToggled((prev) => ({ ...prev, [group.href]: !isOpen }))}
              className={[
                "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-lg font-semibold transition",
                hasActiveItem ? "text-red-900" : "text-stone-800 hover:text-red-800",
              ].join(" ")}
            >
              {group.label}
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className={["h-5 w-5 text-amber-700 transition-transform", isOpen ? "rotate-180" : ""].join(" ")}
              >
                <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" />
              </svg>
            </button>
            {isOpen ? (
              <ul id={panelId} className="mt-1 space-y-1 border-l-2 border-amber-200 pl-3 ml-3">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={[
                          "block rounded-xl px-3 py-2 text-sm transition",
                          isActive ? "bg-red-800 text-amber-100" : "text-stone-700 hover:bg-[#fff8ef] hover:text-red-800",
                        ].join(" ")}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
