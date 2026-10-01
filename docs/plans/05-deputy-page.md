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
