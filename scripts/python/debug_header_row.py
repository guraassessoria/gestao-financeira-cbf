"""
Debug _find_header_row and _read_csv
"""

import sys
import csv
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "backend"))

from parsers import _detectar_delimitador

arquivo = "arquivos/teste_de_para_dre.csv"
ENCODING = "latin-1"

with open(arquivo, encoding=ENCODING, errors="replace") as f:
    content = f.read()

delimiter = _detectar_delimitador(content)
print(f"Delimitador detectado: {repr(delimiter)}")

rows = list(csv.reader(content.splitlines(), delimiter=delimiter))
print(f"\nTotal de linhas parseadas: {len(rows)}")

# Simular _find_header_row
expected_col = "Filial"
header_idx = None
for i, row in enumerate(rows):
    has_filial = any(expected_col.lower() in c.lower() for c in row)
    print(f"  Linha {i}: {has_filial} | {row[:2]}")  # Show first 2 cols
    if has_filial:
        header_idx = i
        break

if header_idx is None:
    header_idx = 0
    
print(f"\nHeader ROW index: {header_idx}")
print(f"Header row: {rows[header_idx]}")
print(f"Primeira linha de dados seria: {rows[header_idx + 1] if header_idx + 1 < len(rows) else 'N/A'}")
