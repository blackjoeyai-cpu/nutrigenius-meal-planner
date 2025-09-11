import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-lg font-bold text-primary",
        className,
      )}
    >
      <div className="rounded-lg bg-primary/20 p-2">
        <Leaf className="h-5 w-5 text-primary" />
      </div>
      <span className="font-headline text-primary-foreground hidden group-data-[state=expanded]:sm:inline">
        NutriGenius
      </span>
    </div>
  );
}
