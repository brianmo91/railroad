import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'

class TicketFinder extends Component {
  render() {
    return (
      <div>
        <form onSubmit={this.props.onSubmit}>
          <table border="0" className="tableticket">
            <tr>
              <td>
                Enter E-mail Address: <br />
                <input
                  type="email"
                  name="email"
                  size="35"
                  maxlength="50"
                  value={this.props.email}
                  onChange={this.props.onEmail}
                  required
                />
                &emsp;
                <input
                  type="submit"
                  value="View Tickets"
                  disabled={this.props.disabled}
                />
              </td>
            </tr>
          </table>
        </form>
      </div>
    );
  }
}

class TicketList extends Component {
  render() {
    let tickets = null;
    if (this.props.tickets) {
      tickets = this.props.tickets.map(t => (
        <table border="0" className="tabletl">
          <tr>
            <td colspan="2" className="tdc">
              Ticket No. {t.trip_id}
            </td>
          </tr>
          <tr>
            <td colspan="2" className="l t">
              <b>Passenger: </b>
              {t.f_name} {t.l_name}
            </td>
          </tr>
          <tr>
            <td className="l t">
              <b>From:</b> {t.start_name}
            </td>
            <td className="t">
              <b>To:</b> {t.end_name}
            </td>
          </tr>
          <tr>
            <td colspan="2" className="l t">
              <b>Train No. {t.train_id}</b>
            </td>
          </tr>
          <tr>
            <td width="300px" className="l t">
              <b>Departure:</b>{" "}
              <span style={{ textAlign: "right" }}>
                {moment(t.start_time, "HH:mm:ss").format("h:mm a")}
              </span>
            </td>
            <td className="t">
              <b>Date:</b> {moment(t.date).format("M/D/YYYY")}
            </td>
          </tr>
          <tr>
            <td className="l t">
              <b>Arrival:</b> {moment(t.end_time, "HH:mm:ss").format("h:mm a")}
            </td>
            <td className="t">
              <b>Fare:</b> ${t.fare}
            </td>
          </tr>
          <tr>
            <td className="l t" />
            <td className="t">
              {t.pet == 1 ? (
                <span>
                  <b>Additional: </b>Pet (+$25.00)<br />
                </span>
              ) : null}
              {t.discounttype !== "null" ? (
                <span>
                  <b>Discount: </b> {t.discounttype}
                </span>
              ) : null}
            </td>
          </tr>
          <tr>
            <td colspan="2" className="r">
              <hr />
              <form onSubmit={this.props.onCancel}>
                <input
                  type="hidden"
                  name='trip_id'
                  value={t.trip_id}
                />
                <input
                  type="submit"
                  className="cancelbutton"
                  disabled={this.props.disabled}
                  value="Cancel Ticket"
                />
              </form>
            </td>
          </tr>
        </table>
      ));
    }
    return <div>{tickets}</div>;
  }
}

class Tickets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDisabled: false,
      Tickets: [],
      email: ""
    };

    this.handleEmail = this.handleEmail.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleCancel2 = this.handleCancel2.bind(this);
  }

  handleEmail(e) {
    this.setState({ email: e.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ isDisabled: true });
    axios
      .post("/viewTickets", {
        email: this.state.email
      })
      .then(info => {
        this.setState({
          Tickets: info.data,
          isDisabled: false
        });
      })
      .catch(err => console.log(err));
  }

  handleCancel(event) {
    event.preventDefault();
    this.setState({ isDisabled: true });
    let e = event.target[0].value;
    confirmAlert({
      title: 'Cancel Ticket',
      message: 'Are you sure?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => this.handleCancel2(e, event)
        },
        {
          label: 'No',
          onClick: () => this.setState({ isDisabled: false })
        }
      ]
    })
  }

  handleCancel2(e, event) {
    axios
      .post("/cancelTicket", {
        trip_id: e,
      })
      .then(() => {
        this.handleSubmit(event);
      })
      .catch(err => console.log(err));
  }

  render() {
    return (
      <div className="container">
        <TicketFinder
          email={this.state.email}
          onEmail={this.handleEmail}
          onSubmit={this.handleSubmit}
          disabled={this.state.isDisabled}
        />
        <TicketList
          tickets={this.state.Tickets}
          onCancel={this.handleCancel}
          disabled={this.state.isDisabled}
        />
      </div>
    );
  }
}

export default Tickets;
