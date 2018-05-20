import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import moment from "moment";

class TicketInfo extends Component {
  render() {
    let t = this.props.ticket;
    let date = moment(t.date).format('M/D/YYYY');
    return (
      <div>
        <form onSubmit={this.props.onSubmit}>
          <table border='1' className='tabletl'>
            <tr>
              <td colspan='2'>Ticket Information</td>
            </tr>
            <tr>
              <td>
                <label>
                  Discount:<br />
                  <select style={{ width: "200px" }} name="Discount" value={JSON.stringify(this.props.discount)} onChange={this.props.onD}>
                    <option value={JSON.stringify({pct: 1.0, type: null})} label="--None--" />
                    <option value={JSON.stringify({pct: 0.8, type: "Military (20%)"})} label="Military (20%)" />
                    <option value={JSON.stringify({pct: 0.8, type: "Senior (20%)"})} label="Senior (20%)" />
                    <option value={JSON.stringify({pct: 0.8, type: "Handicapped (20%)"})} label="Handicapped (20%)" />
                    <option value={JSON.stringify({pct: 0.8, type: "Child (20%)"})} label="Child (20%)" />
                  </select>
                </label>
              </td>
              <td>
                <label>
                  Pet:<br />
                  <select style={{ width: "200px" }} name="Pet" value={this.props.pet} onChange={this.props.onT}>
                    <option value='0' label="--None--" />
                    <option value='1' label="Pet (+$25.00)" />
                  </select>
                </label>
              </td>
            </tr>
            <tr>
              <td colspan='2'>
                <hr/>
                <b>From:</b> {t.start_name} &emsp;<b>To:</b> {t.end_name}
              </td>
            </tr>
            <tr>
              <td colspan="2"><b>Train No. {t.train_id}</b></td>
            </tr>
            <tr>
              <td>
                <b>Departure:</b> <span style={{textAlign:'right'}}>{moment(t.start_time, "HH:mm:ss").format("h:mm a")}</span>
              </td>
              <td><b>Date:</b> {date}</td>
            </tr>
            <tr>
              <td>
                <b>Arrival:</b> {moment(t.end_time, "HH:mm:ss").format("h:mm a")}
              </td>
              <td><b>Fare:</b> ${t.fare}</td>
            </tr>
          </table>
        </form>
      </div>
    );
  }
}

class PaymentInfo extends Component {
  render() {
    let p = this.props.payinfo;
    return (
      <div>
        <form onSubmit={this.props.onSubmit}>
          <table border='1' className='tabletl'>
            <tr>
              <td colspan='2'>Payment Information</td>
            </tr>
            <tr>
              <td width='215'><label>First Name<br/>
                <input type="text" name='f_name' size='26' value={p.f_name} onChange={(e)=>this.props.onP(e)} required/>
              </label></td>
              <td><label>Last Name<br/>
                <input type="text" name='l_name' size='26' value={p.l_name} onChange={(e)=>this.props.onP(e)} required/>
              </label></td>
            </tr>
            <tr>
              <td colspan='2'><label>Address<br/>
                <input type="text" name='address' size='60' value={p.address} onChange={(e)=>this.props.onP(e)} required/>
              </label></td>
            </tr>
            <tr>
              <td colspan='2'><label>E-mail<br/>
                <input type="text" name='email' size='35' maxlength='15' value={p.email} onChange={(e)=>this.props.onP(e)} required/>
              </label></td>
            </tr>
            <tr>
              <td style={{paddingTop:'40px'}}><label>Card Number<br/>
                <input type="text" name='creditNum' size='26' maxlength='16' />
              </label></td>
              <td style={{paddingTop:'40px'}}><label>Exp Date(mm/yy)<br/>
                <input type="text" name='expiration' size='17' maxlength='5' />
              </label></td>
            </tr>
            <tr>
              <td><label>CCV<br/>
                <input type="text" name='ccv' size='3' maxlength='3' />
              </label></td>
            </tr>
            <tr>
              <td colspan='2' valign='bottom' align='right' height='30px'>
                <input name='submit' type="submit" value='Purchase Ticket'/>
              </td>
            </tr>
          </table>
        </form>
      </div>
    );
  }
}

class Checkout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toReceipt: false,
      Ticket: {},
      Pet: 0,
      Discount: {pct: 1.0, type: null},
      PayInfo: {
        f_name: '',
        l_name: '',
        address: '',
        email: ''
      }
    };

    this.handlePayChange = this.handlePayChange.bind(this);
    this.handleTicketChange = this.handleTicketChange.bind(this);
    this.handleDiscountChange = this.handleDiscountChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount(){
    fetch("/getCheckout")
      .then(res => res.json())
      .then(info => this.setState({ Ticket: info }));
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ isSelDisabled: true });
    console.log("SELECTION: " + event.target[0].value);
    axios
      .post("/purchaseTicket", {
        train_id: event.target[0].value
      })
      .then(info => {
        this.setState({ toReceipt: true });
      })
      .catch(err => console.log(err));
  }

  handlePayChange(event){
    const t = event.target;
    const value = t.value;
    const name = t.name;
    var newstate = this.state.PayInfo;
    newstate[name] = value;
    this.setState(newstate);
  }

  handleTicketChange(event){
    const t = event.target;
    const value = t.value;
    const name = t.name;
    this.setState({ [name]: value });
  }

  handleDiscountChange(event){
    const t = event.target;
    const value = JSON.parse(t.value);
    const name = t.name;
    this.setState({ [name]: value });
  }

  render() {
    return (
      <div>
        <TicketInfo discount={this.state.Discount} pet={this.state.Pet} ticket={this.state.Ticket} onT={this.handleTicketChange} onD={this.handleDiscountChange}/>
        <PaymentInfo payinfo={this.state.PayInfo} onP={this.handlePayChange} onSubmit={this.handleSubmit}/>
      </div>
    );
  }
}

export default Checkout;
