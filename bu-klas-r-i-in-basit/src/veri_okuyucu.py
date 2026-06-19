"""
Futbol Laboratuvari V1 icin yerel JSON veri okuyucu.

Bu modul `data/football_data_org_ornek.json` dosyasini okur ve temel
bilgileri analiz katmanlarinin kullanabilecegi parcalara ayirir:

- Lig bilgisi
- Takim listesi
- Puan durumu tablosu
- Son mac sonuclari
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATA_FILE = PROJECT_ROOT / "data" / "football_data_org_ornek.json"


class VeriOkumaHatasi(RuntimeError):
    """Veri dosyasi okunamadiginda veya beklenen formatta olmadiginda kullanilir."""


def json_dosyasi_yukle(file_path: str | Path = DEFAULT_DATA_FILE) -> dict[str, Any]:
    """
    JSON veri dosyasini yukler.

    Args:
        file_path: Okunacak JSON dosyasinin yolu.

    Returns:
        JSON icerigini sozluk olarak doner.

    Raises:
        VeriOkumaHatasi: Dosya yoksa, JSON bozuksa veya kok veri obje degilse.
    """
    path = Path(file_path)

    if not path.exists():
        raise VeriOkumaHatasi(f"Veri dosyasi bulunamadi: {path}")

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise VeriOkumaHatasi(f"JSON dosyasi okunamadi: {path}") from exc
    except OSError as exc:
        raise VeriOkumaHatasi(f"Dosya okuma hatasi: {path}") from exc

    if not isinstance(data, dict):
        raise VeriOkumaHatasi("JSON kok verisi sozluk/object formatinda olmali.")

    return data


def beklenen_alanlari_kontrol_et(data: dict[str, Any]) -> None:
    """
    Ana veri yapisinda beklenen alanlarin varligini kontrol eder.

    Args:
        data: Yuklenmis JSON verisi.

    Raises:
        VeriOkumaHatasi: Zorunlu alanlardan biri eksikse veya liste degilse.
    """
    required_fields = ("competition_code", "standings", "recent_results")
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        raise VeriOkumaHatasi(
            "Veri dosyasinda zorunlu alan eksik: " + ", ".join(missing_fields)
        )

    if not isinstance(data["standings"], list):
        raise VeriOkumaHatasi("`standings` alani liste olmali.")

    if not isinstance(data["recent_results"], list):
        raise VeriOkumaHatasi("`recent_results` alani liste olmali.")


def lig_bilgisi_cikar(data: dict[str, Any]) -> dict[str, Any]:
    """
    Veri dosyasindan lig bilgisini cikarir.

    Args:
        data: Yuklenmis JSON verisi.

    Returns:
        Lig kodu, lig adi ve veri adetlerini iceren kisa sozluk.
    """
    beklenen_alanlari_kontrol_et(data)
    recent_results = data["recent_results"]
    first_match = recent_results[0] if recent_results else {}

    return {
        "competition_code": data["competition_code"],
        "competition_id": first_match.get("competition_id"),
        "competition_name": first_match.get("competition_name"),
        "team_count": len(data["standings"]),
        "recent_match_count": len(recent_results),
    }


def takim_listesi_cikar(data: dict[str, Any]) -> list[dict[str, Any]]:
    """
    Puan durumundan takim listesini cikarir.

    Args:
        data: Yuklenmis JSON verisi.

    Returns:
        `team_id`, `team_name` ve `position` alanlarini iceren takim listesi.
    """
    beklenen_alanlari_kontrol_et(data)

    teams = []
    for row in data["standings"]:
        teams.append(
            {
                "team_id": row.get("team_id"),
                "team_name": row.get("team_name"),
                "position": row.get("position"),
            }
        )

    return teams


def puan_durumu_tablosu_uret(data: dict[str, Any]) -> list[dict[str, Any]]:
    """
    Puan durumunu tablo satirlari halinde uretir.

    Args:
        data: Yuklenmis JSON verisi.

    Returns:
        Pozisyon, takim, oynanan mac, galibiyet, beraberlik, maglubiyet,
        gol ve puan bilgilerini iceren liste.
    """
    beklenen_alanlari_kontrol_et(data)

    table = []
    for row in data["standings"]:
        table.append(
            {
                "position": row.get("position"),
                "team_id": row.get("team_id"),
                "team_name": row.get("team_name"),
                "played_games": row.get("played_games"),
                "won": row.get("won"),
                "draw": row.get("draw"),
                "lost": row.get("lost"),
                "points": row.get("points"),
                "goals_for": row.get("goals_for"),
                "goals_against": row.get("goals_against"),
                "goal_difference": row.get("goal_difference"),
            }
        )

    return table


def son_mac_sonuclarini_listele(data: dict[str, Any]) -> list[dict[str, Any]]:
    """
    Son mac sonuclarini standart liste formatinda doner.

    Args:
        data: Yuklenmis JSON verisi.

    Returns:
        Mac tarihi, takimlar, skor ve kazanan bilgilerini iceren liste.
    """
    beklenen_alanlari_kontrol_et(data)

    matches = []
    for match in data["recent_results"]:
        matches.append(
            {
                "match_id": match.get("match_id"),
                "utc_date": match.get("utc_date"),
                "competition_id": match.get("competition_id"),
                "competition_name": match.get("competition_name"),
                "matchday": match.get("matchday"),
                "status": match.get("status"),
                "home_team_id": match.get("home_team_id"),
                "home_team_name": match.get("home_team_name"),
                "away_team_id": match.get("away_team_id"),
                "away_team_name": match.get("away_team_name"),
                "home_goals": match.get("home_goals"),
                "away_goals": match.get("away_goals"),
                "winner": match.get("winner"),
            }
        )

    return matches


def veri_ozeti_uret(file_path: str | Path = DEFAULT_DATA_FILE) -> dict[str, Any]:
    """
    Yerel JSON dosyasindan V1 icin temel veri ozetini uretir.

    Args:
        file_path: Okunacak JSON dosyasinin yolu.

    Returns:
        Lig bilgisi, takim listesi, puan durumu ve son maclari iceren sozluk.
    """
    data = json_dosyasi_yukle(file_path)

    return {
        "league": lig_bilgisi_cikar(data),
        "teams": takim_listesi_cikar(data),
        "standings_table": puan_durumu_tablosu_uret(data),
        "recent_results": son_mac_sonuclarini_listele(data),
    }


if __name__ == "__main__":
    try:
        summary = veri_ozeti_uret()
        print(json.dumps(summary, ensure_ascii=False, indent=2))
    except VeriOkumaHatasi as exc:
        print(f"Veri okuma hatasi: {exc}")

