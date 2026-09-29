/**
 * Why a search returned a mark, which is a different question from how similar it is.
 *
 * A mark carried whole inside another — ZARA inside AAFIZARA — scores as distant on every
 * whole-string measure, so it is admitted and shown on the containment instead of on the score.
 */
export enum SimilarityMatchType {
  /** Scored above the threshold on overall resemblance. The ordinary case. */
  SIMILAR = 'SIMILAR',

  /** The searched term carries this registered mark inside it. */
  CONTAINS_MARK = 'CONTAINS_MARK',

  /** This registered mark carries the searched term inside it. */
  CONTAINED_IN_MARK = 'CONTAINED_IN_MARK',
}
