from __future__ import annotations

import filecmp
import shutil
from pathlib import Path


SOURCE = Path(r"C:\Users\Arıf\Documents\Codex\2026-06-18\bu-klas-r-i-in-basit")
REPO = Path(r"C:\Users\Arıf\Documents\GitHub\futbol-laboratuvari")

DIRS = ["src", "tests", "work"]
ROOT_FILES = [
    "run_robot.bat",
    "requirements.txt",
    "MASTER_HAFIZA.md",
    "proje_hafizasi.md",
    "gunluk_rapor.md",
    "api_veri_kaynaklari.md",
    "faz1_altyapi_raporu.md",
    "ikinci_veri_kaynagi_entegrasyonu.md",
    "ilk_yari_ikinci_yari_modeli.md",
    "notes.md",
    ".env.example",
]

PROTECTED_ROOT = {
    "index.html",
    "script.js",
    "robot-dashboard.js",
    "nav-routing.js",
    "premium-theme.css",
    "style.css",
}

GITIGNORE_LINES = [
    ".env",
    ".env.local",
    ".env.*",
    "!.env.example",
    "node_modules/",
    "__pycache__/",
    "*.pyc",
    ".DS_Store",
]


def is_secret_path(path: Path) -> bool:
    name = path.name.lower()
    if name == ".env" or name == ".env.local":
        return True
    if name.startswith(".env.") and name != ".env.example":
        return True
    if name.endswith(".pyc"):
        return True
    if "__pycache__" in {part.lower() for part in path.parts}:
        return True
    return False


def ensure_gitignore() -> None:
    target = REPO / ".gitignore"
    existing = target.read_text(encoding="utf-8").splitlines() if target.exists() else []
    lines = list(existing)
    for item in GITIGNORE_LINES:
        if item not in lines:
            lines.append(item)
    target.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def copy_file(source: Path, target: Path, copied: list[str], skipped: list[str]) -> None:
    if is_secret_path(source):
        skipped.append(str(source.relative_to(SOURCE)))
        return
    if target.name in PROTECTED_ROOT and target.parent == REPO:
        skipped.append(str(target.relative_to(REPO)))
        return
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists() and filecmp.cmp(source, target, shallow=False):
        return
    shutil.copy2(source, target)
    copied.append(str(target.relative_to(REPO)))


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"SOURCE_NOT_FOUND: {SOURCE}")
    if not REPO.exists():
        raise SystemExit(f"REPO_NOT_FOUND: {REPO}")

    copied: list[str] = []
    skipped: list[str] = []

    ensure_gitignore()

    for dirname in DIRS:
        source_dir = SOURCE / dirname
        if not source_dir.exists():
            continue
        for source_file in source_dir.rglob("*"):
            if source_file.is_file():
                rel = source_file.relative_to(SOURCE)
                copy_file(source_file, REPO / rel, copied, skipped)

    for filename in ROOT_FILES:
        source_file = SOURCE / filename
        if source_file.exists():
            copy_file(source_file, REPO / filename, copied, skipped)

    print("COPIED")
    for item in copied:
        print(item)
    print("SKIPPED")
    for item in skipped:
        print(item)


if __name__ == "__main__":
    main()
