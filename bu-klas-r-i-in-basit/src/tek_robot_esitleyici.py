"""PC robotu ile canli siteyi tek Robot + PRO 12.2 akisina baglayan guvenli esitleyici.

Bu dosya eski web_site_esitleyici.py dosyasini silmez veya bozmaz.
Once eski esitleyiciyi calistirir, sonra yeni Robot + PRO 12.2 JSON dosyalarini da site reposuna tasir.
"""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path

from web_site_esitleyici import (
    DEFAULT_COMMIT_MESSAGE,
    PROJECT_ROOT,
    auto_commit_push,
    get_site_repo_path,
    print_sync_result,
    sync_robot_outputs,
)

TEK_ROBOT_EXTRA_FILES = [
    ("data", "fixtures.json"),
    ("data", "live-matches.json"),
    ("data", "robot-analysis.json"),
    ("data", "daily-coupons.json"),
    ("data", "robot_match_archive.json"),
    ("data", "robot_hafiza.json"),
    ("outputs", "robot_hafiza_raporu.md"),
]


def copy_extra_robot_files(target_repo: Path) -> dict[str, list[str]]:
    """Yeni Robot + PRO 12.2 dosya sozlesmesindeki ek dosyalari web repo icine kopyala."""
    result: dict[str, list[str]] = {"copied": [], "missing": [], "errors": []}
    for folder, filename in TEK_ROBOT_EXTRA_FILES:
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

    return result


def merge_result(base: dict, extra: dict[str, list[str]]) -> dict:
    """Eski esitleyici sonucunu tek robot ek dosya sonucu ile birlestir."""
    base.setdefault("copied", [])
    base.setdefault("missing", [])
    base.setdefault("errors", [])
    base["copied"].extend(extra.get("copied", []))
    base["missing"].extend(extra.get("missing", []))
    base["errors"].extend(extra.get("errors", []))
    base["tek_robot_extra_files"] = extra
    return base


def sync_tek_robot_outputs(push: bool = False, commit_message: str = DEFAULT_COMMIT_MESSAGE) -> dict:
    """Eski robot ciktilari + yeni PRO 12.2 JSON ciktilarini tek seferde web sitesine aktar."""
    target_repo = get_site_repo_path()
    base_result = sync_robot_outputs(site_repo=target_repo, push=False, commit_message=commit_message)

    if not target_repo.exists():
        return base_result

    extra_result = copy_extra_robot_files(target_repo)
    merged = merge_result(base_result, extra_result)

    if push:
        merged["git"] = auto_commit_push(target_repo, commit_message)

    return merged


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--push", action="store_true", help="Esitlemeden sonra git commit/push dene.")
    parser.add_argument("--message", default=DEFAULT_COMMIT_MESSAGE, help="Commit mesaji.")
    args = parser.parse_args()
    print_sync_result(sync_tek_robot_outputs(push=args.push, commit_message=args.message))


if __name__ == "__main__":
    main()
