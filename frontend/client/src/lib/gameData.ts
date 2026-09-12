export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Quest = {
  id: string;
  title: string;
  category: string;
  stat: string;
  difficulty: Difficulty;
  rarity: Rarity;
  duration: string;
  xp: number;
  coins: number;
  drops: string[];
  progress?: number;
  completed?: boolean;
};

export const quests: Quest[] = [
  { id: 'focus', title: 'Deep Work Sprint', category: 'Coding', stat: 'Intelligence', difficulty: 'Hard', rarity: 'Rare', duration: '45 min', xp: 92, coins: 60, drops: ['Iron Ore', 'Crystal'] },
  { id: 'walk', title: 'Trail of the Wayfinder', category: 'Fitness', stat: 'Strength', difficulty: 'Medium', rarity: 'Uncommon', duration: '25 min', xp: 58, coins: 35, drops: ['Stone', 'Silver'] },
  { id: 'read', title: 'Pages of Forgotten Lore', category: 'Reading', stat: 'Wisdom', difficulty: 'Easy', rarity: 'Common', duration: '20 min', xp: 34, coins: 20, drops: ['Moon Shard'] },
  { id: 'tidy', title: 'Restore the Camp', category: 'Personal Tasks', stat: 'Discipline', difficulty: 'Easy', rarity: 'Common', duration: '15 min', xp: 28, coins: 16, drops: ['Stone'] },
];

export const materials = [
  { name: 'Crystal', qty: 12, color: '#a78bfa', icon: '✦', rarity: 'Rare' },
  { name: 'Iron Ore', qty: 8, color: '#c2a77d', icon: '◆', rarity: 'Uncommon' },
  { name: 'Moon Shard', qty: 4, color: '#8ad7d2', icon: '◈', rarity: 'Epic' },
  { name: 'Stone', qty: 24, color: '#85909d', icon: '⬟', rarity: 'Common' },
];

export const navItems = [
  ['/', 'Home', '⌂'], ['/game', 'Play', '◈'], ['/quests', 'Quests', '☰'], ['/inventory', 'Inventory', '▦'], ['/forge', 'Forge', '⚒'], ['/character', 'Character', '♙'], ['/map', 'Map', '⌖'], ['/codex', 'Codex', '✧'], ['/shop', 'Shop', '◇'],
];

export const stats = [
  ['Strength', 12, '+4', '⚔'], ['Intelligence', 16, '+6', '✺'], ['Knowledge', 14, '+2', '⌘'], ['Wisdom', 11, '+3', '◌'], ['Creativity', 9, '+1', '✦'], ['Discipline', 13, '+5', '◒'],
];

export const biomeCards = [
  ['Stone Cavern', 'Level 1', '🪨', 'unlocked'], ['Iron Mountains', 'Level 4', '⛰', 'unlocked'], ['Crystal Caverns', 'Level 7', '✦', 'current'], ['Ancient Forest', 'Level 12', '♣', 'locked'], ['Volcanic Depths', 'Level 18', '♨', 'locked'],
];

export const achievements = [
  ['First Steps', 'Complete your first quest', 1, 1, 'Claimed'], ['Master Miner', 'Collect 50 materials', 38, 50, ''], ['Blacksmith', 'Craft 5 pieces of equipment', 3, 5, ''], ['Deep Explorer', 'Discover 4 biomes', 3, 4, ''],
];

export const rarityClass: Record<Rarity, string> = { Common: 'rarity-common', Uncommon: 'rarity-uncommon', Rare: 'rarity-rare', Epic: 'rarity-epic', Legendary: 'rarity-legendary' };
export const rarityDot: Record<Rarity, string> = { Common: '#9ca3af', Uncommon: '#62c795', Rare: '#65a4ed', Epic: '#b692e6', Legendary: '#e4ae5d' };

export function wait(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }

export async function completeQuestMock(quest: Quest) {
  await wait(450);
  return { xp: quest.xp, coins: quest.coins, stat: quest.stat, statXp: 2, drops: quest.drops, damage: quest.difficulty === 'Hard' ? 150 : quest.difficulty === 'Medium' ? 80 : 40 };
}
