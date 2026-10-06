# Data sources

Verified on 2026-10-01 by downloading the files. Each section stands alone:
read only the one for the source being touched.

## Assemblée nationale

Base: `https://data.assemblee-nationale.fr/static/openData/repository/17/`
(17th legislature, from July 2024). Licence Ouverte / Open Licence (Etalab):
free reuse, source must be cited.

| Dataset | Path | Zip | Unzipped |
|---|---|---|---|
| Scrutins | `loi/scrutins/Scrutins.json.zip` | 26 MB | 173 MB, one JSON per scrutin (8,434 on 2026-10-01) |
| Active deputies, mandates, organs | `amo/deputes_actifs_mandats_actifs_organes/AMO10_deputes_actifs_mandats_actifs_organes.json.zip` | 5 MB | 13 MB |
| Full history | `amo/tous_acteurs_mandats_organes_xi_legislature/AMO30_tous_acteurs_tous_mandats_tous_organes_historique.json.zip` | ? | ? |
| Amendments | `loi/amendements_div_legis/Amendements.json.zip` | 310 MB | 868 MB, one JSON per amendment (128,723 on 2026-10-06) |
| Legislative files | `loi/dossiers_legislatifs/Dossiers_Legislatifs.json.zip` | 10 MB | 60 MB: 3,167 files under `dossierParlementaire/`, 7,195 under `document/` (2026-10-02) |
| Debates | `vp/syceronbrut/syseron.xml.zip` | 56 MB | XML only |

- Refreshed nightly (Last-Modified between 22:00 and 06:00 UTC), no published
  schedule, no rate limit seen.
- Every zip sends `ETag` and `Last-Modified`: ingestion uses conditional GETs
  and does nothing when the file has not changed.
- **AMO50 is stale** (last modified 2024-07-11). Use AMO10 for current
  deputies, AMO30 for deputies who left during the legislature — votes
  reference both.

### Scrutin (`json/VTANR5L17V<n>.json` → `.scrutin`)

- `uid`, `numero`, `dateScrutin`, `titre`, `objet.libelle`,
  `objet.dossierLegislatif`, `demandeur.texte`, `sort.code`
  (`adopté` / `rejeté`).
- `typeVote.codeTypeVote`: `SPO` ordinary public vote, `SPS` solemn vote,
  `MOC` motion of censure.
- `syntheseVote.decompte`: totals for, against, abstention, non-voting.
- `ventilationVotes.organe.groupes.groupe[]`: per group `organeRef`,
  `vote.positionMajoritaire`, and `vote.decompteNominatif` with `pours`,
  `contres`, `abstentions`, `nonVotants`, each holding `.votant`.
- A votant: `acteurRef`, `mandatRef`, `parDelegation`, and for non-voters
  `causePositionVote` (e.g. `MG`, member of the government).
- `miseAuPoint`: same buckets — the votes deputies declared after the fact
  (1,544 scrutins have at least one).

### Traps

- **Every value is a string**, numbers and booleans included.
- **An empty bucket is `null`.**
- **A bucket with one voter is an object, not an array** (35,671 times).
  Normalise every bucket to an array at the boundary, in one place.
- The group in `ventilationVotes` is the group at the vote; for a deputy's own
  page, compute group membership from dated mandates, never from the current
  group.

### Acteur (`json/acteur/PA<n>.json` → `.acteur`)

- The id is `uid["#text"]`. `etatCivil`, `profession`, `uri_hatvp` (the link
  to HATVP), `mandats.mandat[]`.
- Group mandate: `typeOrgane: "GP"`, `dateDebut`, `dateFin` (null while
  active), `organes.organeRef`. A group change is several GP mandates.
- Seat mandate (`typeOrgane: "ASSEMBLEE"`): `election.lieu.numDepartement`,
  `numCirco`, `refCirconscription`.

### Organe (`json/organe/PO<n>.json`)

`uid`, `codeType` (`GP` for groups), `libelle`, `libelleAbrege`,
`viMoDe.dateDebut/dateFin`, `couleurAssociee` (official group colour).

### Dossier législatif (`json/dossierParlementaire/DLR<…>.json` → `.dossierParlementaire`)

