// メニュー表HTML生成ユーティリティ

interface MenuItem {
  id: string;
  japanese: string;
  english: string;
  description?: string;
}

export function generateMenuHtml(menuItems: MenuItem[], restaurantName: string, restaurantTagline: string): string {
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
}
