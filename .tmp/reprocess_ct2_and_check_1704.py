import requests
import json
import time

BASE_URL = 'http://localhost:3000'
EMAIL = 'admin@cbf.com.br'
PASSWORD = 'admin123'
CT2_FILE = 'arquivos/CT2 - Lançamentos.csv'

for _ in range(30):
    try:
        r = requests.get(BASE_URL, timeout=5)
        if r.status_code in (200, 302, 307):
            break
    except Exception:
        pass
    time.sleep(1)

s = requests.Session()
login = s.post(
    f'{BASE_URL}/api/auth/callback/credentials',
    json={'email': EMAIL, 'password': PASSWORD},
    headers={'Content-Type': 'application/json'},
    allow_redirects=False,
    timeout=60,
)

if login.status_code not in (200, 302):
    print('LOGIN_ERROR', login.status_code, login.text[:500])
    raise SystemExit(1)

print('LOGIN_OK', login.status_code)

with open(CT2_FILE, 'rb') as f:
    resp = s.post(
        f'{BASE_URL}/api/parse/ct2',
        files={'file': f},
        allow_redirects=False,
        timeout=3600,
    )

print('UPLOAD_STATUS', resp.status_code)
try:
    print('UPLOAD_BODY', json.dumps(resp.json(), ensure_ascii=False)[:2000])
except Exception:
    print('UPLOAD_TEXT', resp.text[:2000])

# Query DRE annual/monthly 2025
for url in [
    f'{BASE_URL}/api/dre?visao=anual&periodo=2025',
    f'{BASE_URL}/api/dre?visao=mensal&periodo=2025',
]:
    dre = s.get(url, timeout=180)
    print('DRE_URL', url)
    print('DRE_STATUS', dre.status_code)
    if dre.status_code != 200:
        print('DRE_TEXT', dre.text[:1000])
        continue
    payload = dre.json()
    linha = next((x for x in payload.get('linhas', []) if str(x.get('codigoConta')) == '1704'), None)
    if not linha:
        print('LINHA_1704_NOT_FOUND')
        continue
    jan = None
    mensais = linha.get('valoresMensaisAtual')
    if isinstance(mensais, list) and mensais:
        jan = mensais[0]
    print('LINHA_1704_VALOR', linha.get('valor'))
    print('LINHA_1704_JAN', jan)
