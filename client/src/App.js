import React, { Component } from "react";
import { Route, Link, BrowserRouter } from "react-router-dom";
import "./App.css";

import Train from "./Train";
import Checkout from "./Checkout";
import Tickets from "./Tickets";
import Purchased from "./Purchased";

class Routes extends Component {
  render() {
    return [
      <nav>
        <Link to="/">Home</Link>&emsp;&emsp;
        <Link to="/Tickets">Tickets</Link>
      </nav>
    ];
  }
}

class App extends Component {
  render() {
    return [
      <BrowserRouter>
        <div className="App">
          <header className="App-header" id='head'>
            <Routes />
          </header>
          <Route path="/" exact component={Train} />
          <Route path="/Checkout" exact component={Checkout} />
          <Route path="/Purchased" exact component={Purchased} />
          <Route path="/Tickets" exact component={Tickets} />
        </div>
      </BrowserRouter>,
      <footer>
      </footer>
    ];
  }
}

export default App;
