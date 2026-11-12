# MorsePlay

A web app for learning Morse code by sending, receiving and playing.

<a href="https://updownupdown.github.io/morse/" target="_blank">Open MorsePlay</a>

## What's in it

- **Learn**: every code with its sound, coloured by how well you know it.
- **Practice**
  - **Send** and **Receive** drills over lessons, words, pangrams, characters, numbers and abbreviations. Lessons follow the Koch order: start with two characters and unlock the next at 90% accuracy.
  - **On Air**: a conversation with a station in Morse, with guided, multiple-choice and free replies, plus endless stream drills for sending and copying.
- **Play**: ten games. Morse Rain, Time Attack, Echo, Sound-alikes, Steady Hand, Memory, Intercept, Mordle, Snowman, and Trivia and Riddles.
- **Translate**: text to Morse and back.

It keys with a straight key or Iambic A, Iambic B and Ultimatic paddles, by touch, mouse or keyboard. Progress is remembered per character in the browser, and weak characters come up more often. The app installs to a home screen and works offline. Vibration and an on-screen light can stand in for sound.

## Development

```
npm install
npm run dev      # local server
npm test         # unit tests (Vitest)
npm run lint     # ESLint
npm run build    # type-check and build to dist/
```

Pushing to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`.

## Layout

| Path | What lives there |
| --- | --- |
| `src/morse/` | Timing, playback schedules, the key decoder and rhythm scoring. No React. |
| `src/progress/` | Per-character records, mastery, Koch lessons and adaptive picking. |
| `src/quiz/` | The Send and Receive round as a pure state machine. |
| `src/data/` | Codes, word lists, abbreviations and On Air conversation scripts. |
| `src/games/` | One file per game, plus `registry.tsx`, which lists them. |
| `src/components/` | Screens and shared UI. |
| `src/hooks/` | Audio, the straight key and paddles, routing, storage. |

### Adding a game

Write a component that takes `GameProps` (`level`, `best`, `onEnd`) and add a `GameDef` for it to a group in `src/games/registry.tsx`. The shell supplies the setup screen, help, levels, best score and results.
