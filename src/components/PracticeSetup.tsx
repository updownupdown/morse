import React from "react";
import clsx from "clsx";
import "./PracticeSetup.scss";

// Building blocks for the setup screens of Send, Receive and On Air

type IconTab<T> = { id: T; label: string; icon: React.ReactNode };

// A row of large tabs, each an icon over its label
export function IconTabs<T extends string>({
  tabs,
  selected,
  onSelect,
  label,
}: {
  tabs: IconTab<T>[];
  selected: T;
  onSelect: (id: T) => void;
  label: string;
}) {
  return (
    <div className="icon-tabs" role="tablist" aria-label={label}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={tab.id === selected}
          className={clsx("icon-tab", tab.id === selected && "icon-tab--selected")}
          onClick={() => onSelect(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export type ChoiceCard<T> = {
  id: T;
  title: string;
  desc?: string;
  // A few characters that show what the choice is about
  glyph?: React.ReactNode;
};

// A grid of choices, each with a glyph, a title and a line about it
export function ChoiceCards<T extends string>({
  cards,
  selected,
  onSelect,
  label,
  columns = 2,
}: {
  cards: ChoiceCard<T>[];
  columns?: 1 | 2;
  selected: T;
  onSelect: (id: T) => void;
  label: string;
}) {
  return (
    <div
      className={clsx("choice-cards", columns === 1 && "choice-cards--list")}
      role="radiogroup" aria-label={label}>
      {cards.map((card) => (
        <button
          key={card.id}
          role="radio"
          aria-checked={card.id === selected}
          className={clsx(
            "choice-card",
            card.id === selected && "choice-card--selected",
          )}
          onClick={() => onSelect(card.id)}
        >
          {card.glyph !== undefined && (
            <span className="choice-card__glyph">{card.glyph}</span>
          )}
          <span className="choice-card__text">
            <span>{card.title}</span>
            {card.desc && <span>{card.desc}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

// A labelled setting with a few options side by side
export function OptionRow<T extends string>({
  label,
  options,
  selected,
  onSelect,
  hint,
}: {
  label: string;
  options: T[];
  selected: T;
  onSelect: (option: T) => void;
  hint?: string;
}) {
  return (
    <div className="option-row">
      <div className="option-row__main">
        <span className="option-row__label">{label}</span>
        <div className="segmented" role="radiogroup" aria-label={label}>
          {options.map((option) => (
            <button
              key={option}
              role="radio"
              aria-checked={option === selected}
              className={clsx(
                "segmented__item",
                option === selected && "segmented__item--selected",
              )}
              onClick={() => onSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      {hint && <p className="option-row__hint">{hint}</p>}
    </div>
  );
}

export const SetupHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="setup-heading">{children}</h2>
);
