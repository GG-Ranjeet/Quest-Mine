/**
 * XP system — mirrors the backend quest.controller.js formulas exactly.
 * Keep these two in sync if you change the curve.
 */

export const DIFFICULTY_WEIGHTS: Record<string, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
  Epic: 5,
};

/**
 * XP required to advance from level N to level N+1.
 * Formula: floor(100 × (N+1)^1.5)
 *
 *  0 → 1 :   100 XP
 *  1 → 2 :   283 XP
 *  2 → 3 :   520 XP
 *  3 → 4 :   800 XP
 *  4 → 5 : 1 118 XP
 *  5 → 6 : 1 461 XP  …
 */
export function xpRequiredForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level + 1, 1.5));
}

/**
 * Given accumulated XP and current level, apply a gain and return the new state.
 * Handles multiple level-ups in a single call.
 */
export function applyXPGain(
  currentXp: number,
  currentLevel: number,
  gainedXp: number
): { newXp: number; newLevel: number; levelsGained: number } {
  let xp = currentXp + gainedXp;
  let level = currentLevel;
  let levelsGained = 0;

  while (xp >= xpRequiredForLevel(level)) {
    xp -= xpRequiredForLevel(level);
    level++;
    levelsGained++;
  }

  return { newXp: xp, newLevel: level, levelsGained };
}

/**
 * Distribute 100 XP across a list of quests proportionally by difficulty weight.
 * Same-day additions (isLateAddition) always get 1 XP and are excluded from the pool.
 */
export function distributeXP(
  questList: Array<{ id: string; difficulty: string }>
): Record<string, number> {
  if (questList.length === 0) return {};
  const totalWeight = questList.reduce((s, q) => s + (DIFFICULTY_WEIGHTS[q.difficulty] ?? 1), 0);
  const dist: Record<string, number> = {};
  let allocated = 0;

  questList.forEach((q, i) => {
    const weight = DIFFICULTY_WEIGHTS[q.difficulty] ?? 1;
    if (i === questList.length - 1) {
      dist[q.id] = Math.max(1, 100 - allocated);
    } else {
      const share = Math.max(1, Math.round((weight / totalWeight) * 100));
      dist[q.id] = share;
      allocated += share;
    }
  });

  return dist;
}

/**
 * Returns a human-readable XP progress string, e.g. "247 / 520 XP"
 */
export function xpProgressLabel(currentXp: number, level: number): string {
  const required = xpRequiredForLevel(level);
  return `${currentXp.toLocaleString()} / ${required.toLocaleString()} XP`;
}

/**
 * Returns progress as a 0–100 percentage within the current level.
 */
export function xpProgressPercent(currentXp: number, level: number): number {
  const required = xpRequiredForLevel(level);
  return Math.min(100, Math.round((currentXp / required) * 100));
}
