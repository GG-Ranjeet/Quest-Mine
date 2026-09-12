import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import gsap from "gsap";
import {
  Bell,
  ChevronRight,
  CircleHelp,
  Coins,
  Flame,
  Gem,
  Menu,
  Settings,
  X,
  Zap,
} from "lucide-react";
import {
  completeQuestMock,
  materials,
  navItems,
  quests,
  stats,
  type Quest,
} from "../lib/gameData";
import { GameProgress } from "../components/ui/GameProgress";
import { Panel } from "../components/ui/Panel";
import { SectionHead } from "../components/ui/SectionHead";
import { RarityBadge } from "../components/ui/RarityBadge";

export function GameShell() {
  const [location] = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [coins, setCoins] = useState(1284);
  const [xp, setXp] = useState(4820);
  const [energy, setEnergy] = useState(68);
  const [questsDone, setQuestsDone] = useState(3);
  const [bossHp, setBossHp] = useState(640);
  const [toast, setToast] = useState("");
  const [selectedQuest, setSelectedQuest] = useState<Quest>(quests[0]);
  const [completing, setCompleting] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const oreRef = useRef<HTMLDivElement>(null);
  const rewardRef = useRef<HTMLDivElement>(null);
  const pageName = navItems.find(([path]) => path === location)?.[1] || "Play";
  const complete = async () => {
    if (completing) return;
    setCompleting(true);
    setToast("");
    const tl = gsap.timeline();
    if (stageRef.current && oreRef.current) {
      tl.to(stageRef.current, {
        scale: 1.025,
        duration: 0.22,
        ease: "power2.out",
      })
        .to(oreRef.current, {
          rotate: -8,
          x: -7,
          duration: 0.14,
          yoyo: true,
          repeat: 3,
          ease: "power1.inOut",
        })
        .to(oreRef.current, {
          scale: 1.14,
          filter: "brightness(1.8)",
          duration: 0.15,
        })
        .to(oreRef.current, {
          scale: 1,
          filter: "brightness(1)",
          duration: 0.3,
        });
    }
    const result = await completeQuestMock(selectedQuest);
    setXp(v => v + result.xp);
    setCoins(v => v + result.coins);
    setEnergy(v => Math.max(0, v - 7));
    setQuestsDone(v => v + 1);
    setBossHp(v => Math.max(0, v - result.damage));
    if (rewardRef.current)
      gsap.fromTo(
        rewardRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    setToast(`Quest complete · +${result.xp} XP · +${result.coins} coins`);
    setCompleting(false);
  };
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(timer);
  }, [toast]);
  return (
    <div className="app-shell">
      <header className="top-hud">
        <Link href="/" className="brand">
          <span className="brand-mark">✦</span>
          <span>
            QUEST<span>MINE</span>
          </span>
        </Link>
        <div className="hud-profile">
          <div className="level-badge">07</div>
          <div className="hud-player">
            <div className="hud-player-row">
              <b>Rin, the Wayfinder</b>
              <span>4,820 / 6,000 XP</span>
            </div>
            <GameProgress value={80} tone="xp" />
          </div>
        </div>
        <div className="hud-counters">
          <div className="hud-counter">
            <Coins size={16} />
            <b>{coins.toLocaleString()}</b>
            <span>coins</span>
          </div>
          <div className="hud-counter">
            <Flame size={16} />
            <b>12</b>
            <span>day streak</span>
          </div>
          <div className="hud-counter">
            <Zap size={16} />
            <b>{energy}%</b>
            <span>energy</span>
          </div>
          <button className="icon-button">
            <Bell size={17} />
            <i />
          </button>
          <button className="avatar-button">R</button>
          <button
            className="mobile-menu"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <div className={`app-body ${mobileMenu ? "mobile-open" : ""}`}>
        <aside className="sidebar">
          <div className="event-card">
            <div className="event-top">
              <span className="event-icon">✦</span>
              <div>
                <div className="eyebrow">WORLD EVENT</div>
                <b>Crystal Surge</b>
              </div>
              <span className="live-dot">LIVE</span>
            </div>
            <p>
              Crafting costs reduced by <strong>10%</strong> today.
            </p>
            <div className="event-timer">
              Ends in <b>08h 42m</b>
            </div>
          </div>
          <nav className="side-nav">
            {navItems.map(([path, label, icon]) => (
              <Link
                key={path}
                href={path}
                className={location === path ? "active" : ""}
              >
                <span className="nav-icon">{icon}</span>
                {label}
                {label === "Quests" && <span className="nav-count">4</span>}
              </Link>
            ))}
          </nav>
          <div className="side-bottom">
            <Link href="/settings">
              <Settings size={15} /> Settings
            </Link>
            <button>
              <CircleHelp size={15} /> Help center
            </button>
          </div>
        </aside>
        <main className="game-main">
          <div className="main-heading">
            <div>
              <div className="breadcrumb">
                TODAY'S RUN <span>·</span> SEPTEMBER 12, 2026
              </div>
              <h1>{pageName === "Play" ? "Crystal Caverns" : pageName}</h1>
              <p>
                {pageName === "Play"
                  ? "A humming underworld where focus crystallizes into power."
                  : `Your ${pageName.toLowerCase()} and progression records.`}
              </p>
            </div>
            <div className="heading-actions">
              <button className="soft-button">
                <Gem size={14} /> Rare drop +15%
              </button>
              <button className="round-action">•••</button>
            </div>
          </div>
          {location === "/game" || location === "/quests" ? (
            <GameContent
              {...{
                selectedQuest,
                setSelectedQuest,
                completing,
                complete,
                stageRef,
                oreRef,
                rewardRef,
                questsDone,
                bossHp,
                toast,
              }}
            />
          ) : (
            <SecondaryContent location={location} />
          )}
        </main>
      </div>
      <nav className="mobile-bottom">
        {navItems.slice(0, 5).map(([path, label, icon]) => (
          <Link
            key={path}
            href={path}
            className={location === path ? "active" : ""}
          >
            <span>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
      {toast && (
        <div className="toast">
          <span className="toast-icon">✦</span>
          <div>
            <b>{toast.split("·")[0]}</b>
            <small>{toast.split("·").slice(1).join("·")}</small>
          </div>
          <button onClick={() => setToast("")}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function GameContent({
  selectedQuest,
  setSelectedQuest,
  completing,
  complete,
  stageRef,
  oreRef,
  rewardRef,
  questsDone,
  bossHp,
}: any) {
  return (
    <div className="game-grid">
      <div className="game-left">
        <section className="biome-stage" ref={stageRef}>
          <div className="stage-bg" />
          <div className="stage-vignette" />
          <div className="stage-top">
            <div>
              <span className="location-pill">
                <span className="pulse" /> CURRENT BIOME
              </span>
              <h2>Crystal Caverns</h2>
              <p>Where old light becomes new resolve.</p>
            </div>
            <div className="stage-meta">
              <span>
                <b>AVAILABLE DROPS</b>
                <i>Stone · Silver · Crystal · Moon Shard</i>
              </span>
              <span>
                <b>DAILY MODIFIER</b>
                <i className="teal">Rare material chance +15%</i>
              </span>
            </div>
          </div>
          <div className="stage-character">
            <div className="mine-sparkles">
              <i />
              <i />
              <i />
              <i />
            </div>
            <img
              src="/manus-storage/questmine-mascot_0a10ca73.png"
              alt="Your character in Crystal Caverns"
            />
            <div className="character-name">
              <span>RIN</span>
              <small>THE WAYFINDER</small>
            </div>
          </div>
          <div className="ore-deposit" ref={oreRef}>
            <div className="ore-glow" />
            <div className="ore-crystal">✦</div>
            <div className="ore-label">
              <span>✦</span> VEIN OF LUCENTIUM
            </div>
          </div>
          <div className="stage-caption">
            <span>THE CAVERN HUMS WITH POTENTIAL</span>
            <span>Biome rotation in 08h 42m</span>
          </div>
        </section>
        <Panel className="boss-panel">
          <div className="boss-top">
            <div>
              <div className="eyebrow">WEEKLY CHALLENGE</div>
              <h3>
                Crystal Guardian <span>·</span> <em>Tier II</em>
              </h3>
            </div>
            <div className="boss-time">
              <b>4d 08h</b>
              <span>remaining</span>
            </div>
          </div>
          <div className="boss-health">
            <div className="boss-avatar">♜</div>
            <div className="boss-bar-wrap">
              <div className="boss-bar-label">
                <span>GUARDIAN HP</span>
                <b>
                  {bossHp} <small>/ 1,000</small>
                </b>
              </div>
              <GameProgress value={bossHp / 10} tone="boss" />
              <div className="boss-meta">
                <span>
                  Personal contribution <b>360 dmg</b>
                </span>
                <span>Next reward at 500 dmg</span>
              </div>
            </div>
            <div className="boss-reward">
              ✦<small>REWARD CHEST</small>
            </div>
          </div>
        </Panel>
      </div>
      <aside className="quest-rail">
        <SectionHead
          eyebrow="YOUR ACTIVE QUEST"
          title="Quest scroll"
          action="View journal"
        />
        <div className="quest-scroll">
          <div className="scroll-fold" />
          <div className="quest-inner">
            <div className="quest-topline">
              <RarityBadge rarity={selectedQuest.rarity} />
              <span className="quest-category">
                {selectedQuest.category} · {selectedQuest.stat}
              </span>
            </div>
            <h3>{selectedQuest.title}</h3>
            <p>
              Enter a focused state and bring one meaningful piece of work to
              completion. Your attention is the pickaxe.
            </p>
            <div className="quest-facts">
              <span>
                <b>DIFFICULTY</b>
                <strong className={selectedQuest.difficulty.toLowerCase()}>
                  {selectedQuest.difficulty}
                </strong>
              </span>
              <span>
                <b>DURATION</b>
                <strong>{selectedQuest.duration}</strong>
              </span>
              <span>
                <b>BASE XP</b>
                <strong>+{selectedQuest.xp} XP</strong>
              </span>
            </div>
            <div className="quest-drops">
              <span>Possible drops</span>
              {selectedQuest.drops.map((drop: string) => (
                <b key={drop}>{drop}</b>
              ))}
            </div>
            <button
              className="complete-button"
              onClick={complete}
              disabled={completing}
            >
              {completing ? (
                <>
                  <span className="button-spinner" /> Mining your reward...
                </>
              ) : (
                <>
                  <span>✦</span> Complete quest <kbd>↵</kbd>
                </>
              )}
            </button>
            <div className="quest-note">
              Completion deals{" "}
              <b>
                {selectedQuest.difficulty === "Hard"
                  ? "150"
                  : selectedQuest.difficulty === "Medium"
                    ? "80"
                    : "40"}{" "}
                damage
              </b>{" "}
              to the weekly boss.
            </div>
          </div>
        </div>
        <div className="recent-heading">
          <SectionHead
            eyebrow="UP NEXT"
            title="Daily quests"
            action="See all"
          />
        </div>
        <div className="mini-quests">
          {quests.slice(1, 4).map(quest => (
            <button
              key={quest.id}
              className={`mini-quest ${selectedQuest.id === quest.id ? "selected" : ""}`}
              onClick={() => setSelectedQuest(quest)}
            >
              <span className="mini-icon">
                {quest.stat === "Strength"
                  ? "⚔"
                  : quest.stat === "Wisdom"
                    ? "◌"
                    : "◒"}
              </span>
              <span>
                <b>{quest.title}</b>
                <small>
                  {quest.category} · {quest.duration}
                </small>
              </span>
              <span className="mini-xp">
                +{quest.xp}
                <small>XP</small>
              </span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

function SecondaryContent({ location }: { location: string }) {
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
