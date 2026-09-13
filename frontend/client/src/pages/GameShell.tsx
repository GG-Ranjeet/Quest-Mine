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
  navItems,
  quests,
  type Quest,
} from "../lib/gameData";
import { GameProgress } from "../components/ui/custom/GameProgress";
import { GameContent } from "../components/game/GameContent";
import { SecondaryContent } from "../components/game/SecondaryContent";
import type { Equipment } from "../lib/gameData";

export type EquipmentState = {
  armor1: Equipment | null;
  armor2: Equipment | null;
  armor3: Equipment | null;
  accessory1: Equipment | null;
  accessory2: Equipment | null;
  accessory3: Equipment | null;
};

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
  
  const [equipment, setEquipment] = useState<EquipmentState>({
    armor1: null,
    armor2: null,
    armor3: null,
    accessory1: null,
    accessory2: null,
    accessory3: null,
  });
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
            <SecondaryContent location={location} equipment={equipment} setEquipment={setEquipment} />
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
