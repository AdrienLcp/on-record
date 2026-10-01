# 06 — Scrutin page

Goal: `/scrutins/<number>` — one vote, understandable by someone who has
never followed parliament.

## Content

- What was voted, in plain words: the object, and what kind of vote it is
  (whole text, article, amendment, motion of censure), with one sentence
  saying what adopting or rejecting it meant.
- Result and totals; a parliament-arc or bar view by group (load `dataviz`
  before drawing it).
- Per group: majority position, then the deputies who voted otherwise —
  the dissents are the interesting part.
- Full nominal list, searchable.
- Link to the official scrutin page and the legislative file.

## Scrutin list

`/scrutins`: newest first, filter by type and result, search in titles,
from `scrutins/index.json`.

## Open question

Plain-language summaries of important votes are editorial work. Options: none
(official titles only), hand-written for solemn votes, or generated then
reviewed. Decide with Adrien before building it; whatever is chosen is
disclosed on the page (principle 7).

## Done when

- A motion of censure, a solemn vote and an amendment vote each read
  correctly in a browser.
