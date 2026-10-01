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
| Amendments | `loi/amendements_div_legis/Amendements.json.zip` | 304 MB | ? |
| Legislative files | `loi/dossiers_legislatifs/Dossiers_Legislatifs.json.zip` | 10 MB | ? |
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

## Senate (later)

No standalone votes dataset: votes live in the DOSLEG PostgreSQL dump
(`https://data.senat.fr/data/dosleg/dosleg.zip`, 16 MB, nightly). Tables `scr`
(scrutins) and `votsen` (votes per senator, `senmatdel` = by delegation).
Senators and dated group history: `https://data.senat.fr/les-senateurs/`
(`ODSEN_HISTOGROUPES`). Licence terms not read yet.

## HATVP (later)

- Declarations of interests: `https://www.hatvp.fr/livraison/merge/declarations.xml`
  (87 MB, irregular updates), index `https://www.hatvp.fr/livraison/opendata/liste.csv`.
  Linked to deputies through the acteur's `uri_hatvp`. Licence Ouverte.
- Lobbying registry (AGORA): `https://www.hatvp.fr/agora/opendata/agora_repertoire_opendata.json`
  (138 MB, daily). **Activities do not name deputies**, only categories of
  officials: it cannot say "who met whom", only which interests lobbied on a
  subject.
