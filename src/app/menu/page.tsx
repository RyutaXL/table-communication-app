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

const MenuItemDisplay = ({ item }: { item: MenuItem }) => {
  // 英語のテキストから価格を抽出
  const priceMatch = item.english.match(/([¥$]?\d{1,3}(?:,\d{3})*)/);
  const price = priceMatch ? priceMatch[0] : '';

  // 価格を除いた説明部分
  const description = item.english.replace(price, '').replace(/^[¥$]\d{1,3}(?:,\d{3})*\s*/, '').trim();

  return (
    <div className="flex justify-between items-start py-2 border-b border-amber-100 last:border-b-0">
      <div className="flex-1">
        <div className="font-serif text-lg font-semibold text-amber-900 leading-tight">
          {description.split(' ')[0] || 'Menu Item'}
        </div>
        {description.split(' ').slice(1).length > 0 && (
          <div className="text-sm text-amber-700 italic mt-1 leading-relaxed">
            {description.split(' ').slice(1).join(' ')}
          </div>
        )}
      </div>
      <div className="text-lg font-serif font-bold text-amber-900 ml-4">
        {price}
      </div>
    </div>
  );
};

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
  const [showItalianMenu, setShowItalianMenu] = useState(false);

  // サンプルメニューデータ（イタリアンレストラン風に変更）
  const sampleMenus = [
    'Margherita Pizza 2,800円 トマトソース、モッツァレラチーズ、バジル',
    'Carbonara Pasta 2,200円 クリームソース、ベーコン、パルメザンチーズ',
    'Osso Buco 4,500円 仔牛すね肉の煮込み、野菜のラグーソース',
    'Tiramisu 800円 マスカルポーネクリーム、コーヒーシロップ',
    'Bruschetta 1,200円 トマト、バジル、ニンニクのトースト'
  ];

  const loadSampleMenu = () => {
    setInputText(sampleMenus.join('\n\n'));
  };

  const translateMenu = async () => {
    if (!inputText.trim()) return;

    const lines = inputText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return;

    try {
      // 全てのメニュー項目を1回のLLMコールで翻訳
      const menuText = lines.join('\n');
      const batchTranslation = await translate({
        text: menuText,
        targetLanguage: 'en',
        context: `レストランメニューの項目を英語に翻訳してください。各行の形式は「メニュー名 価格 説明」です。価格はそのまま残し、メニュー名と説明を自然な英語に翻訳してください。元の行の構造を保持してください。

例:
日本語: Margherita Pizza 2,800円 トマトソース、モッツァレラチーズ、バジル
英語: Margherita Pizza ¥2,800 Fresh tomato sauce, mozzarella cheese, basil

各行を別々に翻訳し、改行で区切って返してください。`
      });

      // 翻訳結果を行ごとに分割
      const translatedLines = batchTranslation.split('\n').filter(line => line.trim());

      const newMenuItems: MenuItem[] = [];

      for (let i = 0; i < lines.length; i++) {
        const japanese = lines[i];
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
      const newMenuItems: MenuItem[] = lines.map(line => ({
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
              placeholder="メニュー項目を「メニュー名 価格 説明」の形式で入力してください&#10;&#10;例:&#10;Margherita Pizza 2,800円 トマトソース、モッツァレラチーズ、バジル&#10;Carbonara Pasta 2,200円 クリームソース、ベーコン、パルメザンチーズ&#10;Osso Buco 4,500円 仔牛すね肉の煮込み、野菜のラグーソース"
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

        {/* 表示モード切り替え */}
        {menuItems.length > 0 && (
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setShowItalianMenu(false)}
              variant={!showItalianMenu ? "default" : "outline"}
              size="sm"
            >
              📝 翻訳結果
            </Button>
            <Button
              onClick={() => setShowItalianMenu(true)}
              variant={showItalianMenu ? "default" : "outline"}
              size="sm"
            >
              🍽️ メニュー表
            </Button>
          </div>
        )}

        {/* 翻訳結果 */}
        {menuItems.length > 0 && !showItalianMenu && (
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

        {/* 高級イタリアンレストラン風メニュー表 */}
        {menuItems.length > 0 && showItalianMenu && (
          <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-8 h-0.5 bg-amber-600"></div>
                <span className="text-2xl font-serif font-bold text-amber-900">🍽️</span>
                <div className="w-8 h-0.5 bg-amber-600"></div>
              </div>
              <CardTitle className="text-3xl font-serif font-bold text-amber-900 mb-1">
                Il Giardino
              </CardTitle>
              <p className="text-sm text-amber-700 font-medium">
                Authentic Italian Cuisine • Est. 1995
              </p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {/* メニューセクション分け */}
              <div className="space-y-8">
                {/* Antipasti */}
                {menuItems.some(item => item.english.toLowerCase().includes('bruschetta') || item.english.toLowerCase().includes('antipasti')) && (
                  <div>
                    <h3 className="text-xl font-serif font-bold text-amber-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-0.5 bg-amber-600"></span>
                      Antipasti
                      <span className="text-sm font-normal text-amber-700">(Appetizers)</span>
                    </h3>
                    <div className="space-y-3">
                      {menuItems.filter(item =>
                        item.english.toLowerCase().includes('bruschetta') ||
                        item.english.toLowerCase().includes('antipasti') ||
                        item.english.toLowerCase().includes('appetizer')
                      ).map((item, index) => (
                        <MenuItemDisplay key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Primi Piatti */}
                {menuItems.some(item => item.english.toLowerCase().includes('pasta') || item.english.toLowerCase().includes('risotto')) && (
                  <div>
                    <h3 className="text-xl font-serif font-bold text-amber-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-0.5 bg-amber-600"></span>
                      Primi Piatti
                      <span className="text-sm font-normal text-amber-700">(First Courses)</span>
                    </h3>
                    <div className="space-y-3">
                      {menuItems.filter(item =>
                        item.english.toLowerCase().includes('pasta') ||
                        item.english.toLowerCase().includes('risotto') ||
                        item.english.toLowerCase().includes('carbonara')
                      ).map((item, index) => (
                        <MenuItemDisplay key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Pizza */}
                {menuItems.some(item => item.english.toLowerCase().includes('pizza')) && (
                  <div>
                    <h3 className="text-xl font-serif font-bold text-amber-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-0.5 bg-amber-600"></span>
                      Pizza
                      <span className="text-sm font-normal text-amber-700">(Wood-fired Pizzas)</span>
                    </h3>
                    <div className="space-y-3">
                      {menuItems.filter(item =>
                        item.english.toLowerCase().includes('pizza')
                      ).map((item, index) => (
                        <MenuItemDisplay key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Secondi Piatti */}
                {menuItems.some(item => item.english.toLowerCase().includes('osso buco') || item.english.toLowerCase().includes('meat') || item.english.toLowerCase().includes('fish')) && (
                  <div>
                    <h3 className="text-xl font-serif font-bold text-amber-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-0.5 bg-amber-600"></span>
                      Secondi Piatti
                      <span className="text-sm font-normal text-amber-700">(Main Courses)</span>
                    </h3>
                    <div className="space-y-3">
                      {menuItems.filter(item =>
                        item.english.toLowerCase().includes('osso buco') ||
                        item.english.toLowerCase().includes('meat') ||
                        item.english.toLowerCase().includes('fish') ||
                        item.english.toLowerCase().includes('osso')
                      ).map((item, index) => (
                        <MenuItemDisplay key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Dolci */}
                {menuItems.some(item => item.english.toLowerCase().includes('tiramisu') || item.english.toLowerCase().includes('dessert') || item.english.toLowerCase().includes('dolci')) && (
                  <div>
                    <h3 className="text-xl font-serif font-bold text-amber-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-0.5 bg-amber-600"></span>
                      Dolci
                      <span className="text-sm font-normal text-amber-700">(Desserts)</span>
                    </h3>
                    <div className="space-y-3">
                      {menuItems.filter(item =>
                        item.english.toLowerCase().includes('tiramisu') ||
                        item.english.toLowerCase().includes('dessert') ||
                        item.english.toLowerCase().includes('dolci')
                      ).map((item, index) => (
                        <MenuItemDisplay key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 未分類の項目 */}
                {(() => {
                  const categorizedItems = menuItems.filter(item =>
                    item.english.toLowerCase().includes('bruschetta') ||
                    item.english.toLowerCase().includes('pasta') ||
                    item.english.toLowerCase().includes('risotto') ||
                    item.english.toLowerCase().includes('carbonara') ||
                    item.english.toLowerCase().includes('pizza') ||
                    item.english.toLowerCase().includes('osso buco') ||
                    item.english.toLowerCase().includes('tiramisu')
                  );
                  const uncategorizedItems = menuItems.filter(item => !categorizedItems.includes(item));

                  return uncategorizedItems.length > 0 ? (
                    <div>
                      <h3 className="text-xl font-serif font-bold text-amber-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-0.5 bg-amber-600"></span>
                        Specialità
                        <span className="text-sm font-normal text-amber-700">(Specialties)</span>
                      </h3>
                      <div className="space-y-3">
                        {uncategorizedItems.map((item, index) => (
                          <MenuItemDisplay key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              <div className="mt-8 pt-6 border-t border-amber-200 text-center">
                <p className="text-sm text-amber-700 italic">
                  "Bringing the authentic flavors of Italy to your table"
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  * All prices include tax • Subject to change without notice
                </p>
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
              <strong>1. メニュー入力:</strong> 「メニュー名 価格 説明」の形式で1行ずつ入力
            </div>
            <div>
              <strong>2. 翻訳実行:</strong> 「英語に翻訳」ボタンでAIが一括翻訳
            </div>
            <div>
              <strong>3. 表示切り替え:</strong> 「翻訳結果」と「メニュー表」で表示モード変更
            </div>
            <div className="bg-muted p-3 rounded-md">
              <strong>💡 ヒント:</strong> 「メニュー表」モードで高級イタリアンレストラン風のメニューを表示できます。
              お客さんにそのまま見せられるデザインです。
            </div>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
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
