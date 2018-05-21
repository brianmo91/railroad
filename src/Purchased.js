import React, { Component } from "react";
import { Link } from "react-router-dom";


class Purchased extends Component {
  render() {
    return (
      <div className='purchased'>
      <h1>Thank You for Your Purchase!</h1>
      <Link to='/Tickets' className='a2'>
        <h2>Click Here to View Your Tickets</h2>
      </Link>
      </div>
    );
  }
}

export default Purchased;
