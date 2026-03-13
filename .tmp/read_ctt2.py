import csv as csvlib
with open("arquivos/CTT - Centros de Custo.csv", encoding="latin-1", errors="replace") as f:
    content = f.read()

lines = content.splitlines()
rows = list(csvlib.reader(lines, delimiter=";"))

# Find header
hi = 0
for i,r in enumerate(rows[:20]):
    if any("C Custo" in c or "Filial" in c for c in r):
        hi = i
        break

headers = [h.strip() for h in rows[hi]]
print("Headers:", headers[:20])

records = [{headers[i]: row[i].strip() if i < len(row) else "" for i in range(len(headers))} for row in rows[hi+1:] if any(c.strip() for c in row)]

print(f"\nTotal records: {len(records)}")
print("\nFirst 10 records (C Custo, Desc Moeda 1, CC Superior, Classe):")
for r in records[:10]:
    print(f"  CC={r.get('C Custo',r.get('Codigo',''))} | Desc={r.get('Desc Moeda 1','')} | Sup={r.get('CC Superior','')} | Classe={r.get('Classe','')}")

# Check what "1" top-level looks like
cc1 = [r for r in records if r.get("C Custo","").strip() == "1"]
print(f"\nCC=1 records: {len(cc1)}")
for r in cc1:
    print(r)

# Sample analytical CCs under "1"
cc_under_1 = [r for r in records if r.get("CC Superior","").strip() == "1"]
print(f"\nCCs under Superior=1: {len(cc_under_1)}")
for r in cc_under_1[:20]:
    print(f"  CC={r.get('C Custo','')} | Desc={r.get('Desc Moeda 1','')} | Classe={r.get('Classe','')}")

# What are unique top-level CCs?
top_level = [r for r in records if not r.get("CC Superior","").strip()]
print(f"\nTop-level CCs (no superior): {len(top_level)}")
for r in top_level[:20]:
    print(f"  CC={r.get('C Custo','')} | Desc={r.get('Desc Moeda 1','')} | Classe={r.get('Classe','')}")
