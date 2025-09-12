import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-lg font-bold', className)}>
      <div className="rounded-md bg-primary p-1.5">
        <Leaf className="h-4 w-4 text-primary-foreground" />
      </div>
      <span className="font-headline text-foreground hidden group-data-[state=expanded]:sm:inline">
        NutriGenius
      </span>
    </div>
  );
}
