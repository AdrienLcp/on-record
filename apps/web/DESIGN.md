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
- **Scrutin title** (`scrutin-title.ts`, `scrutin-subject.tsx`,
  `scrutin-title-detail.tsx`): a list names a vote by its subject alone,
  read off the official title ("visant à moderniser…" reads "Moderniser…";
  "projet de loi de finances" reads "Loi de finances"). Under it, in small
  soft ink: the **text kind tag** (`text-kind-tag.tsx` — a hairline-outlined
  label, "Proposition de loi", "Projet de loi organique"…), then the part
  voted in ink ("Texte entier", "Amendement n° 374 de M. Bazin à
  l'article 9") and the stage. A motion of censure reads "Censurer le
  gouvernement", with who tabled it underneath. The scrutin page keeps the
  official title word for word under its heading, as the cited source.
- **Group label**: the group's official colour as a small index tab before its
  name, with an ink inner ring so pale colours (HOR, SOC, LIOT) and dark ones
  (RN) show on both themes. A group with no colour is hatched, never given an
  invented one.
- **Group stances** (`group-stances-summary.tsx`): inside the result card, under
  the tally. The groups filed under the majority position of
  them, one compact vote bar each with "n sur m" in data numerals; each row
  leads to the group's detail below. A digest sentence counts groups per
  position and members who broke from theirs — figures only, no wording chosen
  by hand. For a censure, groups by votes for the censure.
- **Group positions** (`group-positions.tsx`): the first card of a group's
  page. Solemn votes as one vote bar of the majority positions
  for the group, each count linking to the list on that position; motions of
  censure as "n sur m" voted by more than half its members, since the
  computed position turns "for" as soon as one member votes a censure. The
  list below opens on solemn votes.
- **Guided path** (`features/vote-match/`): the home page. One text per
  record card — its subject as the heading, its topic in the corner, a
  one-sentence summary, the kind tag and stage — and the answers as single
  choice chips (pour, contre, abstention with their ballot marks; « Je ne
  sais pas » dashed). A tab per text along the top edge shows progress. The
  outcome and the parties' votes stay hidden until the result: a card of
  rows, one per race party in the race list's order, a square per answered
  text (filled accent with a check where the party made the same choice,
  each leading to its scrutin) and "n sur m" in data numerals; then every
  text with the visitor's answer beside each party's vote and counts, the
  same choice washed in accent with the open-tab top edge. Answers and step
  live in the URL. The disclosure (who chose the texts, how a party's vote is
  read, who wrote the summaries, the race list) sits under the path once it
  has started.
- **Vote ledger** (`features/compare-page/vote-ledger.tsx`): the compare
  page's table. On a desk, one column per party under a sticky head (the
  group's colour as a tab over its full name), each cell washed in its
  position's colour with the mark and the word. On a phone the columns are
  too narrow to name their party, so each cell becomes a line of its own:
  mark, swatch and party name, the position on the right.
- **HATVP declarations** (`features/hatvp/hatvp-declarations.tsx`): the
  last card of a deputy's and a senator's page. The latest declaration of
  interests as a ruled list of the form's nine sections, each named in a
  label: the declarant's own lines set off by a hairline on their start
  edge, like an amendment's summary (what they wrote, not what the site
  writes); « Néant » in soft ink; the spouse's activities and the
  collaborators as a count only. Under it, every declaration of the mandate
  with its dates on one soft line; only a declaration of interests is a
  link, an asset declaration reads « Consultable en préfecture » and is
  never linked. No amount, no total. The source line closes the card.
- **Primary button** (`.button.primary`): filled accent, for the one action
  a page invites (starting the guided path). Everything else stays ruled.
- **Correction** ("mise au point"): a dashed-outline line inside the vote, the
  folded tape flag of a reviewed card.

## Data colours

Vote positions form a diverging scale: pour = blue `oklch(57.5% 0.163 255.5)`
/ `oklch(62.2% 0.161 255)`, abstention = neutral grey midpoint, contre =
orange `oklch(63.6% 0.175 40.6)` / `oklch(62.2% 0.173 40.1)` (dataviz
reference steps, validated for CVD separation: worst adjacent ΔE 10.6 light,
11.3 dark; the grey fails the categorical chroma floor by design, as the
diverging midpoint). The light orange and grey sit a few points darker than
their reference steps so every mark reaches 3:1 on every surface, which
`tokens-contrast.test.ts` checks. Blue/orange rather than green/red so no position looks
like a verdict, and every bar is printed beside its numbers, which are the
table view.

Vote bars (`vote-bar.tsx`) order pour → abstention → contre, 2px surface gaps,
measured against the group's members so the empty track is "no recorded vote".

## Layout

Mobile first, one column, 16px gutter. The site header stays at the top of
the screen at every width; on a phone its six sections scroll sideways under
the wordmark, the current one brought into view on arrival; on a phone its six sections scroll sideways under
the wordmark, the current one brought into view on arrival; anything else sticky sits under it
(`--site-header-height`). From 900px (`$wide-screen`): home in
two columns (latest votes 3fr, how to read 2fr), deputy page with its group
history in a sticky 20rem aside, filters in one row. Scrutin, groups and
method pages keep a reading width (52–60rem).

## Copy rules carried by the design

- Every page that counts votes carries the "only nominal votes" note.
- Participation always sits beside the committee sentence; no figure is ever
  sorted across deputies.
- A group's position is labelled *position du groupe* and always explained as
  the most frequent vote of its deputies, computed from their votes; a tie
  reads *sans majorité*, never as a stance.
