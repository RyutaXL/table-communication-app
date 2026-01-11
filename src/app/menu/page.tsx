'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/lib/use-gemini';
import { generateMenuHtml } from '@/lib/menu-html-generator';
import { Loader2, Sparkles, Copy, Check, Plus, X } from 'lucide-react';
import { useLanguageStore } from '@/lib/language-store';

interface MenuItem {
  id: string;
  japanese: string;
  english: string;
  description?: string;
}

export default function MenuPage() {
  const { currentLanguage } = useLanguageStore();
  const { translate, isLoading } = useTranslation();

  const [menuInputs, setMenuInputs] = useState<string[]>(['']);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState('Il Giardino');
  const [restaurantTagline, setRestaurantTagline] = useState('Authentic Italian Cuisine • Est. 1995');

  // サンプルメニューデータ（イタリアンレストラン風に変更）
  const sampleMenus = [
    'Margherita Pizza 2,800円 トマトソース、モッツァレラチーズ、バジル',
    'Carbonara Pasta 2,200円 クリームソース、ベーコン、パルメザンチーズ',
    'Osso Buco 4,500円 仔牛すね肉の煮込み、野菜のラグーソース',
    'Tiramisu 800円 マスカルポーネクリーム、コーヒーシロップ',
    'Bruschetta 1,200円 トマト、バジル、ニンニクのトースト'
  ];

  const loadSampleMenu = () => {
    setMenuInputs(sampleMenus);
  };

  const translateMenu = async () => {
    const nonEmptyInputs = menuInputs.filter(input => input.trim());
    if (nonEmptyInputs.length === 0) return;

    try {
      // 全てのメニュー項目を1回のLLMコールで翻訳
      const menuText = nonEmptyInputs.join('\n');
      const batchTranslation = await translate({
        text: menuText,
        targetLanguage: 'en',
        context: `あなたはプロのレストラン翻訳者です。各メニュー項目を英語に翻訳してください。

【翻訳ルール】
1. 各行の形式: 「メニュー名 価格 説明」
2. 価格（例: 2,800円）は変更せずそのまま残す
3. メニュー名と説明文を自然で流暢な英語に翻訳
4. レストランらしい洗練された表現を使用
5. 元の行の構造を厳密に保持

【例】
日本語: Margherita Pizza 2,800円 トマトソース、モッツァレラチーズ、バジル
英語: Margherita Pizza ¥2,800 Fresh tomato sauce, mozzarella cheese, basil

日本語: Carbonara Pasta 2,200円 クリームソース、ベーコン、パルメザンチーズ
英語: Carbonara Pasta ¥2,200 Rich cream sauce, pancetta, parmesan cheese

各行を別々に翻訳し、改行で区切って返してください。説明文は特に美味しそうで魅力的な英語表現にしてください。`
      });

      // 翻訳結果を行ごとに分割
      const translatedLines = batchTranslation.split('\n').filter(line => line.trim());

      const newMenuItems: MenuItem[] = [];

      for (let i = 0; i < nonEmptyInputs.length; i++) {
        const japanese = nonEmptyInputs[i];
        const english = translatedLines[i] || japanese; // 翻訳結果がない場合は原文を使用

        newMenuItems.push({
          id: Date.now().toString() + Math.random(),
          japanese,
          english,
        });
      }

      setMenuItems(newMenuItems);
    } catch (error) {
      console.error('Translation failed:', error);
      // エラーが発生した場合は全て原文を使用
      const newMenuItems: MenuItem[] = nonEmptyInputs.map(line => ({
        id: Date.now().toString() + Math.random(),
        japanese: line,
        english: line,
      }));
      setMenuItems(newMenuItems);
    }
  };

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const updateMenuInput = (index: number, value: string) => {
    const newInputs = [...menuInputs];
    newInputs[index] = value;
    setMenuInputs(newInputs);
  };

  const addMenuInput = () => {
    setMenuInputs([...menuInputs, '']);
  };

  const removeMenuInput = (index: number) => {
    if (menuInputs.length > 1) {
      const newInputs = menuInputs.filter((_, i) => i !== index);
      setMenuInputs(newInputs);
    }
  };

  const copyAllMenu = async () => {
    const allMenuText = menuItems.map(item =>
      `${item.japanese}\n${item.english}`
    ).join('\n\n');

    await copyToClipboard(allMenuText, 'all');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* ページヘッダー */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">
            🍽️ メニュー英語化
          </h1>
          <p className="text-muted-foreground">
            AIを使ってレストランメニューを自動で英語に翻訳
          </p>
        </div>

        {/* レストラン情報設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">🏪 レストラン情報設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">レストラン名</label>
                <Input
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="Il Giardino"
                  className="h-12 md:h-10 text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">キャッチコピー</label>
                <Input
                  value={restaurantTagline}
                  onChange={(e) => setRestaurantTagline(e.target.value)}
                  placeholder="Authentic Italian Cuisine • Est. 1995"
                  className="h-12 md:h-10 text-base"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 入力セクション */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Sparkles className="h-5 w-5" />
              日本語メニューを入力
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <strong>入力形式:</strong> メニュー名 価格 説明（説明は省略可）
                <div className="mt-2 text-xs">
                  例: Margherita Pizza 2,800円 トマトソース、モッツァレラチーズ、バジル
                </div>
              </div>

              {menuInputs.map((input, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Input
                      placeholder={
                        index === 0
                          ? "メニュー名 価格 説明 の形式で入力（説明は省略可）\n例: Margherita Pizza 2,800円 トマトソース、モッツァレラチーズ、バジル"
                          : "メニュー項目を入力..."
                      }
                      value={input}
                      onChange={(e) => updateMenuInput(index, e.target.value)}
                      className="text-base"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeMenuInput(index)}
                    disabled={menuInputs.length === 1}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addMenuInput}
                className="w-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                項目を追加
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={loadSampleMenu}
                variant="outline"
                className="h-12 text-base"
              >
                サンプルメニューを読み込む
              </Button>

              <Button
                onClick={translateMenu}
                disabled={!menuInputs.some(input => input.trim()) || isLoading}
                className="flex items-center justify-center gap-2 h-12 text-base flex-1 sm:flex-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    翻訳中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    英語に翻訳
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 表示モード切り替え */}
        {menuItems.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Button
              onClick={() => {}}
              variant="default"
              className="h-12 text-base flex-1"
            >
              📝 翻訳結果
            </Button>
            <Button
              onClick={() => {
                // メニュー表を別タブで開く
                const menuHtml = generateMenuHtml(menuItems, restaurantName, restaurantTagline);
                const blob = new Blob([menuHtml], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
              }}
              variant="outline"
              className="h-12 text-base flex-1"
            >
              🍽️ メニュー表を開く
            </Button>
          </div>
        )}

        {/* 翻訳結果 */}
        {menuItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg md:text-xl">
                <span className="flex items-center gap-2">
                  🌍 翻訳結果
                </span>
                <Button
                  onClick={copyAllMenu}
                  variant="outline"
                  className="h-10 px-4 flex items-center gap-2 text-sm"
                >
                  {copiedItem === 'all' ? (
                    <>
                      <Check className="h-4 w-4" />
                      コピー完了
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      全てコピー
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {menuItems.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">項目 {index + 1}</Badge>
                    <Button
                      onClick={() => copyToClipboard(`${item.japanese}\n${item.english}`, item.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 flex items-center gap-2 text-sm"
                    >
                      {copiedItem === item.id ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span className="hidden sm:inline">コピー済み</span>
                          <span className="sm:hidden">済</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span className="hidden sm:inline">コピー</span>
                          <span className="sm:hidden">コ</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">🇯🇵 日本語</Badge>
                      </div>
                      <p className="text-sm bg-muted p-3 rounded-md leading-relaxed">{item.japanese}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">🇺🇸 英語</Badge>
                      </div>
                      <p className="text-sm bg-muted p-3 rounded-md leading-relaxed">{item.english}</p>
                    </div>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="text-center text-sm text-muted-foreground">
                💡 各項目をコピーしてメニュー作成に活用してください
              </div>
            </CardContent>
          </Card>
        )}

        {/* メニュー表は別タブで開きます */}

        {/* 使用方法 */}
        <Card>
          <CardHeader>
            <CardTitle>📖 使用方法</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>1. レストラン情報を設定:</strong><br/>
              レストラン名とキャッチコピーを入力してください。
            </div>
            <div>
              <strong>2. メニュー項目を入力:</strong><br/>
              「メニュー名 価格 説明」の形式で入力してください。
            </div>
            <div>
              <strong>🍕 入力例:</strong><br/>
              Margherita Pizza 2,800円 トマトソース、モッツァレラチーズ、バジル<br/>
              Carbonara Pasta 2,200円 クリームソース、ベーコン、パルメザンチーズ
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
