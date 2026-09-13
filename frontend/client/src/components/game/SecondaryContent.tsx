import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { materials, navItems, stats, inventoryEquipment, craftingRecipes, type Equipment, type EquipmentType } from "../../lib/gameData";
import { Panel } from "../ui/custom/Panel";
import { SectionHead } from "../ui/custom/SectionHead";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/overlays/dialog";
import type { EquipmentState } from "../../pages/GameShell";
import { useUserData, useCraftItem, useAddQuest, useQuestsData, useEditQuest } from "../../hooks/useGameData";

export function SecondaryContent({ location, equipment, setEquipment, inventory = [] }: { location: string; equipment?: EquipmentState; setEquipment?: React.Dispatch<React.SetStateAction<EquipmentState>>; inventory?: any[] }) {
  const title = navItems.find(([path]) => path === location)?.[1] || "Journal";
  
  const { data: user } = useUserData();
  const { data: activeQuests } = useQuestsData();
  const craftMutation = useCraftItem();
  const addQuestMutation = useAddQuest();
  const editQuestMutation = useEditQuest();

  const [selectedSlot, setSelectedSlot] = useState<keyof EquipmentState | null>(null);
  const [inventoryFilter, setInventoryFilter] = useState<'All' | 'Materials' | 'Equipment'>('All');

  // Add Quest Form State
  const [questTitle, setQuestTitle] = useState("");
  const [questCategory, setQuestCategory] = useState("General");
  const [questStat, setQuestStat] = useState("STR");
  const [questDifficulty, setQuestDifficulty] = useState("Easy");
  const [questScheduledDate, setQuestScheduledDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [questIsEveryday, setQuestIsEveryday] = useState(false);
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  
  // Weekly View State
  const [selectedDateFilter, setSelectedDateFilter] = useState(() => new Date().toISOString().split('T')[0]);

  const handleAddQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questTitle.trim()) return;
    
    if (editingQuestId) {
      editQuestMutation.mutate({
        id: editingQuestId,
        updates: {
          title: questTitle,
          category: questCategory,
          stat: questStat,
          difficulty: questDifficulty,
          scheduledDate: questScheduledDate,
          isEveryday: questIsEveryday
        }
      });
      setEditingQuestId(null);
    } else {
      addQuestMutation.mutate({
        title: questTitle,
        category: questCategory,
        stat: questStat,
        difficulty: questDifficulty,
        scheduledDate: questScheduledDate,
        isEveryday: questIsEveryday
      });
    }
    
    // Reset form
    setQuestTitle(""); 
    setQuestIsEveryday(false);
    setQuestScheduledDate(new Date().toISOString().split('T')[0]);
  };

  const handleEditClick = (q: any) => {
    setEditingQuestId(q.id);
    setQuestTitle(q.title);
    setQuestCategory(q.category);
    setQuestStat(q.stat);
    setQuestDifficulty(q.difficulty);
    setQuestScheduledDate(q.scheduledDate || new Date().toISOString().split('T')[0]);
    setQuestIsEveryday(q.isEveryday || false);
  };

  const handleEquip = (item: Equipment) => {
    if (selectedSlot && setEquipment) {
      setEquipment(prev => ({ ...prev, [selectedSlot]: item }));
    }
    setSelectedSlot(null);
  };
  
  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate()
    };
  });

  const filteredQuests = activeQuests?.filter((q: any) => 
    q.isEveryday || q.scheduledDate === selectedDateFilter
  ) || [];
  
  return (
    <div className="secondary-grid">
      <Panel className="wide-panel">
        <SectionHead eyebrow="ADVENTURER'S LOG" title={title} action="Filter" />
        {location === "/inventory" ? (
          <div className="inventory-sections" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="inventory-filters" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button 
                className={`outline-button ${inventoryFilter === 'All' ? 'active' : ''}`}
                onClick={() => setInventoryFilter('All')}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', opacity: inventoryFilter === 'All' ? 1 : 0.6, borderColor: inventoryFilter === 'All' ? 'var(--primary)' : 'var(--border)' }}
              >
                All
              </button>
              <button 
                className={`outline-button ${inventoryFilter === 'Materials' ? 'active' : ''}`}
                onClick={() => setInventoryFilter('Materials')}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', opacity: inventoryFilter === 'Materials' ? 1 : 0.6, borderColor: inventoryFilter === 'Materials' ? 'var(--primary)' : 'var(--border)' }}
              >
                Materials
              </button>
              <button 
                className={`outline-button ${inventoryFilter === 'Equipment' ? 'active' : ''}`}
                onClick={() => setInventoryFilter('Equipment')}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', opacity: inventoryFilter === 'Equipment' ? 1 : 0.6, borderColor: inventoryFilter === 'Equipment' ? 'var(--primary)' : 'var(--border)' }}
              >
                Equipment
              </button>
            </div>

            {(inventoryFilter === 'All' || inventoryFilter === 'Materials') && (
              <div>
                <h4 style={{ marginBottom: '1rem', color: 'var(--muted)' }}>Materials</h4>
                <div className="inventory-grid">
                  {inventory.filter(i => i.itemType === 'Material').map(item => (
                    <div
                      className={`inventory-item ${item.rarity.toLowerCase()}`}
                      key={item.id || item.name}
                    >
                      <div className="item-icon" style={{ color: item.color }}>
                        {item.icon}
                      </div>
                      <b>{item.name}</b>
                      <span>x{item.quantity}</span>
                      <small>{item.rarity}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {(inventoryFilter === 'All' || inventoryFilter === 'Equipment') && (
              <div>
                <h4 style={{ marginBottom: '1rem', color: 'var(--muted)' }}>Equipment</h4>
                <div className="inventory-grid">
                  {inventory.filter(i => i.itemType === 'Armor' || i.itemType === 'Accessory').map(item => (
                    <div
                      className={`inventory-item ${item.rarity.toLowerCase()}`}
                      key={item.id}
                    >
                      <div className="item-icon">
                        {item.icon}
                      </div>
                      <b>{item.name}</b>
                      <span>{item.itemType}</span>
                      <small>{item.stats}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  {inventory
                    .filter(item => item.itemType?.toLowerCase() === (selectedSlot?.startsWith('armor') ? 'armor' : 'accessory'))
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
                  {inventory.filter(item => item.itemType?.toLowerCase() === (selectedSlot?.startsWith('armor') ? 'armor' : 'accessory')).length === 0 && (
                    <p style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", opacity: 0.5 }}>No matching items in inventory.</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
          </div>
        ) : location === "/craft" ? (
          <div className="crafting-sheet">
            <h4 style={{ marginBottom: '1rem', color: 'var(--muted)' }}>Available Recipes</h4>
            <div className="crafting-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {craftingRecipes.map(recipe => {
                const resultItem = inventoryEquipment.find(eq => eq.id === recipe.resultItemId);
                if (!resultItem) return null;
                
                const canAffordCoins = (user?.coins || 0) >= recipe.costCoins;
                const canAffordMats = recipe.ingredients.every(ing => {
                  const invItem = inventory.find(i => i.id === ing.itemId || i.itemId === ing.itemId);
                  return (invItem?.quantity || 0) >= ing.quantity;
                });
                
                const canCraft = canAffordCoins && canAffordMats;

                return (
                  <div key={recipe.id} className="inventory-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', height: 'auto', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                      <div className="item-icon" style={{ flexShrink: 0 }}>{resultItem.icon}</div>
                      <div style={{ flex: 1 }}>
                        <b style={{ display: 'block' }}>{resultItem.name}</b>
                        <small style={{ color: 'var(--muted)' }}>{resultItem.stats}</small>
                      </div>
                      <button 
                        className="primary-button" 
                        disabled={!canCraft || craftMutation.isPending}
                        onClick={() => craftMutation.mutate(recipe.id)}
                        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', opacity: canCraft ? 1 : 0.5 }}
                      >
                        {craftMutation.isPending ? '...' : 'Craft'}
                      </button>
                    </div>
                    
                    <div style={{ width: '100%', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                      <small style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--muted)' }}>Requirements:</small>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                          <span>Coins</span>
                          <span style={{ color: canAffordCoins ? 'var(--cream)' : 'var(--error)' }}>
                            {recipe.costCoins} / {user?.coins || 0}
                          </span>
                        </div>
                        {recipe.ingredients.map(ing => {
                          // Find name from mock materials array or inventory
                          const matDef = materials.find(m => m.name.toLowerCase().includes(ing.itemId.split('_')[1])) || { name: ing.itemId };
                          const invItem = inventory.find(i => i.id === ing.itemId || i.itemId === ing.itemId);
                          const hasQty = invItem?.quantity || 0;
                          const hasEnough = hasQty >= ing.quantity;
                          
                          return (
                            <div key={ing.itemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                              <span>{matDef.name}</span>
                              <span style={{ color: hasEnough ? 'var(--cream)' : 'var(--error)' }}>
                                {ing.quantity} / {hasQty}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : location === "/quests" ? (
          <div className="add-quest-sheet" style={{ padding: '1rem' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--muted)' }}>Create a New Quest</h4>
            <form onSubmit={handleAddQuest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--cream)' }}>Quest Title</label>
                <input 
                  type="text" 
                  value={questTitle}
                  onChange={(e) => setQuestTitle(e.target.value)}
                  placeholder="e.g. Read 20 pages..." 
                  style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--cream)', borderRadius: '4px' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--cream)' }}>Category</label>
                  <select 
                    value={questCategory} 
                    onChange={(e) => setQuestCategory(e.target.value)}
                    style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--cream)', borderRadius: '4px' }}
                  >
                    <option value="General">General</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Focus">Focus</option>
                    <option value="Chores">Chores</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--cream)' }}>Primary Stat</label>
                  <select 
                    value={questStat} 
                    onChange={(e) => setQuestStat(e.target.value)}
                    style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--cream)', borderRadius: '4px' }}
                  >
                    <option value="STR">STR (Strength)</option>
                    <option value="INT">INT (Intelligence)</option>
                    <option value="AGI">AGI (Agility)</option>
                    <option value="WIS">WIS (Wisdom)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--cream)' }}>Difficulty (Determines XP)</label>
                <select 
                  value={questDifficulty} 
                  onChange={(e) => setQuestDifficulty(e.target.value)}
                  style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--cream)', borderRadius: '4px' }}
                >
                  <option value="Easy">Easy (Base: 10 XP)</option>
                  <option value="Medium">Medium (Base: 20 XP)</option>
                  <option value="Hard">Hard (Base: 30 XP)</option>
                  <option value="Epic">Epic (Base: 40 XP)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={questIsEveryday} 
                  onChange={(e) => setQuestIsEveryday(e.target.checked)}
                  id="everydayCheck"
                  style={{ width: '1.2rem', height: '1.2rem' }}
                />
                <label htmlFor="everydayCheck" style={{ fontSize: '0.9rem', color: 'var(--cream)' }}>This is a Daily Habit (Everyday)</label>
              </div>

              {!questIsEveryday && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--cream)' }}>Scheduled Date</label>
                  <input 
                    type="date" 
                    value={questScheduledDate}
                    onChange={(e) => setQuestScheduledDate(e.target.value)}
                    style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--cream)', borderRadius: '4px' }}
                  />
                </div>
              )}

              <button 
                type="submit" 
                className="primary-button" 
                disabled={addQuestMutation.isPending || editQuestMutation.isPending || !questTitle.trim()}
                style={{ padding: '1rem', marginTop: '1rem' }}
              >
                {editingQuestId ? 'Save Changes' : (addQuestMutation.isPending ? 'Forging Quest...' : 'Add Quest to Log')}
              </button>

              {editingQuestId && (
                <button type="button" className="outline-button" onClick={() => {
                  setEditingQuestId(null);
                  setQuestTitle("");
                }}>
                  Cancel Edit
                </button>
              )}

              {(addQuestMutation.isSuccess || editQuestMutation.isSuccess) && (
                <p style={{ color: 'var(--primary)', fontSize: '0.9rem', textAlign: 'center' }}>Quest successfully saved!</p>
              )}
            </form>
            
            <div style={{ marginTop: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                <h4 style={{ color: 'var(--cream)', margin: 0 }}>Active Quest Log</h4>
              </div>

              {/* 7-Day Calendar Picker */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {next7Days.map(day => (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDateFilter(day.date)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      minWidth: '4rem', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer',
                      background: selectedDateFilter === day.date ? 'var(--primary)' : 'rgba(0,0,0,0.4)',
                      border: `1px solid ${selectedDateFilter === day.date ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                      color: selectedDateFilter === day.date ? '#000' : 'var(--muted)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{day.dayName}</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: selectedDateFilter === day.date ? '#000' : 'var(--cream)' }}>{day.dayNumber}</span>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredQuests.length > 0 ? (
                  filteredQuests.map((q: any) => (
                    <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <b style={{ color: 'var(--cream)', display: 'block' }}>{q.title}</b>
                          {q.isEveryday && <span style={{ fontSize: '0.65rem', background: 'var(--primary)', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>DAILY</span>}
                        </div>
                        <small style={{ color: 'var(--muted)' }}>{q.difficulty} • {q.stat} • {q.category}</small>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        <b style={{ color: 'var(--primary)', display: 'block' }}>+{q.xp} XP</b>
                        <button 
                          onClick={() => handleEditClick(q)}
                          style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center', padding: '1rem 0' }}>No active quests scheduled for this day. Forge a new one above!</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="secondary-content">
            <div className="big-symbol">
              {title === "Craft"
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
