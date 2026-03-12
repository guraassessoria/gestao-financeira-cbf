"""
Verificar BOM e testarvector direto da função _read_csv
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "backend"))

from parsers import _read_csv

arquivo = "arquivos/teste_de_para_dre.csv"

print("Testando _read_csv() do parser:")
headers, records = _read_csv(arquivo)

print(f"\nHeaders ({len(headers)}):")
for i, h in enumerate(headers):
    print(f"  [{i}] '{h}'")

print(f"\nRegistros ({len(records)}):")
for i, r in enumerate(records[:3]):
    print(f"  [{i}] {r}")

# Verificar encoding do arquivo
print("\n" + "="*70)
with open(arquivo, 'rb') as f:
    primeiros_bytes = f.read(4)
    if primeiros_bytes[:3] == b'\xef\xbb\xbf':
        print("✓ Arquivo tem BOM UTF-8 (bytes: EF BB BF)")
    elif primeiros_bytes[:2] == b'\xff\xfe':
        print("✗ Arquivo tem BOM UTF-16 LE")
    elif primeiros_bytes[:2] == b'\xfe\xff':
        print("✗ Arquivo tem BOM UTF-16 BE")
    else:
        print(f"Primeiros 4 bytes: {primeiros_bytes.hex()}")
