"""
Futbol Laboratuvari V1 icin Form Puani Motoru.

Bu modul `veri_okuyucu.py` tarafindan okunan mac verilerini kullanarak takim
bazli son mac form raporu uretir.

Form Puani 0-100 araliginda hesaplanir.

Formul:

1. Sonuc puani, 45 puan:
   - Galibiyet 3 puan, beraberlik 1 puan, maglubiyet 0 puan.
   - result_score = (points / (match_count * 3)) * 45

2. Gol uretim puani, 20 puan:
   - Mac basina 2.00 ve uzeri gol tam puan kabul edilir.
   - attack_score = min(goals_for_avg / 2.0, 1.0) * 20

3. Savunma puani, 20 puan:
   - Mac basina 0 gol yemek tam puan, 2.00 ve uzeri gol yemek 0 puan kabul edilir.
   - defense_score = max(0, 1 - (goals_against_avg / 2.0)) * 20

4. Ev/deplasman performans puani, 10 puan:
   - Ev ve deplasman maclarindaki puan oranlari ayri hesaplanir.
   - Veri varsa bu oranlarin ortalamasi alinir.
   - venue_score = average(venue_points_ratio) * 10

5. Momentum puani, 5 puan:
   - Son maclarin sonuc serisine gore hesaplanir.
   - Son 3 mac galibiyet: 5
   - Son 2 mac galibiyet: 4
   - Son mac galibiyet: 3
   - Son mac beraberlik: 2
   - Son mac maglubiyet: 0

Nihai:

form_score = result_score + attack_score + defense_score + venue_score + momentum_score

Veri notu:

Takim icin 3'ten az mac varsa `confidence` alani `low` doner. Bu durumda
puan hesaplanir ama kupon motorunda tek basina guclu sinyal sayilmamalidir.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

try:
    from confidence_motoru import confidence_from_match_count
    from veri_okuyucu import son_mac_sonuclarini_listele, veri_ozeti_uret
except ImportError:  # Paket olarak calistirildiginda kullanilir.
    from src.confidence_motoru import confidence_from_match_count
    from src.veri_okuyucu import son_mac_sonuclarini_listele, veri_ozeti_uret


WIN = "W"
DRAW = "D"
LOSS = "L"


@dataclass
class TeamMatchResult:
    """Bir maci takim acisindan sade sonuc formatinda temsil eder."""

    match_id: int | str | None
    utc_date: str | None
    venue: str
    opponent_id: int | str | None
    opponent_name: str | None
    goals_for: int
    goals_against: int
    result: str
    points: int


def takim_maclarini_filtrele(
    matches: list[dict[str, Any]], team_id: int | str
) -> list[dict[str, Any]]:
    """
    Verilen takim kimligine ait maclari secer.

    Args:
        matches: `veri_okuyucu` tarafindan donen mac listesi.
        team_id: Analiz edilecek takim kimligi.

    Returns:
        Takimin ev sahibi veya deplasman oldugu maclar.
    """
    return [
        match
        for match in matches
        if match.get("home_team_id") == team_id or match.get("away_team_id") == team_id
    ]


def son_maclari_sec(
    matches: list[dict[str, Any]], limit: int = 5
) -> list[dict[str, Any]]:
    """
    Bitmis maclari tarihe gore yeniden eskiye siralar ve son maclari secer.

    Args:
        matches: Mac listesi.
        limit: Secilecek maksimum mac sayisi.

    Returns:
        Tarihe gore en yeni `limit` mac.
    """
    finished_matches = [
        match for match in matches if match.get("status") == "FINISHED"
    ]
    return sorted(
        finished_matches,
        key=lambda match: match.get("utc_date") or "",
        reverse=True,
    )[:limit]


def takim_acisindan_mac_sonucu(
    match: dict[str, Any], team_id: int | str
) -> TeamMatchResult:
    """
    Bir maci analiz edilen takim acisindan sonuc objesine donusturur.

    Args:
        match: Tek mac verisi.
        team_id: Analiz edilen takim kimligi.

    Returns:
        Takim acisindan gol, rakip, saha, sonuc ve puan bilgisi.
    """
    is_home = match.get("home_team_id") == team_id

    if is_home:
        goals_for = int(match.get("home_goals") or 0)
        goals_against = int(match.get("away_goals") or 0)
        opponent_id = match.get("away_team_id")
        opponent_name = match.get("away_team_name")
        venue = "home"
    else:
        goals_for = int(match.get("away_goals") or 0)
        goals_against = int(match.get("home_goals") or 0)
        opponent_id = match.get("home_team_id")
        opponent_name = match.get("home_team_name")
        venue = "away"

    if goals_for > goals_against:
        result = WIN
        points = 3
    elif goals_for == goals_against:
        result = DRAW
        points = 1
    else:
        result = LOSS
        points = 0

    return TeamMatchResult(
        match_id=match.get("match_id"),
        utc_date=match.get("utc_date"),
        venue=venue,
        opponent_id=opponent_id,
        opponent_name=opponent_name,
        goals_for=goals_for,
        goals_against=goals_against,
        result=result,
        points=points,
    )


def momentum_puani_hesapla(result_sequence: list[str]) -> int:
    """
    Sonuc dizisine gore 0-5 arasi momentum puani hesaplar.

    Args:
        result_sequence: Yeniden eskiye sirali W/D/L sonuc listesi.

    Returns:
        Momentum puani.
    """
    if len(result_sequence) >= 3 and result_sequence[:3] == [WIN, WIN, WIN]:
        return 5
    if len(result_sequence) >= 2 and result_sequence[:2] == [WIN, WIN]:
        return 4
    if result_sequence and result_sequence[0] == WIN:
        return 3
    if result_sequence and result_sequence[0] == DRAW:
        return 2
    return 0


def guven_seviyesi_uret(match_count: int) -> str:
    """
    Sayisal V1 confidence standardina gore seviye hesaplar.

    Seviyeler:
    - 0-39: low
    - 40-64: medium
    - 65-84: high
    - 85-100: very_high
    """
    return confidence_from_match_count(match_count)["confidence"]


def form_etiketi_uret(form_score: float) -> str:
    """
    Form puanini okunabilir etikete cevirir.

    Args:
        form_score: 0-100 arasi form puani.

    Returns:
        Form etiketi.
    """
    if form_score >= 85:
        return "cok_guclu_form"
    if form_score >= 70:
        return "guclu_form"
    if form_score >= 55:
        return "orta_ustu_form"
    if form_score >= 40:
        return "orta_form"
    if form_score >= 25:
        return "zayif_form"
    return "cok_zayif_form"


def venue_performansi_hesapla(
    team_results: list[TeamMatchResult], venue: str
) -> dict[str, Any]:
    """
    Ev sahibi veya deplasman performansini hesaplar.

    Args:
        team_results: Takim acisindan mac sonuc listesi.
        venue: `home` veya `away`.

    Returns:
        Mac sayisi, puan, galibiyet/beraberlik/maglubiyet ve gol ortalamalari.
    """
    venue_results = [result for result in team_results if result.venue == venue]
    match_count = len(venue_results)
    points = sum(result.points for result in venue_results)
    goals_for = sum(result.goals_for for result in venue_results)
    goals_against = sum(result.goals_against for result in venue_results)

    return {
        "matches": match_count,
        "wins": sum(1 for result in venue_results if result.result == WIN),
        "draws": sum(1 for result in venue_results if result.result == DRAW),
        "losses": sum(1 for result in venue_results if result.result == LOSS),
        "points": points,
        "points_per_match": round(points / match_count, 2) if match_count else 0,
        "goals_for_avg": round(goals_for / match_count, 2) if match_count else 0,
        "goals_against_avg": round(goals_against / match_count, 2)
        if match_count
        else 0,
    }


def form_puani_hesapla(team_results: list[TeamMatchResult]) -> dict[str, Any]:
    """
    Takim mac sonuclarindan detayli form puani bilesenlerini hesaplar.

    Args:
        team_results: Takim acisindan son mac sonuc listesi.

    Returns:
        Form puani bilesenlerini ve nihai puani iceren sozluk.
    """
    match_count = len(team_results)
    if match_count == 0:
        return {
            "form_score": 0,
            "form_label": "veri_yok",
            "confidence": "none",
            "score_parts": {
                "result_score": 0,
                "attack_score": 0,
                "defense_score": 0,
                "venue_score": 0,
                "momentum_score": 0,
            },
        }

    points = sum(result.points for result in team_results)
    goals_for = sum(result.goals_for for result in team_results)
    goals_against = sum(result.goals_against for result in team_results)
    goals_for_avg = goals_for / match_count
    goals_against_avg = goals_against / match_count

    result_score = (points / (match_count * 3)) * 45
    attack_score = min(goals_for_avg / 2.0, 1.0) * 20
    defense_score = max(0, 1 - (goals_against_avg / 2.0)) * 20

    venue_ratios = []
    for venue in ("home", "away"):
        venue_results = [result for result in team_results if result.venue == venue]
        if venue_results:
            venue_points = sum(result.points for result in venue_results)
            venue_ratios.append(venue_points / (len(venue_results) * 3))

    venue_score = (
        (sum(venue_ratios) / len(venue_ratios)) * 10 if venue_ratios else 5
    )

    result_sequence = [result.result for result in team_results]
    momentum_score = momentum_puani_hesapla(result_sequence)

    form_score = (
        result_score + attack_score + defense_score + venue_score + momentum_score
    )
    form_score = max(0, min(100, form_score))

    return {
        "form_score": round(form_score, 2),
        "form_label": form_etiketi_uret(form_score),
        "confidence": guven_seviyesi_uret(match_count),
        "score_parts": {
            "result_score": round(result_score, 2),
            "attack_score": round(attack_score, 2),
            "defense_score": round(defense_score, 2),
            "venue_score": round(venue_score, 2),
            "momentum_score": round(momentum_score, 2),
        },
    }


def takim_form_raporu_uret(
    matches: list[dict[str, Any]], team_id: int | str, team_name: str | None = None
) -> dict[str, Any]:
    """
    Bir takim icin son 5 mac form raporu uretir.

    Args:
        matches: Mac listesi.
        team_id: Analiz edilecek takim kimligi.
        team_name: Opsiyonel takim adi.

    Returns:
        Galibiyet, beraberlik, maglubiyet, gol ortalamalari, ev/deplasman
        performansi, momentum ve form puanini iceren rapor.
    """
    team_matches = takim_maclarini_filtrele(matches, team_id)
    last_matches = son_maclari_sec(team_matches, limit=5)
    team_results = [
        takim_acisindan_mac_sonucu(match, team_id) for match in last_matches
    ]

    match_count = len(team_results)
    wins = sum(1 for result in team_results if result.result == WIN)
    draws = sum(1 for result in team_results if result.result == DRAW)
    losses = sum(1 for result in team_results if result.result == LOSS)
    points = sum(result.points for result in team_results)
    goals_for = sum(result.goals_for for result in team_results)
    goals_against = sum(result.goals_against for result in team_results)
    result_sequence = [result.result for result in team_results]
    score_info = form_puani_hesapla(team_results)

    inferred_team_name = team_name
    if inferred_team_name is None and last_matches:
        first_match = last_matches[0]
        inferred_team_name = (
            first_match.get("home_team_name")
            if first_match.get("home_team_id") == team_id
            else first_match.get("away_team_name")
        )

    return {
        "team_id": team_id,
        "team_name": inferred_team_name,
        "match_count": match_count,
        "wins": wins,
        "draws": draws,
        "losses": losses,
        "points": points,
        "points_per_match": round(points / match_count, 2) if match_count else 0,
        "goals_for": goals_for,
        "goals_against": goals_against,
        "goal_difference": goals_for - goals_against,
        "goals_for_avg": round(goals_for / match_count, 2) if match_count else 0,
        "goals_against_avg": round(goals_against / match_count, 2)
        if match_count
        else 0,
        "home_performance": venue_performansi_hesapla(team_results, "home"),
        "away_performance": venue_performansi_hesapla(team_results, "away"),
        "momentum_score": score_info["score_parts"]["momentum_score"],
        "result_sequence": "-".join(result_sequence),
        "form_score": score_info["form_score"],
        "form_label": score_info["form_label"],
        "confidence": score_info["confidence"],
        "score_parts": score_info["score_parts"],
        "matches": [result.__dict__ for result in team_results],
    }


def tum_takimlar_form_raporu_uret() -> list[dict[str, Any]]:
    """
    Yerel ornek veriden tum takimlar icin form raporu uretir.

    Returns:
        Puan durumundaki tum takimlar icin form raporu listesi.
    """
    summary = veri_ozeti_uret()
    teams = summary["teams"]
    matches = son_mac_sonuclarini_listele(
        {
            "competition_code": summary["league"]["competition_code"],
            "standings": summary["standings_table"],
            "recent_results": summary["recent_results"],
        }
    )

    return [
        takim_form_raporu_uret(
            matches,
            team_id=team["team_id"],
            team_name=team["team_name"],
        )
        for team in teams
    ]


if __name__ == "__main__":
    reports = tum_takimlar_form_raporu_uret()
    example_reports = [
        report for report in reports if report["match_count"] > 0
    ][:5]
    print(json.dumps(example_reports, ensure_ascii=False, indent=2))
