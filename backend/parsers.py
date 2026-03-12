"""
parsers.py — Parser dos arquivos TOTVS Protheus para o sistema CBF
Suporta: CT1, CTT, CV0, DE_PARA DRE, ESTRUTURA DRE, CT2
"""

import csv
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any

ENCODING = "latin-1"
SEP = ";"


# ─────────────────────────────────────────────
# Utilitários
# ─────────────────────────────────────────────

def _nivel_conta(cod: str) -> int:
    """Calcula nível hierárquico pelo comprimento do código."""
    cod = cod.strip()
    thresholds = [1, 2, 3, 4, 6, 9]
    for i, t in enumerate(thresholds, 1):
        if len(cod) <= t:
            return i
    return len(thresholds) + 1


def _parse_valor(val: str) -> float:
    """Converte string de valor TOTVS para float. Ex: '147000' → 147000.0"""
    val = val.strip().replace(",", ".")
    try:
        return float(val)
    except ValueError:
        return 0.0


def _parse_date(val: str) -> str | None:
    """Converte 'DD/MM/AAAA' para 'YYYY-MM-DD'. Retorna None se inválido."""
    val = val.strip()
    try:
        return datetime.strptime(val, "%d/%m/%Y").strftime("%Y-%m-%d")
    except ValueError:
        return None


def _periodo(date_str: str | None) -> str | None:
    """Extrai 'YYYY-MM' de 'YYYY-MM-DD'."""
    if not date_str:
        return None
    return date_str[:7]


def _find_header_row(rows: list[list[str]], expected_col: str) -> int:
    """Encontra a linha que contém expected_col (ignora linhas de título/vazias)."""
    for i, row in enumerate(rows):
        if any(expected_col.lower() in c.lower() for c in row):
            return i
    return 0


def _read_csv(path: str) -> tuple[list[str], list[dict]]:
    """Lê arquivo CSV com separador ';' e encoding latin-1."""
    with open(path, encoding=ENCODING, errors="replace") as f:
        content = f.read()

    rows = list(csv.reader(content.splitlines(), delimiter=SEP))
    header_idx = _find_header_row(rows, "Filial")
    headers = [h.strip() for h in rows[header_idx]]
    records = []
    for row in rows[header_idx + 1 :]:
        if not any(c.strip() for c in row):
            continue
        rec = {headers[i]: row[i].strip() if i < len(row) else "" for i in range(len(headers))}
        records.append(rec)
    return headers, records


# ─────────────────────────────────────────────
# CT1 — Plano de Contas
# ─────────────────────────────────────────────

def parse_ct1(path: str) -> list[dict[str, Any]]:
    """Parseia CT1 e retorna lista de contas contábeis."""
    _, records = _read_csv(path)
    contas = []
    for r in records:
        cod = r.get("Cod Conta", "").strip()
        if not cod:
            continue
        contas.append({
            "filial":       r.get("Filial", "01"),
            "cod_conta":    cod,
            "descricao":    r.get("Desc Moeda 1", ""),
            "classe":       r.get("Classe Conta", "Analítica"),
            "cond_normal":  r.get("Cond Normal", "Devedora"),
            "cta_superior": r.get("Cta Superior", "") or None,
            "aceita_cc":    r.get("Aceita CC", "N").upper() == "S",
            "aceita_item":  r.get("Aceita Item", "N").upper() == "S",
            "aceita_clvl":  r.get("Aceita CLVL", "N").upper() == "S",
            "nivel":        _nivel_conta(cod),
        })
    return contas


# ─────────────────────────────────────────────
# CTT — Centros de Custo
# ─────────────────────────────────────────────

def parse_ctt(path: str) -> list[dict[str, Any]]:
    """Parseia CTT e retorna lista de centros de custo."""
    _, records = _read_csv(path)
    ccs = []
    for r in records:
        cod = r.get("C Custo", "").strip()
        if not cod:
            continue
        ccs.append({
            "filial":      r.get("Filial", "01"),
            "cod_cc":      cod,
            "descricao":   r.get("Desc Moeda 1", ""),
            "classe":      r.get("Classe", "Analítico"),
            "cond_normal": r.get("Cond Normal", "Despesa"),
            "cc_superior": r.get("CC Superior", "") or None,
            "bloqueado":   r.get("CC Bloq", "").lower() in ("s", "sim", "bloqueado", "1"),
        })
    return ccs


