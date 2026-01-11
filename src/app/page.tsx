'use client';

import { useMemo, useState } from 'react';
import { Header } from '@/components/header';
import { QuickResponseCard } from '@/components/quick-response-card';
import { demoResponses, type QuickResponse } from '@/lib/demo-data';
import { useLanguageStore } from '@/lib/language-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MessageSquare, Users, CreditCard, ChefHat } from 'lucide-react';

const categoryIcons = {
  billing: CreditCard,
  allergy: Users,
  'how-to-eat': ChefHat,
  other: MessageSquare,
};

export default function Home() {
  const { currentLanguage } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredResponses = useMemo(() => {
    let filtered = demoResponses;

    // カテゴリーフィルター
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(response => response.category === selectedCategory);
    }

    // 検索フィルター
    if (searchQuery.trim()) {
      filtered = filtered.filter(response =>
        response.title_jp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        response.content_translations[currentLanguage].toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory, currentLanguage]);

  const categoryStats = useMemo(() => {
    const stats = {
      billing: demoResponses.filter(r => r.category === 'billing').length,
      allergy: demoResponses.filter(r => r.category === 'allergy').length,
      'how-to-eat': demoResponses.filter(r => r.category === 'how-to-eat').length,
      other: demoResponses.filter(r => r.category === 'other').length,
    };
    return stats;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* 検索バー - モバイルでは高さを大きくしてタッチしやすく */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="キーワードで検索（例: アレルギー, 支払い, etc.）"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 md:h-10 text-base md:text-sm mobile-input"
          />
        </div>

        {/* カテゴリータブ - モバイルではスクロール可能に */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <div className="overflow-x-auto pb-2 mobile-scroll">
            <TabsList className="inline-flex w-max min-w-full h-auto p-1 bg-muted gap-1">
              <TabsTrigger value="all" className="flex items-center gap-1 md:gap-2 whitespace-nowrap px-3 py-2 text-xs md:text-sm bg-background hover:bg-background/80">
                <span className="font-medium">すべて</span>
                <Badge variant="secondary" className="text-xs">
                  {demoResponses.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="other" className="flex items-center gap-1 md:gap-2 whitespace-nowrap px-3 py-2 text-xs md:text-sm">
                <MessageSquare className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                <span className="hidden xs:inline font-medium">その他</span>
                <span className="xs:hidden font-medium">他</span>
                <Badge variant="secondary" className="text-xs ml-1">
                  {categoryStats.other}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-1 md:gap-2 whitespace-nowrap px-3 py-2 text-xs md:text-sm">
                <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                <span className="hidden xs:inline font-medium">会計</span>
                <span className="xs:hidden font-medium">会</span>
                <Badge variant="secondary" className="text-xs ml-1">
                  {categoryStats.billing}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="allergy" className="flex items-center gap-1 md:gap-2 whitespace-nowrap px-3 py-2 text-xs md:text-sm">
                <Users className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                <span className="hidden sm:inline font-medium">アレルギー</span>
                <span className="sm:hidden font-medium">アレ</span>
                <Badge variant="secondary" className="text-xs ml-1">
                  {categoryStats.allergy}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="how-to-eat" className="flex items-center gap-1 md:gap-2 whitespace-nowrap px-3 py-2 text-xs md:text-sm">
                <ChefHat className="h-3 w-3 md:h-4 md:w-4 text-orange-600" />
                <span className="hidden md:inline font-medium">食べ方</span>
                <span className="md:hidden font-medium">食</span>
                <Badge variant="secondary" className="text-xs ml-1">
                  {categoryStats['how-to-eat']}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={selectedCategory} className="mt-6">
            {filteredResponses.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  検索条件に一致する回答が見つかりません
                </p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredResponses.map((response) => (
                  <QuickResponseCard key={response.id} response={response} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* 説明文 - モバイルでは簡潔に */}
        <div className="bg-muted rounded-lg p-3 md:p-4 text-center">
          <p className="text-xs md:text-sm text-muted-foreground">
            💡 <span className="md:hidden">タップでゲストに見せる</span>
            <span className="hidden md:inline">タップしてゲストに見せる画面が開きます。言語は自動で切り替わります。</span>
          </p>
        </div>
      </main>
    </div>
  );
}
