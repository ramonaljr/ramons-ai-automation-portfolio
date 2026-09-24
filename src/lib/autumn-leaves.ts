/**
 * The three leaf colours shared by every falling-leaf canvas on the page.
 *
 * Red and gold carry the season; brown is kept to a minority so the mix reads
 * as real autumn rather than confetti. Each tone is an RGB triple so the canvas
 * code can blend it with other colours and set its own alpha.
 */
export type Rgb = readonly [number, number, number]

const LEAF_TONES: readonly { rgb: Rgb; weight: number }[] = [
  { rgb: [178, 52, 36], weight: 0.4 }, // maple red
  { rgb: [214, 156, 44], weight: 0.38 }, // birch gold
  { rgb: [121, 74, 42], weight: 0.22 } // oak brown
]

/** Picks a leaf tone for a value in [0, 1), honouring the weights above. */
export function leafTone(roll: number): Rgb {
  let threshold = 0

  for (const tone of LEAF_TONES) {
    threshold += tone.weight
    if (roll < threshold) return tone.rgb
  }

  return LEAF_TONES[LEAF_TONES.length - 1].rgb
}

/** A darker version of a tone, for the leaf's outline. */
export function leafEdge([r, g, b]: Rgb, amount = 0.58): Rgb {
  return [Math.round(r * amount), Math.round(g * amount), Math.round(b * amount)]
}
