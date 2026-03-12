#!/usr/bin/env node

/**
 * Script interativo para conectar ao Supabase
 * Facilita o processo de login e link do projeto
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n🚀 Assistente de Conexão Supabase\n');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar se supabase CLI está instalado
    console.log('✓ Verificando Supabase CLI...');
    execSync('npx supabase --version', { stdio: 'pipe' });
    console.log('✓ Supabase CLI encontrado\n');
    
    // 2. Perguntar sobre token
    console.log('Para fazer login no Supabase, você precisa de um token de acesso.');
    console.log('📍 Obtenha em: https://app.supabase.com/account/tokens\n');
    
    const hasToken = await question('✓ Você já tem um token de acesso? (s/n): ');
    
    if (hasToken.toLowerCase() !== 's' && hasToken.toLowerCase() !== 'sim') {
      console.log('\n⏳ Abra o link acima para gerar um token.');
      console.log('Quando terminar, volte aqui e execute novamente.\n');
      rl.close();
      return;
    }
    
    // 3. Pedir token
    console.log('\n📋 Cole seu token de acesso (não será printado):');
    rl.resume();
    rl.once('line', async (token) => {
      if (!token || token.trim().length === 0) {
        console.log('\n❌ Token inválido!');
        rl.close();
        process.exit(1);
      }
      
      try {
        // 4. Fazer login
        console.log('\n⏳ Fazendo login...');
        execSync(`npx supabase login --token "${token.trim()}"`, { 
          stdio: 'inherit',
          shell: true
        });
        
        // 5. Fazer link
        console.log('\n⏳ Conectando ao projeto...');
        execSync('npm run supabase:link', { 
          stdio: 'inherit'
        });
        
        // 6. Verificar conexão
        console.log('\n✓ Verificando conexão...');
        const status = execSync('npx supabase status', { 
          encoding: 'utf8'
        });
        console.log(status);
        
        // 7. Gerar tipos
        const generateTypes = await question('\n✓ Gerar tipos TypeScript para o banco? (s/n): ');
        
        if (generateTypes.toLowerCase() === 's' || generateTypes.toLowerCase() === 'sim') {
          console.log('\n⏳ Gerando tipos...');
          const typeDir = path.join(process.cwd(), 'src', 'types');
          
          if (!fs.existsSync(typeDir)) {
            fs.mkdirSync(typeDir, { recursive: true });
          }
          
          execSync(`npx supabase gen types typescript --linked --schema public > "${path.join(typeDir, 'database.ts')}"`, {
            stdio: 'inherit',
            shell: true
          });
          
          console.log('✓ Tipos gerados em src/types/database.ts');
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('✅ Conexão com Supabase realizada com sucesso!\n');
        console.log('📝 Próximas etapas:');
        console.log('   1. Execute: npm run dev');
        console.log('   2. Acesse: http://localhost:3000');
        console.log('   3. Comece a trabalhar!\n');
        
      } catch (error) {
        console.error('\n❌ Erro durante conexão:');
        console.error(error.message);
        process.exit(1);
      } finally {
        rl.close();
      }
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
