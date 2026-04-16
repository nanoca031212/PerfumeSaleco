import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Tipos para os dados recebidos do webhook
interface PerfumeProduct {
  nomeOriginal: string;
  nome: string;
  marca: string;
  nomeCompleto: string;
  mapeado: boolean;
  tipo: 'principal' | 'secundario';
  posicao: number;
  parcialmenteVisivel?: boolean;
}

interface PerfumeAnalysisData {
  filename: string;
  produtos: PerfumeProduct[];
  principal: {
    nome: string;
    marca: string;
    nomeCompleto: string;
  } | null;
  secundarios: PerfumeProduct[];
  novosNomes: any[];
  mapeamentos: any[];
  estatisticas: {
    totalEncontrados: number;
    principalEncontrado: boolean;
    secundariosEncontrados: number;
    novosNomesDetectados: number;
  };
  metadata: {
    originalFilename: string;
    processedAt: string;
    analysisLength: number;
    hasValidData: boolean;
  };
}

// Diretório para salvar os resultados
const RESULTS_DIR = path.join(process.cwd(), 'data', 'perfume-analysis');

// Garantir que o diretório existe
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apenas aceitar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Esta API aceita apenas requisições POST'
    });
  }

  try {
    const analysisData: PerfumeAnalysisData = req.body;

    // Validar dados básicos
    if (!analysisData.filename || !analysisData.produtos) {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'Dados obrigatórios: filename e produtos'
      });
    }

    // Gerar timestamp para o arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeFilename = analysisData.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const resultFilename = `${timestamp}_${safeFilename}.json`;
    const resultPath = path.join(RESULTS_DIR, resultFilename);

    // Adicionar informações de processamento
    const enrichedData = {
      ...analysisData,
      processamento: {
        receivedAt: new Date().toISOString(),
        savedAs: resultFilename,
        apiVersion: '1.0'
      },
      mapeamentoImagem: {
        imagemOriginal: analysisData.filename,
        produtosIdentificados: analysisData.produtos.length,
        temProdutoPrincipal: analysisData.estatisticas.principalEncontrado,
        produtosSecundarios: analysisData.estatisticas.secundariosEncontrados
      }
    };

    // Salvar resultado em arquivo JSON
    fs.writeFileSync(resultPath, JSON.stringify(enrichedData, null, 2), 'utf8');

    // Atualizar índice de resultados
    await updateResultsIndex(enrichedData);

    // Log para debug
    console.log(`[WEBHOOK] Análise salva: ${resultFilename}`);
    console.log(`[WEBHOOK] Produtos encontrados: ${analysisData.produtos.length}`);
    
    if (analysisData.produtos.length > 0) {
      console.log(`[WEBHOOK] Produtos:`, analysisData.produtos.map(p => p.nomeCompleto));
    }

    // Resposta de sucesso
    return res.status(200).json({
      success: true,
      message: 'Análise recebida e salva com sucesso',
      data: {
        filename: analysisData.filename,
        produtosEncontrados: analysisData.produtos.length,
        principalEncontrado: analysisData.estatisticas.principalEncontrado,
        secundariosEncontrados: analysisData.estatisticas.secundariosEncontrados,
        savedAs: resultFilename
      }
    });

  } catch (error) {
    console.error('[WEBHOOK ERROR]:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Erro ao processar análise de perfume',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}

// Função para atualizar índice de resultados
async function updateResultsIndex(analysisData: any) {
  const indexPath = path.join(RESULTS_DIR, 'index.json');
  
  let index = [];
  
  // Carregar índice existente
  if (fs.existsSync(indexPath)) {
    try {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      index = JSON.parse(indexContent);
    } catch (error) {
      console.warn('[INDEX] Erro ao carregar índice existente:', error);
      index = [];
    }
  }

  // Adicionar nova entrada
  const indexEntry = {
    filename: analysisData.filename,
    savedAs: analysisData.processamento.savedAs,
    receivedAt: analysisData.processamento.receivedAt,
    produtosEncontrados: analysisData.produtos.length,
    principalEncontrado: analysisData.estatisticas.principalEncontrado,
    secundariosEncontrados: analysisData.estatisticas.secundariosEncontrados,
    produtos: analysisData.produtos.map((p: PerfumeProduct) => ({
      nome: p.nomeCompleto,
      tipo: p.tipo,
      mapeado: p.mapeado
    }))
  };

  index.push(indexEntry);

  // Manter apenas os últimos 1000 registros
  if (index.length > 1000) {
    index = index.slice(-1000);
  }

  // Salvar índice atualizado
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
}

// Configuração para aceitar payloads maiores
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};