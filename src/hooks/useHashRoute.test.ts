import { describe, expect, it } from "vitest";
import { hashToRoute, routeToHash } from "./useHashRoute";
import { Modes } from "../context/MorseContext";

describe("hash routes", () => {
  it("maps addresses to screens", () => {
    expect(hashToRoute("", Modes.Send).mode).toBe(Modes.Home);
    expect(hashToRoute("#/", Modes.Send).mode).toBe(Modes.Home);
    expect(hashToRoute("#/learn", Modes.Send).mode).toBe(Modes.Learn);
    expect(hashToRoute("#/practice/receive/", Modes.Send).mode).toBe(
      Modes.Receive,
    );
    expect(hashToRoute("#/nonsense", Modes.Send).mode).toBe(Modes.Home);
  });

  it("opens the last practice mode for #/practice", () => {
    expect(hashToRoute("#/practice", Modes.Receive).mode).toBe(Modes.Receive);
  });

  it("round-trips every screen", () => {
    Object.values(Modes).forEach((mode) => {
      expect(hashToRoute(routeToHash({ mode }), Modes.Send).mode).toBe(mode);
    });
  });
});
