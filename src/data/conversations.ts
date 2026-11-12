// Scripted, branching conversations for On Air. Plain data, so the mode
// works offline. Each node is one line from the station; its replies are
// what you can send back, and where each one leads.

export type Reply = {
  text: string;
  // The node the station moves to; omitted = the conversation ends
  next?: string;
  // In free replies: words that pick this branch
  keywords?: string[];
};

export type ConversationNode = {
  station: string;
  replies?: Reply[];
};

export type Conversation = {
  id: string;
  title: string;
  desc: string;
  start: string;
  // Roughly how many exchanges, for the progress bar
  turns: number;
  nodes: Record<string, ConversationNode>;
};

export const conversations: Conversation[] = [
  {
    id: "small-talk",
    title: "Small talk",
    desc: "A friendly chat with short replies",
    start: "hello",
    turns: 5,
    nodes: {
      hello: {
        station: "GM HOW ARE YOU",
        replies: [
          { text: "FINE TNX", next: "name", keywords: ["FINE", "GOOD", "WELL", "OK", "GREAT"] },
          { text: "TIRED", next: "tired", keywords: ["TIRED", "BAD", "SICK", "SLEEPY"] },
        ],
      },
      tired: {
        station: "SORRY OM. GET SOME REST",
        replies: [{ text: "WILL DO", next: "name" }],
      },
      name: {
        station: "WHAT IS UR NAME",
        replies: [
          { text: "NAME IS SAM", next: "weather", keywords: ["NAME", "SAM"] },
          { text: "CALL ME AL", next: "weather", keywords: ["CALL", "AL"] },
        ],
      },
      weather: {
        station: "NICE TO MEET U. HOW IS WX",
        replies: [
          { text: "SUNNY ES WARM", next: "sunny", keywords: ["SUN", "WARM", "HOT", "CLEAR", "NICE"] },
          { text: "RAIN ES COLD", next: "rain", keywords: ["RAIN", "COLD", "SNOW", "WET", "WIND"] },
        ],
      },
      sunny: {
        station: "LUCKY U. RAIN HR ALL DAY",
        replies: [{ text: "TOO BAD", next: "bye" }],
      },
      rain: {
        station: "SAME HR. GOOD DAY FOR RADIO",
        replies: [{ text: "VERY TRUE", next: "bye" }],
      },
      bye: {
        station: "MUST GO NOW. 73",
        replies: [{ text: "73 CUL", next: "end" }],
      },
      end: { station: "CUL" },
    },
  },
  {
    id: "radio-contact",
    title: "Radio contact",
    desc: "A real amateur exchange: call, report, name, location",
    start: "cq",
    turns: 6,
    nodes: {
      cq: {
        station: "CQ CQ DE W1AW K",
        replies: [{ text: "W1AW DE K7QA K", next: "report" }],
      },
      report: {
        station: "K7QA DE W1AW GM UR RST 579",
        replies: [
          { text: "R TNX UR RST 599", next: "name", keywords: ["599", "5NN"] },
          { text: "R TNX UR RST 559", next: "weak", keywords: ["559", "449", "339"] },
        ],
      },
      weak: {
        station: "TNX. QSB HR TODAY",
        replies: [{ text: "R QRM TOO", next: "name" }],
      },
      name: {
        station: "NAME HR IS JOE. QTH BOSTON",
        replies: [
          { text: "NAME HR IS SAM", next: "qth", keywords: ["NAME"] },
          { text: "OP SAM", next: "qth", keywords: ["OP"] },
        ],
      },
      qth: {
        station: "TNX SAM. UR QTH?",
        replies: [
          { text: "QTH SEATTLE", next: "rig", keywords: ["SEATTLE"] },
          { text: "QTH TORONTO", next: "rig", keywords: ["TORONTO"] },
        ],
      },
      rig: {
        station: "FB. RIG HR 100W ES DIPOLE",
        replies: [
          { text: "RIG HR QRP 5W", next: "bye", keywords: ["QRP", "5W"] },
          { text: "RIG HR 50W ES VERT", next: "bye", keywords: ["50W", "VERT"] },
        ],
      },
      bye: {
        station: "FB SIG. TNX QSO 73",
        replies: [{ text: "TNX QSO 73 SK", next: "end" }],
      },
      end: { station: "73 SK" },
    },
  },
  {
    id: "ship-to-shore",
    title: "Ship to shore",
    desc: "Guide a ship into harbour through the fog",
    start: "call",
    turns: 6,
    nodes: {
      call: {
        station: "HARBOR DE SHIP VEGA K",
        replies: [{ text: "VEGA DE HARBOR GO", next: "fog" }],
      },
      fog: {
        station: "THICK FOG. NEED A PILOT",
        replies: [
          { text: "PILOT ON THE WAY", next: "position", keywords: ["PILOT", "WAY", "YES"] },
          { text: "WAIT AT ANCHOR", next: "anchor", keywords: ["WAIT", "ANCHOR", "NO"] },
        ],
      },
      anchor: {
        station: "R. AT ANCHOR NOW",
        replies: [{ text: "PILOT AT DAWN", next: "position" }],
      },
      position: {
        station: "WE ARE 2 MILES EAST OF LIGHT",
        replies: [
          { text: "STEER WEST SLOW", next: "depth", keywords: ["WEST", "SLOW"] },
          { text: "HOLD UR COURSE", next: "depth", keywords: ["HOLD", "COURSE"] },
        ],
      },
      depth: {
        station: "R. WHAT IS TIDE",
        replies: [
          { text: "HIGH TIDE AT 6", next: "berth", keywords: ["HIGH"] },
          { text: "LOW TIDE AT 9", next: "berth", keywords: ["LOW"] },
        ],
      },
      berth: {
        station: "TNX. WHICH BERTH",
        replies: [
          { text: "BERTH 4 NORTH PIER", next: "end", keywords: ["4", "NORTH"] },
          { text: "BERTH 7 SOUTH PIER", next: "end", keywords: ["7", "SOUTH"] },
        ],
      },
      end: { station: "R. SEE U IN PORT. OUT" },
    },
  },
  {
    id: "telegram-office",
    title: "Telegram office",
    desc: "Take down a customer's telegram and send it on",
    start: "open",
    turns: 5,
    nodes: {
      open: {
        station: "OFFICE OPEN? HAVE A TELEGRAM",
        replies: [{ text: "OPEN. GO AHEAD", next: "to" }],
      },
      to: {
        station: "TO MRS ADA REED, YORK",
        replies: [{ text: "TO ADA REED YORK", next: "body" }],
      },
      body: {
        station: "ARRIVE FRIDAY NOON. MEET TRAIN",
        replies: [
          { text: "ARRIVE FRIDAY NOON MEET TRAIN", next: "sign", keywords: ["ARRIVE", "FRIDAY"] },
          { text: "AGN PSE", next: "again", keywords: ["AGN", "AGAIN", "REPEAT", "?"] },
        ],
      },
      again: {
        station: "ARRIVE FRIDAY NOON. MEET TRAIN",
        replies: [{ text: "ARRIVE FRIDAY NOON MEET TRAIN", next: "sign" }],
      },
      sign: {
        station: "SIGNED TOM. HOW MANY WORDS",
        replies: [
          { text: "9 WORDS", next: "cost", keywords: ["9", "NINE"] },
          { text: "12 WORDS", next: "recount", keywords: ["12", "TWELVE"] },
        ],
      },
      recount: {
        station: "COUNT AGN PSE",
        replies: [{ text: "9 WORDS", next: "cost" }],
      },
      cost: {
        station: "R. COST IS 45 CENTS",
        replies: [{ text: "PAID. SENT AT 1030", next: "end" }],
      },
      end: { station: "TNX. GOOD DAY" },
    },
  },
];

