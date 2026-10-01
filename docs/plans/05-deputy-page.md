# 05 — Deputy page

Goal: `/deputes/<id>` — everything the record says about one deputy.

## Read first

`docs/product.md` § Editorial principles — every block of this page is
constrained by them. `impeccable` before markup.

## Content

- Identity: name, constituency, current group, group history with dates.
- Votes: list of the deputy's nominal votes, newest first, filterable by
  type (solemn votes and motions of censure first — they are the ones that
  matter most and that people recognise), with the result of each scrutin and
  the deputy's group majority position beside the deputy's own.
- Corrections shown inline ("declared afterwards: for").
- Participation: share of scrutins with a recorded vote, always with the
  sentence explaining committees and show-of-hands votes. No rank among
  deputies.
- Agreement with own group: share of votes matching the group majority —
  each figure links to the votes it counts.
- Link to the official Assemblée page and to the HATVP page when present.

## Deputy list

`/deputes`: search by name, filter by group and département. All client-side
from `deputies.json`.

## Done when

- A deputy who changed group shows both groups on the right votes.
- Every figure, clicked, lists the votes it is computed from.
- Checked in a browser on a deputy with corrections and one with delegated
  votes.

## Done — 2026-10-01

- `/deputes`: search by name (accent- and case-insensitive), current group,
  department, sitting / former; all in the URL. `/deputes/:deputyId`:
  identity, official page and HATVP links, group history with dates (sticky
  aside on a desk, first on a phone), then the record.
- Pure rules in `features/deputy-pages/deputy-votes.ts` (tested): one line per
  scrutin held while seated (plus any scrutin with a ballot), the group of the
  vote's day, participation (recorded ballots, non-voting included, over
  scrutins of the mandate) and agreement (expressed ballots where the group
  had a published position). Each count links to the filtered list
  (`?vote=recorded|notRecorded|withGroup|againstGroup`, plus `corrected`,
  `delegated`) and the counts match the list.
- Votes list newest first, 25 at a time, filter by kind (tabs) and ballot;
  own vote beside the group's position, delegation and "mise au point" inline.
- Deviation: the dataset's `groupPosition` is the position the Assemblée
  publishes, which can differ from the most frequent vote in the group (e.g.
  scrutin 8431, EcoS: 19 pour, 7 contre, published "contre"). The UI says
  "position du groupe", never "majorité".
- Checked on PA841067 (Non inscrit → À Droite → UDR → UDR) and PA793262
  (corrections, delegated votes).
