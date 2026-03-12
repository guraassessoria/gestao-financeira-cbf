"""
Script de debug para entender o problema com o de-para DRE
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "backend"))

from parsers import _read_csv, _pick

arquivo = "arquivos/teste_de_para_dre.csv"

print(f"Lendo arquivo: {arquivo}\n")
headers, records = _read_csv(arquivo)

print(f"Headers encontrados ({len(headers)} colunas):")
for i, h in enumerate(headers):
    print(f"  [{i}] '{h}' (len={len(h)})")

print(f"\nPrimeiros 2 registros:")
for i, r in enumerate(records[:2], 1):
    print(f"\n  Registro {i}:")
    for k, v in r.items():
        print(f"    '{k}': '{v}'")
    
    # Testa _pick
    conta = _pick(r, ["codigo_conta_contabil", "codigo conta contabil", "conta_protheus", "cod_conta", "conta"])
    linha_dre = _pick(r, ["codigo_linha_dre", "codigo linha dre", "codigo_dre", "linha_dre", "cod_dre"])
    
    print(f"  _pick(conta): '{conta}'")
    print(f"  _pick(linha_dre): '{linha_dre}'")
