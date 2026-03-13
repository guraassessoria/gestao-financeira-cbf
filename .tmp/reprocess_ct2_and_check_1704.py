import requests
import json

BASE_URL = 'http://localhost:3000'
EMAIL = 'admin@cbf.com.br'
PASSWORD = 'admin123'
CT2_FILE = 'arquivos/CT2 - Lançamentos.csv'

s = requests.Session()

# Login (NextAuth credentials callback)
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

# Upload CT2 base
with open(CT2_FILE, 'rb') as f:
    resp = s.post(
        f'{BASE_URL}/api/parse/ct2',
        files={'file': f},
        allow_redirects=False,
        timeout=1800,
    )

print('UPLOAD_STATUS', resp.status_code)
try:
    print('UPLOAD_BODY', json.dumps(resp.json(), ensure_ascii=False)[:1000])
except Exception:
    print('UPLOAD_TEXT', resp.text[:1000])

# Consultar DRE mensal 2025 e extrair linha 1704
dre = s.get(f'{BASE_URL}/api/dre?visao=mensal&periodo=2025', timeout=120)
print('DRE_STATUS', dre.status_code)
if dre.status_code != 200:
    print('DRE_TEXT', dre.text[:1000])
    raise SystemExit(0)

payload = dre.json()
linhas = payload.get('linhas', [])
linha_1704 = next((x for x in linhas if str(x.get('codigoConta')) == '1704'), None)
if not linha_1704:
    print('LINHA_1704_NOT_FOUND')
else:
    jan = None
    mensais = linha_1704.get('valoresMensaisAtual')
    if isinstance(mensais, list) and len(mensais) >= 1:
        jan = mensais[0]
    print('LINHA_1704_JAN', jan)
    print('LINHA_1704_TOTAL_ANO', linha_1704.get('valor'))
