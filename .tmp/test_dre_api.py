import requests, json

BASE_URL = "http://localhost:3000"

# Get CSRF token first
csrf = requests.get(f"{BASE_URL}/api/auth/csrf", timeout=10)
print("CSRF status:", csrf.status_code)
csrf_token = csrf.json().get("csrfToken","")
print("CSRF token:", csrf_token[:20])

# Login
session = requests.Session()
login_resp = session.post(
    f"{BASE_URL}/api/auth/callback/credentials",
    data={"email": "admin@cbf.com.br", "password": "admin123", "csrfToken": csrf_token, "callbackUrl": BASE_URL, "json": "true"},
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    allow_redirects=False,
    timeout=30
)
print("Login status:", login_resp.status_code)
print("Login cookies:", list(session.cookies.keys()))

# Try DRE
dre = session.get(f"{BASE_URL}/api/dre?periodo=2025&visao=mensal", timeout=300)
print("DRE status:", dre.status_code)
if dre.status_code == 200:
    payload = dre.json()
    linhas = payload.get("linhas", [])
    linha_1704 = next((x for x in linhas if str(x.get("codigoConta")) == "1704"), None)
    if linha_1704:
        mensais = linha_1704.get("valoresMensaisAtual",[])
        jan = mensais[0] if mensais else None
        print(f"\nLinha 1704 - Janeiro: {jan}")
        print(f"Linha 1704 - Total ano: {linha_1704.get('valor')}")
    else:
        print("Linha 1704 not found. Total linhas:", len(linhas))
        print("First few:", [l.get("codigoConta") for l in linhas[:10]])
else:
    print("DRE error:", dre.text[:500])
