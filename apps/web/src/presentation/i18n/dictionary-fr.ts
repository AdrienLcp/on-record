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

/** A month the declarations to the HATVP give: « mars 2020 ». */
const IN_MONTH = { month: 'long', timeZone: 'UTC', year: 'numeric' } as const

export const FR_DICTIONARY = defineDictionary({
  amendments: {
    article: {
      after: {
        many: 'Après les articles {designation}',
        one: 'Après l’article {designation}'
      },
      before: {
        many: 'Avant les articles {designation}',
        one: 'Avant l’article {designation}'
      },
      on: {
        many: 'Articles {designation}',
        one: 'Article {designation}'
      },
      title: 'Titre du texte'
    },
    asRapporteur: 'Déposé comme rapporteur, au nom de la commission',
    cosigned: defineTranslation('{count:plural}', {
      plural: {
        count: {
          one: '{?} amendement cosigné',
          other: '{?} amendements cosignés',
          zero: 'Aucun amendement cosigné'
        }
      }
    }),
    cosignedContext:
      'Les amendements cosignés ne sont pas listés : un groupe cosigne souvent par centaines ceux de ses membres, et un par un ils ne disent pas qui les a écrits.',
    count: defineTranslation('{count:plural}', {
      plural: {
        count: {
          one: '{?} amendement',
          other: '{?} amendements',
          zero: 'Aucun amendement'
        }
      }
    }),
    empty:
      'Aucun amendement déposé en premier signataire dans les données pour l’instant.',
    emptyFilter: 'Aucun amendement ne correspond à ces filtres.',
    filtersLegend: 'Filtrer les amendements',
    glossary: {
      fell: 'Devenu sans objet avant son tour, le plus souvent parce qu’un amendement adopté avant lui avait déjà réécrit ou supprimé le passage visé.',
      inadmissible:
        'Écarté avant tout débat, sans vote : il aurait créé une dépense ou réduit une recette publique, ce que la Constitution interdit aux parlementaires (article 40), ou il n’avait pas de lien avec le texte (article 45).',
      noRate:
        'Aucun taux de réussite n’est calculé : le sort d’un amendement dépend surtout de la majorité et de la procédure, pas seulement de son contenu. Ces chiffres ne classent personne.',
      notMoved:
        'Personne n’était là pour le défendre quand son tour est venu en séance.',
      pending: 'Le texte n’a pas encore été débattu à cet endroit.',
      stages:
        'Un amendement rejeté ou retiré en commission peut être déposé de nouveau pour la séance : il apparaît alors deux fois.',
      title: 'Ce que veulent dire ces mentions',
      withdrawn:
        'Son auteur l’a retiré, souvent après la réponse du rapporteur ou du gouvernement, ou au profit d’un autre amendement.'
    },
    lead: 'Amendements déposés en premier signataire, du plus récent au plus ancien. Sous chacun, le début de l’exposé écrit par son auteur.',
    number: 'Amendement n° {number}',
    officialPage: 'Lire l’amendement',
    outcomeFilter: 'Sort',
    outcomeOption: '{label} ({count:number})',
    outcomes: {
      adopted: 'Adoptés',
      all: 'Tous',
      fell: 'Tombés',
      inadmissible: 'Irrecevables',
      notMoved: 'Non soutenus',
      pending: 'Pas encore examinés',
      rejected: 'Rejetés',
      withdrawn: 'Retirés'
    },
    scrutin: 'Voté au scrutin n° {number:number}',
    stage: {
      culture: 'Commission des affaires culturelles et de l’éducation',
      defence: 'Commission de la défense',
      economy: 'Commission des affaires économiques',
      finance: 'Commission des finances',
      foreignAffairs: 'Commission des affaires étrangères',
      law: 'Commission des lois',
      otherCommittee: 'En commission',
      sitting: 'En séance',
      socialAffairs: 'Commission des affaires sociales',
      specialCommittee: 'Commission spéciale',
      sustainableDevelopment: 'Commission du développement durable'
    },
    stageTabs: {
      all: 'Tous',
      committee: 'En commission',
      label: 'Étape',
      sitting: 'En séance'
    },
    title: 'Amendements déposés',
    unknownFile: 'Texte non identifié dans les données'
  },
  ballot: {
    byDelegation: 'par délégation',
    correction: defineTranslation(
      'Mise au point : voulait voter {intended:enum}',
      {
        enum: { intended: POSITION_IN_SENTENCE }
      }
    ),
    groupMajority: 'Position de son groupe',
    groupNoMajority: 'sans majorité',
    ownVote: 'Son vote',
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
  compare: {
    camps: {
      aside: 'Autre',
      none: 'Aucun parti'
    },
    columnVote: 'Vote',
    digest: {
      every: {
        censure:
          'Les {count:number} partis ont tous pris la même position sur <figure>{together:number} des {total:number}</figure> motions de censure. Choisissez-en deux ci-dessus pour les mettre face à face.',
        solemn:
          'Les {count:number} partis ont tous pris la même position sur <figure>{together:number} des {total:number}</figure> votes solennels. Choisissez-en deux ci-dessus pour les mettre face à face.'
      },
      label: 'En résumé',
      pair: {
        censure:
          '<first>{firstName}</first> et <second>{secondName}</second> ont pris la même position sur <figure>{together:number} des {total:number}</figure> motions de censure.',
        solemn:
          '<first>{firstName}</first> et <second>{secondName}</second> ont pris la même position sur <figure>{together:number} des {total:number}</figure> votes solennels.'
      },
      showAll: 'Revoir tous les votes',
      showSplit: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: 'Voir le seul vote où ils se séparent',
            other: 'Voir les {?} votes où ils se séparent'
          }
        }
      }),
      showTogether: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: 'Voir le seul vote où ils sont d’accord',
            other: 'Voir les {?} votes où ils sont d’accord'
          }
        }
      })
    },
    empty: {
      noMatch: 'Aucun vote de ce type ne correspond à cette recherche.',
      noSplit: 'Ces partis ont pris la même position sur chacun de ces votes.',
      noTogether:
        'Ces partis ne se sont jamais tous retrouvés du même côté sur ces votes.'
    },
    heading: {
      censure: {
        all: 'Chaque motion de censure, du plus récent au plus ancien',
        split: 'Les motions de censure où ils se séparent',
        together: 'Les motions de censure où ils sont d’accord'
      },
      solemn: {
        all: 'Chaque vote solennel, du plus récent au plus ancien',
        split: 'Les votes solennels où ils se séparent',
        together: 'Les votes solennels où ils sont d’accord'
      }
    },
    kinds: {
      censure: 'Motions de censure',
      solemn: 'Votes solennels'
    },
    kindsLabel: 'Type de vote',
    lead: {
      camps:
        'Sur chaque grand vote de la législature, les partis rangés du côté qu’a pris leur groupe : pour, abstention ou contre.',
      ledger:
        'Une ligne par texte, une colonne par parti : la position que le groupe de chaque parti a prise au dernier vote solennel du texte. Ouvrez une ligne pour lire ce que fait le texte, voir les voix et les votes précédents.',
      texts:
        'Cherchez une loi dont vous avez entendu parler : la position de chaque parti à chaque fois que l’Assemblée l’a votée, et qui a changé d’avis en route.'
    },
    ledger: {
      earlierReadings: 'Les votes précédents sur ce texte',
      latestReading: defineTranslation(
        'Dernier vote : {stage}, le {day:date}',
        {
          date: { day: ON_DAY }
        }
      )
    },
    notes: {
      censure:
        'Sur une motion de censure, seuls les votes pour sont enregistrés, un groupe est donc « pour » dès qu’un seul de ses membres la vote. Un parti « l’a votée » ici quand plus de la moitié des membres de son groupe l’ont votée ce jour-là.',
      solemn:
        'Chaque marque est la position majoritaire des députés du groupe sur ce scrutin, calculée à partir de leurs votes : le choix le plus fréquent entre pour, contre et abstention. Le détail de chaque vote donne les voix, membre par membre.'
    },
    notListedCounts: 'Le groupe ne siégeait pas ce jour-là.',
    onlyOne: {
      text: 'Avec <strong>{party}</strong> seul, il n’y a rien à mettre côte à côte. Ajoutez au moins un autre parti ci-dessus, ou ouvrez <group>la page du groupe {acronym}</group> pour voir tous ses votes.',
      title: 'Rien à comparer pour l’instant'
    },
    onlySplit: 'Seulement les votes où ces partis se séparent',
    parties: 'Partis comparés',
    scrutinLink: defineTranslation(
      'Le scrutin n° {number:number} en détail, député par député',
      { number: { number: { useGrouping: false } } }
    ),
    search: 'Chercher un texte',
    stance: {
      abstention: 'Abstention',
      against: 'Contre',
      backed: 'L’a votée',
      for: 'Pour',
      none: 'Sans majorité',
      nonVoting: 'Non-votant',
      notBacked: 'Ne l’a pas votée',
      notListed: 'Ne siégeait pas',
      someVoices: 'Quelques voix'
    },
    texts: {
      changedFrom: defineTranslation('A changé · avant : {before:enum}', {
        enum: { before: POSITION_IN_SENTENCE }
      }),
      grouping:
        'Les votes d’un même texte sont rassemblés par leur dossier législatif quand l’Assemblée le publie, par leur intitulé sinon : un texte renommé en route peut apparaître deux fois. « A changé » ne compare que deux positions prises, pour, contre ou abstention.',
      heading: {
        censure: {
          all: 'Chaque motion de censure, de la plus récente à la plus ancienne',
          split: 'Les motions de censure où ils se séparent'
        },
        solemn: {
          all: 'Chaque texte, du dernier voté au plus ancien',
          split: 'Les textes où ils se séparent au moins une fois'
        }
      },
      onlySplit: {
        censure: 'Seulement les motions où ces partis se séparent',
        solemn: 'Seulement les textes où ces partis se séparent'
      },
      readingCount: defineTranslation('{count:plural}', {
        plural: { count: { one: '{?} vote', other: '{?} votes' } }
      }),
      revenuePartOnly: 'Première partie seulement : les recettes',
      withoutStage: 'Vote solennel'
    },
    title: 'Comparer les partis, vote par vote',
    views: {
      camps: 'Qui avec qui',
      ledger: 'Tableau',
      texts: 'Par texte'
    },
    viewsLabel: 'Façon de lire la comparaison',
    why: 'Pourquoi ces partis ?'
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
        'Compté sur les scrutins où son groupe, au jour du vote, avait une position majoritaire (le vote le plus fréquent de ses députés, calculé à partir de leurs votes), et où le député a voté pour, contre ou s’est abstenu.',
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
      notRecorded: 'Aucun vote enregistré',
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
      'Données : <source>Assemblée nationale</source>, <senate>Sénat</senate> et <hatvp>HATVP</hatvp>, sous <licence>Licence Ouverte</licence>.',
    updated: defineTranslation('Mises à jour le {day:date}.', {
      date: { day: ON_DAY }
    })
  },
  group: {
    allGroups: 'Tous les groupes',
    lead: 'Comment le groupe a voté sur chaque scrutin public de la législature : la position majoritaire de ses députés, calculée à partir de leurs votes, et le vote de chacun ce jour-là.',
    missing: 'Aucun groupe ne porte cet identifiant dans les données.',
    positions: {
      censure: {
        context:
          'Sur une motion de censure, seuls les votes pour sont enregistrés, un groupe est donc « pour » dès qu’un seul de ses membres la vote. Ce chiffre compte donc les motions votées par plus de la moitié des membres du groupe ce jour-là.',
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
        'La position du groupe est la position majoritaire de ses députés, calculée à partir de leurs votes : le choix le plus fréquent entre pour, contre et abstention. Le vote de chacun est détaillé sur chaque scrutin.',
      noPosition: 'Sans majorité',
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
        none: 'Sans majorité',
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
  hatvp: {
    assetsNote:
      'Les déclarations de patrimoine des parlementaires ne sont pas publiées en ligne : la loi les rend seulement consultables en préfecture, par les électeurs inscrits. Le site dit seulement si elles ont été déposées, et quand.',
    declarations: {
      kinds: {
        assets: 'Déclaration de situation patrimoniale',
        assetsEndOfMandate:
          'Déclaration de situation patrimoniale de fin de mandat',
        assetsUpdate: 'Modification de la situation patrimoniale',
        interests: 'Déclaration d’intérêts et d’activités',
        interestsUpdate:
          'Modification de la déclaration d’intérêts et d’activités'
      },
      phrases: {
        awaiting: 'Publication à venir',
        exempt: 'Dispense de déclaration',
        filed: defineTranslation('Déposée le {day:date}', {
          date: { day: ON_DAY }
        }),
        inProgress: 'En cours à la HATVP, pas encore publiée',
        notFiled: 'Non déposée, selon la HATVP',
        prefecture: 'Consultable en préfecture',
        prefectureSoon: 'Bientôt consultable en préfecture',
        published: defineTranslation('Publiée le {day:date}', {
          date: { day: ON_DAY }
        })
      },
      title: 'Les déclarations de son mandat'
    },
    empty:
      'La HATVP ne publie aucune déclaration pour ce mandat. Elle ne garde en ligne que les déclarations des mandats en cours : celles d’un ancien parlementaire n’y figurent plus.',
    interests: {
      filed: defineTranslation(
        'Sa dernière déclaration d’intérêts, déposée le {day:date}, telle qu’elle a été écrite.',
        { date: { day: ON_DAY } }
      ),
      item: {
        from: defineTranslation('depuis {from:date}', {
          date: { from: IN_MONTH }
        }),
        kept: 'conservée pendant le mandat',
        period: defineTranslation('de {from:date} à {to:date}', {
          date: { from: IN_MONTH, to: IN_MONTH }
        }),
        to: defineTranslation('jusqu’à {to:date}', {
          date: { to: IN_MONTH }
        }),
        withheld: 'Texte non publié par la HATVP'
      },
      more: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: 'Afficher la ligne suivante',
            other: 'Afficher les {?} lignes suivantes'
          }
        }
      }),
      none: 'Néant, déclaré comme tel',
      notYet:
        'La HATVP ne publie pas, à ce jour, de déclaration d’intérêts pour ce mandat : elle n’est pas encore publiée, ou n’est plus en ligne après la fin du mandat.',
      pdf: 'Lire la déclaration complète (PDF)',
      sections: {
        collaborators:
          'Collaborateurs parlementaires et leurs autres activités',
        consulting: 'Activités de conseil',
        electedOffices: 'Autres mandats et fonctions électives',
        governingBodies:
          'Fonctions dans les organes dirigeants d’un organisme ou d’une société',
        observations: 'Observations',
        recentActivities:
          'Activités professionnelles des cinq dernières années',
        shareholdings: 'Participations au capital de sociétés',
        spouseActivities: 'Activités professionnelles du conjoint',
        volunteerRoles: 'Fonctions bénévoles'
      },
      thirdParty: {
        collaborators: defineTranslation('{count:plural}', {
          plural: {
            count: {
              one: '{?} collaborateur déclaré',
              other: '{?} collaborateurs déclarés'
            }
          }
        }),
        note: 'Seul le nombre est repris : ces lignes concernent d’autres personnes que le parlementaire. Le détail figure dans la déclaration.',
        spouseActivities: defineTranslation('{count:plural}', {
          plural: {
            count: {
              one: '{?} activité déclarée',
              other: '{?} activités déclarées'
            }
          }
        })
      },
      title: 'Intérêts et activités déclarés'
    },
    lead: 'Chaque parlementaire déclare à la Haute Autorité pour la transparence de la vie publique (HATVP) ses activités, ses fonctions et ses participations.',
    leadReuse:
      'Le site reprend sa dernière déclaration telle qu’elle a été déposée, sans la vérifier ni la commenter ; les montants restent dans le document original.',
    page: 'Sa page sur le site de la HATVP',
    source: defineTranslation(
      'Source : <hatvp>HATVP</hatvp>, sous <licence>Licence Ouverte</licence>, liste du {day:date}.',
      { date: { day: ON_DAY } }
    ),
    sourceUndated:
      'Source : <hatvp>HATVP</hatvp>, sous <licence>Licence Ouverte</licence>.',
    title: 'Déclarations à la HATVP'
  },
  head: {
    assembly: 'Assemblée nationale',
    compare:
      'Les partis en lice pour 2027 côte à côte, vote par vote : la position de leur groupe sur chaque vote solennel et chaque motion de censure de la législature, d’après les données officielles de l’Assemblée nationale.',
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
    scrutinPage: defineTranslation(
      '{subject} (scrutin n° {number:number}, {day:date})',
      {
        date: { day: ON_DAY },
        number: { number: { useGrouping: false } }
      }
    ),
    scrutins:
      'Tous les scrutins publics de la législature, du plus récent au plus ancien : ce qui a été voté, le résultat, et comment chaque groupe et chaque député a voté.',
    senate: 'Sénat',
    senateScrutin: defineTranslation(
      '{kind} du Sénat du {day:date} sur « {title} », résultat : {outcome}. Comment chaque groupe et chaque sénateur a voté, d’après les données officielles du Sénat.',
      { date: { day: ON_DAY } }
    ),
    senateScrutinPage: defineTranslation('{subject} (Sénat, {day:date})', {
      date: { day: ON_DAY }
    }),
    senateScrutins:
      'Tous les scrutins publics du Sénat depuis le renouvellement d’octobre 2023, du plus récent au plus ancien : ce qui a été voté, le résultat, et comment chaque groupe et chaque sénateur a voté.',
    senator:
      '{name} ({group}, {constituency}) : chacun de ses votes publics au Sénat depuis octobre 2023, à côté de la position de son groupe ce jour-là. Données officielles, sans classement.',
    senatorPage: '{name} (Sénat)',
    senators:
      'Toutes les personnes qui ont siégé au Sénat depuis le renouvellement d’octobre 2023, anciens compris : cherchez par nom ou par groupe, puis ouvrez le registre de leurs votes.',
    shareImageAlt:
      'on-record : une fiche de registre sur un bureau gris-bleu, avec la phrase « Comment votent les députés, scrutin par scrutin. »',
    voteMatch:
      'Dites ce que vous auriez voté sur douze textes de l’Assemblée nationale, et voyez quels partis en lice pour 2027 ont fait le même choix, texte par texte. Données officielles, sans classement ni consigne de vote.'
  },
  header: {
    compare: 'Comparer',
    deputies: 'Députés',
    groups: 'Groupes',
    home: 'on-record, accueil',
    navigation: 'Navigation principale',
    scrutins: 'Scrutins',
    senate: 'Sénat',
    skip: 'Aller au contenu',
    voteMatch: 'Qui vote comme vous',
    voteMatchShort: '2027'
  },
  method: {
    dataLead:
      'Le site lit les fichiers publiés par l’Assemblée nationale sur data.assemblee-nationale.fr et par le Sénat sur data.senat.fr. Ils sont téléchargés chaque nuit, vérifiés, puis convertis. Un seul chiffre est recalculé : la position de chaque groupe, expliquée plus bas. Au Sénat, les scrutins couverts commencent au renouvellement du 2 octobre 2023. Les déclarations d’intérêts viennent de la liste publiée par la Haute Autorité pour la transparence de la vie publique (HATVP), et de chaque déclaration publiée en données ouvertes.',
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
    groupPosition:
      'La position d’un groupe sur un scrutin est le choix le plus fréquent de ses députés qui ont voté : pour, contre ou abstention. En cas d’égalité, le groupe est « sans majorité ». Les fichiers de l’Assemblée contiennent bien une position de groupe, mais elle contredit les votes des membres sur environ 3 % des scrutins, et le site de l’Assemblée ne l’affiche pas : le site la recalcule donc à partir des votes nominatifs, qui sont affichés sur chaque scrutin. Le Sénat ne publie aucune position de groupe : elle est calculée de la même façon à partir des votes de ses sénateurs.',
    groupPositionTitle: 'La position d’un groupe',
    licence:
      'Les données de l’Assemblée nationale, du Sénat et de la HATVP sont publiées sous <licence>Licence Ouverte</licence> : on peut les réutiliser en citant leur source, ce que fait chaque page. Les déclarations de patrimoine des parlementaires, que la loi réserve à la consultation en préfecture, ne sont jamais reprises.',
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
        'assembly-amendments':
          'Amendements déposés à l’Assemblée nationale, leur auteur et leur sort',
        'assembly-current-deputies':
          'Députés en exercice, leurs mandats et leurs groupes',
        'assembly-deputies-history':
          'Tous les députés de la législature, anciens compris, et leurs groupes successifs',
        'assembly-legislative-files':
          'Dossiers législatifs : le scrutin de chaque étape d’un texte',
        'assembly-scrutins': 'Scrutins publics de la législature',
        'constituency-contours':
          'Contours des circonscriptions législatives (data.gouv.fr)',
        'hatvp-declarations':
          'Déclarations d’intérêts et de patrimoine des parlementaires (HATVP)',
        'insee-commune-moves':
          'Fusions, rétablissements et changements de code des communes (Insee)',
        'insee-communes':
          'Communes au 1er janvier 2026 (Insee, Code officiel géographique)',
        'insee-overseas-communes':
          'Communes des collectivités d’outre-mer (Insee)',
        'interior-commune-constituencies':
          'Communes et cantons par circonscription législative (ministère de l’Intérieur, 2017)',
        'laposte-postcodes': 'Codes postaux (La Poste)',
        'senate-dosleg':
          'Scrutins publics du Sénat, votes de chaque sénateur, mises au point et dossiers législatifs',
        'senate-senators': 'Sénateurs, leurs mandats et leurs groupes (Sénat)'
      },
      unknownModified: 'date de modification non communiquée'
    },
    sourcesTitle: 'Fichiers lus',
    summaries:
      'Un intitulé officiel dit souvent l’intention d’un texte (« pour une montagne vivante et souveraine », « relatif à la protection des enfants ») plutôt que ce qu’il change. Les textes passés par un vote solennel ont donc un nom et un court résumé écrits par on-record à partir du texte voté : ce que le texte crée, oblige, interdit ou finance, sans adjectif, sans l’objectif qu’il affiche, et sans dire qui l’a soutenu. L’intitulé officiel et le lien vers le dossier de l’Assemblée restent à côté. Les autres scrutins gardent l’intitulé officiel, avec une phrase sur le type de vote (amendement, article, texte entier, motion), déduit de l’intitulé, et ce que son adoption ou son rejet voulait dire.',
    summariesTitle: 'Les résumés',
    title: 'Méthode et sources'
  },
  notFound: {
    backHome: 'Retour à l’accueil',
    message: 'Aucune page à l’adresse {path}.',
    title: 'Page introuvable'
  },
  outcome: {
    adopted: 'Adopté',
    fell: 'Tombé',
    inadmissible: 'Irrecevable',
    notMoved: 'Non soutenu',
    pending: 'À examiner',
    rejected: 'Rejeté',
    withdrawn: 'Retiré'
  },
  party: {
    disclosure: defineTranslation(
      '<strong>Partis en lice</strong> : {threshold:number} % ou plus dans la moyenne de <polls>{count:number} sondages</polls> publiés du {from:date} au {to:date}. Liste choisie par on-record, mise à jour le {updatedOn:date}, revue après la primaire socialiste du 17 octobre. Un parti se lit ici par le groupe où siègent ses députés : Renaissance par EPR ; Place publique, sans groupe, par le groupe socialiste (SOC). Les groupes alliés (UDR, Dem) ne sont pas fondus dans un parti.',
      { date: { from: ON_DAY, to: ON_DAY, updatedOn: ON_DAY } }
    ),
    filterLabel: 'Filtrer par parti',
    names: {
      horizons: 'Horizons',
      lfi: 'La France insoumise',
      placePublique: 'Place publique',
      renaissance: 'Renaissance',
      rn: 'Rassemblement national'
    },
    noGroupShown: 'Aucun des groupes choisis n’apparaît ici.',
    others: 'Autres groupes',
    showAll: 'Tout afficher',
    showAllGroups: 'Afficher tous les groupes',
    showOnly: 'N’afficher que',
    status: defineTranslation('{count:plural} sur {total:number} affichés.', {
      plural: { count: { one: '{?} groupe', other: '{?} groupes' } }
    }),
    statusAll: 'Tous les groupes sont affichés.'
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
      text: 'Les listes sont complètes ou triées par date. Les rares sélections, comme les partis en lice ou les textes du parcours de l’accueil, disent qui les a faites et selon quels critères.',
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
      lead: 'Chaque député est compté dans le groupe auquel il appartenait le jour du vote. La barre couvre tous les membres : la partie vide correspond à ceux sans vote enregistré. La position du groupe est la position majoritaire de ses députés, calculée à partir de leurs votes ; sans majorité en cas d’égalité.',
      majority: defineTranslation('Position du groupe : {position:enum}', {
        enum: { position: POSITION_IN_SENTENCE }
      }),
      members: defineTranslation('{count:plural}', {
        plural: { count: { one: '{?} membre', other: '{?} membres' } }
      }),
      noMajority: 'Sans majorité dans le groupe',
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
      emptyForParties: defineTranslation(
        'Aucun député des groupes affichés n’a {position:enum} sur ce scrutin.',
        {
          enum: {
            position: {
              abstention: 'choisi l’abstention',
              against: 'voté contre',
              all: 'de vote enregistré',
              for: 'voté pour',
              nonVoting: 'été non-votant'
            }
          }
        }
      ),
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
      budgetCredits: {
        adopted: 'Adoptés : les crédits de la mission restent dans le texte.',
        rejected:
          'Rejetés : l’Assemblée retire ces crédits du texte à cette étape.',
        what: 'Ce vote porte sur les crédits d’une mission du budget, l’argent prévu pour une politique publique, pas sur le texte entier.'
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
      referralMotion: {
        adopted:
          'Adoptée : le texte repart en commission, son examen en séance s’arrête.',
        rejected: 'Rejetée : l’examen du texte continue.',
        what: 'Ce vote porte sur une motion de renvoi en commission, qui demande que la commission réexamine le texte avant tout débat.'
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
      title: 'Résultat'
    },
    sources: 'Sources',
    stances: {
      censureDigest: {
        all: defineTranslation('{count:plural}', {
          plural: {
            count: {
              one: '{?} groupe compte au moins un vote pour la censure.',
              other: '{?} groupes comptent au moins un vote pour la censure.',
              zero: 'Aucun groupe ne compte de vote pour la censure.'
            }
          }
        }),
        shown: defineTranslation('{count:plural}', {
          plural: {
            count: {
              one: 'Parmi les groupes affichés, {?} compte au moins un vote pour la censure.',
              other:
                'Parmi les groupes affichés, {?} comptent au moins un vote pour la censure.',
              zero: 'Aucun des groupes affichés ne compte de vote pour la censure.'
            }
          }
        })
      },
      censureLead:
        'Chaque barre couvre les membres du groupe : la partie remplie correspond à ceux qui ont voté la censure.',
      censureTitle: 'Votes pour la censure, par groupe',
      digestLead: {
        all: 'Groupes : {parts}.',
        shown: 'Groupes affichés : {parts}.'
      },
      digestPart: defineTranslation('{count:number} {stance:enum}', {
        enum: {
          stance: { ...POSITION_IN_SENTENCE, none: 'sans majorité' }
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
        none: 'Sans majorité dans le groupe',
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
  scrutinTitle: {
    censure: {
      afterForcedAdoption: 'Censurer le gouvernement après un 49.3',
      plain: 'Censurer le gouvernement',
      tabledBy: 'Déposée par {authors}'
    },
    officialTitle: 'Intitulé officiel : « {title} »',
    secondDeliberation: 'Seconde délibération',
    specialLaw: 'Loi spéciale',
    stage: {
      finalReading: 'Lecture définitive',
      firstReading: 'Première lecture',
      jointCommittee: 'Accord députés-sénateurs (CMP)',
      newReading: 'Nouvelle lecture',
      secondReading: 'Deuxième lecture'
    },
    textKind: {
      bill: 'Projet de loi',
      constitutionalBill: 'Projet de loi constitutionnelle',
      constitutionalMemberBill: 'Proposition de loi constitutionnelle',
      europeanResolution: 'Résolution européenne',
      memberBill: 'Proposition de loi',
      organicBill: 'Projet de loi organique',
      organicMemberBill: 'Proposition de loi organique',
      resolution: 'Résolution'
    },
    textKindHint: {
      bill: 'Texte déposé par le gouvernement',
      constitutionalBill:
        'Texte déposé par le gouvernement pour réviser la Constitution',
      constitutionalMemberBill:
        'Texte déposé par des parlementaires pour réviser la Constitution',
      europeanResolution:
        'Avis de l’Assemblée sur une question européenne, sans force de loi',
      memberBill: 'Texte déposé par des parlementaires',
      organicBill:
        'Texte déposé par le gouvernement, qui précise l’application de la Constitution',
      organicMemberBill:
        'Texte déposé par des parlementaires, qui précise l’application de la Constitution',
      resolution: 'Avis ou décision de l’Assemblée, sans force de loi'
    },
    wholeText: 'Texte entier'
  },
  senateScrutin: {
    allScrutins: 'Tous les scrutins du Sénat',
    corrections: {
      lead: 'Après le scrutin, ces sénateurs ont déclaré le vote qu’ils voulaient émettre. Le vote enregistré, qui compte dans le résultat, ne change pas.'
    },
    groups: {
      lead: 'Chaque sénateur est compté dans le groupe auquel il appartenait le jour du vote. La position du groupe est la position majoritaire de ses sénateurs, calculée à partir de leurs votes ; sans majorité en cas d’égalité.'
    },
    groupVoting:
      'Au Sénat, lors d’un scrutin public ordinaire, un membre de chaque groupe peut déposer les bulletins de tous ses collègues : un vote enregistré ne prouve pas qu’un sénateur était en séance.',
    kind: {
      ordinary:
        'Un scrutin public ordinaire est demandé pendant la séance, par un groupe, une commission ou le gouvernement, pour que le vote de chacun soit enregistré.',
      solemn:
        'Un scrutin public solennel est annoncé à l’avance, en général pour le vote sur l’ensemble d’un texte important : chaque sénateur vote lui-même, ou confie sa délégation à un collègue.'
    },
    legislativeFile: 'Le dossier législatif « {title} » sur le site du Sénat',
    missing: 'Aucun scrutin du Sénat ne porte ce numéro dans les données.',
    nominal: {
      count: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: '{?} sénateur',
            other: '{?} sénateurs',
            zero: 'Aucun sénateur'
          }
        }
      }),
      empty: 'Aucun sénateur ne correspond.',
      lead: 'Les sénateurs ayant un vote enregistré, groupe au jour du vote.',
      search: 'Chercher un sénateur'
    },
    nominalOnly:
      'Seuls les scrutins publics laissent une trace individuelle. La plupart des votes du Sénat se font à main levée, sans liste de noms : ils ne sont comptés nulle part ici.',
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
      budgetCredits: {
        adopted: 'Adoptés : les crédits de la mission restent dans le texte.',
        rejected:
          'Rejetés : le Sénat retire ces crédits de sa version du texte.',
        what: 'Ce vote porte sur les crédits d’une mission du budget, l’argent prévu pour une politique publique, pas sur le texte entier.'
      },
      governmentDeclaration: {
        adopted:
          'Approuvée : le Sénat soutient la déclaration du gouvernement.',
        rejected:
          'Rejetée : le Sénat ne la soutient pas, sans conséquence sur le gouvernement.',
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
        what: 'Ce vote porte sur le déroulement de la séance (suspension, seconde délibération), pas sur le fond d’un texte.'
      },
      referralMotion: {
        adopted:
          'Adoptée : le texte repart en commission, son examen en séance s’arrête.',
        rejected: 'Rejetée : l’examen du texte continue.',
        what: 'Ce vote porte sur une motion de renvoi en commission, qui demande que la commission réexamine le texte avant tout débat.'
      },
      rejectionMotion: {
        adopted:
          'Adoptée : le Sénat rejette le texte sans en examiner les articles.',
        rejected: 'Rejetée : l’examen du texte continue.',
        what: 'Ce vote porte sur une motion qui demande de rejeter le texte avant d’en examiner les articles : la question préalable (le texte n’a pas lieu d’être débattu) ou l’exception d’irrecevabilité (il serait contraire à la Constitution).'
      },
      textPart: {
        adopted: 'Adoptée : l’examen du texte continue.',
        rejected: 'Rejetée : le Sénat rejette le texte entier à cette étape.',
        what: 'Ce vote porte sur une partie d’un texte budgétaire, pas sur le texte entier.'
      },
      wholeText: {
        adopted:
          'Adopté : le Sénat approuve le texte à cette étape de son parcours.',
        rejected: 'Rejeté : le Sénat n’approuve pas le texte à cette étape.',
        what: 'Ce vote porte sur l’ensemble du texte.'
      }
    },
    officialPage: 'Ce scrutin sur le site du Sénat',
    reference: defineTranslation(
      'Scrutin n° {number:number} ({session:number}-{nextYear:number})',
      {
        number: {
          nextYear: { useGrouping: false },
          number: { useGrouping: false },
          session: { useGrouping: false }
        }
      }
    )
  },
  senateScrutins: {
    lead: 'Les scrutins publics du Sénat depuis le renouvellement d’octobre 2023, du plus récent au plus ancien.',
    missing: {
      lead: 'Le Sénat a numéroté ces scrutins sans les publier dans ses données ouvertes : ils ne sont consultables que sur son site, et ne comptent dans aucun chiffre ici.',
      title: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: '{?} scrutin absent des données du Sénat',
            other: '{?} scrutins absents des données du Sénat'
          }
        }
      })
    },
    search: 'Chercher dans les intitulés et les dossiers',
    title: 'Scrutins du Sénat'
  },
  senator: {
    allSenators: 'Tous les sénateurs',
    constituency: defineTranslation('{gender:enum} au titre de : {name}', {
      enum: { gender: { female: 'Élue', male: 'Élu' } }
    }),
    groupHistory: {
      title: 'Groupes depuis octobre 2023'
    },
    missing: 'Aucun sénateur ne porte cet identifiant dans les données.',
    officialPage: 'Sa fiche sur le site du Sénat',
    votes: {
      none: 'Aucun scrutin public enregistré pour ce sénateur depuis son arrivée.',
      noParticipation:
        'Au Sénat, un membre de chaque groupe peut voter pour tous ses collègues : chaque sénateur a un vote enregistré sur presque chaque scrutin, présent ou non. Ce site n’affiche donc aucun taux de participation des sénateurs.'
    }
  },
  senators: {
    empty: 'Aucun sénateur ne correspond à ces critères.',
    filtersLegend: 'Filtrer la liste des sénateurs',
    lead: 'Toutes les personnes qui ont siégé au Sénat depuis le renouvellement d’octobre 2023, avec leur groupe d’aujourd’hui. Cherchez par nom, ou filtrez par groupe.',
    resultCount: defineTranslation('{count:plural}', {
      plural: {
        count: {
          one: '{?} sénateur',
          other: '{?} sénateurs',
          zero: 'Aucun sénateur'
        }
      }
    }),
    title: 'Sénateurs'
  },
  textSummaries: {
    label: 'Ce que fait le texte',
    officialFile: 'Le dossier sur le site de l’Assemblée',
    officialTitle: 'Intitulé officiel :',
    texts: {
      DLR5L15N43846: {
        summary:
          'Le texte étend aux communes de moins de 1 000 habitants le scrutin de liste déjà utilisé dans les communes plus grandes : les électeurs votent pour une liste entière, sans pouvoir rayer ou ajouter des noms, et les listes alternent femmes et hommes. Une liste peut compter jusqu’à deux candidats de moins que le nombre de sièges. Le conseil municipal est réputé complet avec au moins 5, 9 ou 13 membres selon la taille de la commune. Le texte s’applique à partir du prochain renouvellement général des conseils municipaux.',
        title:
          'Voter par listes paritaires dans les communes de moins de 1 000 habitants'
      },
      DLR5L16N49176: {
        summary:
          'Le texte autorise les agents de sécurité de la SNCF et de la RATP à fouiller les bagages avec l’accord du propriétaire, à intervenir aux abords des gares et à retenir des objets dangereux. Il permet au juge d’interdire à une personne condamnée pour certains crimes ou délits commis dans les transports d’y paraître pendant trois ans au plus. Il expérimente des caméras-piétons pour les conducteurs de bus et de car et prolonge jusqu’au 1er mars 2027 l’expérimentation de vidéosurveillance algorithmique lancée pour les Jeux olympiques. Il punit d’une amende l’abandon de bagages et oblige à y inscrire nom et prénom dans certains véhicules.',
        title:
          'Agents de sécurité des transports : fouilles, interdiction de paraître, caméras'
      },
      DLR5L16N49364: {
        summary:
          'Le texte définit la « mode ultra-express » : des vêtements vendus par des entreprises qui mettent en vente un très grand nombre de nouveaux modèles, selon des seuils fixés par décret. Il interdit à partir du 1er janvier 2027 la publicité pour ces produits et leur promotion par les influenceurs, sous peine d’une amende jusqu’à 100 000 euros. Il ajoute une pénalité par vêtement à la contribution environnementale payée par les producteurs, jusqu’à 12 euros en 2026 et 20 euros à partir de 2030, plafonnée à 50 % du prix hors taxe. Il oblige les sites de vente en ligne à afficher le lieu de fabrication du vêtement aussi lisiblement que le prix.',
        title:
          'Définir la « mode ultra-express », interdire sa publicité et la pénaliser'
      },
      DLR5L16N49726: {
        summary:
          'Le texte déclare l’agriculture et la pêche « d’intérêt général majeur » et intérêt fondamental de la Nation, et fixe l’objectif d’au moins 400 000 exploitations et 500 000 exploitants agricoles. Il crée le réseau France services agriculture pour accompagner les installations et les départs. Il soumet toute destruction de haie à une déclaration unique préalable et remplace, pour les atteintes non intentionnelles aux espèces protégées, les poursuites pénales par une amende de 450 € au plus ou un stage. Il accélère le traitement par le juge des recours contre les réserves d’eau et certains élevages.',
        title:
          'Inscrire l’agriculture comme intérêt fondamental et encadrer l’arrachage des haies'
      },
      DLR5L16N49849: {
        summary:
          'Le texte inscrit dans le code de l’énergie des objectifs chiffrés : 58 % d’énergie décarbonée dans la consommation en 2030, 18 gigawatts d’éolien en mer en service et 29 gigawatts d’hydroélectricité en 2035, au moins 4,5 gigawatts d’hydrogène produit par électrolyse en 2030. Il porte l’objectif de baisse des émissions de gaz à effet de serre en 2030 de 40 % à 50 %, hors forêts et sols. Il interdit à partir du 1er janvier 2027 de produire de l’électricité à partir de charbon, sauf menace pour l’approvisionnement. Il vise 380 000 rénovations énergétiques performantes de logements par an.',
        title:
          'Fixer des objectifs de production d’énergie et de baisse des émissions pour 2030-2035'
      },
      DLR5L16N49868: {
        summary:
          'Le texte supprime de nombreuses commissions et instances consultatives de l’État et abroge les zones à faibles émissions (ZFE), qui limitent la circulation des véhicules les plus polluants dans certaines villes. Il permet aux acheteurs publics de passer des marchés de travaux sans publicité ni mise en concurrence sous le seuil européen, et autorise à qualifier par décret certains grands centres de données de « projets d’intérêt national majeur », ce qui leur ouvre des procédures d’autorisation dérogatoires. Il ouvre aux petites et moyennes entreprises un droit de résilier leurs contrats d’assurance de biens professionnels et crée un conseil de la simplification qui évalue l’impact des nouveaux textes sur les entreprises.',
        title:
          'Supprimer les zones à faibles émissions et des commissions de l’État'
      },
      DLR5L17N50169: {
        summary:
          'Le texte crée à Paris un procureur de la République anti-criminalité organisée, compétent sur tout le territoire. Il permet au ministre de la Justice de placer les détenus liés au crime organisé dans des quartiers de prison spécifiques, pour un an renouvelable. Il crée le délit de concours à une organisation criminelle, puni de trois ans de prison et 150 000 euros d’amende, et réforme le statut des repentis (« collaborateurs de justice »). Il autorise le préfet à fermer pour six mois un commerce lié au trafic, à interdire pour un mois l’accès d’un point de deal à ceux qui y participent, et permet de verser certaines techniques d’enquête dans un dossier séparé accessible aux seuls magistrats.',
        title:
          'Créer un parquet national anti-criminalité organisée et des quartiers de prison dédiés'
      },
      DLR5L17N50198: {
        summary:
          'Le texte est la première partie du projet de loi de finances pour 2025 : elle fixe les impôts, les recettes de l’État et l’équilibre général du budget. Le projet indexe le barème de l’impôt sur le revenu sur l’inflation et crée une contribution garantissant une imposition minimale de 20 % aux foyers dont le revenu dépasse 250 000 € (personne seule) ou 500 000 € (couple). Il crée aussi une contribution exceptionnelle sur les bénéfices des grandes entreprises.',
        title:
          'Budget de l’État pour 2025 : impôts et recettes (première partie)'
      },
      DLR5L17N50579: {
        summary:
          'Le texte est une loi organique qui accompagne la loi étendant le scrutin de liste aux communes de moins de 1 000 habitants. Il oblige, dans toutes les communes, à indiquer sur les bulletins de vote la nationalité des candidats citoyens d’un autre pays de l’Union européenne, et soumet ces candidats aux mêmes règles de candidature quelle que soit la taille de la commune. Pour la règle qui interdit à un député de cumuler plusieurs mandats locaux, seul le mandat de conseiller municipal d’une commune de 1 000 habitants et plus continue de compter. Il s’applique à partir du prochain renouvellement général des conseils municipaux.',
        title:
          'Étendre aux petites communes les règles des candidats européens aux municipales'
      },
      DLR5L17N50690: {
        summary:
          'Le texte crée une comparution immédiate pour les mineurs d’au moins 16 ans déjà suivis par la justice et encourant au moins trois ans de prison. Il écarte l’atténuation de peine liée à l’âge pour les plus de 16 ans en récidive d’un crime ou délit puni d’au moins cinq ans, sauf décision contraire du tribunal. Il punit de trois ans de prison et 45 000 euros d’amende le parent dont le manquement a directement conduit l’enfant à commettre un crime ou plusieurs délits, oblige les parents à venir aux convocations du juge des enfants sous peine d’amende civile et rend les deux parents responsables des dommages causés par l’enfant même s’il ne vit pas avec eux. Il permet d’interdire à un mineur, pour six mois au plus, de sortir sur la voie publique sans un parent.',
        title:
          'Créer une comparution immédiate dès 16 ans et punir les manquements des parents'
      },
      DLR5L17N50724: {
        summary:
          'Le texte oblige les établissements d’enseignement supérieur à former à la lutte contre l’antisémitisme, le racisme, les discriminations, les violences et la haine. Il impose dans chaque université une mission « égalité et diversité » avec un référent antisémitisme et racisme et un dispositif de signalement anonyme. Il inscrit l’antisémitisme, le racisme et l’incitation à la haine parmi les fautes passibles de sanction disciplinaire, y compris hors de l’établissement en cas de lien suffisant avec lui, et crée dans chaque région académique une section disciplinaire commune présidée par un juge administratif.',
        title:
          'Sanctionner l’antisémitisme et le racisme à l’université et créer des référents'
      },
      DLR5L17N50819: {
        summary:
          'Le texte permet au Gouvernement d’autoriser par décret, à titre exceptionnel, des insecticides de la famille des néonicotinoïdes aujourd’hui interdits, en cas de menace grave pour une production agricole sans alternative suffisante, avec un réexamen après trois ans puis chaque année. Pour les projets d’élevages de bovins, porcs et volailles, il remplace la réunion publique par une permanence du commissaire enquêteur et permet de relever les seuils au-delà desquels ils sont soumis à autorisation. Il présume « d’intérêt général majeur » les réserves d’eau à usage agricole dans les zones durablement en manque d’eau. Il autorise les inspecteurs de l’environnement à porter des caméras individuelles.',
        title:
          'Autoriser par dérogation des néonicotinoïdes et relever les seuils des élevages'
      },
      DLR5L17N51037: {
        summary:
          'Le texte crée une présomption : quand un policier ou un gendarme fait usage de son arme, il est présumé l’avoir fait dans un cas autorisé par la loi, de façon absolument nécessaire et strictement proportionnée. Cette présomption peut être renversée à tout moment par une preuve contraire. Le texte réécrit aussi le cas où l’arme peut servir à empêcher qu’un ou plusieurs meurtres venant d’être commis se répètent dans un temps rapproché.',
        title:
          'Présumer régulier l’usage de leur arme par les policiers et gendarmes'
      },
      DLR5L17N51039: {
        summary:
          'Le texte modifie le droit du sol propre à Mayotte. Un enfant né à Mayotte de parents étrangers ne peut devenir français que si ses deux parents (et non plus un seul) résidaient en France de façon régulière depuis plus d’un an (et non plus trois mois) à sa naissance. Cette résidence se prouve par un titre de séjour accompagné d’un passeport biométrique valide. Si l’enfant n’a de lien de filiation qu’avec un seul parent, la condition ne porte que sur ce parent.',
        title:
          'Exiger deux parents en séjour régulier depuis un an pour le droit du sol à Mayotte'
      },
      DLR5L17N51078: {
        summary:
          'Le texte est une loi organique qui complète le statut des magistrats pour le nouveau procureur de la République anti-criminalité organisée, créé à Paris par la loi sur le narcotrafic. Il le soumet aux mêmes règles statutaires que les procureurs financier et antiterroriste de Paris. Il entre en vigueur le 5 janvier 2026.',
        title:
          'Inscrire le procureur national anti-criminalité organisée dans le statut des magistrats'
      },
      DLR5L17N51079: {
        summary:
          'Le texte est une loi spéciale : faute de budget voté avant le 1er janvier, elle permet à l’État de continuer à fonctionner. Il autorise, jusqu’à l’adoption du budget 2025, la perception des impôts existants et les emprunts de l’État. Il fixe à environ 45,1 milliards d’euros les versements de l’État aux collectivités locales et autorise des caisses de sécurité sociale, dont l’Acoss (qui gère la trésorerie de la Sécurité sociale), à emprunter.',
        title:
          'Autoriser l’État à percevoir les impôts et à emprunter en attendant le budget 2025'
      },
      DLR5L17N51222: {
        summary:
          'Le texte charge un établissement public de coordonner la reconstruction de Mayotte et permet à l’État de construire et réparer les écoles à la place des communes jusqu’à fin 2027. Il assouplit pendant deux ans les règles d’urbanisme et de marchés publics pour reconstruire. Il porte à 75 % la réduction d’impôt pour les dons faits jusqu’au 17 mai 2025, dans la limite de 2 000 €. Il suspend les poursuites pour dettes fiscales et sociales et prolonge les droits sociaux et les allocations chômage arrivant à échéance.',
        title:
          'Mayotte après le cyclone Chido : dérogations pour reconstruire, droits prolongés'
      },
      DLR5L17N51362: {
        summary:
          'Le texte autorise la France à ratifier un amendement de 2009 au protocole de Londres, le traité international qui encadre le déversement de déchets en mer. Cet amendement permet d’exporter ou d’importer du dioxyde de carbone capté afin de le stocker durablement dans des couches géologiques sous les fonds marins. Chaque exportation exige un accord préalable entre le pays exportateur et le pays de stockage, qui répartit leurs responsabilités.',
        title:
          'Autoriser l’export de dioxyde de carbone pour le stocker sous les fonds marins'
      },
      DLR5L17N51429: {
        summary:
          'Le texte étend la rétention administrative de 210 jours au plus, jusqu’ici réservée aux étrangers condamnés pour terrorisme, à ceux condamnés pour des crimes ou délits graves (meurtre, viol, trafic de stupéfiants, violences, proxénétisme…), à ceux visés par une expulsion ou une interdiction du territoire, et à ceux dont le comportement est jugé une menace d’une particulière gravité pour l’ordre public. Pour les autres, la durée maximale reste de 90 jours. Le texte autorise aussi à prendre les empreintes et la photo d’un étranger en rétention sans son accord, sur autorisation du procureur et en présence de son avocat, et facilite le placement en rétention de certains demandeurs d’asile.',
        title:
          'Allonger jusqu’à 210 jours la rétention des étrangers condamnés pour des faits graves'
      },
      DLR5L17N51467: {
        summary:
          'Le texte est une résolution européenne : elle exprime la position de l’Assemblée sans créer de règle obligatoire. Elle condamne l’agression russe contre l’Ukraine et appelle l’Union européenne et ses alliés à accroître leur soutien politique, économique et militaire. Elle demande la saisie des avoirs russes gelés pour financer ce soutien, le renforcement des sanctions et la création d’un tribunal spécial pour juger les dirigeants russes. Elle invite aussi à accompagner l’adhésion de l’Ukraine à l’Union européenne et à bâtir une défense européenne.',
        title:
          'Demander plus d’aide à l’Ukraine, la saisie des avoirs russes et un tribunal spécial'
      },
      DLR5L17N51504: {
        summary:
          'Le texte prolonge jusqu’au 15 avril 2028 l’obligation de revendre les produits alimentaires au moins 10 % au-dessus de leur prix d’achat ainsi que le plafonnement des promotions. Il autorise des promotions allant jusqu’à 40 % du prix pour les produits de grande consommation qui ne sont pas alimentaires. Il punit d’une amende pouvant aller jusqu’à 0,4 % du chiffre d’affaires le distributeur qui ne transmet pas aux ministres le document sur l’usage de ces marges. Il remplace l’amende de 75 000 € prévue pour l’imposition d’un prix de revente minimal par une amende pouvant atteindre 0,4 % du chiffre d’affaires.',
        title:
          'Prolonger jusqu’en 2028 la marge minimale de 10 % et le plafond des promotions'
      },
      DLR5L17N51670: {
        summary:
          'Le texte crée un droit à l’aide à mourir : une personne peut être autorisée à prendre une substance létale, ou à se la faire administrer par un médecin ou un infirmier si elle ne peut pas le faire elle-même. Il faut être majeur, français ou résident stable, atteint d’une maladie grave et incurable qui engage la vie, en phase avancée ou terminale, avec une souffrance réfractaire ou insupportable, et capable d’exprimer une volonté libre et éclairée ; une souffrance psychologique seule ne suffit pas. Un médecin décide après une procédure collégiale, dans un délai de 15 jours, puis la personne doit confirmer sa demande après au moins deux jours de réflexion. Aucun soignant n’est obligé d’y participer, mais il doit indiquer des collègues qui acceptent.',
        title:
          'Créer une aide à mourir pour les majeurs atteints d’une maladie grave et incurable'
      },
      DLR5L17N51672: {
        summary:
          'Le texte définit dans la loi l’accompagnement et les soins palliatifs, ouverts aux malades graves de tout âge où qu’ils vivent, y compris en prison, et interdit les dépassements d’honoraires pour ces soins. Il crée des « maisons d’accompagnement et de soins palliatifs », publiques ou privées à but non lucratif, pour les malades qui ne peuvent pas rester chez eux sans avoir besoin d’un service hospitalier, avec un accueil de répit pour les proches. Il fixe une stratégie nationale dotée de 150 à 244 millions d’euros de mesures nouvelles par an de 2026 à 2034, avec l’objectif d’au moins deux unités de soins palliatifs par région avant fin 2030. Il range les directives anticipées dans le dossier médical partagé et prévoit un livret d’information sur ces droits remis aux patients.',
        title:
          'Soins palliatifs : créer des maisons d’accueil et fixer les crédits jusqu’en 2034'
      },
      DLR5L17N51732: {
        summary:
          'Le texte permet à une fédération de créer deux ligues professionnelles, l’une masculine et l’une féminine, et organise la fin ou le renouvellement de la délégation donnée à une ligue, avec un médiateur nommé par le ministre en cas de désaccord. Il autorise la Cour des comptes à contrôler les comptes des fédérations, des ligues et de leurs sociétés commerciales, et interdit aux personnes condamnées pour certains crimes ou délits de diriger une fédération. Il permet de faire bloquer sans délai, pendant la diffusion en direct, les sites qui diffusent une compétition sans en détenir les droits. Il autorise, du 1er janvier 2027 au 30 juin 2028, l’insertion de publicités virtuelles dans les retransmissions sportives.',
        title:
          'Encadrer les ligues de sport professionnel, leur gestion et le piratage des matchs'
      },
      DLR5L17N51968: {
        summary:
          'Le texte autorise une « clause de fonction » dans le bail d’un logement social obtenu par un agent public ou un salarié des transports publics grâce à son employeur : quand il quitte cet emploi, l’employeur peut demander la fin du bail dans l’année, avec un préavis d’au moins six mois. Un délai supplémentaire d’un an au plus est possible pour raison médicale, familiale ou professionnelle, et les locataires en situation de handicap peuvent rester dans certains cas. Le texte relève de 10 % à 50 % la part maximale de logements sociaux réservés à l’État quand il cède un terrain à prix réduit. Il permet de déroger au plan local d’urbanisme pour construire des logements sur des terrains publics si au moins la moitié est réservée à ces agents.',
        title:
          'Créer une clause liant le logement social d’agents publics à leur emploi'
      },
      DLR5L17N51984: {
        summary:
          'Le texte fait de Mayotte un « Département-Région » : une seule collectivité qui exerce à la fois les compétences d’un département et d’une région, dirigée par une « assemblée de Mayotte ». Il adapte en conséquence les règles de loi organique, notamment les incompatibilités entre le mandat de conseiller à l’assemblée de Mayotte et ceux de député, de sénateur ou les fonctions de magistrat. Ces règles s’appliquent à partir du prochain renouvellement général des conseils départementaux.',
        title:
          'Transformer Mayotte en « Département-Région » doté d’une assemblée unique'
      },
      DLR5L17N51985: {
        summary:
          'Le texte allonge les durées de résidence exigées à Mayotte pour certains titres de séjour (cinq ans de séjour régulier pour faire venir sa famille, sept ans pour une admission au titre des liens personnels) et supprime au 1er janvier 2030 le titre de séjour valable uniquement à Mayotte. Il autorise le préfet à faire évacuer et démolir les quartiers d’habitat informel, avec un délai d’au moins quinze jours et une proposition de relogement ou d’hébergement. Il relève le Smic net à Mayotte à 87,5 % de celui de la métropole au 1er janvier 2026 et autorise le Gouvernement à aligner les prestations sociales par ordonnance. Il crée une assemblée de Mayotte de 52 membres élus pour six ans.',
        title:
          'Mayotte : séjour plus long exigé, démolition de l’habitat informel, Smic relevé'
      },
      DLR5L17N52100: {
        summary:
          'Le texte fixe le cadre juridique des jeux Olympiques et Paralympiques d’hiver des Alpes françaises 2030 et autorise les régions Auvergne-Rhône-Alpes et Provence-Alpes-Côte d’Azur à garantir chacune jusqu’à un quart d’un éventuel déficit du comité d’organisation, dans la limite de 75 millions d’euros chacune. Il allège les procédures d’urbanisme et permet l’expropriation avec prise de possession immédiate pour les villages olympiques et les ouvrages des Jeux. Il autorise le préfet à permettre l’ouverture des commerces le dimanche près des sites, avec des salariés volontaires. Il prolonge jusqu’au 31 décembre 2027 l’expérimentation de caméras dont les images sont analysées par des algorithmes, et permet l’inspection visuelle des véhicules à l’entrée des grands événements.',
        title:
          'Jeux d’hiver 2030 : dérogations d’urbanisme, travail le dimanche, caméras à algorithmes'
      },
      DLR5L17N52104: {
        summary:
          'Le texte permet aux personnes nées en Nouvelle-Calédonie et inscrites sur la liste électorale générale de voter aux élections du Congrès et des assemblées de province, réservées jusque-là à un corps électoral restreint. Il prévoit leur inscription d’office sur la liste électorale spéciale, sans démarche de leur part. Il entre en vigueur le lendemain de sa publication.',
        title:
          'Ajouter les natifs de Nouvelle-Calédonie aux électeurs des élections provinciales'
      },
      DLR5L17N52428: {
        summary:
          'Le texte est la première partie du budget de l’État pour 2026 : elle autorise la perception des impôts, fixe les recettes et plafonne le déficit, avant que la seconde partie ne répartisse les dépenses. Dans la version déposée par le Gouvernement, elle prolonge la contribution différentielle sur les très hauts revenus et, pour 2026, la contribution exceptionnelle sur les bénéfices des grandes entreprises avec des taux divisés par deux. Elle crée une taxe sur le patrimoine financier des holdings patrimoniales, une taxe sur les petits colis venant de pays hors Union européenne et un abattement forfaitaire d’impôt sur le revenu pour les retraités.',
        title:
          'Budget de l’État pour 2026 : impôts et recettes (première partie)'
      },
      DLR5L17N52655: {
        summary:
          'Le texte repousse les élections des membres du congrès et des assemblées de province de Nouvelle-Calédonie, prévues au plus tard le 30 novembre 2025, à une date fixée au plus tard au 28 juin 2026. Il prolonge les mandats des élus en place jusqu’à la première réunion des assemblées nouvellement élues. Il oblige à mettre à jour la liste électorale spéciale au plus tard dix jours avant le scrutin.',
        title:
          'Reporter au plus tard au 28 juin 2026 les élections provinciales en Nouvelle-Calédonie'
      },
      DLR5L17N52746: {
        summary:
          'Le texte transforme la société Agence de gestion de l’immobilier de l’État en un établissement public, l’« Établissement public immobilier et foncier de l’État », au plus tard le 1er janvier 2027. Il autorise l’État à lui transférer gratuitement des bâtiments, que l’établissement entretient, rénove et loue ensuite aux services publics. Il oblige l’État et cet établissement à prévenir les communes et intercommunalités avant de vendre un immeuble situé chez elles. Il limite à 30 % la part de capital privé dans les sociétés que l’établissement contrôle.',
        title:
          'Confier les bâtiments de l’État à un nouvel établissement public immobilier'
      },
      DLR5L17N52922: {
        summary:
          'Le texte est la loi de financement de la sécurité sociale : il fixe chaque année les recettes et les dépenses de l’Assurance maladie, des retraites et des allocations familiales. Il suspend jusqu’au 1er janvier 2028 la hausse de l’âge légal de départ à la retraite et de la durée de cotisation prévue par la réforme de 2023 : une personne née en 1964 peut partir à 62 ans et 9 mois au lieu de 63 ans. Il augmente la CSG sur les revenus du capital et prévoit un déficit de la Sécurité sociale de 19,4 milliards d’euros en 2026.',
        title:
          'Budget 2026 de la Sécurité sociale et suspension de la hausse de l’âge de retraite'
      },
      DLR5L17N52985: {
        summary:
          'Le texte autorise France Travail et les caisses de sécurité sociale à suspendre à titre conservatoire le versement d’une allocation ou d’une prestation quand leurs contrôleurs réunissent plusieurs indices sérieux de fraude ; la personne peut demander un débat contradictoire dans les deux semaines. Il interdit de renouveler un arrêt de travail par téléconsultation et oblige les taxis et ambulances conventionnés à équiper leurs véhicules d’une géolocalisation certifiée par l’Assurance maladie. Il élargit l’accès des agents des impôts, de la sécurité sociale et de France Travail à des informations détenues par d’autres administrations, les mutuelles ou les banques, et impose que les allocations chômage soumises à résidence soient versées sur un compte en France ou dans la zone euro.',
        title:
          'Suspendre des aides sur indices de fraude et ouvrir plus de données aux contrôleurs'
      },
      DLR5L17N53135: {
        summary:
          'Le texte est une loi de fin de gestion : en fin d’année, il ajuste le budget de l’État voté pour 2025 sans le refaire. Il annule environ 10,4 milliards d’euros de crédits de paiement du budget général et en ouvre environ 3,2 milliards, dont 349 millions pour la défense. Il révise les recettes attendues, dont l’impôt sur les sociétés relevé d’environ 5,2 milliards d’euros, et fixe à 131,5 milliards d’euros le déficit de l’État à financer en 2025.',
        title:
          'Annuler 10,4 milliards et ouvrir 3,2 milliards de crédits de l’État en fin d’année 2025'
      },
      DLR5L17N53187: {
        summary:
          'Le texte interdit l’accès aux réseaux sociaux en ligne aux mineurs de moins de 15 ans à partir du 1er septembre 2026, et quatre mois plus tard pour les comptes déjà ouverts. Les encyclopédies en ligne, les répertoires éducatifs ou scientifiques et les plateformes de logiciels libres ne sont pas concernés. Il étend aux lycées l’interdiction du téléphone portable déjà en vigueur dans les écoles et collèges, à partir de la rentrée 2026, avec des exceptions fixées par le règlement intérieur. Il oblige chaque école et établissement à prévoir dans son projet des actions de sensibilisation aux effets des écrans et des réseaux sociaux.',
        title:
          'Interdire les réseaux sociaux aux moins de 15 ans et le portable au lycée'
      },
      DLR5L17N53284: {
        summary:
          'Le texte permet au préfet d’obliger une personne jugée menaçante, en raison de son adhésion à des thèses terroristes et de possibles troubles mentaux, à passer un examen psychiatrique. Il crée une « rétention de sûreté terroriste » : après leur peine, des condamnés à 15 ans ou plus pour terrorisme jugés très dangereux peuvent être placés dans un centre fermé de prise en charge médicale et sociale. Il permet de prolonger au-delà de 90 jours la rétention d’étrangers sous mesure d’expulsion condamnés pour certains crimes ou délits graves, et autorise jusqu’à cinq placements successifs en rétention, dans la limite de 360 jours cumulés (540 jours dans les cas les plus graves).',
        title:
          'Allonger la rétention administrative et créer une rétention de sûreté terroriste'
      },
      DLR5L17N53386: {
        summary:
          'Le texte est une loi spéciale : faute de budget voté avant le 1er janvier, elle permet à l’État de continuer à fonctionner de façon provisoire. Il autorise l’État à percevoir les impôts existants et à emprunter en 2026 jusqu’à l’adoption de la loi de finances pour 2026. Il évalue à environ 45,2 milliards d’euros les sommes que l’État reverse aux collectivités territoriales sur ses recettes. Il ne crée aucun impôt ni aucune dépense nouvelle.',
        title:
          'Autoriser l’État à lever les impôts et à emprunter en attendant le budget 2026'
      },
      DLR5L17N53426: {
        summary:
          'Le texte oblige l’État à fixer une stratégie nationale pluriannuelle contre les maladies cardio-neuro-vasculaires (cœur, vaisseaux, AVC). Il crée un rendez-vous de dépistage pour chaque enfant dans l’année qui suit ses 6 ans, notamment du cholestérol familial, et fait proposer un dépistage lors des rendez-vous de prévention des adultes et des visites de médecine du travail. Il autorise les pharmaciens et les kinésithérapeutes à mesurer la tension artérielle. Il prévoit une séance d’information par an à l’école dès l’élémentaire.',
        title:
          'Dépister les maladies du cœur et des vaisseaux dès 6 ans et au travail'
      },
      DLR5L17N53530: {
        summary:
          'Le texte met fin aux concessions des centrales hydroélectriques de plus de 4 500 kilowatts, sauf celle du Rhône, contre une indemnité évaluée par des experts indépendants. Il attribue aux exploitants actuels, à la place d’une remise en concurrence, un droit réel de 70 ans sur ces barrages ; s’ils refusent la convention proposée, ce droit est attribué après une procédure de sélection. Il oblige EDF à vendre aux enchères pendant 20 ans de l’électricité correspondant à une capacité de 6 gigawatts au départ.',
        title:
          'Remplacer les concessions des grands barrages par un droit réel de 70 ans'
      },
      DLR5L17N53940: {
        summary:
          'Le texte oblige les policiers et gendarmes à informer, dès la plainte, les victimes de violences conjugales et les enfants de moins de 15 ans victimes d’un parent de leur droit à un avocat payé par l’aide juridictionnelle. Il élargit la liste des délits dont les auteurs voient leur ADN enregistré au fichier national (homicide routier, cruauté envers les animaux, voyeurisme aggravé…) et autorise, pour certains crimes dont le terrorisme, la comparaison d’un ADN inconnu avec des bases généalogiques privées. Il permet de limiter l’appel devant la cour d’assises aux seules peines complémentaires, jugé alors sans jurés. Il fixe à un mois au plus après l’autopsie la remise du corps aux proches.',
        title:
          'Réorganiser les procès d’assises, élargir le fichier ADN et l’aide aux victimes'
      },
      DLR5L17N53942: {
        summary:
          'Le texte, une loi organique sur le statut des magistrats, permet de nommer des avocats honoraires (avocats ayant cessé d’exercer) comme assesseurs dans les cours criminelles départementales, qui jugent sans jury certains crimes comme la plupart des viols. Ils sont nommés pour cinq ans, renouvelables une fois, jusqu’à 75 ans, et ne peuvent pas siéger là où ils ont exercé dans les trois dernières années. Il oblige les juges qui siègent dans ces cours à suivre une formation sur les violences sexuelles et sexistes, et ceux qui traitent souvent de violences dans la famille à en suivre une dans l’année de leur prise de fonctions.',
        title:
          'Faire siéger des avocats honoraires comme juges dans les cours criminelles'
      },
      DLR5L17N53980: {
        summary:
          'Le texte relève l’amende forfaitaire pour usage de stupéfiants de 200 € à 500 € et interdit aux particuliers de détenir ou transporter du protoxyde d’azote au-delà d’une quantité maximale, sous peine de deux ans de prison et 7 500 € d’amende. Il étend le délit d’introduction et de maintien dans le local d’autrui (« squat ») aux locaux commerciaux, agricoles ou professionnels et au maintien dans un meublé de tourisme après la fin de la location. Il oblige à déclarer les fêtes musicales pouvant réunir plus de 250 personnes et impose aux loueurs de sono de garder l’identité des locataires. Il prolonge jusqu’au 31 décembre 2030 l’expérimentation de l’analyse des images de vidéosurveillance par algorithme.',
        title:
          'Alourdir les sanctions contre squats, rodéos, drogues et protoxyde d’azote'
      },
      DLR5L17N53981: {
        summary:
          'Le texte ajoute la rupture conventionnelle (départ négocié entre salarié et employeur) aux critères qui peuvent faire varier la durée de l’allocation chômage. Il donne ainsi une base légale à l’accord signé le 25 février 2026 par des syndicats et organisations patronales. Cet accord ramène la durée maximale d’indemnisation après une rupture conventionnelle à 15 mois pour les moins de 55 ans (au lieu de 18) et à 20,5 mois pour les 55 ans et plus.',
        title:
          'Permettre de raccourcir le chômage indemnisé après une rupture conventionnelle'
      },
      DLR5L17N54006: {
        summary:
          'Le texte oblige l’État à informer chaque année les communes des prévisions d’effectifs scolaires sur trois à cinq ans et à adapter les seuils d’ouverture et de fermeture de classes en montagne. Il demande aux agences régionales de santé de garantir en montagne l’accès à un médecin, une pharmacie, des urgences et une maternité dans des délais raisonnables, avec un transport sanitaire aérien dans les zones très isolées. Il crée une commission « montagne » dans les intercommunalités qui comptent des communes de montagne. Il autorise la reconstruction d’anciens chalets d’alpage même en ruine, réservés à l’activité pastorale ou à la randonnée, et facilite les abris de bergers.',
        title:
          'Adapter en montagne les fermetures de classes, l’accès aux soins et l’urbanisme'
      },
      DLR5L17N54083: {
        summary:
          'Le texte met à jour la loi de programmation militaire, qui fixe pour plusieurs années les moyens des armées. Il porte les crédits de la mission « Défense » à 435,7 milliards d’euros sur 2024-2030, soit 36 milliards de plus que prévu en 2023, jusqu’à 75,7 milliards d’euros pour la seule année 2030. Il crée un contrat d’appelé du service national : des volontaires de 18 à 25 ans servent dix mois comme militaires. Il prévoit 268 400 emplois au ministère de la défense en 2027 et 275 000 en 2030.',
        title:
          'Augmenter le budget des armées jusqu’en 2030 et créer un service national'
      },
      DLR5L17N54085: {
        summary:
          'Le texte permet au préfet d’autoriser directement l’intervention des lieutenants de louveterie (chargés des tirs de loups), y compris auprès de troupeaux non protégés, et reconnaît les troupeaux de bovins, de chevaux et d’ânes comme ne pouvant pas être protégés du loup. Il rend obligatoire l’indication de l’origine des viandes utilisées comme ingrédients dans les produits alimentaires préemballés, ainsi que des poissons d’élevage. Il fixe à l’État l’objectif de doubler d’ici 2035 les volumes d’eau stockés pour l’agriculture et autorise à titre exceptionnel, pour un an renouvelable deux fois, des semences traitées à la flupyradifurone, un insecticide. Il alourdit les peines pour les vols et dégradations commis dans les exploitations agricoles.',
        title:
          'Faciliter les tirs de loups, afficher l’origine des viandes, autoriser un insecticide'
      },
      DLR5L17N54218: {
        summary:
          'Le texte modifie la Constitution pour doter la Corse d’un statut d’autonomie. Il permet à la Collectivité de Corse, dans les conditions d’une loi organique, d’adapter les lois et règlements nationaux et de fixer ses propres règles dans ses domaines de compétence. Ces pouvoirs sont exclus notamment pour la nationalité, les droits civiques, la justice, le droit pénal, la défense, la sécurité, la monnaie et le droit électoral. Les électeurs inscrits en Corse sont consultés sur le projet de statut.',
        title:
          'Inscrire dans la Constitution un statut d’autonomie pour la Corse'
      },
      DLR5L17N54372: {
        summary:
          'Le texte limite le placement d’un enfant par le juge à un an pour les moins de 3 ans et à deux ans au-delà, renouvelable seulement par décision motivée. Il soumet à un contrôle de leurs antécédents judiciaires toutes les personnes, salariées ou bénévoles, qui travaillent au contact de mineurs ou de majeurs vulnérables, dont les professionnels de santé. Il permet au procureur, en cas d’urgence et de danger, de prendre des mesures provisoires concernant l’enfant (placement, droits de visite, interdiction de paraître dans certains lieux). Il punit de la réclusion à perpétuité le viol d’un mineur de moins de 15 ans lorsqu’il a entraîné sa mort ou qu’il s’ajoute à d’autres viols sur d’autres victimes.',
        title:
          'Limiter la durée des placements d’enfants et contrôler les adultes à leur contact'
      }
    },
    writtenBy:
      'Résumé écrit par on-record à partir du texte voté, sans juger le texte.'
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
  },
  voteMatch: {
    answers: {
      abstention: 'Abstention',
      against: 'Contre',
      for: 'Pour',
      unsure: 'Je ne sais pas'
    },
    answersLabel: 'Ce que vous auriez voté',
    compare: 'Comparer les partis sur tous les grands votes',
    disclosure: {
      partyVote:
        '<strong>Le vote d’un parti</strong> est le choix le plus fréquent des députés de son groupe qui ont voté, avec leurs nombres. Ne pas voter n’est pas un choix : un député peut siéger en commission pendant le vote.',
      selection: defineTranslation(
        '<strong>Textes choisis par on-record</strong> le {day:date} : un vote solennel sur l’ensemble d’un texte par grand thème, en gardant la dernière lecture votée par l’Assemblée nationale. Tous les grands votes de la législature sont sur <compare>la page Comparer</compare>.',
        { date: { day: ON_DAY } }
      ),
      summaries:
        '<strong>Les résumés</strong> sont écrits par on-record : une phrase qui dit ce que le texte prévoyait, sans le juger. Chaque texte mène à son scrutin et à son intitulé officiel.'
    },
    disclosureLabel: 'Comment ce parcours est construit',
    empty: {
      action: 'Répondre aux textes',
      text: 'Répondez « pour », « contre » ou « abstention » à au moins un texte pour voir quels partis ont fait le même choix. « Je ne sais pas » n’est pas compté.',
      title: 'Aucune réponse pour l’instant'
    },
    hiddenUntilResult:
      'Le résultat du vote et le choix des partis s’affichent à la fin, pour ne pas orienter votre réponse.',
    lead: 'Douze textes votés par l’Assemblée nationale depuis 2024, chacun expliqué en une phrase. Dites ce que vous auriez voté : à la fin, vos réponses s’affichent à côté des votes des députés des partis en lice pour 2027. Aucun parti ne vous est conseillé.',
    next: 'Passer ce texte',
    nextAnswered: 'Texte suivant',
    previous: 'Texte précédent',
    progress: 'Texte {position:number} sur {count:number}',
    question: 'Vous auriez voté…',
    result: {
      byText: 'Texte par texte',
      change: 'Changer mes réponses',
      groupCounts:
        '{for:number} pour, {against:number} contre, {abstention:number} abstention, sur {members:number} députés',
      lead: defineTranslation('{count:plural}', {
        plural: {
          count: {
            one: 'Sur le seul texte où vous avez donné un avis. Les partis restent dans l’ordre de la liste des partis en lice : ce n’est pas un classement, et aucun n’est recommandé.',
            other:
              'Sur les {?} textes où vous avez donné un avis. Les partis restent dans l’ordre de la liste des partis en lice : ce n’est pas un classement, et aucun n’est recommandé.'
          }
        }
      }),
      legendOther: 'autre choix',
      legendSame: 'même choix que vous',
      noMajority: 'Sans majorité',
      notAnswered: 'Sans réponse',
      notSitting: 'Ne siégeait pas',
      sameChoice: 'Même choix que vous',
      sameChoiceCount: '{same:number} sur {count:number}',
      sameChoiceOn: defineTranslation('{subject} : {same:enum}', {
        enum: { same: { false: 'autre choix', true: 'même choix' } }
      }),
      squaresLead: 'Chaque case est un texte et mène à son vote.',
      textCount: defineTranslation('{count:plural}', {
        plural: { count: { one: '{?} texte', other: '{?} textes' } }
      }),
      title: 'Vos réponses à côté de leurs votes',
      you: 'Vous'
    },
    showResult: 'Voir le résultat',
    showResultNow: 'Voir le résultat maintenant',
    start: 'Commencer',
    startNote:
      '{count:number} textes, une question à la fois. Vos réponses restent dans l’adresse de la page : rien n’est enregistré.',
    startOver: 'Recommencer',
    topics: {
      agriculture: {
        name: 'Agriculture',
        summary:
          'Assouplir des règles qui encadrent le travail agricole, notamment sur certains pesticides, l’eau et les élevages.'
      },
      defence: {
        name: 'Défense',
        summary:
          'Mettre à jour la loi qui fixe les moyens des armées jusqu’en 2030, et modifier plusieurs règles de la défense.'
      },
      endOfLife: {
        name: 'Fin de vie',
        summary:
          'Permettre à une personne majeure, atteinte d’une maladie grave et incurable qui la fait souffrir, de demander une aide pour mettre fin à sa vie, sous conditions.'
      },
      energy: {
        name: 'Énergie',
        summary:
          'Fixer jusqu’en 2035 les objectifs de la France pour produire son énergie (nucléaire, renouvelables) et réduire ses émissions.'
      },
      environment: {
        name: 'Environnement',
        summary:
          'Réduire l’impact environnemental des vêtements, en visant d’abord la mode éphémère vendue à bas prix et renouvelée très vite.'
      },
      housing: {
        name: 'Logement',
        summary:
          'Faciliter l’accès au logement des agents des services publics.'
      },
      institutions: {
        name: 'Institutions',
        summary:
          'Inscrire dans la Constitution un statut d’autonomie pour la Corse, qui reste dans la République.'
      },
      nationality: {
        name: 'Nationalité',
        summary:
          'Rendre plus strictes, à Mayotte, les conditions pour qu’un enfant né sur place devienne français, selon la situation de ses parents.'
      },
      onlineSafety: {
        name: 'Mineurs en ligne',
        summary:
          'Encadrer l’accès des mineurs aux réseaux sociaux pour les protéger des risques liés à leur usage.'
      },
      policing: {
        name: 'Police',
        summary:
          'Présumer qu’un policier ou un gendarme qui fait usage de son arme en service agit en légitime défense, jusqu’à preuve du contraire.'
      },
      socialSecurity: {
        name: 'Sécurité sociale',
        summary:
          'Fixer les recettes et les dépenses de la Sécurité sociale pour 2026 : santé, retraites, famille.'
      },
      work: {
        name: 'Assurance chômage',
        summary:
          'Inscrire dans la loi un accord sur l’assurance chômage signé le 25 février 2026 par des syndicats et des organisations patronales.'
      }
    },
    votedOn: defineTranslation('Voté le {day:date}', {
      date: { day: ON_DAY }
    })
  },
  voteMatchPage: {
    allScrutins: 'Tous les scrutins',
    latest: {
      lead: 'Les plus récents, sans aucune sélection : un vote solennel porte en général sur un texte entier et il est annoncé à l’avance.',
      title: 'Derniers votes solennels et motions de censure'
    },
    method: 'Lire la méthode complète',
    principlesTitle: 'Comment lire ce site',
    search: {
      label: 'Trouver un député',
      placeholder: 'Nom ou prénom',
      submit: 'Chercher'
    },
    title: 'Quels partis ont voté comme vous l’auriez fait ?'
  }
})
