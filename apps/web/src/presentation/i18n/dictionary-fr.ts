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
        'Une ligne par vote, une colonne par parti : la position que le groupe de chaque parti a prise sur les grands votes de la législature. Ouvrez une ligne pour voir les voix.',
      texts:
        'Cherchez une loi dont vous avez entendu parler : la position de chaque parti à chaque fois que l’Assemblée l’a votée, et qui a changé d’avis en route.'
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
      'Partout sauf sur l’accueil, le site ne rédige pas de résumé des textes votés : il affiche l’intitulé officiel, et explique en une phrase le type de vote (amendement, article, texte entier, motion) et ce que son adoption ou son rejet voulait dire. Ce type est déduit de l’intitulé. Les douze textes du parcours de l’accueil ont chacun une phrase de résumé écrite par on-record, qui dit ce que le texte prévoyait sans le juger.',
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
