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
import { useLanguageStore } from "@/hooks/use-language-store";

export default function SettingsPage() {
  const { language, setLanguage } = useLanguageStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-bold tracking-tight">
          Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your application preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Generation Language</CardTitle>
          <CardDescription>
            Select the language for all AI-generated content like recipes and
            meal plans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            defaultValue={language}
            onValueChange={(value: "English" | "Malay") => setLanguage(value)}
            className="grid gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="English" id="en" />
              <Label htmlFor="en">English</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Malay" id="ms" />
              <Label htmlFor="ms">Bahasa Melayu</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
