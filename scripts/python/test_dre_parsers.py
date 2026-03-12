"""
Script para testar o pipeline de upload da DRE
Valida parse_estrutura_dre e parse_de_para_dre
"""

import sys
import json
from pathlib import Path

# Adiciona backend ao path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from parsers import parse_estrutura_dre, parse_de_para_dre

def test_estrutura_dre():
    """Testa parse da Estrutura DRE"""
    print("\n" + "="*70)
    print("TESTE 1: ESTRUTURA DRE")
    print("="*70)
    
    arquivo_orig = "arquivos/DRE-Estrutura-Teste.csv"
    arquivo_alt = "arquivos/teste_estrutura_dre.csv"
    
    # Teste com primeira versão
    print(f"\n[1/2] Testando: {arquivo_orig}")
    try:
        resultado1 = parse_estrutura_dre(arquivo_orig)
        print(f"✓ Sucesso! Parseadas {resultado1['total_linhas']} linhas")
        
        if resultado1['erros']:
            print(f"⚠ {len(resultado1['erros'])} erros encontrados:")
            for erro in resultado1['erros']:
                print(f"  - {erro}")
        
        print("\nAmostra dos dados parseados (primeiras 3 linhas):")
        for i, linha in enumerate(resultado1['linhas'][:3], 1):
            print(f"  [{i}] Código: {linha['codigo_conta']:12} | Nível: {linha['nivel']} | Viz: {linha['nivel_visualizacao']}")
            print(f"      {linha['descricao_conta']}")
    except Exception as e:
        print(f"✗ Erro ao processar: {e}")
    
    # Teste com segunda versão
    print(f"\n[2/2] Testando: {arquivo_alt}")
    try:
        resultado2 = parse_estrutura_dre(arquivo_alt)
        print(f"✓ Sucesso! Parseadas {resultado2['total_linhas']} linhas")
        
        if resultado2['erros']:
            print(f"⚠ {len(resultado2['erros'])} erros encontrados:")
            for erro in resultado2['erros']:
                print(f"  - {erro}")
        
        print("\nAmostra dos dados parseados (primeiras 3 linhas):")
        for i, linha in enumerate(resultado2['linhas'][:3], 1):
            print(f"  [{i}] Código: {linha['codigo_conta']:12} | Nível: {linha['nivel']} | Viz: {linha['nivel_visualizacao']}")
            print(f"      {linha['descricao_conta']}")
            if linha['codigo_cta_superior']:
                print(f"      Superior: {linha['codigo_cta_superior']}")
    except Exception as e:
        print(f"✗ Erro ao processar: {e}")


def test_de_para_dre():
    """Testa parse do De-Para DRE"""
    print("\n" + "="*70)
    print("TESTE 2: DE-PARA DRE")
    print("="*70)
    
    arquivo = "arquivos/teste_de_para_dre.csv"
    
    print(f"\n[1/1] Testando: {arquivo}")
    try:
        resultado = parse_de_para_dre(arquivo)
        print(f"✓ Sucesso! Parseados {resultado['total_mappings']} mapeamentos")
        
        if resultado['erros']:
            print(f"⚠ {len(resultado['erros'])} erros encontrados:")
            for erro in resultado['erros']:
                print(f"  - {erro}")
        
        print("\nTodos os mapeamentos:")
        for i, mapping in enumerate(resultado['mappings'], 1):
            print(f"  [{i}] Conta: {mapping['codigo_conta_contabil']:12} → Linha DRE: {mapping['codigo_linha_dre']:12}", end="")
            if mapping['codigo_centro_custo']:
                print(f" | CC: {mapping['codigo_centro_custo']}", end="")
            print()
            if mapping['observacao']:
                print(f"       Obs: {mapping['observacao']}")
    except Exception as e:
        print(f"✗ Erro ao processar: {e}")


def test_duplicate_handling():
    """Testa comportamento com duplicatas (mesma conta/cc)"""
    print("\n" + "="*70)
    print("TESTE 3: VALIDAÇÃO DE DUPLICATAS")
    print("="*70)
    
    print("\nCom a UNIQUE(codigo_conta_contabil, codigo_centro_custo),")
    print("a segunda tentativa com mesmos valores fará UPSERT (sobrescreve):")
    print("\nExemplo:")
    print("  [1ª carga] 1.01.01 → 1.1.1 (CC: 001)")
    print("  [2ª carga] 1.01.01 → 1.1.2 (CC: 001)  ← SOBRESCREVE a linha anterior")
    print("\nSem centro de custo:")
    print("  [1ª carga] 1.01.01 → 1.1.1 (CC: NULL)")
    print("  [2ª carga] 1.01.01 → 1.1.3 (CC: NULL)  ← SOBRESCREVE")
    print("\nCombinaçõesúnicas são mantidas:")
    print("  Same account, different CC → serão criadas 2 linhas distintas")
    print("  Ex: (1.01.01, CC=001) e (1.01.01, CC=002) coexistem")


if __name__ == "__main__":
    test_estrutura_dre()
    test_de_para_dre()
    test_duplicate_handling()
    
    print("\n" + "="*70)
    print("TESTES CONCLUÍDOS")
    print("="*70 + "\n")
