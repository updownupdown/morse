import { describe, expect, it } from "vitest";
import { conversations, matchReply, phrases } from "./conversations";
import { alphaToMorseDict } from "./alphaToMorse";

const sendable = (text: string) =>
  [...text].every((c) => c === " " || alphaToMorseDict[c] !== undefined);

describe("conversations", () => {
  conversations.forEach((conversation) => {
    describe(conversation.title, () => {
      it("only links to nodes that exist, and can reach an ending", () => {
        const { nodes, start } = conversation;
        expect(nodes[start]).toBeDefined();

        const seen = new Set<string>();
        const queue = [start];
        let reachesEnd = false;

        while (queue.length) {
          const id = queue.pop()!;
          if (seen.has(id)) continue;
          seen.add(id);

          const node = nodes[id];
          expect(node, `missing node "${id}"`).toBeDefined();
          if (!node.replies?.length) reachesEnd = true;

          node.replies?.forEach((reply) => {
            if (reply.next) queue.push(reply.next);
            else reachesEnd = true;
          });
        }

        expect(reachesEnd).toBe(true);
        // No orphaned nodes
        expect([...seen].sort()).toEqual(Object.keys(nodes).sort());
      });

      it("uses only characters that have a Morse code", () => {
        Object.values(conversation.nodes).forEach((node) => {
          expect(sendable(node.station), node.station).toBe(true);
          node.replies?.forEach((reply) =>
            expect(sendable(reply.text), reply.text).toBe(true),
          );
        });
      });
    });
  });

  it("has phrases that can all be sent", () => {
    phrases.forEach((phrase) => expect(sendable(phrase), phrase).toBe(true));
  });
});

describe("matchReply", () => {
  const node = conversations[0].nodes.hello;

  it("picks a branch by keyword", () => {
    expect(matchReply(node, "so tired")?.next).toBe("tired");
  });

  it("falls back to the first reply", () => {
    expect(matchReply(node, "XYZ")?.next).toBe("name");
  });
});
