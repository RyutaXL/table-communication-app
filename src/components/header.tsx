'use client';

import { useLanguageStore, type Language } from '@/lib/language-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const languageLabels = {
  ja: '日本語',
  en: 'English',
  es: 'Español',
};

export function Header() {
  const { currentLanguage, setLanguage } = useLanguageStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 md:h-14 items-center justify-between px-4">
        {/* モバイルではタイトルを短く、バッジを非表示 */}
        <div className="flex items-center space-x-2">
          <h1 className="text-base md:text-lg font-semibold">
            <span className="md:hidden">Table</span>
            <span className="hidden md:inline">Table Communication</span>
          </h1>
          <Badge variant="outline" className="text-xs hidden sm:inline-flex">
            飲食店スタッフ支援
          </Badge>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">言語:</span>
          <ToggleGroup
            type="single"
            value={currentLanguage}
            onValueChange={(value) => {
              if (value) setLanguage(value as Language);
            }}
            className="border rounded-md"
          >
            <ToggleGroupItem value="ja" aria-label="日本語" className="text-xs px-2 py-1 md:px-3 md:py-2">
              <span className="md:hidden">日</span>
              <span className="hidden md:inline">日本語</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="en" aria-label="English" className="text-xs px-2 py-1 md:px-3 md:py-2">
              EN
            </ToggleGroupItem>
            <ToggleGroupItem value="es" aria-label="Español" className="text-xs px-2 py-1 md:px-3 md:py-2">
              ES
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </header>
  );
}
