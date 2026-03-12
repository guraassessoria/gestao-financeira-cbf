"""
Script para verificar duplicatas no banco Supabase
"""

import subprocess
import json
import sys

# Função auxiliar para executar queries SQL via psql/supabase
def run_sql_query(query: str) -> str:
    """Executa query SQL no banco remoto e retorna resultado em JSON"""
    
    # Usar supabase CLI para executar query
    # Criamos um arquivo temporário com a query
    import tempfile
    from pathlib import Path
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.sql', delete=False) as f:
        f.write(query)
        sql_file = f.name
    
    try:
        # Executar via supabase db execute
        result = subprocess.run(
            f'supabase db execute -f {sql_file} -p "P@13233442769"',
            shell=True,
            capture_output=True,
            text=True,
            cwd="c:\\Projetos\\gestao-financeira-cbf\\gestao-financeira-cbf"
        )
        return result.stdout + result.stderr
    finally:
        Path(sql_file).unlink(missing_ok=True)


def check_duplicates_in_table(table_name: str, unique_cols: list) -> dict:
    """Verifica duplicatas em uma tabela"""
    
    cols_str = ", ".join(unique_cols)
    
    query = f"""
    SELECT {cols_str}, COUNT(*) as duplicates
    FROM {table_name}
    GROUP BY {cols_str}
    HAVING COUNT(*) > 1
    ORDER BY duplicates DESC;
    """
    
    print(f"\n{'='*70}")
    print(f"VERIFICANDO DUPLICATAS EM: {table_name}")
    print(f"Colunas únicas esperadas: {unique_cols}")
    print(f"{'='*70}")
    
    try:
        result = run_sql_query(query)
        
        if "ERROR" in result or "error" in result.lower():
            print(f"❌ Erro ao consultar: {result}")
            return {"error": result}
        
        if not result.strip():
            print("✓ Nenhuma duplicata encontrada!")
            return {"duplicates": 0}
        
        print("⚠ DUPLICATAS ENCONTRADAS:")
        print(result)
        return {"result": result}
    
    except Exception as e:
        print(f"❌ Exceção: {e}")
        return {"error": str(e)}


print("\n" + "="*70)
print("AUDITORIA DE DUPLICATAS - BANCO SUPABASE")
print("="*70)

# 1. Verificar lancamentos_contabeis (CT2)
print("\n[1/4] Lançamentos Contábeis (CT2)")
check_duplicates_in_table(
    "lancamentos_contabeis",
    ["filial", "numero_lote", "sub_lote", "tipo_lcto", "cta_debito", "cta_credito"]
)

# 2. Verificar de_para_dre  
print("\n[2/4] De-Para DRE")
check_duplicates_in_table(
    "de_para_dre",
    ["codigo_conta_contabil", "codigo_centro_custo"]
)

# 3. Verificar estrutura_dre
print("\n[3/4] Estrutura DRE")
check_duplicates_in_table(
    "estrutura_dre",
    ["codigo_conta"]
)

# 4. Verificar contas_contabeis (CT1)
print("\n[4/4] Contas Contábeis (CT1)")
check_duplicates_in_table(
    "contas_contabeis",
    ["filial", "cod_conta"]
)

print("\n" + "="*70)
print("AUDITORIA CONCLUÍDA")
print("="*70)
