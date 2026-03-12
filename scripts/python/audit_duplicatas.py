"""
Script para verificar duplicatas usando a SDK Supabase
"""

import sys
from pathlib import Path

# Carregar variáveis de ambiente
import os
from dotenv import load_dotenv

env_file = ".env.local"
load_dotenv(env_file)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Erro: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados no .env.local")
    sys.exit(1)

print("Importando Supabase SDK...")
try:
    from supabase import create_client, Client
except ImportError:
    print("Instalando supabase SDK...")
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "supabase"], check=True)
    from supabase import create_client, Client

print(f"Conectando ao Supabase...")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("\n" + "="*70)
print("AUDITORIA DE DUPLICATAS NO SUPABASE")
print("="*70)

# Query 1: Duplicatas em lancamentos_contabeis
print("\n[1/4] LANÇAMENTOS CONTÁBEIS (CT2)")
print("-" * 70)

try:
    response = supabase.rpc("check_lancamentos_duplicatas", {}).execute()
    print("✓ Query executada")
except Exception as e:
    print(f"⚠ Método RPC não disponível, usando abordagem alternativa...")
    
    # Alternativa: usar SQL direto via pgsql
    try:
        # Fetch todos os lançamentos e verificar localmente
        lancamentos = supabase.table("lancamentos_contabeis").select("*").execute()
        data = lancamentos.data
        
        if not data:
            print("✓ Nenhum lançamento no banco")
        else:
            # Verificar duplicatas por (filial, numero_lote, sub_lote, tipo_lcto, cta_deb, cta_cred)
            from collections import defaultdict
            duplicatas = defaultdict()
            
            for lancamento in data:
                chave = (
                    lancamento.get('filial'),
                    lancamento.get('numero_lote'),
                    lancamento.get('sub_lote'),
                    lancamento.get('tipo_lcto'),
                    lancamento.get('cta_debito'),
                    lancamento.get('cta_credito')
                )
                
                if chave not in duplicatas:
                    duplicatas[chave] = []
                duplicatas[chave].append(lancamento['id'])
            
            # Contar apenas as que têm > 1
            duplicadas_count = sum(1 for v in duplicatas.values() if len(v) > 1)
            total_duplicatas = sum(len(v) - 1 for v in duplicatas.values() if len(v) > 1)
            
            if duplicadas_count == 0:
                print(f"✓ Nenhuma duplicata encontrada ({len(data)} registros)")
            else:
                print(f"⚠ {duplicadas_count} combinações duplicadas encontradas")
                print(f"  Total de registros duplicados: {total_duplicatas}")
                print("\n  Primeiras 5 duplicatas:")
                for i, (chave, ids) in enumerate(sorted(duplicatas.items(), key=lambda x: -len(x[1]))[:5]):
                    filial, lote, sublote, tipo, deb, cred = chave
                    print(f"    [{i+1}] Lote={lote:6} SubLote={sublote:3} Tipo={tipo:15} Deb={deb:12} Cred={cred:12}")
                    print(f"         IDs: {ids}")
    
    except Exception as e2:
        print(f"❌ Erro ao verificar: {e2}")

# Query 2: Duplicatas em de_para_dre
print("\n[2/4] DE-PARA DRE")
print("-" * 70)

try:
    de_para = supabase.table("de_para_dre").select("*").execute()
    data = de_para.data
    
    if not data:
        print("✓ Tabela vazia")
    else:
        from collections import defaultdict
        duplicatas = defaultdict(list)
        
        for mapping in data:
            chave = (mapping.get('codigo_conta_contabil'), mapping.get('codigo_centro_custo'))
            duplicatas[chave].append(mapping['id'])
        
        duplicadas_count = sum(1 for v in duplicatas.values() if len(v) > 1)
        
        if duplicadas_count == 0:
            print(f"✓ Nenhuma duplicata {len(data)} registros)")
        else:
            print(f"⚠ {duplicadas_count} combinações duplicadas")
            for chave, ids in list(duplicatas.items())[:3]:
                conta, cc = chave
                print(f"    Conta={conta:10} CC={str(cc):6} [{len(ids)} registros]")
except Exception as e:
    print(f"❌ Erro: {e}")

# Query 3: Duplicatas em estrutura_dre
print("\n[3/4] ESTRUTURA DRE")
print("-" * 70)

try:
    estrutura = supabase.table("estrutura_dre").select("*").execute()
    data = estrutura.data
    
    if not data:
        print("✓ Tabela vazia")
    else:
        from collections import defaultdict
        duplicatas = defaultdict(list)
        
        for linha in data:
            codigo = linha.get('codigo_conta')
            duplicatas[codigo].append(linha['id'])
        
        duplicadas_count = sum(1 for v in duplicatas.values() if len(v) > 1)
        
        if duplicadas_count == 0:
            print(f"✓ Nenhuma duplicata ({len(data)} registros)")
        else:
            print(f"⚠ {duplicadas_count} códigos duplicados")
            for codigo, ids in list(duplicatas.items())[:3]:
                print(f"    Código={codigo:10} [{len(ids)} registros]")
except Exception as e:
    print(f"❌ Erro: {e}")

# Query 4: Contar totais
print("\n[4/4] RESUMO GERAL")
print("-" * 70)

try:
    tabelas = {
        'lancamentos_contabeis': "Lançamentos CT2",
        'de_para_dre': "De-Para DRE",
        'estrutura_dre': "Estrutura DRE",
        'contas_contabeis': "Contas CT1",
        'centros_custo': "Centros de Custo",
        'entidades_dre': "Entidades DRE"
    }
    
    for tabela, desc in tabelas.items():
        try:
            result = supabase.table(tabela).select("id", count="exact").execute()
            count = result.count
            print(f"  {desc:25} → {count:5} registros")
        except Exception as e:
            print(f"  {desc:25} → ❌ Erro")

except Exception as e:
    print(f"❌ Erro ao contar: {e}")

print("\n" + "="*70)
print("FIM DA AUDITORIA")
print("="*70)
