'use client';

import { useLanguageStore, type Language } from '@/lib/language-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, ChefHat } from 'lucide-react';

const languageLabels = {
  ja: '日本語',
  en: 'English',
  es: 'Español',
};

const navigationItems = [
  {
    href: '/',
    label: 'クイック回答',
    icon: MessageSquare,
    description: 'すぐに使える定型文'
  },
  {
    href: '/menu',
    label: 'メニュー英語化',
    icon: ChefHat,
    description: 'AIでメニューを英語化'
  }
];

export function Header() {
  const { currentLanguage, setLanguage } = useLanguageStore();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4">
        {/* タイトル部分 */}
        <div className="flex h-16 md:h-14 items-center justify-between">
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

        {/* ナビゲーションタブ */}
        <nav className="pb-4">
          <div className="flex space-x-1 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                    ${isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.label.split('')[0]}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
