
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

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your application preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Language</CardTitle>
          <CardDescription>
            Select your preferred language. (This feature is currently disabled)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue="en" className="grid gap-2" disabled>
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
