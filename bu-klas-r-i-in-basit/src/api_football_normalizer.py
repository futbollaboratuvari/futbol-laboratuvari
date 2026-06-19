"""
API-Football yanitlarini Futbol Laboratuvari ortak mac semasina cevirir.
"""

from __future__ import annotations

from typing import Any


def ikinci_yari_golu_hesapla(full_time: int | None, half_time: int | None) -> int | None:
    """Full-time ve half-time gol degerlerinden ikinci yari golunu hesaplar."""
    if full_time is None or half_time is None:
        return None
    return full_time - half_time


def api_football_fixture_normalize(fixture_row: dict[str, Any]) -> dict[str, Any]:
    """
    API-Football tek fixture satirini ortak mac semasina donusturur.
    """
    fixture = fixture_row.get("fixture", {})
    league = fixture_row.get("league", {})
    teams = fixture_row.get("teams", {})
    goals = fixture_row.get("goals", {})
    score = fixture_row.get("score", {})
    halftime = score.get("halftime", {})
    fulltime = score.get("fulltime", {})
    home_team = teams.get("home", {})
    away_team = teams.get("away", {})

    home_goals = fulltime.get("home")
    away_goals = fulltime.get("away")
    if home_goals is None:
        home_goals = goals.get("home")
    if away_goals is None:
        away_goals = goals.get("away")

    home_half = halftime.get("home")
    away_half = halftime.get("away")

    return {
        "source": "api_football",
        "match_id": fixture.get("id"),
        "source_match_id": fixture.get("id"),
        "utc_date": fixture.get("date"),
        "competition_id": league.get("id"),
        "competition_code": str(league.get("id") or ""),
        "competition_name": league.get("name"),
        "season": league.get("season"),
        "matchday": league.get("round"),
        "status": (fixture.get("status") or {}).get("short"),
        "home_team_id": home_team.get("id"),
        "home_team_name": home_team.get("name"),
        "away_team_id": away_team.get("id"),
        "away_team_name": away_team.get("name"),
        "home_goals": home_goals,
        "away_goals": away_goals,
        "home_half_time_goals": home_half,
        "away_half_time_goals": away_half,
        "home_second_half_goals": ikinci_yari_golu_hesapla(home_goals, home_half),
        "away_second_half_goals": ikinci_yari_golu_hesapla(away_goals, away_half),
        "winner": None,
    }


def api_football_fixtures_normalize(api_response: dict[str, Any]) -> list[dict[str, Any]]:
    """API-Football fixture yanitini mac listesine cevirir."""
    return [
        api_football_fixture_normalize(row)
        for row in api_response.get("response", [])
        if isinstance(row, dict)
    ]


def api_football_leagues_normalize(api_response: dict[str, Any]) -> list[dict[str, Any]]:
    """API-Football lig yanitini sade listeye cevirir."""
    rows = []
    for item in api_response.get("response", []):
        league = item.get("league", {})
        country = item.get("country", {})
        seasons = item.get("seasons", [])
        rows.append(
            {
                "league_id": league.get("id"),
                "league_name": league.get("name"),
                "league_type": league.get("type"),
                "country_name": country.get("name"),
                "country_code": country.get("code"),
                "seasons": [season.get("year") for season in seasons],
            }
        )
    return rows
