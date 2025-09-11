"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from 'next-intl/client';
import { useTransition } from "react";

export default function SettingsPage() {
  const t = useTranslations("SettingsPage");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();


  function onSelectLocale(nextLocale: string) {
    startTransition(() => {
      router.replace(pathname, {locale: nextLocale});
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          {t("settings")}
        </h2>
        <p className="text-muted-foreground">{t("settings_description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("language")}</CardTitle>
          <CardDescription>{t("select_language")}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            defaultValue={locale}
            onValueChange={onSelectLocale}
            className="grid gap-2"
            disabled={isPending}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="en" id="en" />
              <Label htmlFor="en">English</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ms" id="ms" />
              <Label htmlFor="ms">Bahasa Melayu</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
