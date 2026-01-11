'use client';

import { useState } from 'react';
import { QuickResponse, categoryColors, categoryNames } from '@/lib/demo-data';
import { useLanguageStore } from '@/lib/language-store';
import { useImproveResponse } from '@/lib/use-gemini';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface QuickResponseCardProps {
  response: QuickResponse;
}

export function QuickResponseCard({ response }: QuickResponseCardProps) {
  const { currentLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const [improvedContent, setImprovedContent] = useState<string | null>(null);

  const { improve, isPending: isImproving } = useImproveResponse();

  const content = response.content_translations[currentLanguage];
  const categoryColor = categoryColors[response.category];
  const categoryName = categoryNames[response.category];
  const displayContent = improvedContent || content;

  return (
    <>
      <Card
        className="cursor-pointer transition-all hover:shadow-md hover:scale-105 active:scale-95 md:active:scale-105 touch-manipulation"
        onClick={() => setIsOpen(true)}
        data-testid="quick-response-card"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge className={categoryColor}>
              {categoryName}
            </Badge>
          </div>
          <h3 className="font-medium text-sm leading-tight">
            {response.title_jp}
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          {response.image_url && (
            <AspectRatio ratio={16 / 9} className="mb-3 rounded-md overflow-hidden">
              <Image
                src={response.image_url}
                alt={response.title_jp}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </AspectRatio>
          )}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {content}
          </p>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] w-[98vw] md:w-full mobile-modal p-4 md:p-6">
          <DialogHeader className="pb-3 md:pb-6">
            <DialogTitle className="flex items-center gap-3 text-lg md:text-xl">
              <Badge className={`${categoryColor} text-sm px-3 py-1`}>
                {categoryName}
              </Badge>
              <span className="text-lg md:text-xl font-semibold">{response.title_jp}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 md:space-y-6">
            {response.image_url && (
              <AspectRatio ratio={16 / 9} className="rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={response.image_url}
                  alt={response.title_jp}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </AspectRatio>
            )}

            {/* メインのメッセージ - 大きく目立つように表示 */}
            <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg p-6 md:p-8">
              <div className="text-center">
                <p className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900 mb-4">
                  {displayContent}
                </p>
                <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const improved = await improve(content, currentLanguage);
                    setImprovedContent(improved);
                  } catch (error) {
                    console.error('Failed to improve response:', error);
                  }
                }}
                disabled={isImproving}
                className="flex items-center gap-2"
              >
                {isImproving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isImproving ? '改善中...' : 'AI改善'}
              </Button>

              {improvedContent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImprovedContent(null)}
                >
                  元に戻す
                </Button>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm md:text-base text-muted-foreground font-medium">
                📱 画面を見せてゲストにお伝えください
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
