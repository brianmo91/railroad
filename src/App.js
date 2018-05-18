import React, { Component } from "react";
import { Route, Link, BrowserRouter } from "react-router-dom";
import "./App.css";
import logo from "./logo.svg";

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
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
            <Routes />
          </header>
          <Route path="/" exact component={Train} />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
