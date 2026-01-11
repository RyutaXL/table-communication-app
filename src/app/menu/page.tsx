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
import { Loader2, Sparkles, Copy, Check, Plus, X } from 'lucide-react';
import { useLanguageStore } from '@/lib/language-store';

interface MenuItem {
  id: string;
  japanese: string;
  english: string;
  description?: string;
}


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
              onClick={() => setShowItalianMenu(false)}
              variant={!showItalianMenu ? "default" : "outline"}
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
        {menuItems.length > 0 && !showItalianMenu && (
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

// メニュー表HTML生成関数
const generateMenuHtml = (menuItems: MenuItem[], restaurantName: string, restaurantTagline: string): string => {
  const categorizedItems = {
    antipasti: menuItems.filter(item =>
      item.english.toLowerCase().includes('bruschetta') ||
      item.english.toLowerCase().includes('antipasti') ||
      item.english.toLowerCase().includes('appetizer')
    ),
    primi: menuItems.filter(item =>
      item.english.toLowerCase().includes('pasta') ||
      item.english.toLowerCase().includes('risotto')
    ),
    pizza: menuItems.filter(item =>
      item.english.toLowerCase().includes('pizza')
    ),
    secondi: menuItems.filter(item =>
      item.english.toLowerCase().includes('osso buco') ||
      item.english.toLowerCase().includes('meat') ||
      item.english.toLowerCase().includes('fish')
    ),
    dolci: menuItems.filter(item =>
      item.english.toLowerCase().includes('tiramisu') ||
      item.english.toLowerCase().includes('dessert')
    ),
    altri: menuItems.filter(item => {
      const lower = item.english.toLowerCase();
      return !lower.includes('bruschetta') &&
             !lower.includes('pasta') &&
             !lower.includes('risotto') &&
             !lower.includes('pizza') &&
             !lower.includes('osso buco') &&
             !lower.includes('meat') &&
             !lower.includes('fish') &&
             !lower.includes('tiramisu') &&
             !lower.includes('dessert');
    })
  };

  const renderMenuSection = (title: string, subtitle: string, items: MenuItem[]) => {
    if (items.length === 0) return '';

    return `
      <div class="menu-section">
        <h3>
          <span class="divider"></span>
          ${title}
          <span class="subtitle">(${subtitle})</span>
        </h3>
        <div>
          ${items.map(item => {
            const priceMatch = item.english.match(/([¥$]?\d{1,3}(?:,\d{3})*)/);
            const price = priceMatch ? priceMatch[0] : '';
            const description = item.english.replace(price, '').replace(/^[¥$]\d{1,3}(?:,\d{3})*\s*/, '').trim();
            const name = description.split(' ')[0] || 'Menu Item';
            const desc = description.split(' ').slice(1).join(' ');

            return `
              <div class="menu-item">
                <div class="menu-item-content">
                  <div class="menu-item-name">${name}</div>
                  ${desc ? `<div class="menu-item-desc">${desc}</div>` : ''}
                </div>
                <div class="menu-item-price">${price}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${restaurantName} - Menu</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #92400e;
            background: linear-gradient(to bottom right, #fef7ed, #fed7aa);
            margin: 0;
            padding: 1rem;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border: 2px solid #92400e;
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 2rem 1.5rem 1.5rem;
            background: linear-gradient(135deg, #fef3c7, #fed7aa);
        }
        .restaurant-name {
            font-size: 2rem;
            font-weight: bold;
            color: #92400e;
            margin-bottom: 0.5rem;
        }
        .tagline {
            font-size: 1rem;
            color: #92400e;
            font-weight: 500;
        }
        .content {
            padding: 1.5rem;
        }

        @media (max-width: 640px) {
            body {
                padding: 0.5rem;
            }
            .header {
                padding: 1.5rem 1rem 1rem;
            }
            .restaurant-name {
                font-size: 1.75rem;
            }
            .tagline {
                font-size: 0.875rem;
            }
            .content {
                padding: 1rem;
            }
        }
        .menu-section {
            margin-bottom: 1.5rem;
        }
        .menu-section h3 {
            font-size: 1rem;
            font-weight: bold;
            color: #92400e;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .menu-section h3 .divider {
            width: 1rem;
            height: 0.125rem;
            background-color: #92400e;
        }
        .menu-section h3 .subtitle {
            font-size: 0.75rem;
            font-weight: normal;
            color: #92400e;
        }
        .menu-item {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 0.5rem 0;
            border-bottom: 1px solid #fef3c7;
        }
        .menu-item:last-child {
            border-bottom: none;
        }
        .menu-item-content {
            flex: 1;
        }
        .menu-item-name {
            font-size: 0.9rem;
            font-weight: 600;
            color: #92400e;
            line-height: 1.3;
        }
        .menu-item-desc {
            font-size: 0.8rem;
            color: #92400e;
            margin-top: 0.125rem;
            line-height: 1.4;
        }
        .menu-item-price {
            font-size: 0.9rem;
            font-weight: bold;
            color: #92400e;
            margin-left: 0.75rem;
        }
        .footer {
            text-align: center;
            padding: 1rem;
            background: #fef3c7;
            border-top: 1px solid #92400e;
            margin-top: 1.5rem;
        }
        .footer-text {
            font-size: 0.8rem;
            color: #92400e;
            font-style: italic;
        }
        .footer-note {
            font-size: 0.7rem;
            color: #92400e;
            margin-top: 0.25rem;
        }

        @media (max-width: 640px) {
            .menu-item {
                flex-direction: column;
                align-items: stretch;
            }
            .menu-item-price {
                margin-left: 0;
                margin-top: 0.25rem;
                text-align: right;
            }
        }

        @media print {
            body { background: white !important; padding: 0 !important; }
            .container { box-shadow: none !important; border: none !important; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 1rem;">
                <span style="width: 2rem; height: 0.125rem; background-color: #92400e;"></span>
                <span style="font-size: 2rem;">🍽️</span>
                <span style="width: 2rem; height: 0.125rem; background-color: #92400e;"></span>
            </div>
            <div class="restaurant-name">${restaurantName}</div>
            <div class="tagline">${restaurantTagline}</div>
        </div>

        <div class="content">
            ${renderMenuSection('Antipasti', 'Appetizers', categorizedItems.antipasti)}
            ${renderMenuSection('Primi Piatti', 'First Courses', categorizedItems.primi)}
            ${renderMenuSection('Pizza', 'Wood-fired Pizzas', categorizedItems.pizza)}
            ${renderMenuSection('Secondi Piatti', 'Main Courses', categorizedItems.secondi)}
            ${renderMenuSection('Dolci', 'Desserts', categorizedItems.dolci)}
            ${renderMenuSection('Specialità', 'Specialties', categorizedItems.altri)}
        </div>

        <div class="footer">
            <div class="footer-text">"Bringing the authentic flavors of Italy to your table"</div>
            <div class="footer-note">
                * All prices include tax • Subject to change without notice
            </div>
        </div>
    </div>
</body>
</html>`;
};

        {/* 使用方法 */}
        <Card>
          <CardHeader>
            <CardTitle>📖 使用方法</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>1. メニュー入力:</strong> 「メニュー名 価格 説明」の形式で各項目を個別の欄に入力
            </div>
            <div>
              <strong>2. 項目追加:</strong> 「項目を追加」ボタンで入力欄を増やせます
            </div>
            <div>
              <strong>3. 翻訳実行:</strong> 「英語に翻訳」ボタンでAIが一括翻訳
            </div>
            <div>
              <strong>4. 表示切り替え:</strong> 「翻訳結果」と「メニュー表」で表示モード変更
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
