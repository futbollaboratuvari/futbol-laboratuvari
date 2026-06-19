"""Robot ciktilarini web site repo klasorune esitleyen yardimci modul."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SITE_REPO = Path.home() / "Documents" / "GitHub" / "futbol-laboratuvari"
DEFAULT_COMMIT_MESSAGE = "Gunluk robot verileri web sitesine aktarildi"
ANALYSIS_FILE = "analiz_sonuclari.json"

SYNC_FILES = [
    ("data", "canli-veri.json"),
    ("data", ANALYSIS_FILE),
    ("data", "ham_mac_havuzu.json"),
    ("data", "tahmin_gecmisi.json"),
    ("outputs", "bugunun_en_guclu_maclari.md"),
    ("outputs", "mackolik_veri_cekme_raporu.md"),
    ("outputs", "basari_yuzdesi_raporu.md"),
]


def get_site_repo_path() -> Path:
    """Web site repo yolunu ortam degiskeninden veya varsayilan konumdan al."""
    env_path = os.getenv("FUTBOL_LAB_SITE_REPO") or os.getenv("WEBSITE_REPO_PATH")
    if env_path:
        return Path(env_path).expanduser().resolve()
    return DEFAULT_SITE_REPO


def clean_cell(value: str) -> str:
    """Markdown tablo hucrelerini JSON icin sade metne cevir."""
    return value.replace("<br>", " / ").replace("<br/>", " / ").replace("<br />", " / ").strip()


def markdown_table(markdown: str, heading: str) -> list[dict[str, str]]:
    """Belirli baslik altindaki ilk markdown tabloyu oku."""
    lines = markdown.splitlines()
    head_index = next((i for i, line in enumerate(lines) if heading.lower() in line.lower()), -1)
    if head_index < 0:
        return []

    table_start = next((i for i, line in enumerate(lines[head_index + 1 :], head_index + 1) if line.strip().startswith("|")), -1)
    if table_start < 0 or table_start + 2 > len(lines):
        return []

    headers = [clean_cell(cell) for cell in lines[table_start].split("|")[1:-1]]
    rows: list[dict[str, str]] = []

    for line in lines[table_start + 2 :]:
        if not line.strip().startswith("|"):
            break
        cells = [clean_cell(cell) for cell in line.split("|")[1:-1]]
        rows.append({header: cells[index] if index < len(cells) else "" for index, header in enumerate(headers)})

    return rows


def split_match(match: str) -> tuple[str, str]:
    """Mac adindan ev sahibi/deplasman alanlarini cikarmaya calis."""
    if " - " in match:
        home, away = match.split(" - ", 1)
        return home.strip(), away.strip()
    if " vs " in match.lower():
        parts = match.split(" vs ", 1)
        return parts[0].strip(), parts[1].strip()
    return match.strip(), ""


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def is_demo_report(markdown: str) -> bool:
    """Demo raporlar web sitesinde kupon olarak gosterilmez."""
    text = markdown.lower()
    return "calisma_modu: demo" in text or "demo modda" in text


def build_live_rows() -> list[dict[str, str]]:
    """Robot raporundan web sitesinin okuyacagi canli veri satirlarini uret."""
    report_path = PROJECT_ROOT / "outputs" / "bugunun_en_guclu_maclari.md"
    if not report_path.exists():
        return []

    markdown = report_path.read_text(encoding="utf-8", errors="ignore")
    if is_demo_report(markdown):
        return []

    rows = markdown_table(markdown, "Skorlanan Maclar")
    live_rows: list[dict[str, str]] = []
    for row in rows:
        match = row.get("Mac", "")
        home, away = split_match(match)
        live_rows.append(
            {
                "date": row.get("Tarih", ""),
                "league": row.get("Lig", ""),
                "match": match,
                "home_team": home,
                "away_team": away,
                "type": "Canli Veri",
                "prediction": row.get("En Guclu Market", ""),
                "market": row.get("En Guclu Market", ""),
                "odds": row.get("Oran", ""),
                "confidence": row.get("Confidence", ""),
                "power_score": row.get("Guc Skoru", ""),
                "score_prediction": row.get("Skor Tahmini", ""),
                "result_score": row.get("Gercek Skor", ""),
                "status": row.get("Sonuc", "Bekliyor") or "Bekliyor",
                "risk": row.get("Risk", ""),
                "source": "robot",
            }
        )

    return live_rows


def coupon_item(row: dict[str, str], item_type: str, index: int) -> dict[str, object]:
    """Markdown kupon satirini web sitesinin okuyacagi analiz objesine cevir."""
    match = row.get("Mac") or row.get("Maclar") or ""
    market = row.get("Market") or row.get("Marketler") or ""
    score = row.get("Oneri Skoru") or row.get("Kupon Skoru") or row.get("Guc") or ""
    confidence = row.get("Confidence") or score
    risk = row.get("Risk") or ""
    signals = []
    for label, key in [
        ("Güç", "Guc"),
        ("KG Var", "KG Var"),
        ("Üst 2.5", "Ust 2.5"),
        ("Skor", "Oneri Skoru"),
        ("Kupon Skoru", "Kupon Skoru"),
    ]:
        value = row.get(key)
        if value:
            signals.append(f"{label}: {value}")

    return {
        "id": f"{item_type}-{index}",
        "type": item_type,
        "match": match,
        "market": market,
        "prediction": market,
        "selection": market,
        "confidence_score": confidence,
        "score": score,
        "risk_level": risk,
        "risk": risk,
        "odds": row.get("Oran", "-"),
        "status": "takipte",
        "pro_signals": signals or ["Robot canlı veri raporu"],
        "commentary": "Günün maç listesi ve robot skorlaması üzerinden oluşturuldu.",
        "source": "robot_live_report",
    }


def build_analysis_history() -> dict[str, object]:
    """Robotun canlı kupon raporunu site veri formatina cevir."""
    report_path = PROJECT_ROOT / "outputs" / "bugunun_en_guclu_maclari.md"
    result: dict[str, object] = {
        "generated_at": now_iso(),
        "timezone": "Europe/Istanbul",
        "source": "Robot canlı analiz bekleniyor",
        "active_items": [],
        "completed_items": [],
    }

    if not report_path.exists():
        return result

    markdown = report_path.read_text(encoding="utf-8", errors="ignore")
    if is_demo_report(markdown):
        result["source"] = "Demo rapor site kuponuna aktarılmadı"
        return result

    items: list[dict[str, object]] = []
    for index, row in enumerate(markdown_table(markdown, "Tek Mac Onerileri"), start=1):
        items.append(coupon_item(row, "Tekli", index))
    for index, row in enumerate(markdown_table(markdown, "2'li Kupon Onerileri"), start=1):
        items.append(coupon_item(row, "2'li", index))
    for index, row in enumerate(markdown_table(markdown, "3'lu Kupon Onerileri"), start=1):
        items.append(coupon_item(row, "3'lü", index))

    result["source"] = "Robot canlı kupon raporu"
    result["active_items"] = items
    return result


def write_live_data() -> Path:
    """data/canli-veri.json dosyasini robot raporundan yeniden uret."""
    target = PROJECT_ROOT / "data" / "canli-veri.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(build_live_rows(), ensure_ascii=False, indent=2), encoding="utf-8")
    return target


def write_analysis_data() -> Path:
    """data/analiz_sonuclari.json dosyasini robot kupon raporundan yeniden uret."""
    target = PROJECT_ROOT / "data" / ANALYSIS_FILE
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(build_analysis_history(), ensure_ascii=False, indent=2), encoding="utf-8")
    return target


def find_git() -> str | None:
    """PATH veya bilinen Windows konumlarindan git calistiricisini bul."""
    candidates = [
        "git",
        str(Path(os.environ.get("ProgramFiles", "C:/Program Files")) / "Git" / "cmd" / "git.exe"),
        str(Path(os.environ.get("ProgramFiles", "C:/Program Files")) / "Git" / "bin" / "git.exe"),
        str(Path(os.environ.get("LOCALAPPDATA", "")) / "GitHubDesktop" / "app" / "git" / "cmd" / "git.exe"),
    ]

    for candidate in candidates:
        try:
            subprocess.run([candidate, "--version"], capture_output=True, text=True, check=True)
            return candidate
        except (OSError, subprocess.CalledProcessError):
            continue
    return None


def run_git(git_cmd: str, args: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
    """Git komutunu calistir."""
    return subprocess.run([git_cmd, *args], cwd=cwd, capture_output=True, text=True, check=False)


def auto_commit_push(site_repo: Path, message: str = DEFAULT_COMMIT_MESSAGE) -> dict:
    """Web repo degisikliklerini otomatik commit ve push yap."""
    result = {"attempted": True, "committed": False, "pushed": False, "message": "", "errors": []}
    git_cmd = find_git()
    if not git_cmd:
        result["errors"].append("Git bulunamadi; otomatik commit/push yapilamadi.")
        return result

    status = run_git(git_cmd, ["status", "--porcelain"], site_repo)
    if status.returncode != 0:
        result["errors"].append(status.stderr.strip() or status.stdout.strip())
        return result

    if not status.stdout.strip():
        result["message"] = "Commit/push gerektiren degisiklik yok."
        return result

    add = run_git(git_cmd, ["add", "."], site_repo)
    if add.returncode != 0:
        result["errors"].append(add.stderr.strip() or add.stdout.strip())
        return result

    commit = run_git(git_cmd, ["commit", "-m", message], site_repo)
    if commit.returncode != 0:
        text = f"{commit.stdout}\n{commit.stderr}".strip()
        if "nothing to commit" not in text.lower():
            result["errors"].append(text)
            return result
    else:
        result["committed"] = True

    push = run_git(git_cmd, ["push", "origin", "main"], site_repo)
    if push.returncode != 0:
        result["errors"].append(push.stderr.strip() or push.stdout.strip())
        return result

    result["pushed"] = True
    result["message"] = "Otomatik commit/push tamamlandi."
    return result


def sync_robot_outputs(site_repo: Path | None = None, push: bool = False, commit_message: str = DEFAULT_COMMIT_MESSAGE) -> dict:
    """Robot veri ve rapor dosyalarini web site repo klasorune kopyala."""
    target_repo = site_repo or get_site_repo_path()
    result = {
        "site_repo": str(target_repo),
        "copied": [],
        "missing": [],
        "errors": [],
        "git": None,
    }

    write_live_data()
    write_analysis_data()

    if not target_repo.exists():
        result["errors"].append(f"Web site repo klasoru bulunamadi: {target_repo}")
        return result

    for folder, filename in SYNC_FILES:
        source = PROJECT_ROOT / folder / filename
        target_dir = target_repo / folder
        target = target_dir / filename

        if not source.exists():
            result["missing"].append(str(source.relative_to(PROJECT_ROOT)))
            continue

        try:
            target_dir.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)
            result["copied"].append(str(target.relative_to(target_repo)))
        except OSError as exc:
            result["errors"].append(f"{source} -> {target}: {exc}")

    if push:
        result["git"] = auto_commit_push(target_repo, commit_message)

    return result


def print_sync_result(result: dict) -> None:
    """Esitleme sonucunu terminale okunabilir sekilde yaz."""
    print()
    print("Web site veri esitleme sonucu")
    print(f"Hedef repo: {result['site_repo']}")

    if result["copied"]:
        print("Kopyalanan dosyalar:")
        for path in result["copied"]:
            print(f"- {path}")

    if result["missing"]:
        print("Kaynakta bulunamayan dosyalar:")
        for path in result["missing"]:
            print(f"- {path}")

    if result["errors"]:
        print("Esitleme hatalari:")
        for error in result["errors"]:
            print(f"- {error}")
    else:
        print("Web site esitlemesi tamamlandi.")

    if result.get("git"):
        git_result = result["git"]
        if git_result["errors"]:
            print("Otomatik commit/push tamamlanamadi:")
            for error in git_result["errors"]:
                print(f"- {error}")
        else:
            print(git_result["message"])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--push", action="store_true", help="Esitlemeden sonra git commit/push dene.")
    parser.add_argument("--message", default=DEFAULT_COMMIT_MESSAGE, help="Commit mesaji.")
    args = parser.parse_args()
    print_sync_result(sync_robot_outputs(push=args.push, commit_message=args.message))


if __name__ == "__main__":
    main()
