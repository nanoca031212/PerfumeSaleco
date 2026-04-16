const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente do arquivo .env na raiz
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('Arquivo .env não encontrado!');
  process.exit(1);
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function checkAccount() {
  try {
    console.log('Consultando informações da conta Stripe...');
    
    const account = await stripe.accounts.retrieve();

    console.log('\n--- Informações da Conta Stripe ---');
    console.log(`ID da Conta: ${account.id}`);
    console.log(`Nome do Negócio (Business Name): ${account.business_profile?.name || 'Não configurado'}`);
    console.log(`Nome na Fatura (Statement Descriptor): ${account.settings?.payments?.statement_descriptor || 'Não configurado'}`);
    console.log(`Email de Suporte: ${account.business_profile?.support_email || 'Não configurado'}`);
    console.log(`País: ${account.country}`);
    console.log(`Moeda Padrão: ${account.default_currency.toUpperCase()}`);
    console.log(`Cobranças Habilitadas: ${account.charges_enabled ? 'Sim' : 'Não'}`);
    console.log(`Pagamentos Habilitados: ${account.payouts_enabled ? 'Sim' : 'Não'}`);
    console.log('-'.repeat(40));

  } catch (error) {
    console.error('Erro ao consultar conta Stripe:', error.message);
  }
}

checkAccount();
