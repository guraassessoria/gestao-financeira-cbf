#!/usr/bin/env node

/**
 * Script interativo para configurar projeto no Vercel
 * Facilita o processo de link e configuração de variáveis de ambiente
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
  try {
    console.log(`\n⏳ ${description}...`);
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    return output;
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    throw error;
  }
}

async function main() {
  console.log('\n🚀 Assistente de Configuração Vercel\n');
  console.log('='.repeat(50));
  
  try {
    // 1. Fazer login
    console.log('\n📍 Você será redirecionado para fazer login no Vercel');
    console.log('   (Abra o navegador quando solicitado)\n');
    
    runCommand('npx vercel login', 'Fazendo login no Vercel');
    
    // 2. Linkar projeto
    console.log('\n📍 Agnora vamos linkar este projeto ao Vercel\n');
    runCommand('npx vercel link --create-scope', 'Linkando projeto');
    
    // 3. Ler arquivo .vercel/project.json
    const projectJsonPath = path.join(process.cwd(), '.vercel', 'project.json');
    let projectInfo = {};
    
    if (fs.existsSync(projectJsonPath)) {
      projectInfo = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8'));
      console.log('\n✓ Informações do projeto:');
      console.log(`  - Org ID: ${projectInfo.orgId}`);
      console.log(`  - Project ID: ${projectInfo.projectId}`);
    }
    
    // 4. Configurar variáveis de ambiente
    console.log('\n' + '='.repeat(50));
    console.log('🔐 CONFIGURAR VARIÁVEIS DE AMBIENTE\n');
    
    console.log('As seguintes variáveis serão configuradas no Vercel:\n');
    
    const envVars = [
      {
        name: 'NEXT_PUBLIC_SUPABASE_URL',
        description: 'URL do Supabase',
        production: true
      },
      {
        name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        description: 'Chave Anônima do Supabase',
        production: true
      },
      {
        name: 'SUPABASE_SERVICE_ROLE_KEY',
        description: 'Chave de Serviço do Supabase',
        production: true
      },
      {
        name: 'NEXTAUTH_SECRET',
        description: 'Secret para NextAuth',
        production: true
      },
      {
        name: 'NEXTAUTH_URL',
        description: 'URL de Produção (NextAuth)',
        production: true
      }
    ];
    
    // 5. Instruções
    console.log('✅ Para configurar as variáveis:\n');
    console.log('1. Acesse: https://vercel.com/dashboard');
    console.log('2. Selecione o projeto "gestao-financeira-cbf"');
    console.log('3. Vá para Settings → Environment Variables');
    console.log('4. Adicione cada variável:\n');
    
    for (const env of envVars) {
      console.log(`   • ${env.name}`);
      console.log(`     Descrição: ${env.description}\n`);
    }
    
    console.log('\n📋 Valores necessários:');
    console.log('   1. Supabase URL e Chaves: https://app.supabase.com/project/ifsyeqzodimustnxgwyt/settings/api');
    console.log('   2. NEXTAUTH_SECRET: gere com: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    console.log('   3. NEXTAUTH_URL: https://seu-dominio.vercel.app (ou domínio customizado)\n');
    
    // 6. Deploy
    console.log('=' .repeat(50));
    console.log('\n✅ Projeto linkado com sucesso!\n');
    console.log('📝 Próximos passos:\n');
    console.log('1. Configure as variáveis de ambiente no Vercel Dashboard');
    console.log('2. Faça um commit: git commit -m "vercel: project link"');
    console.log('3. Faça push: git push origin main');
    console.log('4. O deployment será iniciado automaticamente\n');
    
    // 7. Salvar IDs
    if (projectInfo.projectId) {
      const configPath = path.join(process.cwd(), '.vercel-config.json');
      fs.writeFileSync(configPath, JSON.stringify({
        projectId: projectInfo.projectId,
        orgId: projectInfo.orgId,
        timestamp: new Date().toISOString()
      }, null, 2));
      console.log(`✓ Configuração salva em: .vercel-config.json`);
    }
    
  } catch (error) {
    console.error('\n❌ Erro durante configuração:');
    console.error(error.message);
    console.log('\n💡 Dica: Verifique se está logado no GitHub e tem permissões no repositório');
    process.exit(1);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
