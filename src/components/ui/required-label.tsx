import type { ReactNode } from "react";

export function RequiredLabel({ children, required = true }: { children: ReactNode; required?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-ink">
      {required ? <span className="text-red-500 dark:text-red-400">*</span> : null}
      <span>{children}</span>
    </span>
  );
}
