import { rarityClass, rarityDot, type Rarity } from "../../lib/gameData";

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  return (
    <span className={`rarity-badge ${rarityClass[rarity]}`}>
      <span style={{ background: rarityDot[rarity] }} />
      {rarity}
    </span>
  );
}
