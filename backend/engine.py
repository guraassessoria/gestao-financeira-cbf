"""
engine.py — Engine contábil CBF
Calcula DRE, saldos por conta, por centro de custo e por competição.
ITG 2002 (R1) — Entidade sem fins lucrativos.
"""

from __future__ import annotations
from collections import defaultdict
from typing import Any


# ─────────────────────────────────────────────
# 1. Saldos por conta / CC a partir dos lançamentos CT2
# ─────────────────────────────────────────────

def calcular_saldos(
    lancamentos: list[dict],
    periodos: list[str] | None = None,
) -> dict[str, dict[str, float]]:
    """
    Agrupa lançamentos por conta contábil e calcula débitos, créditos e saldo.
    Retorna: { cod_conta: { debito, credito, saldo } }
    Filtra por lista de períodos se fornecida.
    """
    saldos: dict[str, dict[str, float]] = defaultdict(
        lambda: {"debito": 0.0, "credito": 0.0, "saldo": 0.0}
    )

    for l in lancamentos:
        if periodos and l.get("periodo") not in periodos:
            continue
        if l.get("tipo_lcto") != "Partida Dobrada":
            continue

        valor = float(l.get("valor", 0))

        if l.get("cta_debito"):
            saldos[l["cta_debito"]]["debito"] += valor

        if l.get("cta_credito"):
            saldos[l["cta_credito"]]["credito"] += valor

    # Calcula saldo = débito - crédito (convenção Devedora)
    for cod, s in saldos.items():
        s["saldo"] = s["debito"] - s["credito"]

    return dict(saldos)


def calcular_saldos_por_cc(
    lancamentos: list[dict],
    periodos: list[str] | None = None,
) -> dict[tuple[str, str], dict[str, float]]:
    """
    Agrupa por (cod_conta, cod_cc) para análise por competição.
    Retorna: { (cod_conta, cod_cc): { debito, credito, saldo } }
    """
    saldos: dict[tuple, dict[str, float]] = defaultdict(
        lambda: {"debito": 0.0, "credito": 0.0, "saldo": 0.0}
    )

    for l in lancamentos:
        if periodos and l.get("periodo") not in periodos:
            continue
        if l.get("tipo_lcto") != "Partida Dobrada":
            continue

        valor = float(l.get("valor", 0))

        if l.get("cta_debito") and l.get("c_custo_deb"):
            key = (l["cta_debito"], l["c_custo_deb"])
            saldos[key]["debito"] += valor

        if l.get("cta_credito") and l.get("c_custo_crd"):
            key = (l["cta_credito"], l["c_custo_crd"])
            saldos[key]["credito"] += valor

    for key, s in saldos.items():
        s["saldo"] = s["debito"] - s["credito"]

    return dict(saldos)


# ─────────────────────────────────────────────
# 2. Consolidar DRE hierárquica (bottom-up)
# ─────────────────────────────────────────────

def consolidar_dre(
    valores_analiticos: dict[str, float],
    estrutura: list[dict],
) -> dict[str, float]:
    """
    Soma valores analíticos para cima na hierarquia (bottom-up).
    Retorna: { codigo_conta: valor_consolidado }
    """
    # Ordenar por nível descendente para processar filhos antes dos pais
    estrutura_sorted = sorted(estrutura, key=lambda x: x.get("nivel", 1), reverse=True)
    idx: dict[str, dict] = {e["codigo_conta"]: e for e in estrutura}

    valores: dict[str, float] = dict(valores_analiticos)

    for linha in estrutura_sorted:
        cod = linha["codigo_conta"]
        superior = linha.get("codigo_cta_superior")
        val = valores.get(cod, 0.0)

        if superior and superior in idx:
            valores[superior] = valores.get(superior, 0.0) + val

    return valores


# ─────────────────────────────────────────────
# 3. Montar árvore DRE para renderização
# ─────────────────────────────────────────────

