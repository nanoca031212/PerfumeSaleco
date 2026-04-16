import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Diretório dos resultados
const RESULTS_DIR = path.join(process.cwd(), 'data', 'perfume-analysis');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Esta API aceita apenas requisições GET'
    });
  }

  try {
    const { filename, limit = '50', offset = '0', summary = 'false' } = req.query;

    // Se for solicitação de resumo
    if (summary === 'true') {
      return getSummary(res);
    }

    // Se for busca por arquivo específico
    if (filename && typeof filename === 'string') {
      return getSpecificResult(filename, res);
    }

    // Listar todos os resultados
    return getAllResults(parseInt(limit as string), parseInt(offset as string), res);

  } catch (error) {
    console.error('[API ERROR]:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Erro ao buscar resultados de análise'
    });
  }
}

// Função para obter resumo geral
function getSummary(res: NextApiResponse) {
  const indexPath = path.join(RESULTS_DIR, 'index.json');
  
  if (!fs.existsSync(indexPath)) {
    return res.status(200).json({
      totalAnalises: 0,
      produtosMaisEncontrados: [],
      estatisticas: {
        comProdutoPrincipal: 0,
        comProdutosSecundarios: 0,
        semProdutos: 0
      }
    });
  }

  try {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    const index = JSON.parse(indexContent);

    // Calcular estatísticas
    const stats = {
      totalAnalises: index.length,
      comProdutoPrincipal: index.filter((item: any) => item.principalEncontrado).length,
      comProdutosSecundarios: index.filter((item: any) => item.secundariosEncontrados > 0).length,
      semProdutos: index.filter((item: any) => item.produtosEncontrados === 0).length
    };

    // Contar produtos mais encontrados
    const produtoCount: { [key: string]: number } = {};
    index.forEach((item: any) => {
      item.produtos?.forEach((produto: any) => {
        produtoCount[produto.nome] = (produtoCount[produto.nome] || 0) + 1;
      });
    });

    const produtosMaisEncontrados = Object.entries(produtoCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([nome, count]) => ({ nome, count }));

    return res.status(200).json({
      ...stats,
      produtosMaisEncontrados,
      ultimaAnalise: index[index.length - 1]?.receivedAt || null
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Erro ao processar índice de resultados'
    });
  }
}

// Função para obter resultado específico
function getSpecificResult(filename: string, res: NextApiResponse) {
  // Buscar no índice primeiro
  const indexPath = path.join(RESULTS_DIR, 'index.json');
  
  if (!fs.existsSync(indexPath)) {
    return res.status(404).json({
      error: 'Not found',
      message: 'Nenhum resultado encontrado'
    });
  }

  try {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    const index = JSON.parse(indexContent);
    
    const entry = index.find((item: any) => 
      item.filename === filename || item.savedAs === filename
    );

    if (!entry) {
      return res.status(404).json({
        error: 'Not found',
        message: `Resultado não encontrado para: ${filename}`
      });
    }

    // Carregar arquivo completo
    const resultPath = path.join(RESULTS_DIR, entry.savedAs);
    
    if (!fs.existsSync(resultPath)) {
      return res.status(404).json({
        error: 'File not found',
        message: 'Arquivo de resultado não encontrado'
      });
    }

    const resultContent = fs.readFileSync(resultPath, 'utf8');
    const result = JSON.parse(resultContent);

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      error: 'Erro ao carregar resultado específico'
    });
  }
}

// Função para obter todos os resultados (paginado)
function getAllResults(limit: number, offset: number, res: NextApiResponse) {
  const indexPath = path.join(RESULTS_DIR, 'index.json');
  
  if (!fs.existsSync(indexPath)) {
    return res.status(200).json({
      results: [],
      total: 0,
      limit,
      offset
    });
  }

  try {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    const index = JSON.parse(indexContent);
    
    // Ordenar por data (mais recente primeiro)
    const sortedIndex = index.sort((a: any, b: any) => 
      new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
    );

    // Aplicar paginação
    const paginatedResults = sortedIndex.slice(offset, offset + limit);

    return res.status(200).json({
      results: paginatedResults,
      total: index.length,
      limit,
      offset,
      hasMore: offset + limit < index.length
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Erro ao carregar lista de resultados'
    });
  }
}