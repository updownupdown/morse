import { useAudioContext } from "../context/AudioContext";
import { alphaToMorse } from "../data/alphaToMorse";
import "./InfoModal.scss";
import { Modal } from "./Modal";

export const InfoModal = () => {
  const { playMorse } = useAudioContext();

  const CharGap = () => (
    <div className="flex flex--1">
      <div className="setting-example setting-example--gap" />
    </div>
  );
  const LetterGap = () => <div className="flex flex--3"></div>;
  const WordGap = () => <div className="flex flex--7"></div>;
  const Dit = () => (
    <div className="flex flex--1">
      <div className="setting-example setting-example--dit" />
    </div>
  );
  const Dah = () => (
    <div className="flex flex--3">
      <div className="setting-example setting-example--dah" />
    </div>
  );

  return (
    <Modal title="Help">
      <div className="info">
        <div className="info__row">
          <p>
            Morse code is made of "dits" (dots) and "dahs" (dashes). A "dit" is
            one unit long, with the duration of a unit depending on the speed at
            which morse is sent. You can adjust the timing used in this app from
            the settings.
          </p>
          <p>Other unit lengths are as follows:</p>

          <div className="info-units">
            <div>
              <span>dit</span>
              <div className="info-units-dit" />
            </div>
            <div>
              <span>dah</span>
              <div className="info-units-dah" />
              <div className="info-units-dah" />
              <div className="info-units-dah" />
            </div>
            <div>
              <span>dit/dah gap</span>
              <div />
            </div>
            <div>
              <span>letters gap</span>
              <div />
              <div />
              <div />
            </div>
            <div>
              <span>word gaps</span>
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
          </div>

          <p>
            For example, "A" is written as "dit dah", with 1 unit for the dit, 1
            unit for the gap between the dit and dah, and 3 units for the dah:
          </p>

          <div className="info-text">
            <span>A</span>
            <span>.-</span>

            <button
              className="btn btn--small"
              onClick={() => {
                playMorse(alphaToMorse("A"));
              }}
            >
              Play
            </button>
          </div>

          <div className="info-timing">
            <Dit />
            <CharGap />
            <Dah />
          </div>

          <p>Gaps between each letter are 3 units long:</p>

          <div className="info-text">
            <span>RED</span>
            <span>.-. . -..</span>

            <button
              className="btn btn--small"
              onClick={() => {
                playMorse(alphaToMorse("RED"));
              }}
            >
              Play
            </button>
          </div>

          <div className="info-timing">
            <Dit />
            <CharGap />
            <Dah />
            <CharGap />
            <Dit />

            <LetterGap />

            <Dit />

            <LetterGap />

            <Dah />
            <CharGap />
            <Dit />
            <CharGap />
            <Dit />
          </div>

          <p>Gaps between each word are 7 units long:</p>

          <div className="info-text">
            <span>A DOG</span>
            <span>.- / -.. --- --.</span>

            <button
              className="btn btn--small"
              onClick={() => {
                playMorse(alphaToMorse("A DOG"));
              }}
            >
              Play
            </button>
          </div>

          <div className="info-timing">
            <Dit />
            <CharGap />
            <Dah />

            <WordGap />

            <Dah />
            <CharGap />
            <Dit />
            <CharGap />
            <Dit />

            <LetterGap />

            <Dah />
            <CharGap />
            <Dah />
            <CharGap />
            <Dah />

            <LetterGap />

            <Dah />
            <CharGap />
            <Dah />
            <CharGap />
            <Dit />
          </div>

          <p>
            The Farnsworth method teaches high-speed character recognition by
            sending individual letters at the usual, faster rate, while using
            longer pauses than usual between characters and words, slowing the
            overall speed at which the message is sent, so that it is easier for
            beginners to parse. This is to prevent learners from developing the
            bad habit of counting "dits and dahs", and instead encourages them
            to listen for the overall sound of a character.
          </p>

          <p>
            You can change the Farnsworth speed factor used in this app from the
            settings.
          </p>
        </div>
      </div>
    </Modal>
  );
};
