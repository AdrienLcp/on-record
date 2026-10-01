# Design — on-record web

## Direction

**The record as an index card file.** Every deputy and every scrutin is a
ruled card filed under its reference; every figure links to the lines it
counts. The site refuses the two category defaults: the KPI dashboard (big
numbers, rankings) and the party-coloured poster. It must never pass for an
Assemblée nationale page: no tricolour, no Marianne, no official typeface.

Mode: Read first, Operate second. Visitors arrive on a phone from a shared
link and read one record; the lists are tools to find the next one.

## Material

| Piece | Light | Dark | Token |
| --- | --- | --- | --- |
| Desk (page ground) | cool slate white | night slate | `--desk` |
| Card | near-white | slate | `--card` |
| Ink / soft ink | graphite | pale slate | `--ink`, `--ink-soft` |
| Line rules | blue hairline | slate hairline | `--rule`, `--rule-strong` |
| Head rule | index-card red, 2px, one per card | brighter red | `--header-rule` |
| Accent (links, focus, current tab) | deep blue | pale blue | `--accent` |

All colours are `oklch()` in `presentation/styles/_tokens.sass`, written with
`light-dark()`; `@adrienlcp/theme-preference` resolves the scheme, the theme
switch (Auto / Clair / Sombre) sits in the header on a desk and in the footer
on a phone.

## Type

One family, self-hosted from `public/fonts/` (OFL): **Atkinson Hyperlegible
Next** (200–800) for everything readable, **Atkinson Hyperlegible Mono** for
references only — scrutin numbers, dates in a reference line, counts in a
card corner, source file names. Chosen for legibility for every reader, not
for flavour. Fixed rem scale: 0.875 / 1.0625 (body) / 1.1875 / 1.375 / 1.875
(2.5 on a desk) / 2.25 figure.

## Components

- **Record card** (`record-card.tsx`): the only container. Heading over the
  red head rule, optional reference in the corner, body of ruled lines
  (`.ruled-list`). Never nested.
- **Divider tabs** (`toggle-button-group.tsx`): filters that file a list
  (kind of scrutin, scope, position) look like the tabs standing out of a card
  index; the open one carries a 3px accent top edge. The theme switch is the
  same component as flat segments.
- **Party chips** (`toggle-chip-group.tsx`, `features/parties/party-filter.tsx`):
  the 2027 race filter on the scrutin, deputies and groups pages. Any number
  pressed, or none for every group; a pressed chip borrows the open divider
  tab (accent wash, 3px accent top edge). Each chip carries its group's colour
  tab, and the group's acronym when it does not say the party (EPR, SOC). The
  disclosure of who chose the list sits under it, never sticky; on the scrutin
  page the chips stay sticky from 900px only.
- **Fields** (`field.sass`): labelled search box, select and combo box
  (suggestions as one types: communes, addresses) share one sheet; a
  suggestion can carry a detail line in data numerals under its name.
- **Ballot mark** (`ballot-mark.tsx`): a position reads by its shape first —
  check (pour), cross (contre), bar (abstention), dashed ring (non-votant) —
  and by colour second.
- **Outcome stamp**: filled ink for *Adopté*, outlined for *Rejeté*. Never
  green or red: the word carries the meaning.
- **Group label**: the group's official colour as a small index tab before its
  name, with an ink inner ring so pale colours (HOR, SOC, LIOT) and dark ones
  (RN) show on both themes. A group with no colour is hatched, never given an
  invented one.
- **Group stances** (`group-stances-summary.tsx`): inside the result card, under
  the tally. The groups filed under the position the Assemblée published for
  them, one compact vote bar each with "n sur m" in data numerals; each row
  leads to the group's detail below. A digest sentence counts groups per
  position and members who broke from theirs — figures only, no wording chosen
  by hand. For a censure, groups by votes for the censure.
- **Group positions** (`group-positions.tsx`): the first card of a group's
  page. Solemn votes as one vote bar of the positions the Assemblée published
  for the group, each count linking to the list on that position; motions of
  censure as "n sur m" voted by more than half its members, since the
  published position turns "for" as soon as one member votes a censure. The
  list below opens on solemn votes.
- **Correction** ("mise au point"): a dashed-outline line inside the vote, the
  folded tape flag of a reviewed card.

## Data colours

Vote positions form a diverging scale: pour = blue `oklch(57.5% 0.163 255.5)`
/ `oklch(62.2% 0.161 255)`, abstention = neutral grey midpoint, contre =
orange `oklch(67.1% 0.175 40.6)` / `oklch(62.2% 0.173 40.1)` (dataviz
reference steps, validated for CVD separation: worst adjacent ΔE 10.6 light,
11.3 dark; the grey fails the categorical chroma floor by design, as the
diverging midpoint). Blue/orange rather than green/red so no position looks
like a verdict, and every bar is printed beside its numbers, which are the
table view.

Vote bars (`vote-bar.tsx`) order pour → abstention → contre, 2px surface gaps,
measured against the group's members so the empty track is "no recorded vote".

## Layout

Mobile first, one column, 16px gutter. From 900px (`$wide-screen`): home in
two columns (latest votes 3fr, how to read 2fr), deputy page with its group
history in a sticky 20rem aside, filters in one row. Scrutin, groups and
method pages keep a reading width (52–60rem).

## Copy rules carried by the design

- Every page that counts votes carries the "only nominal votes" note.
- Participation always sits beside the committee sentence; no figure is ever
  sorted across deputies.
- A group's position is labelled *position du groupe* (what the Assemblée
  publishes), not *majorité*: the published position can differ from the
  most frequent vote in the group.
