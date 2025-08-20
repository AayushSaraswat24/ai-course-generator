"use client";

import clsx from "clsx";

export default function Toast({
  open,
  kind,
  message,
}: {
  open: boolean;
  kind: "success" | "error";
  message: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[60]">
      <div
        className={clsx(
          "rounded-lg px-4 py-2 shadow-md text-white text-sm",
          kind === "success" ? "bg-green-600" : "bg-red-600"
        )}
      >
        {message}
      </div>
    </div>
  );
}
