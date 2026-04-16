const fs = require('fs');
const path = require('path');

// IDs problemáticos conhecidos que retornam 410 Gone
const OBSOLETE_IDS = [
  '51243679383839', // ID que está causando erro 410
];

// Carregar mapeamento válido atual
function loadValidMapping() {
  const mappingPath = path.join(__dirname, 'data', 'shopify_variant_mapping.json');
  if (!fs.existsSync(mappingPath)) {
    throw new Error('Arquivo de mapeamento não encontrado');
  }
  return JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
}

// Carregar produtos válidos da Store 2
function loadStore2ValidProducts() {
  const store2Path = path.join(__dirname, 'data', 'store2-valid-products-mapping.json');
  if (!fs.existsSync(store2Path)) {
    throw new Error('Arquivo de produtos válidos da Store 2 não encontrado');
  }
  return JSON.parse(fs.readFileSync(store2Path, 'utf8'));
}

// Função para encontrar arquivos que contêm IDs obsoletos
function findFilesWithObsoleteIds() {
  const results = [];
  
  // Diretórios para verificar
  const dirsToCheck = [
    'components',
    'lib',
    'pages',
    'contexts',
    'data',
    'scripts'
  ];
  
  function searchInFile(filePath, content) {
    const foundIds = [];
    OBSOLETE_IDS.forEach(id => {
      if (content.includes(id)) {
        foundIds.push(id);
      }
    });
    
    if (foundIds.length > 0) {
      results.push({
        file: filePath,
        obsoleteIds: foundIds
      });
    }
  }
  
  function searchInDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        searchInDirectory(fullPath);
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.json'))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          searchInFile(fullPath, content);
        } catch (error) {
          console.warn(`Erro ao ler arquivo ${fullPath}:`, error.message);
        }
      }
    });
  }
  
  dirsToCheck.forEach(dir => {
    searchInDirectory(path.join(__dirname, dir));
  });
  
  return results;
}

// Função para sugerir IDs de substituição
function suggestReplacementIds() {
  const validMapping = loadValidMapping();
  const store2Products = loadStore2ValidProducts();
  
  console.log('📋 IDs válidos disponíveis:');
  console.log('='.repeat(50));
  
  // Mostrar alguns exemplos de IDs válidos
  const validIds = Object.values(validMapping).slice(0, 10);
  validIds.forEach((id, index) => {
    const productHandle = Object.keys(validMapping)[index];
    console.log(`✅ ${productHandle}: ${id}`);
  });
  
  console.log('\n📦 Produtos da Store 2 disponíveis:');
  console.log('='.repeat(50));
  
  // Mostrar alguns produtos da Store 2
  const store2Keys = Object.keys(store2Products).slice(0, 5);
  store2Keys.forEach(handle => {
    const product = store2Products[handle];
    console.log(`✅ ${handle}: ${product.variant_id} (£${product.price})`);
  });
}

// Função principal
function main() {
  console.log('🔍 Procurando por IDs de variante obsoletos...\n');
  
  try {
    // Encontrar arquivos com IDs obsoletos
    const filesWithObsoleteIds = findFilesWithObsoleteIds();
    
    if (filesWithObsoleteIds.length === 0) {
      console.log('✅ Nenhum ID obsoleto encontrado nos arquivos do projeto!');
      return;
    }
    
    console.log('❌ IDs obsoletos encontrados:');
    console.log('='.repeat(50));
    
    filesWithObsoleteIds.forEach(result => {
      console.log(`📁 ${result.file}`);
      result.obsoleteIds.forEach(id => {
        console.log(`   ❌ ID obsoleto: ${id}`);
      });
      console.log('');
    });
    
    // Sugerir substituições
    console.log('\n💡 Sugestões de substituição:');
    console.log('='.repeat(50));
    suggestReplacementIds();
    
    // Salvar relatório
    const report = {
      timestamp: new Date().toISOString(),
      obsoleteIds: OBSOLETE_IDS,
      filesAffected: filesWithObsoleteIds,
      totalFilesAffected: filesWithObsoleteIds.length
    };
    
    const reportPath = path.join(__dirname, 'reports', 'obsolete-ids-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n💾 Relatório salvo em: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { findFilesWithObsoleteIds, suggestReplacementIds };