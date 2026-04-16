const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/unified_products_en_gbp.json');
const rawData = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(rawData);

const NEW_PRICE = 49.99;
const REGULAR_VALUE = 170.00;

let updatedCount = 0;

data.products = data.products.map(product => {
  let modified = false;

  // Atualizar preço regular
  if (product.price && product.price.regular === 59.9) {
    product.price.regular = NEW_PRICE;
    modified = true;
  }

  // Atualizar descrição HTML
  if (product.description_html) {
    const savings = (REGULAR_VALUE - NEW_PRICE).toFixed(2);
    const savingsPercent = Math.round(((REGULAR_VALUE - NEW_PRICE) / REGULAR_VALUE) * 100);
    
    // Substituir preço antigo
    let newHtml = product.description_html.replace(/£59\.90/g, `£${NEW_PRICE}`);
    
    // Recalcular savings se possível, ou apenas substituir strings conhecidas
    // Padrão antigo: Total Savings: £110.10 (70% OFF)
    // Novo padrão: Total Savings: £120.01 (71% OFF)
    
    newHtml = newHtml.replace(/Total Savings: £110\.10 \(70% OFF\)/g, `Total Savings: £${savings} (${savingsPercent}% OFF)`);
    
    if (newHtml !== product.description_html) {
        product.description_html = newHtml;
        modified = true;
    }
  }

  // Atualizar shopify_mapping
  if (product.shopify_mapping) {
    Object.keys(product.shopify_mapping).forEach(key => {
      if (product.shopify_mapping[key].price === 59.9) {
        product.shopify_mapping[key].price = NEW_PRICE;
        modified = true;
      }
    });
  }

  if (modified) updatedCount++;
  return product;
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Updated ${updatedCount} products.`);
