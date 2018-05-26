import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";
import moment from "moment";

class TicketInfo extends Component {
  render() {
    let t = this.props.ticket;
    let date = moment(t.date).format('M/D/YYYY');
    let fare = Number(t.fare);
    let addpet = (this.props.pet==1?25:0);
    let disct = this.props.discount.pct;
    let totalfare = (fare+addpet)*disct;
    return (
      <div>
        <form onSubmit={this.props.onSubmit}>
          <table border='0' className='tabletl'>
            <tr>
              <td colspan='2' className='tdc'>Ticket Information</td>
            </tr>
            <tr>
              <td className="l t">
                <label>
                  Discount:<br />
                  <select style={{ width: "200px" }} name="Discount" value={JSON.stringify(this.props.discount)} onChange={this.props.onD}>
                    <option value={JSON.stringify({pct: 1.0, type: null})} label="--None--" />
                    <option value={JSON.stringify({pct: 0.9, type: "Military (10%)"})} label="Military (10%)" />
                    <option value={JSON.stringify({pct: 0.9, type: "Senior, Age: 65+ (10%)"})} label="Senior, Age: 65+ (10%)" />
                    <option value={JSON.stringify({pct: 0.9, type: "Handicapped (10%)"})} label="Handicapped (10%)" />
                    <option value={JSON.stringify({pct: 0.5, type: "Child, Age: 2-12 (50%)"})} label="Child, Age: 2-12 (50%)" />
                  </select>
                </label>
              </td>
              <td className="t">
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
              <td colspan='2' className="l t ti">
                <hr/>
              </td>
            </tr>
            <tr>
              <td colspan='2' className="l t ti">
                <b>From:</b> {t.start_name} &emsp;<b>To:</b> {t.end_name}
              </td>
            </tr>
            <tr>
              <td colspan="2" className="l t"><b>Train No. {t.train_id}</b></td>
            </tr>
            <tr>
              <td className="l t">
                <b>Departure:</b> <span style={{textAlign:'right'}}>{moment(t.start_time, "HH:mm:ss").format("h:mm a")}</span>
              </td>
              <td className="t"><b>Date:</b> {date}</td>
            </tr>
            <tr>
              <td className="l t b">
                <b>Arrival:</b> {moment(t.end_time, "HH:mm:ss").format("h:mm a")}
              </td>
              <td className="t b"><b>Fare:</b> <span className='fare'>${totalfare.toFixed(2)}</span></td>
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
          <table border='0' className='tabletl'>
            <tr>
              <td colspan='2' className='tdc'>Payment Information</td>
            </tr>
            <tr>
              <td width='290' className="l t"><label>First Name<br/>
                <input type="text" name='f_name' size='35' maxlength='20' value={p.f_name} onChange={(e)=>this.props.onP(e)} required/>
              </label></td>
              <td className="t"><label>Last Name<br/>
                <input type="text" name='l_name' size='35' maxlength='20' value={p.l_name} onChange={(e)=>this.props.onP(e)} required/>
              </label></td>
            </tr>
            <tr>
              <td colspan='2' className="l t"><label>Address<br/>
                <input type="text" name='address' size='50' maxlength='50' value={p.address} onChange={(e)=>this.props.onP(e)} required/>
              </label></td>
            </tr>
            <tr>
              <td colspan='2' className="l t"><label>E-mail<br/>
                <input type="email" name='email' size='35' maxlength='50' value={p.email} onChange={(e)=>this.props.onP(e)} required/>
              </label></td>
            </tr>
            <tr>
              <td style={{paddingTop:'40px'}} className="l t"><label>Card Number<br/>
                <input type="text" name='creditNum' size='26' maxlength='16' />
              </label></td>
              <td style={{paddingTop:'40px'}} className="t"><label>Exp Date(mm/yy)<br/>
                <input type="text" name='expiration' size='17' maxlength='5' />
              </label></td>
            </tr>
            <tr>
              <td colspan='2' className="l t"><label>CCV<br/>
                <input type="text" name='ccv' size='3' maxlength='3' />
              </label></td>
            </tr>
            <tr>
              <td colspan='2' className="r">
                <hr/>
                <input name='submit' className="cancelbutton" type="submit" value='Purchase Ticket' disabled={this.props.disable}/>
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
      isPurDisabled: false,
      toPurchased: false,
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
    this.setState({ isPurDisabled: true });
    let fare = Number(this.state.Ticket.fare);
    let addpet = (this.state.Pet==1?25:0);
    let disct = this.state.Discount.pct;
    let totalfare = (fare+addpet)*disct;
    axios
      .post("/purchaseTicket", {
        f_name: this.state.PayInfo.f_name,
        l_name: this.state.PayInfo.l_name,
        address: this.state.PayInfo.address,
        email: this.state.PayInfo.email,
        fare: totalfare,
        discounttype: this.state.Discount.type,
        pet: this.state.Pet
      })
      .then(info => {
        this.setState({ toPurchased: true });
        this.props.onUnlock();
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
    if (this.state.toPurchased === true) {
      document.getElementById('head').scrollIntoView();
      return <Redirect to="/Purchased" />;
    }
    return (
      <div className='container'>
        <TicketInfo discount={this.state.Discount} pet={this.state.Pet} ticket={this.state.Ticket} onT={this.handleTicketChange} onD={this.handleDiscountChange}/>
        <PaymentInfo payinfo={this.state.PayInfo} onP={this.handlePayChange} onSubmit={this.handleSubmit} disable={this.state.isPurDisabled}/>
      </div>
    );
  }
}

export default Checkout;
