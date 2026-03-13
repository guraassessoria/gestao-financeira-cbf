import requests, json

BASE_URL = "http://localhost:3000"
session = requests.Session()

# Step 1: get CSRF token
r1 = session.get(f"{BASE_URL}/api/auth/csrf", timeout=10)
csrf = r1.json()["csrfToken"]

# Step 2: Sign in with credentials
r2 = session.post(
    f"{BASE_URL}/api/auth/callback/credentials",
    data={
        "email": "admin@cbf.com.br",
        "password": "admin123",
        "csrfToken": csrf,
        "callbackUrl": f"{BASE_URL}/dashboard",
        "json": "true",
    },
    allow_redirects=True,
    timeout=30
)
print("Login status:", r2.status_code)
print("Cookies:", {k:v[:20]+"..." for k,v in session.cookies.items()})

# Step 3: Verify session
r3 = session.get(f"{BASE_URL}/api/auth/session", timeout=10)
print("Session:", r3.json())

# Step 4: DRE
dre = session.get(f"{BASE_URL}/api/dre?periodo=2025&visao=anual", timeout=300)
print("DRE status:", dre.status_code)
if dre.status_code == 200:
    payload = dre.json()
    linhas = payload.get("linhas", [])
    linha_1704 = next((x for x in linhas if str(x.get("codigoConta")) == "1704"), None)
    if linha_1704:
        print(f"Linha 1704 - Valor anual 2025: {linha_1704.get('valor')}")
    else:
        print("Linha 1704 not found. Total linhas:", len(linhas))
else:
    print("DRE error:", dre.text[:300])
