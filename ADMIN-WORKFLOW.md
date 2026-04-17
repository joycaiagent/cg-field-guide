# CG Field Guide admin update workflow

This is the safe update path for plant schedule changes.

## Goal

Let someone update plant schedule data in a spreadsheet-style CSV without hand-editing `plants.js`.

## Files

- `plants.js` — live plant data used by the app
- `admin/plant-schedule-template.csv` — editable CSV template/export
- `admin/backups/` — automatic backups created before imports
- `scripts/export-plants-csv.js` — exports current plant data to CSV
- `scripts/import-plants-csv.js` — imports CSV back into `plants.js`

## Safe workflow

1. Export the latest CSV template:
   - `node scripts/export-plants-csv.js`
2. Edit `admin/plant-schedule-template.csv`
3. Keep these columns exactly as-is:
   - `botanical, common, synonyms, image, size, target, aggression, type, fertilize`
   - `jan` through `dec`
4. Month values must be one of:
   - blank
   - `■`
   - `△`
5. Separate synonyms with `|`
6. For local photos, use a workspace-relative path like:
   - `assets/plants/lomandra-breeze.jpg`
7. Import the CSV:
   - `node scripts/import-plants-csv.js`
8. Test locally, then commit and push

## Why this is safe

- import creates a timestamped backup of `plants.js`
- importer validates required columns
- importer rejects bad month values
- nothing updates automatically in production unless someone intentionally runs the import and pushes changes

## Recommendation

Use this only after app behavior is stable. Hardcoded data is still the most reliable runtime setup.
