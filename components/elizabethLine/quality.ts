// Adaptive render resolution for the Elizabeth line scene. Drops a step as soon as frames
// run slow, climbs back slowly while they are fast, and never climbs past a level that has
// already proven too slow on this device, so it settles instead of oscillating.

const STEP = 0.84;
// Average frame interval above which the resolution drops (~42 fps) and below which it may rise (~55 fps)
const SLOW_MS = 24;
const FAST_MS = 18;
const SAMPLES = 20;
const RISE_AFTER_MS = 4000;
const PROVEN_SLOW_MS = 3000;

export function resolutionGovernor( min: number, max: number, start: number )
{
  let ratio = start;
  let ceiling = max;
  let average = 0;
  let samples = 0;
  let changedAt = 0;
  // Ratio before the last step up; 0 when the last change was a step down
  let raisedFrom = 0;

  return {
    get ratio() { return ratio; },
    /** Feeds the interval between two consecutive rendered frames; true when the ratio changed */
    sample( ms: number, now: number )
    {
      if ( ms > 250 ) return false;
      average = samples ? average + ( ms - average ) * 0.1 : ms;
      if ( ++samples < SAMPLES ) return false;

      if ( average > SLOW_MS && ratio > min )
      {
        if ( raisedFrom && now - changedAt < PROVEN_SLOW_MS ) ceiling = raisedFrom;
        ratio = Math.max( min, ratio * STEP );
        raisedFrom = 0;
      }
      else if ( average < FAST_MS && ratio < ceiling && now - changedAt > RISE_AFTER_MS )
      {
        raisedFrom = ratio;
        ratio = Math.min( ceiling, ratio / STEP );
      }
      else return false;

      changedAt = now;
      samples = 0;
      return true;
    },
  };
}
