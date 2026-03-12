#!/usr/bin/env node

/**
 * Script automatizado para organizar arquivos não utilizados
 * Move-os para uma pasta "unused" e mantém organizado
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..', '..');
const unusedDir = path.join(projectRoot, 'unused-files');
const reportPath = path.join(projectRoot, 'unused-files-report.json');

/**
 * Cria a estrutura de diretório se não existir
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Diretório criado: ${dir}`);
  }
}

/**
 * Move arquivo para a pasta unused mantendo a estrutura
 */
function moveFileToUnused(filePath) {
  try {
    const relativePath = path.relative(projectRoot, filePath);
    const fileName = path.basename(filePath);
    const dirName = path.dirname(relativePath);
    
    // Criar estrutura mantendo a hierarquia
    const targetDir = path.join(unusedDir, dirName);
    ensureDir(targetDir);
    
    const targetPath = path.join(targetDir, fileName);
    
    // Copiar arquivo (não deletar automaticamente por segurança)
    fs.copyFileSync(filePath, targetPath);
    console.log(`📁 Copiado: ${relativePath}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao mover ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Função principal
 */
function main() {
  // Verificar se relatório existe
  if (!fs.existsSync(reportPath)) {
    console.log('❌ Arquivo de relatório não encontrado!');
    console.log('Execute: node find-unused-files.js');
    process.exit(1);
  }
  
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  if (report.unusedCount === 0) {
    console.log('✅ Nenhum arquivo não utilizado para organizar!');
    return;
  }
  
  console.log(`\n🗂️  Organizando ${report.unusedCount} arquivo(s) não utilizado(s)...\n`);
  
  ensureDir(unusedDir);
  
  let movedCount = 0;
  for (const filePath of report.unusedFiles) {
    const fullPath = path.join(projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
      if (moveFileToUnused(fullPath)) {
        movedCount++;
      }
    }
  }
  
  // Criar arquivo README na pasta
  const readmePath = path.join(unusedDir, 'README.md');
  const readmeContent = `# Arquivos Não Utilizados

Esta pasta contém arquivos que não estão sendo utilizados no projeto.

**Data de Geração:** ${new Date().toISOString()}
**Total de Arquivos:** ${movedCount}

## Como Restaurar

Se você deseja restaurar alguém destes arquivos:

1. Copie o arquivo necessário de volta para sua localização original
2. Execute \`node find-unused-files.js\` novamente para atualizar o relatório

## Limpeza

Para remover permanentemente os arquivos não utilizados:

\`\`\`bash
rm -rf unused-files
\`\`\`

## Automatização

Para executar a verificação automaticamente:

\`\`\`bash
npm run check-unused
\`\`\`
`;
  
  fs.writeFileSync(readmePath, readmeContent);
  console.log(`\n📄 README criado em: unused-files/README.md`);
  console.log(`✅ ${movedCount} arquivo(s) organizado(s)`);
}

main();
