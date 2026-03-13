import csv
with open("arquivos/CV0 - Entidade 05.csv", encoding="latin-1", errors="replace") as f:
    content = f.read()
print(content[:3000])
