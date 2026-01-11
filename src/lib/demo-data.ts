// デモデータ：クイック回答
export interface QuickResponse {
  id: string;
  category: 'billing' | 'allergy' | 'how-to-eat' | 'other';
  title_jp: string;
  content_translations: {
    ja: string;
    en: string;
    es: string;
  };
  image_url?: string;
}

// カテゴリごとの色分け
export const categoryColors = {
  billing: 'bg-blue-100 text-blue-800 border-blue-200',
  allergy: 'bg-red-100 text-red-800 border-red-200',
  'how-to-eat': 'bg-green-100 text-green-800 border-green-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200',
};

// カテゴリ名（日本語）
export const categoryNames = {
  billing: '会計',
  allergy: 'アレルギー',
  'how-to-eat': '食べ方',
  other: 'その他',
};

export const demoResponses: QuickResponse[] = [
  // 会計カテゴリ
  {
    id: 'billing-1',
    category: 'billing',
    title_jp: 'お会計はテーブルです',
    content_translations: {
      ja: 'お会計はこちらのテーブルでお願いします。',
      en: 'Please pay at this table.',
      es: 'Por favor, pague en esta mesa.',
    },
    image_url: '/images/table-payment.svg',
  },
  {
    id: 'billing-2',
    category: 'billing',
    title_jp: 'クレジットカードOK',
    content_translations: {
      ja: 'クレジットカードでのお支払いが可能です。',
      en: 'Credit cards are accepted.',
      es: 'Aceptamos tarjetas de crédito.',
    },
  },
  {
    id: 'billing-3',
    category: 'billing',
    title_jp: '領収書が必要ですか？',
    content_translations: {
      ja: '領収書をお出ししますか？',
      en: 'Would you like a receipt?',
      es: '¿Quiere un recibo?',
    },
  },

  // アレルギーカテゴリ
  {
    id: 'allergy-1',
    category: 'allergy',
    title_jp: 'アレルギー対応できますか？',
    content_translations: {
      ja: 'アレルギー対応メニューをご用意しております。',
      en: 'We have allergy-friendly menu options.',
      es: 'Tenemos opciones de menú aptas para alérgicos.',
    },
  },
  {
    id: 'allergy-2',
    category: 'allergy',
    title_jp: 'この料理にアレルギー成分は？',
    content_translations: {
      ja: 'この料理には以下のアレルギー成分が含まれています。',
      en: 'This dish contains the following allergens.',
      es: 'Este plato contiene los siguientes alérgenos.',
    },
  },
  {
    id: 'allergy-3',
    category: 'allergy',
    title_jp: '特別な対応をお願いします',
    content_translations: {
      ja: '特別なアレルギー対応をお願いできますか？',
      en: 'Can we accommodate special allergy needs?',
      es: '¿Podemos acomodar necesidades especiales de alergia?',
    },
  },

  // 食べ方カテゴリ
  {
    id: 'how-to-eat-1',
    category: 'how-to-eat',
    title_jp: 'この料理の食べ方',
    content_translations: {
      ja: 'この料理は手で召し上がってください。',
      en: 'Please eat this dish with your hands.',
      es: 'Por favor, coma este plato con las manos.',
    },
    image_url: '/images/how-to-eat.svg',
  },
  {
    id: 'how-to-eat-2',
    category: 'how-to-eat',
    title_jp: 'スープの飲み方',
    content_translations: {
      ja: 'スープは直接お椀からお飲みください。',
      en: 'Please drink the soup directly from the bowl.',
      es: 'Por favor, beba la sopa directamente del tazón.',
    },
  },
  {
    id: 'how-to-eat-3',
    category: 'how-to-eat',
    title_jp: '箸の使い方',
    content_translations: {
      ja: '箸の使い方をお手伝いしましょうか？',
      en: 'Would you like help with chopsticks?',
      es: '¿Le gustaría ayuda con los palillos?',
    },
  },

  // その他カテゴリ
  {
    id: 'other-1',
    category: 'other',
    title_jp: 'お手洗いはこちらです',
    content_translations: {
      ja: 'お手洗いはこちらの方向です。',
      en: 'The restroom is in this direction.',
      es: 'El baño está en esta dirección.',
    },
    image_url: '/images/restroom.svg',
  },
  {
    id: 'other-2',
    category: 'other',
    title_jp: 'おすすめメニューは？',
    content_translations: {
      ja: '本日のおすすめはこちらです。',
      en: 'Today\'s recommendation is this.',
      es: 'La recomendación de hoy es esta.',
    },
  },
  {
    id: 'other-3',
    category: 'other',
    title_jp: '写真撮影OKです',
    content_translations: {
      ja: '料理の写真撮影はOKです。',
      en: 'Taking photos of food is okay.',
      es: 'Tomar fotos de la comida está bien.',
    },
  },
  {
    id: 'other-4',
    category: 'other',
    title_jp: '貸し切りで入れません',
    content_translations: {
      ja: '今日貸し切りで、入れません。テイクアウトならできますよ。',
      en: 'We are closed for a private event today. Takeout is available.',
      es: 'Hoy estamos cerrados para un evento privado. El takeout está disponible.',
    },
    image_url: '/images/closed-event.svg',
  },
  {
    id: 'other-5',
    category: 'other',
    title_jp: 'テイクアウト可能',
    content_translations: {
      ja: 'テイクアウトは、ピザならできますよ。',
      en: 'Takeout is available for pizza.',
      es: 'El takeout está disponible para pizza.',
    },
    image_url: '/images/takeout-pizza.svg',
  },
];
