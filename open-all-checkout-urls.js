const fs = require('fs');
const { exec } = require('child_process');

// Carregar produtos válidos da Loja 2
const validProducts = JSON.parse(fs.readFileSync('./data/store2-valid-products-mapping.json', 'utf8'));

// Extrair todas as URLs de checkout
const checkoutUrls = Object.values(validProducts).map(product => ({
  handle: product.handle,
  title: product.title,
  url: product.checkout_url,
  price: product.price,
  currency: product.currency
}));

console.log(`🛒 Encontrados ${checkoutUrls.length} produtos com URLs de checkout válidas\n`);

// Função para abrir URL no navegador
function openUrl(url) {
  return new Promise((resolve) => {
    const command = `start "" "${url}"`;
    
    exec(command, (error) => {
      if (error) {
        console.log(`❌ Erro ao abrir ${url}: ${error.message}`);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

async function openSelectedUrls() {
  console.log('🚀 Opções de abertura de URLs:\n');
  console.log('1. Abrir apenas as primeiras 5 URLs (recomendado para teste)');
  console.log('2. Abrir as primeiras 10 URLs');
  console.log('3. Abrir todas as 44 URLs (cuidado: muitas abas!)');
  console.log('4. Mostrar lista completa de URLs para copiar manualmente\n');
  
  // Para este exemplo, vamos abrir apenas as primeiras 5
  const urlsToOpen = checkoutUrls.slice(0, 5);
  
  console.log('📦 ABRINDO AS PRIMEIRAS 5 URLs:');
  urlsToOpen.forEach((product, index) => {
    console.log(`${index + 1}. ${product.title} - £${product.price}`);
    console.log(`   🔗 ${product.url}`);
  });
  
  console.log(`\n⚠️  Serão abertas ${urlsToOpen.length} abas no seu navegador!`);
  console.log('💡 Aguarde 1 segundo entre cada abertura...\n');
  
  // Aguardar 2 segundos antes de começar
  console.log('⏳ Iniciando em 2 segundos...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < urlsToOpen.length; i++) {
    const product = urlsToOpen[i];
    console.log(`[${i + 1}/${urlsToOpen.length}] Abrindo: ${product.title}`);
    
    const success = await openUrl(product.url);
    if (success) {
      console.log(`✅ Aberto com sucesso!`);
      successCount++;
    } else {
      console.log(`❌ Erro ao abrir!`);
      errorCount++;
    }
    
    // Aguardar 1 segundo entre cada abertura
    if (i < urlsToOpen.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n📊 RESUMO:');
  console.log(`✅ URLs abertas com sucesso: ${successCount}`);
  console.log(`❌ URLs com erro: ${errorCount}`);
  console.log(`📈 Taxa de sucesso: ${((successCount / urlsToOpen.length) * 100).toFixed(1)}%`);
  
  if (successCount > 0) {
    console.log('\n🎉 URLs abertas com sucesso!');
    console.log('🛒 Verifique as abas abertas no seu navegador para testar os checkouts.');
  }
  
  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('1. Teste os checkouts nas abas abertas');
  console.log('2. Se quiser abrir mais URLs, execute o script novamente');
  console.log('3. Para ver todas as URLs, execute: node show-all-urls.js');
}

// Executar
openSelectedUrls().catch(console.error);