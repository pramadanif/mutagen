import type { ReactNode } from "react";

interface InfoPanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  variant?: "beige" | "light";
  className?: string;
}

export function InfoPanel({
  title,
  subtitle,
  children,
  variant = "beige",
  className = "",
}: InfoPanelProps) {
  const bg = variant === "beige" ? "bg-[#EAE4D5]" : "bg-[#F5F2EB]";
  return (
    <div
      className={`${bg} border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] ${className}`}
    >
      <div className="p-4 border-b-4 border-black">
        <h2 className="font-header text-sm md:text-base">{title}</h2>
        {subtitle && <p className="text-sm font-bold mt-1 opacity-80">{subtitle}</p>}
      </div>
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}

export function InnerCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border-4 border-black p-4 shadow-[4px_4px_0_#000] ${className}`}>
      {children}
    </div>
  );
}
