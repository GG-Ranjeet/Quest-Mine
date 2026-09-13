import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { materials, navItems, stats, inventoryEquipment, type Equipment, type EquipmentType } from "../../lib/gameData";
import { Panel } from "../ui/custom/Panel";
import { SectionHead } from "../ui/custom/SectionHead";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/overlays/dialog";
import type { EquipmentState } from "../../pages/GameShell";

export function SecondaryContent({ location, equipment, setEquipment }: { location: string; equipment?: EquipmentState; setEquipment?: React.Dispatch<React.SetStateAction<EquipmentState>> }) {
  const title = navItems.find(([path]) => path === location)?.[1] || "Journal";
  
  const [selectedSlot, setSelectedSlot] = useState<keyof EquipmentState | null>(null);
  
  const handleEquip = (item: Equipment) => {
    if (selectedSlot && setEquipment) {
      setEquipment(prev => ({ ...prev, [selectedSlot]: item }));
    }
    setSelectedSlot(null);
  };
  
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
        ) : location === "/character" ? (
          <div className="character-sheet">
            <div className="character-visual">
              <img src="/questmine-mascot.png" alt="Your character" className="character-model" style={{ height: 200 }} />
            </div>
            
            <div className="equipment-grid">
              <div className="equipment-column">
                <h4>Armor</h4>
                {(["armor1", "armor2", "armor3"] as const).map(slot => (
                  <button key={slot} className={`equip-slot ${equipment?.[slot] ? equipment[slot]!.rarity.toLowerCase() : ''}`} onClick={() => setSelectedSlot(slot)}>
                    {equipment?.[slot] ? (
                      <div className="equipped-item">
                        <span className="eq-icon">{equipment[slot]!.icon}</span>
                        <div className="eq-info">
                          <b>{equipment[slot]!.name}</b>
                          <small>{equipment[slot]!.stats}</small>
                        </div>
                      </div>
                    ) : (
                      <span className="empty-slot">Empty Armor Slot</span>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="equipment-column">
                <h4>Accessories</h4>
                {(["accessory1", "accessory2", "accessory3"] as const).map(slot => (
                  <button key={slot} className={`equip-slot ${equipment?.[slot] ? equipment[slot]!.rarity.toLowerCase() : ''}`} onClick={() => setSelectedSlot(slot)}>
                    {equipment?.[slot] ? (
                      <div className="equipped-item">
                        <span className="eq-icon">{equipment[slot]!.icon}</span>
                        <div className="eq-info">
                          <b>{equipment[slot]!.name}</b>
                          <small>{equipment[slot]!.stats}</small>
                        </div>
                      </div>
                    ) : (
                      <span className="empty-slot">Empty Accessory Slot</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <Dialog open={selectedSlot !== null} onOpenChange={(open) => !open && setSelectedSlot(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Equip {selectedSlot?.startsWith('armor') ? 'Armor' : 'Accessory'}</DialogTitle>
                </DialogHeader>
                <div className="inventory-grid" style={{ marginTop: '1rem' }}>
                  {inventoryEquipment
                    .filter(item => item.type.toLowerCase() === (selectedSlot?.startsWith('armor') ? 'armor' : 'accessory'))
                    .map(item => (
                      <button
                        key={item.id}
                        className={`inventory-item ${item.rarity.toLowerCase()}`}
                        onClick={() => handleEquip(item)}
                      >
                        <div className="item-icon">{item.icon}</div>
                        <b>{item.name}</b>
                        <small>{item.stats}</small>
                        <small>{item.rarity}</small>
                      </button>
                    ))}
                  {inventoryEquipment.filter(item => item.type.toLowerCase() === (selectedSlot?.startsWith('armor') ? 'armor' : 'accessory')).length === 0 && (
                    <p style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", opacity: 0.5 }}>No matching items in inventory.</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
          </div>
        ) : (
          <div className="secondary-content">
            <div className="big-symbol">
              {title === "Forge"
                ? "⚒"
                : title === "Map"
                  ? "⌖"
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
