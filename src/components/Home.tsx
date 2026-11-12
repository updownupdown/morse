import { useContext } from "react";
import "./Home.scss";
import { ModeIcons, Modes, MorseContext } from "../context/MorseContext";
import { modeToHash } from "../hooks/useHashRoute";
import { ArrowRightIcon } from "../icons/ArrowRightIcon";

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

  return (
    <div className="home">
      <button
        className="home-continue"
        onClick={() => setSelectedMode(lastPracticeMode)}
      >
        <span className="home-continue__text">
          <span>{hasPracticed ? "Pick up where you left off" : "New here?"}</span>
          <span>
            {hasPracticed ? `Continue: ${lastPracticeMode}` : "Start sending"}
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
