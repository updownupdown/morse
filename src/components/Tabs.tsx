import clsx from "clsx";
import "./Tabs.scss";

interface Tab<T extends string> {
  id: T;
  label: string;
}

interface Props<T extends string> {
  tabs: Tab<T>[];
  selected: T;
  onSelect: (id: T) => void;
  label: string;
  className?: string;
}

// Underlined tabs, for moving between sections of one screen
export const Tabs = <T extends string>({
  tabs,
  selected,
  onSelect,
  label,
  className,
}: Props<T>) => (
  <div className={clsx("tabs", className)} role="tablist" aria-label={label}>
    {tabs.map((tab) => {
      const isSelected = tab.id === selected;

      return (
        <button
          key={tab.id}
          role="tab"
          aria-selected={isSelected}
          className={clsx("tabs__tab", isSelected && "tabs__tab--selected")}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      );
    })}
  </div>
);
