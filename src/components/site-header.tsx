import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex flex-col text-right">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            آخر الأخبار
          </span>
          <Link
            href="/"
            className="text-lg font-semibold leading-tight transition-colors hover:text-primary"
            prefetch={false}
          >
            Tunisian News
          </Link>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
