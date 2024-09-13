import React from "react";
import { AuthContextProvider } from "./context/authContext";
import FlowDecider from "./Components/FlowDecider";
import "./style/style.css";

function App() {
  return (
    <AuthContextProvider>
      <FlowDecider />
    </AuthContextProvider>
  );
}

export default App;
