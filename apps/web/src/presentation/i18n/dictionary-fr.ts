import { defineDictionary, defineTranslation } from '@adrienlcp/i18n'

/** A ballot position inside a sentence, where French writes it lowercase. */
const POSITION_IN_SENTENCE = {
  abstention: 'abstention',
  against: 'contre',
  for: 'pour',
  nonVoting: 'non-votant'
} as const

const ON_DAY = { dateStyle: 'long', timeZone: 'UTC' } as const

const SHORT_DAY = { dateStyle: 'medium', timeZone: 'UTC' } as const

export const FR_DICTIONARY = defineDictionary({
  ballot: {
    byDelegation: 'par délégation',
    correction: defineTranslation(
      'Mise au point : voulait voter {intended:enum}',
      {
        enum: { intended: POSITION_IN_SENTENCE }
      }
    ),
    position: {
      abstention: 'Abstention',
      against: 'Contre',
      for: 'Pour',
      nonVoting: 'Non-votant'
    }
  },
  common: {
    countOf: '{shown:number} sur {total:number}',
    day: defineTranslation('{day:date}', { date: { day: ON_DAY } }),
    loading: 'Chargement des données…',
    nominalOnly:
      'Seuls les scrutins publics laissent une trace individuelle. La plupart des votes de l’Assemblée se font à main levée, sans liste de noms : ils ne sont comptés nulle part ici.',
    share: defineTranslation('{share:number}', {
      number: { share: { maximumFractionDigits: 0, style: 'percent' } }
    }),
    shortDay: defineTranslation('{day:date}', { date: { day: SHORT_DAY } }),
    showMore: 'Afficher la suite',
    siteName: 'on-record'
  },
  communes: {
    department: 'dép. {code}',
    label: 'Commune ou code postal',
    loading: 'Chargement de la liste des communes…',
    noMatch:
      'Aucune commune ne correspond. Essayez le nom sans article, ou le code postal.',
    placeholder: 'Ex. : Lyon, Saint-Malo, 01340',
    postcodesAndMore: defineTranslation('{listed} et {count:plural}', {
      plural: { count: { one: '{?} autre', other: '{?} autres' } }
    }),
    typeMore: 'Tapez au moins deux lettres ou chiffres.'
  },
  deputies: {
    allDepartments: 'Tous les départements',
    allGroups: 'Tous les groupes',
    department: 'Département',
    empty: 'Aucun député ne correspond à ces critères.',
    filtersLegend: 'Filtrer la liste des députés',
    group: 'Groupe actuel',
    lead: 'Toutes les personnes qui ont siégé pendant la législature, avec leur groupe d’aujourd’hui. Cherchez par nom, ou filtrez par groupe et par département.',
    resultCount: defineTranslation('{count:plural}', {
      plural: {
        count: { one: '{?} député', other: '{?} députés', zero: 'Aucun député' }
      }
    }),
    scope: {
      all: 'Anciens compris',
      label: 'Période',
      sitting: 'En mandat'
    },
    search: 'Nom ou prénom',
    title: 'Députés'
  },
  deputy: {
    agreement: {
      context:
        'Compté sur les scrutins où son groupe, au jour du vote, avait une position publiée par l’Assemblée nationale, et où le député a voté pour, contre ou s’est abstenu. Cette position peut différer du vote le plus fréquent dans le groupe.',
      differing: defineTranslation('{count:plural}', {
        plural: {
          count: { one: '{?} vote différent', other: '{?} votes différents' }
        }
      }),
      matching: defineTranslation('{count:plural}', {
        plural: {
          count: { one: '{?} vote identique', other: '{?} votes identiques' }
        }
      }),
      none: 'Aucun scrutin comparable pour l’instant.',
      title: 'Même vote que la position de son groupe'
    },
    allDeputies: 'Tous les députés',
    constituency: defineTranslation(
      '{department}, {number:plural} circonscription',
      {
        plural: { number: { one: '{?}re', other: '{?}e', type: 'ordinal' } }
      }
    ),
    groupHistory: {
      from: defineTranslation('depuis le {from:date}', {
        date: { from: ON_DAY }
      }),
      period: defineTranslation('du {from:date} au {to:date}', {
        date: { from: ON_DAY, to: ON_DAY }
      }),
      title: 'Groupes pendant la législature'
    },
    hatvp: 'Déclarations d’intérêts (HATVP)',
    leftOffice: defineTranslation('A quitté son siège le {to:date}.', {
      date: { to: ON_DAY }
    }),
    missing: 'Aucun député ne porte cet identifiant dans les données.',
    noGroup: 'Sans groupe',
    officialPage: 'Sa fiche sur le site de l’Assemblée nationale',
    participation: {
      context:
        'Un député peut siéger en commission, être en mission ou dans sa circonscription pendant un vote en séance : ne pas voter n’est pas ne rien faire. Ce chiffre ne classe personne.',
      none: 'Aucun scrutin public pendant son mandat pour l’instant.',
      notRecorded: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: '{?} sans vote',
            other: '{?} sans vote',
            zero: 'aucun sans vote'
          }
        }
      }),
      recorded: defineTranslation('{count:plural}', {
        plural: {
          count: { one: '{?} vote enregistré', other: '{?} votes enregistrés' }
        }
      }),
      title: 'Scrutins publics avec un vote enregistré',
      total: defineTranslation('sur {count:plural} pendant son mandat', {
        plural: { count: { one: '{?} scrutin', other: '{?} scrutins' } }
      })
    },
    record: 'Ce que dit le registre',
    votes: {
      ballotFilter: 'Afficher',
      ballots: {
        againstGroup: 'Différents de la position de son groupe',
        all: 'Tous les scrutins',
        corrected: 'Avec une mise au point',
        delegated: 'Votés par délégation',
        notRecorded: 'Sans vote enregistré',
        recorded: 'Avec un vote enregistré',
        withGroup: 'Comme la position de son groupe'
      },
      count: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: '{?} scrutin',
            other: '{?} scrutins',
            zero: 'Aucun scrutin'
          }
        }
      }),
      empty: 'Aucun scrutin ne correspond à ces critères.',
      filtersLegend: 'Filtrer ses votes',
      groupMajority: 'Position de son groupe',
      groupNoMajority: 'aucune position publiée',
      notRecorded: 'Aucun vote enregistré',
      ownVote: 'Son vote',
      title: 'Ses votes, du plus récent au plus ancien'
    }
  },
  error: {
    dataset: {
      invalid:
        'Ces données ne correspondent pas au format attendu. Elles ne sont pas affichées plutôt que d’être affichées fausses.',
      missing: 'Ces données n’existent pas.',
      network:
        'Les données n’ont pas pu être téléchargées. Vérifiez la connexion, puis rechargez la page.'
    },
    note: 'Recharger la page suffit en général.',
    reload: 'Recharger la page',
    title: 'Cette page n’a pas pu s’afficher.'
  },
  findMyDeputy: {
    address: {
      failed:
        'Le service d’adresses ne répond pas. Réessayez dans un instant, ou choisissez dans la liste des circonscriptions ci-dessous.',
      label: 'Votre adresse à {commune}',
      noMatch:
        'Aucune adresse trouvée. Essayez avec le numéro et le nom de la rue.',
      placeholder: 'Ex. : 12 rue de la République',
      privacy:
        'L’adresse est envoyée à la Base Adresse Nationale pour être située sur la carte, puis comparée aux contours des circonscriptions dans votre navigateur. Le site ne la conserve pas.',
      searching: 'Recherche de l’adresse…',
      title: 'Votre adresse',
      typeMore: 'Tapez au moins trois caractères de l’adresse.',
      unplaced:
        'Cette adresse tombe hors des contours des circonscriptions de la commune, ce qui arrive près d’une limite. Choisissez une adresse voisine, ou retrouvez votre circonscription dans la liste ci-dessous.'
    },
    commune: {
      note: 'Le code postal suffit, mais un même code couvre parfois plusieurs communes : choisissez la vôtre dans la liste.',
      title: 'Votre commune',
      unknown:
        'Aucune commune ne porte ce code dans les données. Cherchez-la par son nom.'
    },
    homeLead:
      'Le nom de votre commune ou son code postal suffit ; une adresse n’est demandée que dans les villes partagées entre plusieurs circonscriptions.',
    lead: 'Chaque commune vote dans une circonscription, et chaque circonscription élit un député. Dans les grandes villes partagées entre plusieurs circonscriptions, votre adresse dit laquelle est la vôtre.',
    seat: {
      lastHolder: defineTranslation(
        'Dernier député de cette circonscription : {name}, jusqu’au {to:date}.',
        { date: { to: ON_DAY } }
      ),
      lastHolderRecord: 'Ses votes',
      record: 'Voir ses votes, scrutin par scrutin',
      title: 'Votre député',
      vacant: 'Siège vacant',
      vacantNote:
        'Personne ne siège aujourd’hui pour cette circonscription : le siège attend une élection partielle ou l’arrivée d’un remplaçant.',
      vacantTitle: 'Aucun député pour l’instant'
    },
    sources: {
      addresses:
        'Adresses : Base Adresse Nationale, service de géocodage de l’IGN',
      communes:
        'Communes au 1er janvier 2026 : Insee, Code officiel géographique',
      communeTable:
        'Communes et circonscriptions : ministère de l’Intérieur, table de correspondance (2017)',
      contours: 'Contours des circonscriptions : data.gouv.fr',
      licence:
        'Toutes ces données sont publiées sous Licence Ouverte. Les limites des circonscriptions n’ont pas changé depuis 2010 ; les communes fusionnées depuis gardent les circonscriptions de leurs anciennes communes.',
      postcodes: 'Codes postaux : La Poste, base officielle',
      title: 'D’où vient la réponse'
    },
    split: {
      constituency: defineTranslation('{number:plural}', {
        plural: {
          number: { one: '{?}re circ.', other: '{?}e circ.', type: 'ordinal' }
        }
      }),
      lead: '{commune} est partagée entre {count:number} circonscriptions. Votre adresse dit laquelle est la vôtre.',
      title: 'Les circonscriptions de {commune}',
      vacant: 'Siège vacant'
    },
    title: 'Trouver mon député'
  },
  footer: {
    method: 'Méthode et sources',
    source:
      'Données : <source>Assemblée nationale</source>, sous <licence>Licence Ouverte</licence>.',
    updated: defineTranslation('Mises à jour le {day:date}.', {
      date: { day: ON_DAY }
    })
  },
  group: {
    allGroups: 'Tous les groupes',
    lead: 'Comment le groupe a voté sur chaque scrutin public de la législature : la position que l’Assemblée nationale publie pour lui, et le vote de ses membres ce jour-là.',
    missing: 'Aucun groupe ne porte cet identifiant dans les données.',
    positions: {
      censure: {
        context:
          'Sur une motion de censure, seuls les votes pour sont enregistrés, et l’Assemblée publie « pour » comme position du groupe dès qu’un seul membre la vote. Ce chiffre compte donc les motions votées par plus de la moitié des membres du groupe ce jour-là.',
        lead: 'motions de censure votées par plus de la moitié de ses membres.',
        list: defineTranslation('{count:plural}', {
          plural: {
            count: {
              one: 'Voir la motion',
              other: 'Voir les {?} motions'
            }
          }
        }),
        none: 'Aucune motion de censure pendant que le groupe siégeait.',
        title: 'Motions de censure'
      },
      context:
        'La position du groupe est celle que publie l’Assemblée nationale pour chaque scrutin ; elle peut différer du vote de certains de ses membres, détaillé sur chaque scrutin.',
      noPosition: 'Sans position publiée',
      solemn: {
        lead: defineTranslation('{count:plural}', {
          plural: {
            count: {
              one: 'Sa position sur le seul vote solennel tenu pendant qu’il siégeait.',
              other:
                'Sa position sur les {?} votes solennels tenus pendant qu’il siégeait : en général, le vote sur l’ensemble d’un texte important.'
            }
          }
        }),
        none: 'Aucun vote solennel pendant que le groupe siégeait.',
        title: 'Votes solennels'
      },
      title: 'Ses positions',
      votes: defineTranslation('{count:plural}', {
        plural: {
          count: { one: '{?} vote', other: '{?} votes', zero: 'aucun' }
        }
      })
    },
    votes: {
      censureCount:
        '{count:number} sur {members:number} membres ont voté la censure',
      filtersLegend: 'Filtrer ses votes',
      position: 'Position du groupe',
      positionFilter: 'Position du groupe',
      positions: {
        abstention: 'Abstention',
        against: 'Contre',
        all: 'Toutes les positions',
        for: 'Pour',
        none: 'Sans position publiée',
        nonVoting: 'Non-votant'
      },
      title: 'Ses votes, du plus récent au plus ancien'
    }
  },
  groups: {
    colorNote:
      'Couleur officielle donnée par l’Assemblée nationale. Un groupe sans couleur officielle est hachuré.',
    dissolved: defineTranslation('Dissous le {to:date}', {
      date: { to: ON_DAY }
    }),
    formerTitle: 'Groupes dissous',
    lead: 'Les groupes politiques de la législature et le nombre de députés qui y siègent aujourd’hui.',
    members: defineTranslation('{count:plural}', {
      plural: {
        count: { one: '{?} député', other: '{?} députés', zero: 'Aucun député' }
      }
    }),
    noColor: 'pas de couleur officielle',
    sitting: 'En activité',
    title: 'Groupes politiques'
  },
  head: {
    deputies:
      'Toutes les personnes qui ont siégé à l’Assemblée nationale pendant la législature, anciens compris : cherchez par nom, groupe ou département, puis ouvrez le registre de leurs votes.',
    deputy:
      '{name} ({group}, {seat}) : chacun de ses votes publics à l’Assemblée nationale pendant la législature, à côté de la position de son groupe ce jour-là. Données officielles, sans classement.',
    findMyDeputy:
      'Votre commune ou votre adresse, et le député qui siège pour votre circonscription à l’Assemblée nationale, avec le registre de ses votes publics.',
    group:
      '{name} ({shortName}) : sa position sur chaque scrutin public de l’Assemblée nationale pendant la législature, votes solennels et motions de censure d’abord, et le vote de ses membres. Données officielles, sans classement.',
    groups:
      'Les groupes politiques de l’Assemblée nationale pendant la législature, le nombre de députés qui y siègent aujourd’hui, et les groupes dissous.',
    home: 'Comment chaque député a voté, scrutin par scrutin, à partir des données officielles de l’Assemblée nationale. Sans classement, sources citées.',
    method:
      'D’où viennent les chiffres : les fichiers officiels de l’Assemblée nationale lus chaque nuit, leur licence, la date de la dernière mise à jour et les règles que le site s’impose.',
    noGroup: 'sans groupe',
    outcome: {
      adopted: 'adopté',
      rejected: 'rejeté'
    },
    scrutin: defineTranslation(
      '{kind} du {day:date} sur « {title} », résultat : {outcome}. Comment chaque groupe et chaque député a voté, d’après les données officielles de l’Assemblée nationale.',
      { date: { day: ON_DAY } }
    ),
    scrutinKind: {
      censure: 'Motion de censure',
      ordinary: 'Scrutin public',
      solemn: 'Vote solennel'
    },
    scrutins:
      'Tous les scrutins publics de la législature, du plus récent au plus ancien : ce qui a été voté, le résultat, et comment chaque groupe et chaque député a voté.'
  },
  header: {
    deputies: 'Députés',
    groups: 'Groupes',
    home: 'on-record, accueil',
    navigation: 'Navigation principale',
    scrutins: 'Scrutins',
    skip: 'Aller au contenu'
  },
  home: {
    allScrutins: 'Tous les scrutins',
    latest: {
      lead: 'Les plus récents, sans aucune sélection : un vote solennel porte en général sur un texte entier et il est annoncé à l’avance.',
      title: 'Derniers votes solennels et motions de censure'
    },
    lead: 'Les votes nominatifs de l’Assemblée nationale, tirés des données officielles et expliqués sans jargon. Aucun classement, aucune note : le registre, et d’où il vient.',
    method: 'Lire la méthode complète',
    principlesTitle: 'Comment lire ce site',
    search: {
      label: 'Trouver un député',
      placeholder: 'Nom ou prénom',
      submit: 'Chercher'
    },
    title: 'Comment votent les députés, scrutin par scrutin.'
  },
  method: {
    dataLead:
      'Le site lit les fichiers publiés par l’Assemblée nationale sur data.assemblee-nationale.fr. Ils sont téléchargés chaque nuit, vérifiés, puis convertis sans rien y ajouter.',
    dataTitle: 'Les données',
    generatedAt: defineTranslation(
      'Dernière génération des données : {day:date}.',
      {
        date: {
          day: {
            dateStyle: 'long',
            timeStyle: 'short',
            timeZone: 'Europe/Paris'
          }
        }
      }
    ),
    licence:
      'Les données de l’Assemblée nationale sont publiées sous <licence>Licence Ouverte</licence> : on peut les réutiliser en citant leur source, ce que fait chaque page.',
    licenceTitle: 'Licence',
    principlesTitle: 'Les règles que le site s’impose',
    source: {
      lastModified: defineTranslation('modifié le {day:date}', {
        date: { day: ON_DAY }
      }),
      licences: {
        licenceOuverte: 'Licence Ouverte'
      },
      names: {
        'assembly-current-deputies':
          'Députés en exercice, leurs mandats et leurs groupes',
        'assembly-deputies-history':
          'Tous les députés de la législature, anciens compris, et leurs groupes successifs',
        'assembly-scrutins': 'Scrutins publics de la législature',
        'constituency-contours':
          'Contours des circonscriptions législatives (data.gouv.fr)',
        'insee-commune-moves':
          'Fusions, rétablissements et changements de code des communes (Insee)',
        'insee-communes':
          'Communes au 1er janvier 2026 (Insee, Code officiel géographique)',
        'insee-overseas-communes':
          'Communes des collectivités d’outre-mer (Insee)',
        'interior-commune-constituencies':
          'Communes et cantons par circonscription législative (ministère de l’Intérieur, 2017)',
        'laposte-postcodes': 'Codes postaux (La Poste)'
      },
      unknownModified: 'date de modification non communiquée'
    },
    sourcesTitle: 'Fichiers lus',
    summaries:
      'Le site ne rédige pas de résumé des textes votés : il affiche l’intitulé officiel, et explique en une phrase le type de vote (amendement, article, texte entier, motion) et ce que son adoption ou son rejet voulait dire. Ce type est déduit de l’intitulé.',
    summariesTitle: 'Pas de résumé rédigé',
    title: 'Méthode et sources'
  },
  notFound: {
    backHome: 'Retour à l’accueil',
    message: 'Aucune page à l’adresse {path}.',
    title: 'Page introuvable'
  },
  principles: {
    absence: {
      text: 'Pendant un vote en séance, beaucoup de députés sont en commission ou en circonscription. Le site montre la participation avec ce contexte, et ne classe jamais personne.',
      title: 'Une absence n’est pas de l’inactivité'
    },
    corrections: {
      text: 'Après un scrutin, un député peut déclarer le vote qu’il voulait émettre. Cette « mise au point » est affichée à côté du vote enregistré, jamais cachée.',
      title: 'Les mises au point comptent'
    },
    groupAtDate: {
      text: 'Un député qui change de groupe est rattaché, pour chaque vote, au groupe auquel il appartenait ce jour-là.',
      title: 'Le groupe du jour du vote'
    },
    nominal: {
      text: 'La plupart des votes se font à main levée et ne laissent aucune trace individuelle. Seuls les scrutins publics sont comptés ici.',
      title: 'Seuls les scrutins publics existent'
    },
    object: {
      text: 'Voter contre un amendement n’est pas voter contre une idée. Chaque scrutin dit ce qui était voté : un texte entier, un article, un amendement, une motion.',
      title: 'Un vote porte sur un objet précis'
    },
    selection: {
      text: 'Les listes sont complètes ou triées par date. Toute sélection future dira qui l’a faite et selon quels critères.',
      title: 'Aucune sélection cachée'
    },
    traceable: {
      text: 'Chaque chiffre mène à la liste des votes dont il est tiré, et chaque page cite sa source officielle.',
      title: 'Chaque chiffre se vérifie'
    }
  },
  scrutin: {
    allScrutins: 'Tous les scrutins',
    corrections: {
      intended: defineTranslation('voulait voter {intended:enum}', {
        enum: { intended: POSITION_IN_SENTENCE }
      }),
      lead: 'Après le scrutin, ces députés ont déclaré le vote qu’ils voulaient émettre. Le vote enregistré, qui compte dans le résultat, ne change pas.',
      recorded: defineTranslation('enregistré {recorded:enum}', {
        enum: { recorded: POSITION_IN_SENTENCE }
      }),
      title: 'Mises au point'
    },
    groups: {
      censureLead:
        'Pour une motion de censure, seuls les votes pour sont enregistrés : la partie vide de chaque barre correspond aux membres du groupe qui ne l’ont pas votée.',
      dissenters: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: '{?} a voté autrement que la position du groupe',
            other: '{?} ont voté autrement que la position du groupe'
          }
        }
      }),
      lead: 'Chaque député est compté dans le groupe auquel il appartenait le jour du vote. La barre couvre tous les membres : la partie vide correspond à ceux sans vote enregistré. La position du groupe est celle que publie l’Assemblée nationale ; elle peut différer du vote le plus fréquent dans le groupe.',
      majority: defineTranslation('Position du groupe : {position:enum}', {
        enum: { position: POSITION_IN_SENTENCE }
      }),
      members: defineTranslation('{count:plural}', {
        plural: { count: { one: '{?} membre', other: '{?} membres' } }
      }),
      noMajority: 'Aucune position de groupe publiée',
      title: 'Vote par groupe',
      withoutVote: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: '{?} sans vote',
            other: '{?} sans vote',
            zero: 'tous ont voté'
          }
        }
      })
    },
    kind: {
      censure:
        'Une motion de censure vise à renverser le gouvernement. Seuls les votes « pour » sont comptés : elle n’est adoptée qu’avec la majorité absolue des sièges de l’Assemblée.',
      ordinary:
        'Un scrutin public ordinaire est demandé pendant la séance, par un groupe, une commission ou le gouvernement, pour que le vote de chacun soit enregistré.',
      solemn:
        'Un scrutin public solennel est annoncé à l’avance, en général pour le vote sur l’ensemble d’un texte important : tous les députés peuvent venir voter.'
    },
    legislativeFile: 'Le dossier législatif',
    missing: 'Aucun scrutin ne porte ce numéro dans les données.',
    nominal: {
      count: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: '{?} député',
            other: '{?} députés',
            zero: 'Aucun député'
          }
        }
      }),
      empty: 'Aucun député ne correspond.',
      filtersLegend: 'Filtrer la liste nominative',
      lead: 'Les députés ayant un vote enregistré, groupe au jour du vote.',
      positionFilter: 'Vote',
      positions: {
        abstention: 'Abstention',
        against: 'Contre',
        all: 'Tous',
        for: 'Pour',
        nonVoting: 'Non-votants'
      },
      search: 'Chercher un député',
      title: 'Liste nominative'
    },
    object: {
      amendment: {
        adopted: 'Adopté : la modification entre dans le texte en discussion.',
        rejected:
          'Rejeté : ce passage du texte reste tel quel. Le texte lui-même n’était pas voté ici.',
        what: 'Ce vote porte sur un amendement : une modification proposée d’un passage du texte, pas sur le texte entier.'
      },
      article: {
        adopted: 'Adopté : l’article reste dans le texte.',
        rejected: 'Rejeté : l’article est retiré du texte.',
        what: 'Ce vote porte sur un article du texte, pas sur le texte entier.'
      },
      censure: {
        adopted: 'Adoptée : le gouvernement doit démissionner.',
        rejected: 'Rejetée : le gouvernement reste en place.',
        what: 'Ce vote porte sur une motion de censure, qui demande le renversement du gouvernement.'
      },
      disclosure:
        'Type de vote déduit de l’intitulé officiel. Le site ne rédige aucun résumé des textes.',
      governmentDeclaration: {
        adopted:
          'Approuvée : l’Assemblée soutient la déclaration du gouvernement.',
        rejected:
          'Rejetée : l’Assemblée ne la soutient pas. Pour une déclaration de politique générale, le gouvernement doit alors démissionner.',
        what: 'Ce vote porte sur une déclaration du gouvernement.'
      },
      other: {
        adopted: 'Adopté.',
        rejected: 'Rejeté.',
        what: 'L’objet de ce vote n’a pas pu être déduit de son intitulé : lisez l’intitulé officiel ci-dessus.'
      },
      procedural: {
        adopted: 'Adopté : la demande est acceptée.',
        rejected: 'Rejeté : la demande est refusée.',
        what: 'Ce vote porte sur le déroulement de la séance (suspension, prolongation, seconde délibération), pas sur le fond d’un texte.'
      },
      rejectionMotion: {
        adopted: 'Adoptée : le texte est rejeté sans être examiné.',
        rejected: 'Rejetée : l’examen du texte continue.',
        what: 'Ce vote porte sur une motion de rejet préalable, qui demande de rejeter le texte avant même de l’examiner.'
      },
      textPart: {
        adopted: 'Adoptée : l’examen du texte continue.',
        rejected:
          'Rejetée : le texte entier est rejeté par l’Assemblée à cette étape.',
        what: 'Ce vote porte sur une partie d’un texte budgétaire, pas sur le texte entier.'
      },
      wholeText: {
        adopted:
          'Adopté : l’Assemblée approuve le texte à cette étape de son parcours.',
        rejected: 'Rejeté : l’Assemblée n’approuve pas le texte à cette étape.',
        what: 'Ce vote porte sur l’ensemble du texte.'
      }
    },
    officialPage: 'Ce scrutin sur le site de l’Assemblée nationale',
    reference: defineTranslation('Scrutin n° {number:number}', {
      number: { number: { useGrouping: false } }
    }),
    requester: 'Demandé par : {requester}',
    result: {
      outcome: {
        adopted: 'Adopté',
        rejected: 'Rejeté'
      },
      title: 'Résultat'
    },
    sources: 'Sources',
    stances: {
      censureDigest: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: '{?} groupe compte au moins un vote pour la censure.',
            other: '{?} groupes comptent au moins un vote pour la censure.',
            zero: 'Aucun groupe ne compte de vote pour la censure.'
          }
        }
      }),
      censureLead:
        'Chaque barre couvre les membres du groupe : la partie remplie correspond à ceux qui ont voté la censure.',
      censureTitle: 'Votes pour la censure, par groupe',
      digestLead: 'Groupes : {parts}.',
      digestPart: defineTranslation('{count:number} {stance:enum}', {
        enum: {
          stance: { ...POSITION_IN_SENTENCE, none: 'sans position publiée' }
        }
      }),
      dissenters: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: '{?} député a voté autrement que la position de son groupe.',
            other:
              '{?} députés ont voté autrement que la position de leur groupe.',
            zero: 'Aucun député n’a voté autrement que la position de son groupe.'
          }
        }
      }),
      emptyTrack: 'Partie vide : sans vote enregistré',
      heading: {
        abstention: 'Position du groupe : abstention',
        against: 'Position du groupe : contre',
        for: 'Position du groupe : pour',
        none: 'Aucune position de groupe publiée',
        nonVoting: 'Position du groupe : non-votant'
      },
      rowCast: '{count:number} votes sur {members:number}',
      rowCount: '{count:number} sur {members:number}',
      title: 'Position des groupes'
    },
    totals: {
      censure: '{for:number} voix pour la censure',
      vote: 'Pour {for:number} · Contre {against:number} · Abstention {abstention:number}'
    }
  },
  scrutinKind: {
    censure: 'Motion de censure',
    ordinary: 'Ordinaire',
    solemn: 'Solennel'
  },
  scrutins: {
    empty: 'Aucun scrutin ne correspond à ces critères.',
    filtersLegend: 'Filtrer les scrutins',
    kind: 'Type de scrutin',
    kindTabs: {
      all: 'Tous',
      censure: 'Censure',
      ordinary: 'Ordinaires',
      solemn: 'Solennels'
    },
    lead: 'Tous les scrutins publics de la législature, du plus récent au plus ancien.',
    outcome: {
      adopted: 'Adoptés',
      all: 'Tous les résultats',
      label: 'Résultat',
      rejected: 'Rejetés'
    },
    resultCount: defineTranslation('{count:plural}', {
      plural: {
        count: {
          one: '{?} scrutin',
          other: '{?} scrutins',
          zero: 'Aucun scrutin'
        }
      }
    }),
    search: 'Chercher dans les intitulés',
    title: 'Scrutins'
  },
  theme: {
    dark: 'Sombre',
    label: 'Thème',
    light: 'Clair',
    system: 'Auto'
  },
  ui: {
    clearSearch: 'Effacer la recherche',
    newTab: '(nouvel onglet)'
  }
})
