"""
Debug detalhado do parser
"""

import sys
import csv
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "backend"))

arquivo = "arquivos/teste_de_para_dre.csv"
ENCODING = "latin-1"
SEP = ";"

# Teste 1: Ler com latin-1 (padrão do sistema)
print("=" * 70)
print("TESTE 1: Leitura com LATIN-1 (padrão parser)")
print("=" * 70)

with open(arquivo, encoding=ENCODING, errors="replace") as f:
    content_latin1 = f.read()
    print(f"Primeiras 200 chars:\n{content_latin1[:200]}")
    print(f"\nSemicolon count: {content_latin1.count(';')}")
    print(f"Comma count: {content_latin1.count(',')}")
    
    # Simular _detectar_delimitador
    first_lines = "\n".join(content_latin1.splitlines()[:10])
    delim = ";" if first_lines.count(";") >= first_lines.count(",") else ","
    print(f"\nDelimitador detectado: {repr(delim)}")

# Teste 2: Parsear com o delimitador correto
print("\n" + "=" * 70)
print("TESTE 2: Parse com CSV (LATIN-1, delimiter=;)")
print("=" * 70)

with open(arquivo, encoding=ENCODING, errors="replace") as f:
    content = f.read()

delimiter = ";"
rows = list(csv.reader(content.splitlines(), delimiter=delimiter))
print(f"Total de linhas: {len(rows)}")
print(f"Headers (linha 0): {rows[0]}")
print(f"Primeira linha de dados (linha 1): {rows[1]}")

# Agora simular o _find_header_row do parser
for i, row in enumerate(rows):
    if any("Filial" in c for c in row):
        print(f"\nEncontrou 'Filial' na linha {i}")
        break
else:
    print(f"\nNão encontrou 'Filial', usando linha 0 como header")

# Teste 3: Ler com UTF-8 (como foi salvo)
print("\n" + "=" * 70)
print("TESTE 3: Leitura com UTF-8 (como foi criado)")
print("=" * 70)

with open(arquivo, encoding="utf-8") as f:
    content_utf8 = f.read()
    print(f"Primeiras 200 chars:\n{content_utf8[:200]}")
    first_lines = "\n".join(content_utf8.splitlines()[:10])
    delim = ";" if first_lines.count(";") >= first_lines.count(",") else ","
    print(f"Delimitador detectado: {repr(delim)}")
    print(f"Semicolon count: {content_utf8.count(';')}")
