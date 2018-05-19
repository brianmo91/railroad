import React, { Component } from "react";
import { Route, Link, BrowserRouter } from "react-router-dom";
import "./App.css";

import Train from "./Train";

class Routes extends Component {
  render() {
    return [
      <nav>
        <Link to="/">Home</Link>
        <Link to="/ticket">Ticket</Link>
      </nav>
    ];
  }
}

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <header className="App-header">
            <Routes />
          </header>
          <Route path="/" exact component={Train} />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
