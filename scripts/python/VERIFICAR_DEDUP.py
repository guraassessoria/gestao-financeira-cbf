"""
Verificar status da deduplicação via SQL direto
Execute manualmente no Supabase Dashboard > SQL Editor
"""

print("""
╔══════════════════════════════════════════════════════════════════════════════╗
║                 VERIFICAÇÃO - STATUS DA DEDUPLICAÇÃO                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

Execute UMA DESSAS queries no Supabase Dashboard > SQL Editor para verificar:

────────────────────────────────────────────────────────────────────────────────
QUERY 1: Contar total de registros (Antes: 487868 | Esperado Depois: ~487344)
────────────────────────────────────────────────────────────────────────────────

SELECT COUNT(*) as total_lancamentos FROM lancamentos_contabeis;

────────────────────────────────────────────────────────────────────────────────
QUERY 2: Verificar se AINDA há duplicatas
────────────────────────────────────────────────────────────────────────────────

SELECT 
  COUNT(DISTINCT (filial, numero_lote, sub_lote, tipo_lcto, cta_debito, cta_credito)) as combinacoes_unicas
FROM lancamentos_contabeis
WHERE numero_lote IS NOT NULL;

SELECT COUNT(*) as total_com_lote FROM lancamentos_contabeis WHERE numero_lote IS NOT NULL;

-- Se: combinacoes_unicas == total_com_lote → Sem duplicatas ✓
-- Se: combinacoes_unicas < total_com_lote → Ainda há duplicatas ⚠

────────────────────────────────────────────────────────────────────────────────
QUERY 3: Listar índices criados
────────────────────────────────────────────────────────────────────────────────

SELECT indexname FROM pg_indexes 
WHERE tablename = 'lancamentos_contabeis' AND indexname LIKE '%unico%';

────────────────────────────────────────────────────────────────────────────────
PRÓXIMAS AÇÕES
────────────────────────────────────────────────────────────────────────────────

1. Execute QUERY 1 para confirmar que registros foram deletados
2. Execute QUERY 2 para confirmar que não há mais duplicatas
3. Execute QUERY 3 para confirmar que os UNIQUE INDEXes foram criados
4. Se tudo OK: Você está pronto para fazer upload do CT2 novamente
5. Com os UNIQUE INDEXes em place:
   - Primeira carga → insere 487.344+ registros
   - Segunda carga do mesmo arquivo → sobrescreve, sem duplicar
""")

import subprocess
import json

# Tentar contar via Node.js se disponível
try:
    print("\n" + "="*80)
    print("TENTANDO CONECTAR AO SUPABASE...")
    print("="*80 + "\n")
    
    result = subprocess.run(
        "node verify-dedup.js",
        shell=True,
        capture_output=True,
        text=True,
        cwd="."
    )
    print(result.stdout)
    if result.stderr:
        print("ERROS:", result.stderr)
except Exception as e:
    print(f"Não foi possível conectar automaticamente: {e}")
    print("Use as queries acima no Supabase Dashboard.")
