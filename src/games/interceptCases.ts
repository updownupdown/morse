export type Mission = {
  // Sets the scene before the message is played
  brief: string;
  message: string;
  // Shown once the message is decoded
  debrief: string;
};

export type InterceptCase = {
  id: string;
  name: string;
  missions: Mission[];
};

export const interceptCases: InterceptCase[] = [
  {
    id: "lighthouse",
    name: "The Lighthouse",
    missions: [
      {
        brief:
          "A fishing boat is overdue. The lighthouse keeper hears a faint signal through the storm.",
        message: "NET TORN",
        debrief: "They are alive, and drifting. The keeper lights the lamp.",
      },
      {
        brief: "The keeper asks where they are. The answer comes slowly.",
        message: "EAST OF RED ROCK",
        debrief: "Red Rock is two miles out. The lifeboat crew is woken.",
      },
      {
        brief: "The lifeboat is launched. The boat signals again.",
        message: "TAKING ON WATER",
        debrief: "There is not much time. The lifeboat pulls harder.",
      },
      {
        brief: "The lifeboat cannot see them in the dark and asks for a sign.",
        message: "WE SEE YOUR LAMP",
        debrief: "The keeper swings the beam to guide both boats together.",
      },
      {
        brief: "An hour passes with nothing. Then the key clicks once more.",
        message: "ALL SAFE THANK YOU",
        debrief: "Five hands saved. The keeper puts the kettle on.",
      },
    ],
  },
  {
    id: "train",
    name: "The Night Train",
    missions: [
      {
        brief:
          "You work the telegraph at a quiet junction. Just after midnight the wire wakes up.",
        message: "HOLD THE NIGHT TRAIN",
        debrief: "You set the signal to stop. But why hold it?",
      },
      {
        brief: "You ask the reason. The reply is short.",
        message: "BRIDGE OUT AT MILE 9",
        debrief: "The river took the bridge. The train is ten minutes away.",
      },
      {
        brief: "The driver has stopped and wants to know what to do next.",
        message: "BACK TO THE JUNCTION",
        debrief: "The train reverses slowly up the line.",
      },
      {
        brief: "Head office wants a count of the passengers before morning.",
        message: "SEND COUNT BY 6",
        debrief: "You walk the carriages with a lamp: 84 souls, all asleep.",
      },
      {
        brief: "You send the number. One last message comes back.",
        message: "GOOD WORK COACHES AT DAWN",
        debrief: "Everyone gets home, a day late. Your shift is over.",
      },
    ],
  },
  {
    id: "cipher",
    name: "The Cipher Room",
    missions: [
      {
        brief:
          "Your first night in the listening station. A numbers station comes through the static.",
        message: "GRID 47 NORTH",
        debrief: "You pin the map. Something is moving up there.",
      },
      {
        brief: "The same hand, twenty minutes later and in a hurry.",
        message: "CONVOY LEAVES 0530",
        debrief: "Half past five. You ring upstairs.",
      },
      {
        brief: "A second station answers the first. This one is new to you.",
        message: "ROUTE 12 IS WATCHED",
        debrief: "They know about the road. Somebody has talked.",
      },
      {
        brief: "The first station changes its plan on the air.",
        message: "USE QUAY 3 AT 2215",
        debrief: "A new place, a new time. You write it down twice.",
      },
      {
        brief: "The last message of the night is not for them. It is for you.",
        message: "WE KNOW YOU LISTEN 73",
        debrief: "73 means best regards. You switch off the set and smile.",
      },
    ],
  },
];