# ─────────────────────────────────────────────
# CV0 — Entidades DRE (de-para competições)
# ─────────────────────────────────────────────

def parse_cv0(path: str) -> list[dict[str, Any]]:
    """Parseia CV0 e retorna entidades DRE."""
    _, records = _read_csv(path)
    entidades = []
    for r in records:
        cod = r.get("Codigo", "").strip()
        if not cod:
            continue
        entidades.append({
            "filial":       r.get("Filial", "01"),
            "plano_contab": r.get("Plano Contáb", r.get("Plano Contab", "")),
            "item":         r.get("Item", ""),
            "codigo":       cod,
            "descricao":    r.get("Descrição", r.get("Descricao", "")),
            "classe":       r.get("Classe", "Analítica"),
            "cond_normal":  r.get("Cond Normal", "Devedora"),
            "bloqueada":    r.get("Bloqueada", "").lower() in ("s", "sim", "1"),
        })
    return entidades


# ─────────────────────────────────────────────
# CT2 — Lançamentos Contábeis
# ─────────────────────────────────────────────

def parse_ct2(path: str) -> dict[str, Any]:
    """
    Parseia CT2 (lançamentos contábeis).
    Retorna: { lancamentos: [...], periodos: [...], erros: [...], total_lancamentos: int }
    """
    _, records = _read_csv(path)
    lancamentos = []
    erros = []
    periodos: set[str] = set()

    for i, r in enumerate(records):
        tipo = r.get("Tipo Lcto", "").strip()

        # Ignorar linhas de continuação de histórico
        if tipo == "Cont.Hist":
            continue

        cta_deb = r.get("Cta Debito", "").strip() or None
        cta_crd = r.get("Cta Credito", "").strip() or None

        # Ignorar linhas sem contas
        if not cta_deb and not cta_crd:
            continue

        data_str = _parse_date(r.get("Data Lcto", ""))
        if not data_str:
            erros.append(f"Linha {i+1}: data inválida '{r.get('Data Lcto', '')}'")
            continue

        periodo = _periodo(data_str)
        if periodo:
            periodos.add(periodo)

        valor_raw = r.get("Valor", "0")
        valor = _parse_valor(valor_raw)
        valor_m1 = _parse_valor(r.get("Valor Moeda1", valor_raw))

        lancamentos.append({
            "filial":        r.get("Filial", "01"),
            "data_lcto":     data_str,
            "periodo":       periodo,
            "numero_lote":   r.get("Numero Lote", ""),
            "sub_lote":      r.get("Sub Lote", ""),
            "numero_doc":    r.get("Numero Doc", ""),
            "moeda":         r.get("Moeda Lancto", "01"),
            "tipo_lcto":     tipo,
            "cta_debito":    cta_deb,
            "cta_credito":   cta_crd,
            "valor":         valor,
            "hist_pad":      r.get("Hist Pad", "") or None,
            "hist_lanc":     r.get("Hist Lanc", "") or None,
            "c_custo_deb":   r.get("C Custo Deb", "") or None,
            "c_custo_crd":   r.get("C Custo Crd", "") or None,
            "ocorren_deb":   r.get("Ocorren Deb", "") or None,
            "ocorren_crd":   r.get("Ocorren Crd", "") or None,
            "valor_moeda1":  valor_m1,
            "origem":        r.get("Origem", "") or None,
        })

    return {
        "lancamentos":      lancamentos,
        "periodos":         sorted(periodos),
        "total_lancamentos": len(lancamentos),
        "total_valor":      sum(l["valor"] for l in lancamentos),
        "erros":            erros,
    }


if __name__ == "__main__":
    import sys
    import io

    # Force UTF-8 output no Windows
    if sys.stdout.encoding != 'utf-8':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    if len(sys.argv) < 3:
        print("Uso: python parsers.py <tipo> <arquivo.csv>")
        print("Tipos: ct1 | ctt | cv0 | ct2")
        sys.exit(1)

    tipo = sys.argv[1].lower()
    arquivo = sys.argv[2]

    parsers_map = {
        "ct1":  parse_ct1,
        "ctt":  parse_ctt,
        "cv0":  parse_cv0,
        "ct2":  parse_ct2,
    }

    if tipo not in parsers_map:
        print(f"Tipo '{tipo}' não reconhecido. Use: {list(parsers_map.keys())}")
        sys.exit(1)

    resultado = parsers_map[tipo](arquivo)
    print(json.dumps(resultado, ensure_ascii=False, indent=2, default=str))
