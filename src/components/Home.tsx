import { useContext } from "react";
import "./Home.scss";
import { ModeIcons, Modes, MorseContext } from "../context/MorseContext";
import { modeToHash } from "../hooks/useHashRoute";
import { ArrowRightIcon } from "../icons/ArrowRightIcon";
import { useProgress } from "../context/ProgressContext";
import { knownCount, streak } from "../progress/progress";
import { letters } from "../data/chars";

export type HomeLink = {
  mode: Modes;
  title: string;
  desc: string;
};

const sections: { title: string; links: HomeLink[] }[] = [
  {
    title: "Practice",
    links: [
      { mode: Modes.Send, title: "Send", desc: "Key words and letters" },
      { mode: Modes.Receive, title: "Receive", desc: "Copy Morse by ear" },
      { mode: Modes.OnAir, title: "On Air", desc: "Hold a conversation" },
    ],
  },
  {
    title: "Reference",
    links: [
      { mode: Modes.Learn, title: "Learn", desc: "Every code, with sound" },
      { mode: Modes.Translate, title: "Translate", desc: "Text to Morse and back" },
    ],
  },
];

export const HomeTile = ({ mode, title, desc }: HomeLink) => {
  const { setSelectedMode } = useContext(MorseContext);

  return (
    <a
      className="home-tile"
      href={modeToHash(mode)}
      onClick={(e) => {
        e.preventDefault();
        setSelectedMode(mode);
      }}
    >
      {ModeIcons[mode]}
      <span className="home-tile__text">
        <span>{title}</span>
        <span>{desc}</span>
      </span>
    </a>
  );
};

export const Home = () => {
  const { setSelectedMode, lastPracticeMode, hasPracticed } =
    useContext(MorseContext);
  const { progress } = useProgress();
  const known = knownCount(progress, letters);
  const days = streak(progress.days);

  return (
    <div className="home">
      <button
        className="home-continue"
        onClick={() => setSelectedMode(lastPracticeMode)}
      >
        <span className="home-continue__text">
          <span>
            {hasPracticed
              ? days > 1
                ? `${days}-day streak. Keep it going`
                : "Pick up where you left off"
              : "New here? Start with two letters"}
          </span>
          <span>
            {hasPracticed ? `Continue: ${lastPracticeMode}` : "Lesson 1"}
          </span>
          <span className="home-continue__meter">
            <div style={{ width: `${(known / letters.length) * 100}%` }} />
          </span>
          <span>
            {known} of {letters.length} letters known
          </span>
        </span>
        <ArrowRightIcon />
      </button>

      {sections.map((section) => (
        <section key={section.title} className="home-section">
          <h2>{section.title}</h2>
          <div className="home-section__tiles">
            {section.links.map((link) => (
              <HomeTile key={link.mode} {...link} />
            ))}
          </div>
        </section>
      ))}

      <div className="home-credit">
        by James Carmichael&nbsp;&nbsp;-&nbsp;&nbsp;
        <a
          href="https://github.com/updownupdown/morse"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </div>
    </div>
  );
};
