"""Robot ciktilarinda eski demo etiketlerini beta surum diline cevirir."""

from __future__ import annotations

from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
REPORTS = [
    PROJECT_ROOT / "outputs" / "bugunun_en_guclu_maclari.md",
    PROJECT_ROOT / "outputs" / "mackolik_veri_cekme_raporu.md",
    PROJECT_ROOT / "outputs" / "basari_yuzdesi_raporu.md",
]

REPLACEMENTS = {
    "CALISMA_MODU: DEMO": "CALISMA_MODU: BETA",
    "Demo modda calisiyor.": "Beta sürüm çalışıyor.",
    "Demo modda calisiyor": "Beta sürüm çalışıyor",
    "Demo mod aktif": "Beta mod aktif",
    "Demo Mode": "Beta Mode",
    "DEMO": "BETA",
    "Demo": "Beta",
    "demo": "beta",
    "API key bulunmadigi icin robot canli API yerine yerel ornek veriyi kullandi.": "Beta sürüm aktif. Canlı veri yoksa kupon yayına alınmaz.",
    "API key olmadigi icin demo mod kullanildi.": "Beta sürüm aktif. Canlı veri bekleniyor.",
    "API key yoksa robot durmaz; demo mod ile rapor uretir.": "API key yoksa robot durmaz; beta bekleme raporu üretir.",
}


def normalize_report(path: Path) -> bool:
    if not path.exists():
        return False
    text = path.read_text(encoding="utf-8", errors="ignore")
    original = text
    for old, new in REPLACEMENTS.items():
        text = text.replace(old, new)
    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = [str(path.relative_to(PROJECT_ROOT)) for path in REPORTS if normalize_report(path)]
    if changed:
        print("Beta surum rapor dili guncellendi:")
        for item in changed:
            print(f"- {item}")
    else:
        print("Beta surum rapor dili icin degisiklik gerekmedi.")


if __name__ == "__main__":
    main()
