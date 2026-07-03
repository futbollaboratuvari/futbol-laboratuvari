# State

2026-07-03

Main focus: bulletin stability.

matches = main list
live_matches = live list
coupon panel = protected
analysis button = protected

Latest fix focus:
- Futbol Bulteni data window now targets today full day + tomorrow full day.
- Tomorrow cutoff is now 23:59 instead of 08:00 in the full bulletin build and final output check path.
- Build flow keeps started/past matches out of matches and separates live matches into live_matches.
- If no usable scheduled/live bulletin data is produced, build-full-bulletin.js does not overwrite data/full-bulletin.json with an empty bulletin.
- Direct site/widget/admin/workflow/domain files were not changed.
