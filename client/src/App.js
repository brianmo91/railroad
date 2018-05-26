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
  constructor(props) {
    super(props);
    this.state = {
      isLocked: false
    };
    this.handleUnlock = this.handleUnlock.bind(this);
    this.handleLock = this.handleLock.bind(this);
  }

  componentDidMount() {
    window.addEventListener("beforeunload", e => {
      if (this.state.isLocked) {
        let expire = new Date().getTime();
        fetch("/unlock");
        while (new Date().getTime() - expire < 1500) {}
      }
      e.cancelable = false;
    });
  }

  shouldComponentUpdate() {
    return false;
  }

  handleUnlock() {
    fetch("/unlock");
    this.setState({ isLocked: false });
  }

  handleLock() {
    this.setState({ isLocked: true });
  }

  render() {
    return [
      <BrowserRouter>
        <div className="App">
          <header className="App-header" id="head">
            <Routes />
          </header>
          <Route
            path="/"
            onLock={this.handleLock}
            isLocked={this.state.isLocked}
            exact
            component={props => (
              <Train
                {...props}
                onLock={this.handleLock}
                isLocked={this.state.isLocked}
              />
            )}
          />
          <Route
            path="/Checkout"
            onUnlock={this.handleUnlock}
            exact
            component={props => (
              <Checkout {...props} onUnlock={this.handleUnlock} />
            )}
          />
          <Route path="/Purchased" exact component={Purchased} />
          <Route
            path="/Tickets"
            onUnlock={this.handleUnlock}
            isLocked={this.state.isLocked}
            exact
            component={props => (
              <Tickets
                {...props}
                onUnlock={this.handleUnlock}
                isLocked={this.state.isLocked}
              />
            )}
          />
        </div>
      </BrowserRouter>,
      <footer />
    ];
  }
}

export default App;
