export type Mark = "hit" | "near" | "miss";

// Marks each letter of a guess: right place, wrong place, or not in the
// word. A letter is only "near" as many times as the answer has it spare.
export function markGuess(guess: string, answer: string): Mark[] {
  const marks: Mark[] = Array(guess.length).fill("miss");
  const spare: Record<string, number> = {};

  for (let i = 0; i < answer.length; i++) {
    if (guess[i] === answer[i]) marks[i] = "hit";
    else spare[answer[i]] = (spare[answer[i]] ?? 0) + 1;
  }

  for (let i = 0; i < guess.length; i++) {
    if (marks[i] === "hit") continue;
    if (spare[guess[i]] > 0) {
      marks[i] = "near";
      spare[guess[i]] -= 1;
    }
  }

  return marks;
}

const rank: Record<Mark, number> = { miss: 0, near: 1, hit: 2 };

// The best mark each letter has earned so far, for the alphabet strip
export function letterMarks(guesses: string[], answer: string) {
  const best: Record<string, Mark> = {};

  guesses.forEach((guess) => {
    markGuess(guess, answer).forEach((mark, i) => {
      const letter = guess[i];
      if (!best[letter] || rank[mark] > rank[best[letter]]) best[letter] = mark;
    });
  });

  return best;
}
