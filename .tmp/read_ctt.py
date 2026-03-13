import csv
with open("arquivos/CTT - Centros de Custo.csv", encoding="latin-1", errors="replace") as f:
    content = f.read()

lines = content.splitlines()
for i, l in enumerate(lines[:5]):
    print(f"Line {i}: {l[:200]}")

print("\n...")

# Parse CSV
import csv as csvlib
rows = list(csvlib.reader(lines, delimiter=";"))
# Find header
hi = 0
for i,r in enumerate(rows[:20]):
    if any("Filial" in c for c in r):
        hi = i
        break

print(f"\nHeader at {hi}: {rows[hi][:10]}")
headers = [h.strip() for h in rows[hi]]
print("Headers:", headers[:15])

records = [{headers[i]: row[i].strip() if i < len(row) else "" for i in range(len(headers))} for row in rows[hi+1:] if any(c.strip() for c in row)]

print(f"\nTotal records: {len(records)}")

# Show a sample
from_sel = [r for r in records if "SEL" in r.get("Descrição","").upper() or "SELEC" in r.get("Descrição","").upper()]
print(f"\nRecords with SELEC: {len(from_sel)}")
for r in from_sel[:10]:
    print(r.get("Codigo",""), r.get("Descrição",""), "sup:", r.get("Sup CC",""))

# Show hierarchy top-levels
tops = [r for r in records if not r.get("Sup CC","").strip()]
print(f"\nTop-level CCs (no Sup CC): {len(tops)}")
for r in tops[:20]:
    print(r.get("Codigo",""), r.get("Descrição",""))

# Show first 30 records
print("\nFirst 30 records:")
for r in records[:30]:
    print(r.get("Codigo",""), r.get("Descrição",""), "sup:", r.get("Sup CC",""))