- `uid`, `titreDossier.titre`, `procedureParlementaire.libelle`,
  `actesLegislatifs.acteLegislatif[]`: a tree of steps (`codeActe` such as
  `AN1-DEBATS-DEC`, `CMP-DEBATS-AN-DEC`), each with its own
  `actesLegislatifs` (`null` on a leaf).
- A decision step names the scrutin it was taken by in `voteRefs.voteRef`
  (`VTANR5L17V<n>`). Ingest uses it to give a scrutin the file its own JSON
  leaves out: on 2026-10-02, 53 of the 64 solemn votes and motions of censure
  with no `objet.dossierLegislatif` got one this way.
- The `document/` folder (texts, reports) is not read.

### Traps

- **Some decisions carry no `voteRefs`** although a solemn vote took them:
  the first readings of the narcotrafic and PNACO texts (1 April 2025,
  scrutins 1194 and 1195), and scrutins 2957 and 2958. Several files are
  decided in the same sitting, so the sitting (`reunionRef` against the
  scrutin's `seanceRef`) cannot pair them either. They stay without a file:
  nothing in the data says which one, and ingest does not guess.
- **A motion of censure is cited by two files**: the bill, and the
  "engagement de responsabilité" file of the 49.3 it answers. Ingest links
  no file then.
- **`voteRefs` is not limited to Assemblée scrutins of the 17th**: on
  2026-10-02 it held 261 `VTANR5L17V`, 29 `VTANR5L15`/`L16` and 2
  `VTSNR5L17V` refs, whose numbers collide with this legislature's. Only
  `VTANR5L17V<n>` is read.
- `voteRefs.voteRef` was always a single string on 2026-10-02; read it as a
  list anyway.

### Amendment (`json/<DLR>/<text uid>/<amendment uid>.json` → `.amendement`)

- **Never unzipped at once.** 128k small files took ~30 min to extract to
  disk, and concatenating them overflows a string (512 MB). Ingest inflates
  and parses one entry at a time (`visitJsonFiles`), feeding fflate 1 MB at a
  time: one push of the whole zip overflows its stack. 530 s for a full run,
  310 MB download included; ~50 s of parsing when the zip is cached.
- The legislative file is **only in the zip path**; `json/incorrect_data/`
  (149 amendments) has none, and some dirs are files of the 11th, 15th or
  16th legislature that the 17th took up again.
- Author: `signataires.auteur.typeAuteur` `Député`, `Rapporteur` (on behalf
  of a committee) or `Gouvernement` (left out of the per-deputy files).
  Co-signatories `signataires.cosignataires.acteurRef`: an array, a single
  string, or an empty block; median 9, up to 189. Kept as a count per deputy
  only: a group co-signs its members' amendments by the hundred.
- Outcome: `cycleDeVie.sort` is a plain string (`Adopté`, `Rejeté`, `Tombé`,
  `Non soutenu`, `Retiré`) and empty on 45% of them; the rest comes from
  `etatDesTraitements.etat.code`: `RT` withdrawn, `IR` (article 40) and every
  `IRR…` code inadmissible (the reason is in `sousEtat`), `AC` / `ET` pending.
- `exposeSommaire` is HTML with hex entities; ingest keeps its first 200
  characters, cut on a word. The full text stays on the official page.
- Article: `pointeurFragmentTexte.division.articleDesignationCourte`
  (`ART. 3`, `APRÈS ART. 1ER BIS`, `ART.S 3 TER À 3 OCTIES`, `TITRE`); the web
  says it in plain French (`article-designation.ts`). The letters of inserted
  articles stay capitals (`3 bis A`).
- Official page:
  `https://www.assemblee-nationale.fr/dyn/17/amendements/<text><part>/<organ>/<number>`,
  `<text>` the four digits after `B`/`BTC` in the uid (zero-padded: `0324`),
  `<part>` `A`/`C` for the first/second part of a budget (`P1`/`P2`),
  `<number>` without `I-`/`II-` and without `(Rect)`. Checked in a browser on
  2026-10-06 on a sitting, a committee, a budget part, a zero-padded text
  and a rectified amendment; `curl` gets 503 (anti-bot).

### Traps

- **No structured link to the scrutin that decided it**, either side. Ingest
  parses the scrutin title (`l'amendement n° 2194…`) and matches its
  `seanceRef` with the amendment's `seanceDiscussionRef` and bare number.
  Kept only when one amendment answers and both outcomes agree (234
  ambiguous and 58 contradictory pairs are dropped, not guessed); identical
  amendments of the same sitting inherit the link. 9,415 deputy amendments
  linked on 2026-10-06.
- **Government amendments share the numbering**: they stay in the link index
  even though no deputy file lists them.
- The same amendment tabled in committee then for the sitting is two
  records; 396 duplicates on (text, organ, number) exist besides.
- Empty fields are `{"@xsi:nil": "true"}` as often as `null`.

## Find my deputy

Verified on 2026-10-01. All Licence Ouverte. Ingest reads the first five;
the browser calls the geocoder.

| Source | URL | Format | Validators |
|---|---|---|---|
| Commune ↔ constituency table (Ministère de l'Intérieur, 2012 updated 2017) | `https://static.data.gouv.fr/resources/circonscriptions-legislatives-table-de-correspondance-des-communes-et-des-cantons-pour-les-elections-legislatives-de-2012-et-sa-mise-a-jour-pour-les-elections-legislatives-2017/20170411-141128/Table_de_correspondance_circo_legislatives2017-1.xlsx` | XLSX, 1.7 MB, one row per commune or per canton of a commune | ETag, Last-Modified |
| Current communes (INSEE, COG 2026) | `https://www.insee.fr/fr/statistiques/fichier/8740222/v_commune_2026.csv` (+ `v_commune_comer_2026.csv` overseas collectivities, `v_mvt_commune_2026.csv` moves) | CSV, UTF-8, quoted | **none** |
| Postcodes (La Poste, hexasmal) | `https://data.laposte.fr/data-fair/api/v1/datasets/laposte-hexasmal/raw` | CSV `;`, **Latin-1** | Last-Modified |
| Constituency contours | `https://static.data.gouv.fr/resources/contours-geographiques-des-circonscriptions-legislatives/20240613-191520/circonscriptions-legislatives-p10.geojson` | GeoJSON, 5.4 MB, 559 features, already at 4 decimals | ETag, Last-Modified |
| Geocoder (Base Adresse Nationale, IGN Géoplateforme) | `https://data.geopf.fr/geocodage/search?q=…&citycode=<INSEE>&autocomplete=1&limit=6` | JSON, CORS open, no key, 50 req/s per IP | — |

The data.gouv.fr API (`https://www.data.gouv.fr/api/1/datasets/<slug>/`) lists
each dataset's resources. The 2024 results files and INSEE's polling-station
table (REU) were checked as a newer commune ↔ constituency source: none carries
the constituency.

### Traps

- **The table predates the mergers.** 35,494 table communes against 34,963
  current ones (COG 2026). Codes are followed through `v_mvt_commune` moves
  (COM → COM, from 2016) to today's commune; a commune merged across a
  boundary keeps every constituency of its former parts. Fallbacks, in order:
  a restored commune is placed like the merger it left (7), a commune of a
  one-constituency territory takes it (3, Wallis-et-Futuna's kingdoms), a
  commune the table never listed takes its canton's constituency when the
  canton lies in one (6, the Meuse "villages morts pour la France"). Result
  on 2026-10-01: 1 table line unmatched (Wallis-et-Futuna as a whole),
  **0 current commune unplaced**; the run fails if one ever is.
- **Overseas letters.** The Ministry codes overseas departments `ZA`…`ZX`
  in the table and the contours (`ZA` = 971, `ZM` = 976, `ZP` = 987,
  `ZX` = 977 for Saint-Barthélemy and Saint-Martin); table commune numbers
  overseas keep only their last two INSEE digits meaningful (`ZM 501` =
  97601). `ZZ` (French abroad) has no commune.
- **insee.fr sends no ETag nor Last-Modified**: the files are compared byte
  for byte with the cached copy, so an unchanged night stays a no-op.
- **COG**: delegated and associated communes have no `DEP`; Wallis' three
  kingdoms are `CIR`, not `COM`, in the overseas file. INSEE lists
  Saint-Martin under 978, the Assemblée seats it with Saint-Barthélemy (977).
- **La Poste lists Paris, Lyon and Marseille by arrondissement** (75115…):
  their postcodes are folded into the commune.
- **134 communes are split** between constituencies (Paris 18, Marseille 7,
  Lyon 4, and merged communes): only these need an address, and only their
  constituencies' contours are shipped.
- `api-adresse.data.gouv.fr` now redirects to `data.geopf.fr/geocodage`.
  `citycode=75056` matches addresses of every Paris arrondissement.

### Datasets built

| Dataset | Files | Raw | gzip |
|---|---|---|---|
| `assembly/communes.json` (index: `[code, name, postcodes, department, constituencies]`) | 1 | 1.55 MB | 380 KB, read only once someone types |
| `assembly/constituency-contours/<department>.json` | 66 | 2.1 MB | largest 71 KB |
| `assembly/highlights.json` (latest 10 solemn votes, 5 motions of censure) | 1 | 5 KB | 1 KB |
| `assembly/amendments/<deputyId>.json` (tabled amendments, co-signature count) | 649 | 47.8 MB (largest 1.07 MB) | ≈ 6 MB |
| `assembly/legislative-files.json` (titles of the files amendments cite) | 1 | 42 KB | not measured |

## Senate

Licence Ouverte v2.0 (https://data.senat.fr/licence/): name « Sénat —
data.senat.fr » and the update date; never suggest the Senate endorses the site.

Two PostgreSQL plain-text dumps, nightly around 01:45 UTC, ETag + Last-Modified:

- `https://data.senat.fr/data/dosleg/dosleg.zip` (16 MB → `dosleg.sql` 126 MB)
- `https://data.senat.fr/data/senateurs/export_sens.zip` (8.5 MB → 59 MB)

Read without PostgreSQL (`infrastructure/pg-dump-reader.ts`): each
`COPY <table> (<columns>) FROM stdin;` block is tab-separated lines up to a
line `\.`; `\N` is NULL; backslash escapes as in COPY text format. Both dumps
parse in ≈ 5 s. The `ODSEN_*` JSON/CSV files on data.senat.fr are stale: not
used.

### Tables used

| Table | What | Notes |
|---|---|---|
| `scr` | one scrutin, key (`sesann`, `scrnum`) | `sesann` = year the session opened (October); numbers restart each session → id `2025-340`. `scrint` title, `scrdat` day only, `scrpou` for, `scrcon` against, `scrvot` for + against + abstention, `scrsuf` for + against. No outcome column: adopted ⇔ for > against. |
| `votsen` | one row per senator per scrutin | `posvotcod` 1 for, 2 against, 3 abstention, 4 no part; `stavotidt` 8 presiding, 9 government, 12 recusal; `senmatdel` set = cast by delegation; `votsenmar` `*` = made a mise au point. |
| `corscr` | sentences announcing mises au point | Name the senators, or « les membres du groupe <full name> ». |
| `date_seance` → `lecass` → `lecture` → `loi` | the bill a scrutin belongs to | `scr.code` = `date_seance.code`; `lecidt` may be NULL; `loi.signet` is the dossier path, `loient` its short name. |
| `sen` | every person who ever sat | `quacod` M. / Mme / Mlle gives the gender (`senfem` is wrong for some); `sendaiurl` is the HATVP page. |
| `elusen` | seat mandates | `typmancod` is often NULL: every row is a Senate seat. `dptnum` → `dpt`. |
| `memgrppol` | dated group memberships | `AUCUN` = between election and group formation; some rows have no start date. |
| `grppol` | groups by lasting code | `grppolliccou` short name, `grppollilcou` full name (the one `corscr` uses). Codes outlive renames: `UMP` = Les Républicains, `LREM` = RDPI, `RTLI` = Les Indépendants. |
| `dpt` | constituencies by Senate number | `dptcod` official code, `dptlib` name; French people abroad split in « (Série 1/2) ». |

### Traps

1. **Mojibake**: Windows-1252 punctuation stored as C1 controls (U+0092 for ’,
   U+0096 –, U+009C œ…) in titles and sentences; repaired at read.
2. **Scrutins missing from `scr`** (13 since 2023-10, among them whole-budget
   votes and art. 50-1 declarations): numbering gaps, yet `votsen` holds their
   ballots. Listed as missing with the official link; a gap after a session's
   last published number cannot be seen.
3. **No absence**: since 2023-10-02 every senator has a row on every scrutin
   (groups vote for their members). Participation means nothing here.
4. **Solemn votes** have no flag: a delegated ballot marks one (27 since 2023).
5. **Mises au point**: 1,267 of 1,272 flags tied to a sentence; the rest (a
   misspelt name, no sentence at all) are left out, never guessed.
6. `scrdat` has no time: within a day, order by number.
7. **A sentence repeated on the next scrutin**: `corscr` sometimes copies a
   sitting's sentence onto the following scrutin, where the flagged senator's
   ballot already holds the intended position (8 since 2023). Such a
   correction changes nothing and is left out, counted as
   `unchangedCorrections` in the run's report.

### Datasets built (2026-10-06, full run)

| Dataset | Files | Raw | Largest file | gzip |
|---|---|---|---|---|
| `senate/senators.json` | 1 | 172 KB | — | 23 KB |
| `senate/groups.json` | 1 | 1 KB | — | — |
| `senate/scrutins.json` (index and missing) | 1 | 469 KB | — | 52 KB |
| `senate/scrutins/<session>-<block>.json` | 11 | 25.8 MB | 2.8 MB | 131 KB for `2025-2` |
| `senate/senators/<id>.json` | 441 | 33.2 MB | 99 KB | 3 KB |

- 455 files, 59 MB raw: the whole run writes 1,927 files, and the built site
  3,280 with 1,235 prerendered documents, under the 15,000 limit.
- 909 scrutins (27 solemn), 13 missing, 441 senators, 10 groups; 1,267
  corrections kept, 8 unchanged, 5 unmatched.

## HATVP

Licence Ouverte (https://www.hatvp.fr/open-data/: « les déclarations publiées
par la Haute Autorité sont librement réutilisables »). Cite « HATVP » and the
list's date.

- Index: `https://www.hatvp.fr/livraison/opendata/liste.csv` (3.2 MB, UTF-8
  without BOM, `;`, CRLF, one row per document of every declarant). No ETag;
  `If-Modified-Since` answers 304. Read with the CSV reader of the
  constituencies (`csv-rows.ts`).
- Declarations: `https://www.hatvp.fr/livraison/dossiers/<file>`, the PDF
  named in `nom_fichier`, the XML in `open_data`. The file name carries the
  declaration's id, so its content never changes: each XML is downloaded once
  into `.cache/open-data/hatvp-declarations/` and never asked for again. Once
  the publisher stops answering, the rest of the run asks for none: those
  people show the list without the summary, counted as
  `unavailableInterestFiles`.
- The merged `https://www.hatvp.fr/livraison/merge/declarations.xml` (80+ MB)
  is not used: it has no id to join the list on.
- Lobbying registry (AGORA,
  `https://www.hatvp.fr/agora/opendata/agora_repertoire_opendata.json`, 138 MB):
  not used. Activities do not name deputies, only categories of officials.

### Columns used (`liste.csv`)

| Column | What |
|---|---|
| `type_mandat` | `depute` / `senateur` keep the row; other mandates (mayor, MEP…) are left out. |
| `type_document` | `dia` interests, `diam` its update; `dsp`, `dspm`, `dspfm` assets at start, change, end of mandate. |
| `statut_publication` | `Livrée`, `Déclaration déposée - publication à venir`, `… publication en préfecture à venir`, `En cours`, `Déclaration non déposée`, `dispense`. Any other value fails the run. |
| `date_depot`, `date_publication` | ISO days (the notice says DD/MM/YYYY), empty while `En cours`. |
| `nom_fichier`, `open_data` | File names; checked to hold no separator, since they become cache paths. |
| `url_dossier` | The person's page below hatvp.fr; the same on all their rows. |
| `id_origine` | Assemblée uid without `PA` (`841729`), Senate matricule (`21077M`); sometimes empty. |

### Unit declaration XML (`<declaration>`)

Nine sections, each `<xDto><items><items>…</items></items><neant>…</neant></xDto>`:
`activProfCinqDerniereDto`, `activConsultantDto`, `participationDirigeantDto`,
`participationFinanciereDto`, `activProfConjointDto`, `fonctionBenevoleDto`,
`mandatElectifDto`, `activCollaborateursDto`, `observationInteretDto`.
Parsed with `fast-xml-parser` (`infrastructure/xml-reader.ts`), every value a
string. Read: the label and organisation of each line, `dateDebut` /
`dateFin` (`MM/yyyy`), `conservee`. Never read: amounts, comments, and
`general/declarant` (birth date, contact details withheld). The spouse's
activities and the collaborators are third parties: only their count is kept.

### Traps

1. **Assets are never republished.** `dsp`/`dspm`/`dspfm` rows say `Livrée`
   with a file name, but the PDF answers 404: a parliamentarian's asset
   declaration is only consultable in the prefecture by registered voters
   (electoral code LO 135-2), and divulging it is an offence. The protocol
   refuses a link on one (`declarationSchema`), the web never draws one, and
   the page only says whether it was filed and when.
2. **Match order**: `id_origine`, then the number ending the chamber's
   `uri_hatvp` / `sendaiurl` against `url_dossier`, then the name with
   accents, case, word order and the namesake suffix (« MARTIN (GIRONDE) »)
   removed. A key two people share is dropped, never guessed between. Only
   rows of the member's own chamber count: a deputy elected senator is filed
   under `senateur` by the HATVP while the Assemblée may still list them.
3. **Former members** stay in the list as « Ancien député » / « Ancien
   sénateur » while their last declarations are processed (mostly the end of
   mandate asset declaration), with no `id_origine`: they match by name. Their
   declaration of interests is no longer online. Those who left earlier are
   not in the list at all.
4. **`En cours`** rows have no date and no file: 192 senators, most elected or
   re-elected in September 2026, have nothing published yet.
5. **A lone line is not a list** in the parsed XML: the line path is forced to
   an array. An empty section is `<items/>`, or has no `<items>` at all.
6. **`[Données non publiées]`** stands in for withheld values, inside
   otherwise filled fields: removed, and a value left empty becomes `null`.
7. A `diam` restates the whole declaration (its `declarationModificative`
   says `false` all the same): the latest published `dia`/`diam` by
   `date_depot` is the one summarised; the kind comes from the list.
8. « Néant » is read from `neant`, never inferred from an empty list.
9. Non-ASCII file and page names (`echaniz-iñaki-…`) must be percent-encoded.
10. The `sendaiurl` of the Senate is an old `http://…/pages_nominatives/x.html`
    address; the page link is always built from the list's `url_dossier`.

### Datasets built (2026-10-06, full run, list of 2026-10-02)

| Dataset | Files | Raw | Largest file | gzip |
|---|---|---|---|---|
| `hatvp/deputies/<deputyId>.json` | 649 | 1.31 MB | 9.9 KB | 404 KB in all |
| `hatvp/senators/<senatorId>.json` | 441 | 540 KB | 7.9 KB | — |

- One file per deputy and senator of the datasets; those the list does not
  hold get an empty record with their chamber's HATVP link, if any.
- Deputies: 596 of 649 matched (568 by id, 28 former deputies by name), 53
  former deputies unmatched; every sitting deputy matched. Senators: 362 of
  441 matched (348 by id, 14 former senators by name), 79 former senators
  unmatched; every sitting senator matched.
- 3,702 declarations listed; 699 declarations of interests summarised (532
  deputies, 167 senators), from 699 XML files (8.2 MB, downloaded once).
- The whole run writes 3,017 dataset files, and the built site 4,371
  with 1,235 prerendered documents, under the 15,000 limit.

## Assemblée nationale — what ingestion found

### Measured (2026-10-01, full run on the real dumps)

| Dataset | Files | Raw | Largest file | gzip |
|---|---|---|---|---|
| `assembly/deputies.json` | 1 | 299 KB | — | 36 KB |
| `assembly/groups.json` | 1 | 2 KB | — | — |
| `assembly/scrutins.json` (index) | 1 | 2.9 MB | — | 190 KB |
| `assembly/scrutins/<block>.json` | 85 | 116 MB | 2.5 MB | 50 KB for block 50 |
| `assembly/deputies/<id>.json` | 649 | 126 MB | 873 KB | 28 KB |
| `assembly/groups/<id>.json` | 14 | 11.5 MB | 970 KB | 52 KB |
| `meta.json` | 1 | 1 KB | — | — |

- **738 files**, 246 MB raw (820 with the "find my deputy" datasets of step 07 and the group records); the run fails above `MAX_PUBLISHED_FILES`
  (15,000).
- 8,434 scrutins, 649 deputies (577 sitting, 72 who left), 14 groups.
- Run time: ~20 s with downloads (40 MB of zips), ~8 s rebuilding from the
  cache (`--force`), under 1 s when nothing changed.
- 371 ballots are listed under another group than the deputy's mandates give
  for that day, all on the first days after a deputy arrives or returns from
  the government: `groupPosition` follows the group the ballot is listed under.

#### Skip mechanism

Each zip is fetched with `If-None-Match` / `If-Modified-Since` against
`.cache/open-data/<file>.validators.json`. When no source changed and
`.data/meta.json` exists, the run logs `{"event":"sources_unchanged"}`, writes
nothing and exits 0. Under GitHub Actions it also appends `changed=true|false`
to `$GITHUB_OUTPUT`, so later steps use
`if: steps.<ingest step id>.outputs.changed == 'true'`. `pnpm ingest --force`
or `INGEST_FORCE=true` rebuilds anyway. `refresh.yml` caches `.data` under a
hash of `apps/ingest/src` and `packages/protocol/src`: a push that changes how
datasets are shaped restores none, so the run rebuilds them from the cached
zips instead of deploying pages whose datasets were never written. A failure exits 1 with
`{"event":"ingest_failed", "code": …}` on stderr.

#### Traps found in the data

- **AMO10 keeps only running mandates**: a sitting deputy's past groups are in
  AMO30 alone, so AMO30 wins for an actor in both (AMO30 holds all 649).
- **`PO0` placeholder group** in 14 scrutins (all groups of scrutins 489–501,
  RN alone in 1302 and 6256): resolved to the group every listed voter belonged
  to that day; a `PO0` group with no voter and no vote is left out.
- **A stale replica** sometimes answers with the previous night's zip under
  another ETag: a download whose `Last-Modified` is not later than the cached
  one is ignored.
- **`positionMajoritaire` is unreliable, so it is not read.** It is `pour`
  for a group none of whose members voted (~9,000 times), and on 2026-10-02
  3,043 of 92,193 group positions contradicted the group's own counts —
  in 40 of the 95 major votes (scrutin 8280: RN published `pour` with 12 for
  and 106 against; scrutin 10: Écologistes `abstention` with 18 for, 0
  against). No shift between scrutins nor any single member's vote explains
  it, and the Assemblée's own scrutin pages show no group position at all.
- GP mandates repeat per role and split at renewals: same-group mandates that
  overlap or follow each other the next day are folded into one spell.
- A minister back in the chamber gets a second seat mandate whose `dateDebut`
  is election day: the seat starts at `mandature.datePriseFonction`.
- **Every seat period is present.** AMO30 holds every seat and group mandate
  AMO10 has; 29 deputies have two seat periods (back from the government,
  re-elected after an annulment). The run logs `ballotsOutsideMandates`:
  **0** on 2026-10-01, before and after the fixes below. The deputy who looked
  incomplete (PA793214, 921 ballots, one mandate from 2025-11-13) is a
  substitute whose ballots all date from 2025-11-17 on.
- **The wait for groups is not a group.** Groups were declared on
  2024-07-18; until then the Assemblée lists every deputy as non-attached
  (`PO840056`). A non-attached spell that ends by `GROUPS_FORMED_BY`
  (2024-07-31) and is followed by a group is dropped (570 deputies); a
  deputy who stayed non-attached keeps it. `deputies.json` went from 299 KB
  to 264 KB. One-day non-attached spells later in the legislature (a
  deputy arriving, then joining a group the next day) are kept.
- **A group's position is computed from its members' votes.**
  `groupPosition` and `majorityPosition` are the most frequent of for,
  against and abstention among the members who voted; `null` on a tie
  (~1,900 times, mostly small groups) or when none voted. On a motion of
  censure only votes for are recorded, so a group is `for` as soon as one
  member votes it; pages count motions voted by more than half the members.
- `assembly/highlights.json` (latest 10 solemn votes and 5 motions of
  censure) spares the home page the 2.9 MB index.
- "Mises au point" buckets come padded in arrays (`[null, { votant }]`), and
  `miseAuPoint.dysfonctionnement` (votes the system failed to record, 145
  scrutins) is published as corrections too. 932 corrections come from
  deputies with no recorded ballot: they appear in the scrutin's corrections
  but not in the deputy's record.
