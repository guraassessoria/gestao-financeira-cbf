import csv
from pathlib import Path

path = "arquivos/CT2 - Lançamentos.csv"
with open(path, encoding="latin-1", errors="replace") as f:
    content = f.read()

lines = content.splitlines()
total = len(lines)
print(f"Total lines in file: {total}")

# Find header
header_idx = 0
for i,l in enumerate(lines[:20]):
    if "Filial" in l:
        header_idx = i
        break

print(f"Header at line {header_idx}: {lines[header_idx][:200]}")

# Count cont.hist rows and check what columns they have
rows = list(csv.reader(lines[header_idx:], delimiter=";"))
headers = [h.strip() for h in rows[0]]
print(f"\nHeaders: {headers[:20]}")

cont_hist_rows = []
for row in rows[1:5000]:
    rec = {headers[i]: row[i].strip() if i < len(row) else "" for i in range(len(headers))}
    if rec.get("Tipo Lcto", "").strip() == "Cont.Hist":
        cont_hist_rows.append(rec)

print(f"\nFirst 5000 data rows - Cont.Hist rows found: {len(cont_hist_rows)}")
if cont_hist_rows:
    for r in cont_hist_rows[:5]:
        print("  Tipo Lcto:", repr(r.get("Tipo Lcto")))
        print("  Cta Debito:", repr(r.get("Cta Debito")))
        print("  Cta Credito:", repr(r.get("Cta Credito")))
        print("  Valor:", repr(r.get("Valor")))
        print("  ---")

# Count totals
total_data = len(rows) - 1
cont_hist_count = sum(1 for r in rows[1:] if len(r) > 0 and (r[headers.index("Tipo Lcto")] if "Tipo Lcto" in headers else "") == "Cont.Hist")
tipo_idx = headers.index("Tipo Lcto") if "Tipo Lcto" in headers else -1
cta_deb_idx = headers.index("Cta Debito") if "Cta Debito" in headers else -1
cont_hist_with_cta = 0
if tipo_idx >= 0 and cta_deb_idx >= 0:
    for row in rows[1:]:
        if len(row) > tipo_idx and row[tipo_idx].strip() == "Cont.Hist":
            if len(row) > cta_deb_idx and row[cta_deb_idx].strip():
                cont_hist_with_cta += 1

print(f"\nTotal data rows: {total_data}")
print(f"Cont.Hist rows: {cont_hist_count}")
print(f"Cont.Hist rows WITH Cta Debito: {cont_hist_with_cta}")
