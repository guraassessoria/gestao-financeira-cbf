import json
import os
import sys
from pathlib import Path
import requests

sys.path.append(str(Path('.').resolve()))
from backend.parsers import parse_ct2

env = {}
env_path = Path('.env.local')
if env_path.exists():
    for line in env_path.read_text(encoding='utf-8').splitlines():
        t = line.strip()
        if not t or t.startswith('#') or '=' not in t:
            continue
        k, v = t.split('=', 1)
        env[k.strip()] = v.strip()
env.update(os.environ)

base_url = env.get('NEXT_PUBLIC_SUPABASE_URL')
service_key = env.get('SUPABASE_SERVICE_ROLE_KEY')
if not base_url or not service_key:
    raise SystemExit('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': service_key,
    'Authorization': f'Bearer {service_key}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
}

ct2_path = 'arquivos/CT2 - Lançamentos.csv'
print('Parsing CT2...')
parsed = parse_ct2(ct2_path)
rows = parsed.get('lancamentos', [])
print('Parsed rows:', len(rows))
print('Parser errors:', len(parsed.get('erros', [])))

if not rows:
    raise SystemExit('No rows parsed from CT2 base file')

print('Deleting existing lancamentos_contabeis...')
del_resp = requests.delete(
    f'{base_url}/rest/v1/lancamentos_contabeis?id=not.is.null',
    headers=headers,
    timeout=1200,
)
if del_resp.status_code >= 300:
    print('Delete failed:', del_resp.status_code, del_resp.text[:1000])
    raise SystemExit(1)

chunk_size = 1000
inserted = 0
print('Inserting chunks...')
for i in range(0, len(rows), chunk_size):
    chunk = rows[i:i+chunk_size]
    payload = []
    for l in chunk:
        payload.append({
            'filial': l.get('filial'),
            'data_lcto': l.get('data_lcto'),
            'periodo': l.get('periodo'),
            'numero_lote': l.get('numero_lote'),
            'sub_lote': l.get('sub_lote'),
            'numero_doc': l.get('numero_doc'),
            'moeda': l.get('moeda') or '01',
            'tipo_lcto': l.get('tipo_lcto'),
            'cta_debito': l.get('cta_debito'),
            'cta_credito': l.get('cta_credito'),
            'valor': l.get('valor'),
            'hist_pad': l.get('hist_pad'),
            'hist_lanc': l.get('hist_lanc'),
            'c_custo_deb': l.get('c_custo_deb'),
            'c_custo_crd': l.get('c_custo_crd'),
            'ocorren_deb': l.get('ocorren_deb'),
            'ocorren_crd': l.get('ocorren_crd'),
            'valor_moeda1': l.get('valor_moeda1'),
            'origem': 'upload',
        })

    resp = requests.post(
        f'{base_url}/rest/v1/lancamentos_contabeis',
        headers=headers,
        data=json.dumps(payload, ensure_ascii=False),
        timeout=1200,
    )
    if resp.status_code >= 300:
        print('Insert failed at chunk', i, 'status', resp.status_code)
        print(resp.text[:1200])
        raise SystemExit(1)

    inserted += len(payload)
    if inserted % 20000 == 0:
        print('Inserted', inserted)

print('DONE. Inserted rows:', inserted)
