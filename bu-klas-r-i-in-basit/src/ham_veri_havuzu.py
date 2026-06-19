"""
Futbol Laboratuvari V1 ham mac veri havuzu.

Bu modul analizlerden once cekilen maclari kaybetmeden saklamak icin kullanilir.
Amac, gecmis testlerin yeniden uretilebilmesini ve ayni macin ikinci kez
kaydedilmemesini saglamaktir.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    from veri_okuyucu import json_dosyasi_yukle, son_mac_sonuclarini_listele
except ImportError:
    from src.veri_okuyucu import json_dosyasi_yukle, son_mac_sonuclarini_listele


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_RAW_POOL_FILE = PROJECT_ROOT / "data" / "ham_mac_havuzu.json"
DEFAULT_SAMPLE_FILE = PROJECT_ROOT / "data" / "football_data_org_ornek.json"


class HamVeriHavuzuHatasi(RuntimeError):
    """Ham veri havuzu islemlerinde olusan hatalar icin kullanilir."""


def simdi_iso() -> str:
    """UTC zaman damgasini ISO formatinda doner."""
    return datetime.now(timezone.utc).isoformat()


def bos_havuz_olustur() -> dict[str, Any]:
    """Bos ham mac havuzu olusturur."""
    return {
        "schema_version": "raw_match_pool_v1",
        "created_at": simdi_iso(),
        "updated_at": simdi_iso(),
        "storage_strategy": "match_id_indexed_raw_matches",
        "match_count": 0,
        "matches": [],
        "sources": [],
        "deduplication": {
            "incoming_matches": 0,
            "duplicate_matches": 0,
            "new_matches_added": 0,
            "total_unique_matches": 0,
        },
    }


def havuz_oku(file_path: str | Path = DEFAULT_RAW_POOL_FILE) -> dict[str, Any]:
    """
    Ham mac havuzunu okur. Dosya yoksa bos havuz doner.
    """
    path = Path(file_path)
    if not path.exists():
        return bos_havuz_olustur()

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise HamVeriHavuzuHatasi(f"Ham veri havuzu JSON bozuk: {path}") from exc
    except OSError as exc:
        raise HamVeriHavuzuHatasi(f"Ham veri havuzu okunamadi: {path}") from exc

    if not isinstance(data, dict):
        raise HamVeriHavuzuHatasi("Ham veri havuzu kok verisi obje olmali.")
    data.setdefault("matches", [])
    data.setdefault("sources", [])
    return data


def havuz_yaz(
    pool: dict[str, Any],
    file_path: str | Path = DEFAULT_RAW_POOL_FILE,
) -> Path:
    """
    Ham mac havuzunu diske yazar.
    """
    path = Path(file_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(pool, ensure_ascii=False, indent=2), encoding="utf-8")
    return path


def mac_tekil_anahtari(match: dict[str, Any]) -> str:
    """
    Mac icin tekrar kontrol anahtari uretir.

    `match_id` varsa ana anahtar olarak kullanilir. Yoksa tarih, takimlar ve lig
    bilgisinden ikincil anahtar olusturulur.
    """
    match_id = match.get("match_id")
    if match_id is not None:
        return f"id:{match_id}"

    return "fallback:{date}:{home}:{away}:{competition}".format(
        date=match.get("utc_date") or "",
        home=match.get("home_team_id") or match.get("home_team_name") or "",
        away=match.get("away_team_id") or match.get("away_team_name") or "",
        competition=match.get("competition_id") or match.get("competition_name") or "",
    )


def mac_kaynagi_ekle(match: dict[str, Any], source: str) -> dict[str, Any]:
    """Mac kaydina kaynak metadata'si ekler."""
    enriched = dict(match)
    enriched.setdefault("source", source)
    enriched.setdefault("stored_at", simdi_iso())
    enriched.setdefault("raw_pool_key", mac_tekil_anahtari(match))
    return enriched


def maclari_havuza_ekle(
    pool: dict[str, Any],
    matches: list[dict[str, Any]],
    source: str,
) -> tuple[dict[str, Any], dict[str, int]]:
    """
    Maclari tekrar etmeden ham havuza ekler.
    """
    existing_by_key = {
        mac_tekil_anahtari(match): match
        for match in pool.get("matches", [])
    }
    duplicate_count = 0
    before_count = len(existing_by_key)

    for match in matches:
        key = mac_tekil_anahtari(match)
        if key in existing_by_key:
            duplicate_count += 1
        existing_by_key[key] = mac_kaynagi_ekle(match, source)

    merged_matches = sorted(
        existing_by_key.values(),
        key=lambda item: item.get("utc_date") or "",
        reverse=True,
    )
    duplicate_report = {
        "incoming_matches": len(matches),
        "duplicate_matches": duplicate_count,
        "new_matches_added": len(merged_matches) - before_count,
        "total_unique_matches": len(merged_matches),
    }

    sources = pool.get("sources", [])
    sources.append(
        {
            "source": source,
            "added_at": simdi_iso(),
            "incoming_matches": len(matches),
            "new_matches_added": duplicate_report["new_matches_added"],
        }
    )

    pool["matches"] = merged_matches
    pool["sources"] = sources
    pool["match_count"] = len(merged_matches)
    pool["updated_at"] = simdi_iso()
    pool["deduplication"] = duplicate_report
    return pool, duplicate_report


def football_data_org_ornekten_havuz_uret(
    sample_file: str | Path = DEFAULT_SAMPLE_FILE,
) -> dict[str, Any]:
    """
    Mevcut football-data.org ornek dosyasindan ham mac havuzu uretir.
    """
    data = json_dosyasi_yukle(sample_file)
    matches = son_mac_sonuclarini_listele(data)
    pool = bos_havuz_olustur()
    pool, _ = maclari_havuza_ekle(pool, matches, source="football_data_org_ornek")
    pool["competition_code"] = data.get("competition_code")
    return pool


if __name__ == "__main__":
    pool = football_data_org_ornekten_havuz_uret()
    print(json.dumps(pool, ensure_ascii=False, indent=2))
