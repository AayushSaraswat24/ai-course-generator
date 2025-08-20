"use client";

import clsx from "clsx";

export default function Bubble({
  align,
  children,
}: {
  align: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <div className={clsx("w-full flex", align === "right" ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-3xl w-full rounded-2xl border shadow-sm p-4",
          align === "right"
            ? "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800"
            : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
        )}
      >
        {children}
      </div>
    </div>
  );
}
