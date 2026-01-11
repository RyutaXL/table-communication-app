'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/lib/use-gemini';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
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

  const [inputText, setInputText] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // サンプルメニューデータ
  const sampleMenus = [
    '寿司セット 2,500円 - 新鮮な魚介を使った握り寿司の盛り合わせ',
    '天ぷら定食 1,800円 - 海老、野菜の天ぷらに御飯と味噌汁付き',
    'ラーメン 950円 - 鶏ガラベースの醤油スープにチャーシュー、メンマ、ネギ',
    'カレーライス 1,200円 - 国産牛肉と野菜のスパイシーなカレー',
    '刺身盛り合わせ 3,200円 - 鮪、鯛、サーモンなどの鮮魚刺身'
  ];

  const loadSampleMenu = () => {
    setInputText(sampleMenus.join('\n\n'));
  };

  const translateMenu = async () => {
    if (!inputText.trim()) return;

    const lines = inputText.split('\n').filter(line => line.trim());
    const newMenuItems: MenuItem[] = [];

    for (const line of lines) {
      if (line.trim()) {
        try {
          // 日本語のメニュー項目を英語に翻訳
          const englishTranslation = await translate({
            text: line,
            targetLanguage: 'en',
            context: 'レストランメニューの項目を英語に翻訳してください。価格は変更せず、そのまま残してください。'
          });

          newMenuItems.push({
            id: Date.now().toString() + Math.random(),
            japanese: line,
            english: englishTranslation,
          });
        } catch (error) {
          console.error('Translation failed:', error);
          // エラーが発生した場合は原文を使用
          newMenuItems.push({
            id: Date.now().toString() + Math.random(),
            japanese: line,
            english: line,
          });
        }
      }
    }

    setMenuItems(newMenuItems);
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

        {/* 入力セクション */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              日本語メニューを入力
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="メニュー項目を入力してください&#10;&#10;例:&#10;寿司セット 2,500円 - 新鮮な魚介を使った握り寿司の盛り合わせ"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px] text-base"
            />

            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={loadSampleMenu}
                variant="outline"
              >
                サンプルメニューを読み込む
              </Button>

              <Button
                onClick={translateMenu}
                disabled={!inputText.trim() || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    翻訳中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    英語に翻訳
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 翻訳結果 */}
        {menuItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  🌍 翻訳結果
                </span>
                <Button
                  onClick={copyAllMenu}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
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
                    <Badge variant="secondary">項目 {index + 1}</Badge>
                    <Button
                      onClick={() => copyToClipboard(`${item.japanese}\n${item.english}`, item.id)}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {copiedItem === item.id ? (
                        <>
                          <Check className="h-4 w-4" />
                          コピー済み
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          コピー
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">🇯🇵 日本語</Badge>
                      </div>
                      <p className="text-sm bg-muted p-3 rounded-md">{item.japanese}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">🇺🇸 英語</Badge>
                      </div>
                      <p className="text-sm bg-muted p-3 rounded-md">{item.english}</p>
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

        {/* 使用方法 */}
        <Card>
          <CardHeader>
            <CardTitle>📖 使用方法</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>1. メニュー入力:</strong> 日本語のメニュー項目を1行ずつ入力
            </div>
            <div>
              <strong>2. 翻訳実行:</strong> 「英語に翻訳」ボタンをクリック
            </div>
            <div>
              <strong>3. 結果確認:</strong> 英語訳が表示されるのでコピーして使用
            </div>
            <div className="bg-muted p-3 rounded-md">
              <strong>💡 ヒント:</strong> 価格情報は自動的に保持されます。
              説明文も自然な英語に翻訳されます。
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
