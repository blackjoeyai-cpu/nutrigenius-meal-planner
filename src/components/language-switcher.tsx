"use client";

import { Check, Languages } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
        >
          <Languages className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">
            {t("language")}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("en")}>
          <Check
            className={cn(
              "mr-2 h-4 w-4",
              language === "en" ? "opacity-100" : "opacity-0",
            )}
          />
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("ms")}>
          <Check
            className={cn(
              "mr-2 h-4 w-4",
              language === "ms" ? "opacity-100" : "opacity-0",
            )}
          />
          Bahasa Melayu
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
