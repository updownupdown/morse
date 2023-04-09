import "./css/styles.scss";
import { Dictionary } from "./components/Dictionary";
import { Telegraph } from "./components/Telegraph";
import { Converter } from "./components/Converter";

function App() {
  return (
    <div className="main">
      <Dictionary />
      <Telegraph />
      <Converter />
    </div>
  );
}

export default App;
