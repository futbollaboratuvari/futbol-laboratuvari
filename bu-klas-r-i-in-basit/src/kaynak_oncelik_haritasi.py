"""
Lig bazli veri kaynagi oncelik haritasi.
"""

from __future__ import annotations


SOURCE_FOOTBALL_DATA = "football_data_org"
SOURCE_API_FOOTBALL = "api_football"


TURKIYE_LIGLERI = {
    "TR_SUPER_LIG": {
        "display_name": "Turkiye Super Lig",
        "preferred_sources": [SOURCE_API_FOOTBALL, SOURCE_FOOTBALL_DATA],
        "api_football_search_name": "Super Lig",
        "api_football_league_id": None,
    },
    "TR_TFF_1_LIG": {
        "display_name": "TFF 1. Lig",
        "preferred_sources": [SOURCE_API_FOOTBALL],
        "api_football_search_name": "1. Lig",
        "api_football_league_id": None,
    },
    "TR_TFF_2_LIG": {
        "display_name": "TFF 2. Lig",
        "preferred_sources": [SOURCE_API_FOOTBALL],
        "api_football_search_name": "2. Lig",
        "api_football_league_id": None,
    },
    "TR_TFF_3_LIG": {
        "display_name": "TFF 3. Lig",
        "preferred_sources": [SOURCE_API_FOOTBALL],
        "api_football_search_name": "3. Lig",
        "api_football_league_id": None,
        "note": "API-Football coverage'da grup bazli arastirilacak.",
    },
    "TR_TURKIYE_KUPASI": {
        "display_name": "Turkiye Kupasi",
        "preferred_sources": [SOURCE_API_FOOTBALL],
        "api_football_search_name": "Turkiye Kupasi",
        "api_football_league_id": None,
    },
}


FOOTBALL_DATA_COMPETITIONS = [
    "PL",
    "PD",
    "SA",
    "BL1",
    "FL1",
    "ELC",
    "PPL",
    "DED",
    "BSA",
    "CLI",
    "CL",
    "EC",
    "WC",
]
