import React from "react";

// Outline icons, drawn with strokes in the current text colour.
// Every child sets fill="none", so a `fill` set on the <svg> by CSS
// (as the older, filled icons expect) doesn't paint them in.
const LineIcon = ({ children }: { children: React.ReactNode }) => (
  <svg
    className="line-icon"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {children}
  </svg>
);

// ========== Interface ========== //
export const SlidersIcon = () => (
  <LineIcon>
    <path fill="none" d="M4 8h8.5M17.5 8H20M4 16h2.5M11.5 16H20" />
    <circle fill="none" cx="15" cy="8" r="2.5" />
    <circle fill="none" cx="9" cy="16" r="2.5" />
  </LineIcon>
);

export const ChevronLeftIcon = () => (
  <LineIcon>
    <path fill="none" d="M14.5 6 8.5 12l6 6" />
  </LineIcon>
);

export const ChevronRightIcon = () => (
  <LineIcon>
    <path fill="none" d="m9.5 6 6 6-6 6" />
  </LineIcon>
);

export const OnAirIcon = () => (
  <LineIcon>
    <circle fill="none" cx="12" cy="11" r="1.6" />
    <path fill="none" d="M12 12.6V21M9.5 21h5" />
    <path fill="none" d="M8.5 7.5a5 5 0 0 0 0 7M15.5 7.5a5 5 0 0 1 0 7" />
    <path fill="none" d="M5.6 4.6a9 9 0 0 0 0 12.8M18.4 4.6a9 9 0 0 1 0 12.8" />
  </LineIcon>
);

export const ChatIcon = () => (
  <LineIcon>
    <path
      fill="none"
      d="M4 6.5A2.5 2.5 0 0 1 6.5 4h7A2.5 2.5 0 0 1 16 6.5v4a2.5 2.5 0 0 1-2.5 2.5H9l-3.5 3v-3A2.5 2.5 0 0 1 4 10.5z"
    />
    <path
      fill="none"
      d="M18.5 9A1.5 1.5 0 0 1 20 10.5v4a2.5 2.5 0 0 1-2.5 2.5V20l-3.5-3h-3"
    />
  </LineIcon>
);

// ========== Games ========== //
export const RainIcon = () => (
  <LineIcon>
    <path fill="none" d="M8 3.5c2 2.7 3 4.4 3 5.8a3 3 0 0 1-6 0c0-1.4 1-3.1 3-5.8z" />
    <path fill="none" d="M16.5 10c1.7 2.3 2.5 3.7 2.5 4.9a2.5 2.5 0 0 1-5 0c0-1.2.8-2.6 2.5-4.9z" />
    <path fill="none" d="M5 16.5v.01M9 19v2M4 21h12" />
  </LineIcon>
);

export const StopwatchIcon = () => (
  <LineIcon>
    <circle fill="none" cx="12" cy="13.5" r="7.5" />
    <path fill="none" d="M12 13.5V9.5M10 2.5h4M12 2.5V6M18.2 6.8l1.3-1.3" />
  </LineIcon>
);

export const EchoIcon = () => (
  <LineIcon>
    <path fill="none" d="M3 12h2.5M7.5 12h1" />
    <path fill="none" d="M12 8.5a5 5 0 0 1 0 7" />
    <path fill="none" d="M15 6a8.5 8.5 0 0 1 0 12" />
    <path fill="none" d="M18 3.5a12 12 0 0 1 0 17" />
  </LineIcon>
);

export const SoundAlikesIcon = () => (
  <LineIcon>
    <path fill="none" d="M4 9.5c1.3-1.6 2.7-1.6 4 0s2.7 1.6 4 0 2.7-1.6 4 0 2.7 1.6 4 0" />
    <path fill="none" d="M4 15c1.3-1.6 2.7-1.6 4 0s2.7 1.6 4 0 2.7-1.6 4 0 2.7 1.6 4 0" />
  </LineIcon>
);

export const MetronomeIcon = () => (
  <LineIcon>
    <path fill="none" d="M9.5 3h5l4 18h-13z" />
    <path fill="none" d="M12 16.5 17 6M7.5 16.5h9" />
  </LineIcon>
);

export const CardsIcon = () => (
  <LineIcon>
    <rect fill="none" x="3.5" y="6" width="9.5" height="13" rx="2" />
    <path fill="none" d="M15.5 4.6 19 5.8a2 2 0 0 1 1.3 2.5L17 17.8" />
    <path fill="none" d="M8.25 10.5v4M6.5 12.5h3.5" />
  </LineIcon>
);

export const InterceptIcon = () => (
  <LineIcon>
    <path fill="none" d="M3 20 8 9l5 11M4.5 16.5h7" />
    <path fill="none" d="M14 6.5a4 4 0 0 1 4 4M14 2.5a8 8 0 0 1 8 8" />
    <circle fill="none" cx="8" cy="7" r="1.5" />
  </LineIcon>
);

export const GridIcon = () => (
  <LineIcon>
    <rect fill="none" x="3" y="5" width="5" height="5" rx="1" />
    <rect fill="none" x="9.5" y="5" width="5" height="5" rx="1" />
    <rect fill="none" x="16" y="5" width="5" height="5" rx="1" />
    <rect fill="none" x="3" y="14" width="5" height="5" rx="1" />
    <rect fill="none" x="9.5" y="14" width="5" height="5" rx="1" />
    <rect fill="none" x="16" y="14" width="5" height="5" rx="1" />
  </LineIcon>
);

export const SnowmanIcon = () => (
  <LineIcon>
    <circle fill="none" cx="12" cy="8.5" r="3" />
    <circle fill="none" cx="12" cy="16.5" r="4.5" />
    <path fill="none" d="M8.5 4.5h7M10 4.5V2.5h4v2M7.5 13.5 4 11.5M16.5 13.5 20 11.5" />
  </LineIcon>
);

export const QuestionIcon = () => (
  <LineIcon>
    <circle fill="none" cx="12" cy="12" r="9" />
    <path fill="none" d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.6M12 16.8v.01" />
  </LineIcon>
);
