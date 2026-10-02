/**
 * The subjects the guided path asks about, one text each. Its name and
 * plain-language summary live in the dictionary under `voteMatch.topics`.
 */
export type VoteMatchTopic =
  | 'agriculture'
  | 'defence'
  | 'endOfLife'
  | 'energy'
  | 'environment'
  | 'housing'
  | 'institutions'
  | 'nationality'
  | 'onlineSafety'
  | 'policing'
  | 'socialSecurity'
  | 'work'

/** One question of the guided path: the solemn vote that answers it. */
export type VoteMatchEntry = {
  scrutin: number
  topic: VoteMatchTopic
}

/**
 * The texts the guided path asks about, chosen by on-record and disclosed as
 * such (principle 7): one solemn vote on a whole text per topic, the last
 * reading the Assemblée voted, spread across the legislature. Asked in this
 * order, so that two neighbouring questions never share a subject.
 */
export const VOTE_MATCH_SELECTION = {
  chosenOn: '2026-10-02',
  entries: [
    { scrutin: 8280, topic: 'endOfLife' },
    { scrutin: 8431, topic: 'onlineSafety' },
    { scrutin: 7987, topic: 'policing' },
    { scrutin: 7454, topic: 'institutions' },
    { scrutin: 4758, topic: 'socialSecurity' },
    { scrutin: 2957, topic: 'agriculture' },
    { scrutin: 1308, topic: 'nationality' },
    { scrutin: 2653, topic: 'energy' },
    { scrutin: 7494, topic: 'environment' },
    { scrutin: 7905, topic: 'defence' },
    { scrutin: 7260, topic: 'work' },
    { scrutin: 7408, topic: 'housing' }
  ]
} as const satisfies {
  chosenOn: string
  entries: readonly VoteMatchEntry[]
}
