import { quests, type Quest } from "../../lib/gameData";
import { GameProgress } from "../ui/custom/GameProgress";
import { Panel } from "../ui/custom/Panel";
import { SectionHead } from "../ui/custom/SectionHead";
import { RarityBadge } from "../ui/custom/RarityBadge";

export function GameContent({
  selectedQuest,
  setSelectedQuest,
  completing,
  complete,
  stageRef,
  oreRef,
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
              src="/questmine-mascot.png"
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
