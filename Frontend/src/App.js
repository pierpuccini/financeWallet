/* React Imports */
import React, { Fragment } from "react";
/* Bootstrap */
import Navbar from "react-bootstrap/Navbar";

import Message from "./Containers/MessageController";
function App() {
  return (
    <Fragment>
      <Navbar expand="xl" bg="primary" variant="dark">
        <Navbar.Brand href="#">ToolBox Test</Navbar.Brand>
      </Navbar>
      <Message />
    </Fragment>
  );
}

export default App;
