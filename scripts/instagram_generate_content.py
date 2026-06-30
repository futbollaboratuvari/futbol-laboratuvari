#!/usr/bin/env python3
"""
Caption and hashtag generator for Futbol Laboratuvarı Instagram automation.

The generator works offline from content/instagram/captions.json and
content/instagram/hashtags.txt. If USE_OPENAI_CAPTIONS=true and OPENAI_API_KEY
is available, it can ask OpenAI for a fresh caption, then still applies local
safety checks and appends the configured site URL.
"""

from __future__ import annotations

import json
import os
import random
import re
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Sequence

CAPTIONS_PATH = Path("content/instagram/captions.json")
HASHTAGS_PATH = Path("content/instagram/hashtags.txt")
LOG_PATH = Path("logs/instagram_posts.json")
DEFAULT_SITE_URL = "https://www.futbollaboratuuvari.org"

FORBIDDEN_PATTERNS = [
    r"kesin\s+kazanç",
    r"garanti\s+kupon",
    r"banko\s+gelir",
    r"%\s*100\s+kazan",
    r"yüzde\s*yüz\s*kazan",
    r"garanti\s+gelir",
    r"garanti\s+kazan",
]

FALLBACK_CAPTIONS = [
    "Futbol Laboratuvarı ile maçları duyguya göre değil, veriye göre okuyun.",
    "Maç öncesi istatistik, form durumu ve oran takibi tek merkezde.",
    "Canlı bülten, maç verisi ve analiz motoru Futbol Laboratuvarı’nda.",
    "Futbolu tahmin değil, veri analiziyle takip edin.",
    "Maç bültenlerini, istatistikleri ve analizleri tek ekranda inceleyin.",
]


def site_url() -> str:
    return os.getenv("SITE_URL", DEFAULT_SITE_URL).strip() or DEFAULT_SITE_URL


def load_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return fallback


def load_caption_pool(path: Path = CAPTIONS_PATH) -> List[str]:
    data = load_json(path, {})
    if isinstance(data, dict):
        captions = data.get("captions", [])
    elif isinstance(data, list):
        captions = data
    else:
        captions = []

    clean = [str(item).strip() for item in captions if str(item).strip()]
    return clean or FALLBACK_CAPTIONS[:]


def load_hashtags(path: Path = HASHTAGS_PATH) -> List[str]:
    if not path.exists():
        return []

    hashtags: List[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        item = line.strip()
        if not item or item.startswith("//"):
            continue
        if not item.startswith("#"):
            item = "#" + item
        hashtags.append(item)

    # De-duplicate while keeping order.
    return list(dict.fromkeys(hashtags))


def load_recent_logs(path: Path = LOG_PATH) -> List[Dict[str, Any]]:
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []
    return data if isinstance(data, list) else []


def recently_used_captions(logs: Sequence[Dict[str, Any]], limit: int = 5) -> List[str]:
    used: List[str] = []
    for entry in reversed(logs):
        caption = entry.get("caption")
        if isinstance(caption, str) and caption.strip():
            # Compare only the non-hashtag opening section for better repeat detection.
            first_line = caption.split("#", 1)[0].strip()
            if first_line:
                used.append(first_line)
        if len(used) >= limit:
            break
    return used


def contains_forbidden_text(text: str) -> bool:
    lower = text.lower()
    return any(re.search(pattern, lower, flags=re.IGNORECASE) for pattern in FORBIDDEN_PATTERNS)


def sanitize_caption(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    for pattern in FORBIDDEN_PATTERNS:
        text = re.sub(pattern, "veriye dayalı analiz", text, flags=re.IGNORECASE)
    return text.strip()


def ensure_site_url(text: str, url: str) -> str:
    text = text.strip()
    if url not in text:
        text = f"{text}\n\n{url}"
    return text


def choose_hashtags(hashtags: Sequence[str], minimum: int = 8, maximum: int = 15) -> List[str]:
    unique = list(dict.fromkeys([tag for tag in hashtags if tag.startswith("#")]))
    if not unique:
        return []

    count = min(len(unique), random.randint(minimum, maximum))
    return random.sample(unique, count)


def call_openai_caption(used_captions: Sequence[str]) -> str | None:
    """Optionally generate one caption using the OpenAI API without extra packages."""
    if os.getenv("USE_OPENAI_CAPTIONS", "false").lower() != "true":
        return None

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        return None

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    prompt = (
        "Futbol Laboratuvarı için kısa, güçlü, profesyonel Türkçe Instagram captionı yaz. "
        "Marka veriye dayalı futbol analizi, canlı bülten, oran takibi ve maç istatistikleri sunar. "
        "Kesin kazanç, garanti kupon, banko gelir, %100 kazanır gibi ifadeleri kullanma. "
        "Sadece caption metni yaz; hashtag yazma. "
        f"Son kullanılan girişler tekrar edilmesin: {list(used_captions)}"
    )

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "Güvenli, abartısız ve profesyonel sosyal medya metinleri yaz."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.8,
        "max_tokens": 120,
    }

    request = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, KeyError):
        return None

    try:
        content = result["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        return None

    caption = sanitize_caption(str(content))
    if contains_forbidden_text(caption):
        return None
    return caption or None


def choose_caption(captions: Sequence[str], used_captions: Sequence[str]) -> str:
    openai_caption = call_openai_caption(used_captions)
    if openai_caption:
        return openai_caption

    candidates = [caption for caption in captions if caption not in used_captions]
    if not candidates:
        candidates = list(captions)

    random.shuffle(candidates)
    for caption in candidates:
        cleaned = sanitize_caption(caption)
        if cleaned and not contains_forbidden_text(cleaned):
            return cleaned

    return FALLBACK_CAPTIONS[0]


def generate_instagram_content() -> Dict[str, Any]:
    url = site_url()
    logs = load_recent_logs()
    used = recently_used_captions(logs)

    caption_text = choose_caption(load_caption_pool(), used)
    caption_text = ensure_site_url(caption_text, url)

    selected_hashtags = choose_hashtags(load_hashtags())
    if selected_hashtags:
        caption_text = f"{caption_text}\n\n{' '.join(selected_hashtags)}"

    return {
        "caption": caption_text.strip(),
        "hashtags": selected_hashtags,
        "site_url": url,
    }


def main() -> int:
    content = generate_instagram_content()
    print(json.dumps(content, ensure_ascii=False, indent=2))
    return 0 if content.get("caption") else 1


if __name__ == "__main__":
    raise SystemExit(main())
