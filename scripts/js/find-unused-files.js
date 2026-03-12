#!/usr/bin/env node

/**
 * Script para encontrar arquivos não utilizados no projeto
 * Verifica imports e referências em todo o projeto
 */

const fs = require('fs');
const path = require('path');

// Configurações
const projectRoot = path.join(__dirname, '..', '..');
const srcDir = path.join(projectRoot, 'src');
const backendDir = path.join(projectRoot, 'backend');
const arquivosDir = path.join(projectRoot, 'arquivos');
const supabaseDir = path.join(projectRoot, 'supabase');

// Extensões de arquivo para verificar
const fileExtensions = ['.tsx', '.ts', '.jsx', '.js', '.py', '.sql', '.css'];

// Diretórios a ignorar
const ignoreDirs = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '__pycache__',
  '.pytest_cache',
  'out',
  '.vercel'
];

// Padrões de arquivo a ignorar
const ignorePatterns = [
  /\.map$/,
  /next-env\.d\.ts$/,
  /tsconfig\.json$/,
  /package\.json$/,
  /package-lock\.json$/
];

// Arquivos especiais que não devem ser marcados como não utilizados
const specialFiles = [
  'layout.tsx',
  'page.tsx',
  'route.ts',
  '[...nextauth]',
  'globals.css',
  'middleware.ts',
  'next.config.ts',
  'tailwind.config.js',
  'postcss.config.js',
  'tsconfig.json',
  'package.json',
  'requirements.txt'
];

let allFiles = [];
let fileReferences = new Map();

/**
 * Obtém todos os arquivos do projeto
 */
function getAllFiles(dir, baseDir = null) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const relativePath = path.relative(projectRoot, filePath);
    const stat = fs.statSync(filePath);
    
    // Pular diretórios ignorados
    if (ignoreDirs.some(ignore => relativePath.includes(ignore))) {
      continue;
    }
    
    if (stat.isDirectory()) {
      getAllFiles(filePath);
    } else {
      // Verificar extensão
      if (fileExtensions.some(ext => filePath.endsWith(ext))) {
        // Não ignorar padrões
        if (!ignorePatterns.some(pattern => pattern.test(file))) {
          allFiles.push({
            path: relativePath,
            fullPath: filePath,
            name: file
          });
        }
      }
    }
  }
}

/**
 * Extrai todos os imports e referências de um arquivo
 */
function extractReferences(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const references = new Set();
    
    // Padrões de import/require
    const patterns = [
      /import\s+(?:.*?from\s+)?['"]([^'"]+)['"]/g,
      /require\(['"]([^'"]+)['"]\)/g,
      /from\s+['"]([^'"]+)['"]/g,
      /import\s+['"]([^'"]+)['"]/g,
      /fetch\(['"]([^'"]+)['"]/g,
      /fetch\([`]([^`]+)[`]/g,
      /src=['"]([^'"]+)['"]/g,
      /href=['"]([^'"]+)['"]/g,
      /urlpatterns\s*=\s*\[([^\]]+)\]/g
    ];
    
    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          references.add(match[1]);
        }
      }
    }
    
    return references;
  } catch (error) {
    console.error(`Erro ao ler ${filePath}:`, error.message);
    return new Set();
  }
}

/**
 * Verifica se um arquivo é referenciado em outro lugar
 */
function isFileReferenced(fileName, filePath) {
  const baseName = path.basename(fileName, path.extname(fileName));
  const dir = path.dirname(filePath);
  
  for (const [file, refs] of fileReferences) {
    if (file === filePath) continue;
    
    for (const ref of refs) {
      // Verificar várias formas de referência
      if (
        ref.includes(baseName) ||
        ref.includes(fileName) ||
        ref.includes(filePath) ||
        ref.includes(path.relative(dir, filePath)) ||
        filePath.includes(ref)
      ) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Função principal
 */
function main() {
  console.log('🔍 Escaneando projeto para encontrar arquivos não utilizados...\n');
  
  // Obter todos os arquivos
  getAllFiles(projectRoot);
  
  console.log(`✅ Total de arquivos encontrados: ${allFiles.length}\n`);
  
  // Extrair referências de todos os arquivos
  console.log('📊 Extraindo referências...');
  for (const file of allFiles) {
    const refs = extractReferences(file.fullPath);
    fileReferences.set(file.path, refs);
  }
  console.log('✅ Referências extraídas\n');
  
  // Encontrar arquivos não utilizados
  const unusedFiles = [];
  
  for (const file of allFiles) {
    // Pular arquivos especiais
    if (specialFiles.includes(file.name) || specialFiles.some(sf => file.path.includes(sf))) {
      continue;
    }
    
    if (!isFileReferenced(file.name, file.path)) {
      // Verificação adicional: se está em um diretório de testes ou exemplo
      if (!(file.path.includes('test') || file.path.includes('example') || file.path.includes('debug'))) {
        unusedFiles.push(file);
      }
    }
  }
  
  // Exibir resultados
  console.log('📋 ARQUIVOS NÃO UTILIZADOS ENCONTRADOS:');
  console.log('='.repeat(60));
  
  if (unusedFiles.length === 0) {
    console.log('✅ Nenhum arquivo não utilizado encontrado!');
  } else {
    for (const file of unusedFiles) {
      console.log(`⚠️  ${file.path}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`Total: ${unusedFiles.length} arquivo(s) não utilizado(s)`);
  }
  
  // Salvar relatório
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: allFiles.length,
    unusedFiles: unusedFiles.map(f => f.path),
    unusedCount: unusedFiles.length
  };
  
  const reportPath = path.join(projectRoot, 'unused-files-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Relatório salvo em: unused-files-report.json`);
}

main();