// Short sentences for copying by ear
export const phrases = [
  "THE TRAIN LEAVES AT NOON",
  "SEND MORE COFFEE",
  "ALL IS WELL HERE",
  "MEET ME AT THE STATION",
  "THE SHIP SAILS AT DAWN",
  "RAIN IS ON THE WAY",
  "PLEASE CALL HOME",
  "WE ARRIVE ON FRIDAY",
  "THE KEY IS UNDER THE MAT",
  "GOOD LUCK TO YOU",
  "HOLD THE LINE",
  "THE WIRE IS DOWN",
  "SNOW IN THE NORTH PASS",
  "BRING A WARM COAT",
  "THE MOON IS FULL TONIGHT",
  "SEE YOU IN THE MORNING",
  "LIGHTS OUT AT TEN",
  "THE BRIDGE IS CLOSED",
  "WAIT FOR MY SIGNAL",
  "TEA IS AT FOUR",
  "NO NEWS IS GOOD NEWS",
  "KEEP A STEADY HAND",
  "THE MAIL CAME EARLY",
  "TURN LEFT AT THE MILL",
  "HAPPY BIRTHDAY TO YOU",
  "THE RIVER IS RISING",
  "PAY ON ARRIVAL",
  "LISTEN FOR THE BELL",
  "SUPPER IS READY",
  "FAIR WINDS AND CALM SEAS",
];

// Every character a conversation asks you to send or copy
export function conversationChars(conversation: Conversation) {
  const chars = new Set<string>();

  Object.values(conversation.nodes).forEach((node) => {
    [node.station, ...(node.replies ?? []).map((r) => r.text)].forEach(
      (text) => [...text].forEach((c) => c !== " " && chars.add(c)),
    );
  });

  return [...chars];
}

// In free replies: the branch whose keywords appear in what was sent,
// or the first reply's branch when nothing matches
export function matchReply(node: ConversationNode, sent: string) {
  const replies = node.replies ?? [];
  const text = sent.toUpperCase();

  return (
    replies.find((reply) =>
      (reply.keywords ?? []).some((keyword) => text.includes(keyword)),
    ) ?? replies[0]
  );
}
