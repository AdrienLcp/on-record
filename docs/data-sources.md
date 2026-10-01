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

- Constituency contours, GeoJSON:
  `https://static.data.gouv.fr/resources/contours-geographiques-des-circonscriptions-legislatives/20240613-191520/circonscriptions-legislatives-p10.geojson`
- Commune ↔ constituency table (Ministère de l'Intérieur, 2012 updated 2017,
  boundaries unchanged since): data.gouv.fr dataset
  `circonscriptions-legislatives-table-de-correspondance-des-communes-et-des-cantons-pour-les-elections-legislatives-de-2012-et-sa-mise-a-jour-pour-les-elections-legislatives-2017`.
- Postcode → INSEE commune: La Poste `laposte-hexasmal`
  (`https://data.laposte.fr/data-fair/api/v1/datasets/laposte-hexasmal/raw`).
- **Trap:** large cities span several constituencies and a postcode can cover
  several communes. Exact answer needs an address → point (Base Adresse
  Nationale, free public API, called from the browser) → point-in-polygon.

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
