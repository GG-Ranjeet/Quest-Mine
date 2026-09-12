import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

export function Landing() {
  return (
    <div className="landing">
      <div className="landing-bg" />
      <div className="landing-noise" />
      <header className="landing-nav">
        <Link href="/" className="brand">
          <span className="brand-mark">✦</span>
          <span>
            QUEST<span>MINE</span>
          </span>
        </Link>
        <div className="landing-links">
          <a href="#loop">The loop</a>
          <a href="#features">Features</a>
          <a href="#about">Why QuestMine</a>
        </div>
        <Link href="/game" className="outline-button">
          Enter the mine <ChevronRight size={15} />
        </Link>
      </header>
      <main className="landing-hero">
        <div className="hero-copy">
          <div className="kicker">
            <span className="kicker-dot" /> A productivity RPG for people who
            build things
          </div>
          <h1>
            Turn your life
            <br />
            <em>into an adventure.</em>
          </h1>
          <p>
            Complete real-world quests. Gather rare materials. Forge powerful
            equipment. Level up your character — and yourself.
          </p>
          <div className="hero-actions">
            <Link href="/game" className="primary-button">
              Begin your journey <ChevronRight size={17} />
            </Link>
            <a href="#loop" className="quiet-link">
              Explore the world <span>↓</span>
            </a>
          </div>
          <div className="hero-trust">
            <div className="avatar-stack">
              <span>✦</span>
              <span>ᚠ</span>
              <span>◈</span>
              <span>+</span>
            </div>
            <span>Join 2,841 adventurers in the depths</span>
          </div>
        </div>
        <div className="hero-character">
          <div className="character-aura" />
          <img
            src="/questmine-mascot.png"
            alt="QuestMine adventurer"
          />
          <div className="character-tag">
            <span className="pulse" /> Character level 07 <strong>·</strong>{" "}
            Crystal Caverns
          </div>
        </div>
      </main>
      <div className="loop-strip" id="loop">
        <div className="loop-label">THE LOOP</div>
        <div className="loop-item">
          <span>01</span>
          <b>Choose a quest</b>
          <small>Turn intention into action</small>
        </div>
        <div className="loop-arrow">→</div>
        <div className="loop-item">
          <span>02</span>
          <b>Do the real thing</b>
          <small>Progress that matters</small>
        </div>
        <div className="loop-arrow">→</div>
        <div className="loop-item">
          <span>03</span>
          <b>Mine your reward</b>
          <small>Grow your character</small>
        </div>
        <div className="loop-arrow">→</div>
        <div className="loop-item">
          <span>04</span>
          <b>Forge momentum</b>
          <small>Become unstoppable</small>
        </div>
      </div>
      <section className="landing-feature" id="features">
        <div>
          <div className="eyebrow">A world that moves with you</div>
          <h2>
            Small steps.
            <br />
            <em>Legendary progress.</em>
          </h2>
        </div>
        <p>
          QuestMine makes the invisible visible. Every study session, workout,
          and deep-work sprint becomes a tangible piece of your story — with a
          world designed to pull you back in.
        </p>
      </section>
    </div>
  );
}