def montar_arvore_dre(
    valores_consolidados: dict[str, float],
    estrutura: list[dict],
    nivel_visualizacao_max: int = 3,
    valores_anteriores: dict[str, float] | None = None,
) -> list[dict[str, Any]]:
    """
    Monta a árvore hierárquica da DRE para o frontend.
    Retorna lista de nós raiz com filhos aninhados.
    """
    idx: dict[str, dict] = {e["codigo_conta"]: e for e in estrutura}
    filhos: dict[str, list[str]] = defaultdict(list)

    for e in estrutura:
        superior = e.get("codigo_cta_superior")
        if superior:
            filhos[super].append(e["codigo_conta"])

    def _montar_no(cod: str) -> dict[str, Any]:
        linha = idx.get(cod, {})
        valor = valores_consolidados.get(cod, 0.0)
        valor_ant = (valores_anteriores or {}).get(cod)

        variacao_abs = (valor - valor_ant) if valor_ant is not None else None
        variacao_pct = (
            ((valor - valor_ant) / abs(valor_ant) * 100)
            if valor_ant and valor_ant != 0
            else None
        )

        return {
            "codigo_conta":       cod,
            "descricao":          linha.get("descricao_conta", cod),
            "nivel":              linha.get("nivel", 1),
            "nivel_visualizacao": linha.get("nivel_visualizacao", 1),
            "valor":              valor,
            "valor_anterior":     valor_ant,
            "variacao_absoluta":  variacao_abs,
            "variacao_percentual": variacao_pct,
            "filhos": [
                _montar_no(f)
                for f in filhos.get(cod, [])
                if idx.get(f, {}).get("nivel_visualizacao", 1) <= nivel_visualizacao_max
            ],
        }

    # Raízes = sem superior
    raizes = [
        e["codigo_conta"]
        for e in estrutura
        if not e.get("codigo_cta_superior")
    ]

    return [_montar_no(r) for r in raizes]


# ─────────────────────────────────────────────
# 4. Análise por Centro de Custo / Competição
# ─────────────────────────────────────────────

def calcular_analise_cc(
    lancamentos: list[dict],
    ctt: list[dict],
    ct1: list[dict],
    periodos: list[str] | None = None,
) -> list[dict[str, Any]]:
    """
    Agrupa receitas, custos e despesas por centro de custo.
    """
    ct1_idx = {c["cod_conta"]: c for c in ct1}
    ctt_idx  = {c["cod_cc"]: c for c in ctt}

    # Determinar cond_normal de cada conta (Devedora/Credora)
    def eh_receita(cod_conta: str) -> bool:
        conta = ct1_idx.get(cod_conta, {})
        return conta.get("cond_normal", "Devedora") == "Credora"

    agrupado: dict[str, dict[str, float]] = defaultdict(
        lambda: {"receitas": 0.0, "custos": 0.0, "despesas": 0.0}
    )

    for l in lancamentos:
        if periodos and l.get("periodo") not in periodos:
            continue
        if l.get("tipo_lcto") != "Partida Dobrada":
            continue

        valor = float(l.get("valor", 0))

        for lado in [("cta_debito", "c_custo_deb"), ("cta_credito", "c_custo_crd")]:
            conta_key, cc_key = lado
            cod_conta = l.get(conta_key)
            cod_cc = l.get(cc_key)

            if not cod_conta or not cod_cc:
                continue

            # Classificação simples pelo cond_normal
            if eh_receita(cod_conta):
                if cc_key == "c_custo_crd":
                    agrupado[cod_cc]["receitas"] += valor
            else:
                nivel = len(cod_conta)
                if nivel <= 4:  # custo (custos com futebol geralmente)
                    agrupado[cod_cc]["custos"] += valor
                else:
                    agrupado[cod_cc]["despesas"] += valor

    resultado = []
    for cod_cc, valores in sorted(agrupado.items()):
        cc_info = ctt_idx.get(cod_cc, {})
        rec = valores["receitas"]
        cus = valores["custos"]
        des = valores["despesas"]
        total_saidas = cus + des
        resultado.append({
            "cod_cc":              cod_cc,
            "descricao":           cc_info.get("descricao", cod_cc),
            "bloqueado":           cc_info.get("bloqueado", False),
            "receitas":            rec,
            "custos":              cus,
            "despesas":            des,
            "resultado":           rec - total_saidas,
            "percentual_receita":  (rec / total_saidas * 100) if total_saidas else 0,
        })

    return resultado
