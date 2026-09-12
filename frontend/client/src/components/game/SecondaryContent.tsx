import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { materials, navItems, stats } from "../../lib/gameData";
import { Panel } from "../ui/custom/Panel";
import { SectionHead } from "../ui/custom/SectionHead";

export function SecondaryContent({ location }: { location: string }) {
  const title = navItems.find(([path]) => path === location)?.[1] || "Journal";
  return (
    <div className="secondary-grid">
      <Panel className="wide-panel">
        <SectionHead eyebrow="ADVENTURER'S LOG" title={title} action="Filter" />
        {location === "/inventory" ? (
          <div className="inventory-grid">
            {materials
              .concat([
                {
                  name: "Iron Pickaxe",
                  qty: 1,
                  color: "#e4ae5d",
                  icon: "⚒",
                  rarity: "Legendary",
                },
              ])
              .map(item => (
                <div
                  className={`inventory-item ${item.rarity.toLowerCase()}`}
                  key={item.name}
                >
                  <div className="item-icon" style={{ color: item.color }}>
                    {item.icon}
                  </div>
                  <b>{item.name}</b>
                  <span>x{item.qty}</span>
                  <small>{item.rarity}</small>
                </div>
              ))}
          </div>
        ) : (
          <div className="secondary-content">
            <div className="big-symbol">
              {title === "Forge"
                ? "⚒"
                : title === "Map"
                  ? "⌖"
                  : title === "Character"
                    ? "♙"
                    : title === "Codex"
                      ? "✧"
                      : title === "Shop"
                        ? "◇"
                        : "☰"}
            </div>
            <h3>{title} at your fingertips.</h3>
            <p>
              This module is wired into the QuestMine shell and ready for your
              next expedition. Use the Play tab to complete quests and watch
              your rewards flow into progression.
            </p>
            <Link href="/game" className="primary-button">
              Return to the caverns <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </Panel>
      <Panel className="side-panel">
        <SectionHead eyebrow="YOUR PROGRESS" title="Character stats" />
        <div className="stats-list">
          {stats.map(([name, value, bonus, icon]) => (
            <div className="stat-row" key={name}>
              <span className="stat-icon">{icon}</span>
              <span className="stat-name">{name}</span>
              <b>{value as number}</b>
              <small>{bonus}</small>
            </div>
          ))}
        </div>
        <button className="outline-button full">
          Open character sheet <ChevronRight size={14} />
        </button>
      </Panel>
    </div>
  );
}
