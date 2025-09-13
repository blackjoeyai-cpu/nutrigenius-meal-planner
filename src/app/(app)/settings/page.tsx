'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguageStore } from '@/hooks/use-language-store';

export default function SettingsPage() {
  const { language, setLanguage } = useLanguageStore();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold font-headline">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your application settings.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>AI Settings</CardTitle>
          <CardDescription>
            Configure the behavior of the AI generation features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-sm">
            <Label htmlFor="ai-language">AI Output Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="ai-language">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Malay">Bahasa Melayu</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose the language for all generated recipes and meal plans.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
