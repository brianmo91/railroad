import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import DatePicker from "react-date-picker";
import moment from "moment";
import axios from "axios";

class TrainSelection extends Component {
  render() {
    let timeobj = [
      { sel: "Morning (6AM-12PM)", name: "MOR" },
      { sel: "Afternoon (12PM-6PM)", name: "AFT" },
      { sel: "Evening (6PM-12AM)", name: "EVE" },
      { sel: "Midnight (12AM-6AM)", name: "NIT" }
    ];
    let times = timeobj.map(time => (
      <option value={time.name}>{time.sel}</option>
    ));
    let stations = this.props.stations.map(station => (
      <option value={station.station_code}>{station.station_name}</option>
    ));

    return (
      <form onSubmit={this.props.handleSubmit}>
        <table border="0" className="tablets">
          <tr>
            <td>
              <label>
                Station From:<br />
                <select
                  style={{ width: "200px" }}
                  name="stationfrom"
                  value={this.props.stationfrom}
                  onChange={this.props.handleInputChange}
                  required
                >
                  <option label="--Select Station--" />
                  {stations}
                </select>
              </label>
            </td>
            <td>
              <label>
                Station To:<br />
                <select
                  style={{ width: "200px" }}
                  name="stationto"
                  value={this.props.stationto}
                  onChange={this.props.handleInputChange}
                  required
                >
                  <option label="--Select Station--" />
                  {stations}
                </select>
              </label>
            </td>
            <td>
              <label>
                Date:<br />
                <DatePicker
                  name="date"
                  required="true"
                  minDate={new Date()}
                  maxDate={new Date("2018-10-24")}
                  onChange={this.props.handleDateChange}
                  value={this.props.date}
                />
              </label>
            </td>
            <td>
              <label>
                Time:<br />
                <select
                  name="time"
                  value={this.props.time}
                  onChange={this.props.handleInputChange}
                >
                  {times}
                </select>
              </label>
            </td>
            <td>
              <br />
              <input
                type="submit"
                value="Find Train"
                disabled={this.props.disabled}
              />
            </td>
          </tr>
        </table>
      </form>
    );
  }
}

class TrainList extends Component {
  render() {
    let traininfo = null;
    if (this.props.trains) {
      if (this.props.trains[0] === 'timedout')
        traininfo = (
          <table border="0" className="tabletl">
            <tr>
              <td className='tdc'>System Locked</td>
            </tr>
            <tr>
              <td className='t l b' align='center'>
                <h2>Sorry, The Reservation System is Currently In Use.<br/>
                Please Try Again Later.</h2>
              </td>
            </tr>
          </table>
        );
      else
        traininfo = this.props.trains.map(train => (
          <table border="0" className="tabletl">
            <tr>
              <td colspan="3" className='tdc'>Train No. {train.train_id}</td>
            </tr>
            <tr>
              <td className='t l' width="320px">
                <b>Departure: </b>{moment(train.start_time, "HH:mm:ss").format("h:mm a")}
              </td>
              <td className='t'>
                <b>Arrival: </b>{moment(train.end_time, "HH:mm:ss").format("h:mm a")}
              </td>
              <td className='t lcol'><b>Fare: </b>${train.fare}</td>
            </tr>
            <tr>
              <td colspan='3' className='r'>
                <hr/>
                <form onSubmit={this.props.handleSelect}>
                  <input type="hidden" name="train_id" value={train.train_id} />
                  <input
                    type="submit"
                    className="selbutton"
                    disabled={this.props.disabled}
                    value="Select"
                  />
                </form>
              </td>
            </tr>
          </table>
        )
      );
    }

    return <div>{traininfo}</div>;
  }
}

class Train extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toCheckout: false,
      isDisabled: false,
      isLocked: false,
      Stations: [],
      AvailTrains: [],
      date: new Date(),
      day: moment().day(),
      stationfrom: "",
      stationto: "",
      time: "MOR"
    };
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount() {
    fetch("/stations")
      .then(res => res.json())
      .then(info => this.setState({ Stations: info }));
  }

  handleDateChange(dat) {
    this.setState({
      date: dat,
      day: moment(dat).day()
    });
  }

  handleInputChange(event) {
    const t = event.target;
    const value = t.value;
    const name = t.name;
    this.setState({ [name]: value });
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.state.stationfrom === this.state.stationto)
      return alert("Stations cannot be identical");
    this.setState({ isDisabled: true });

    let url = (this.state.isLocked ? "/getTrains2" : "/getTrains")
    axios
      .post(url, {
        date: this.state.date,
        day: this.state.day,
        stationfrom: this.state.stationfrom,
        stationto: this.state.stationto,
        time: this.state.time
      })
      .then(info => {
        this.setState({ AvailTrains: info.data });
        this.setState({ isDisabled: false });
        if (info.data[0] != 'timedout'){
          this.setState({ isLocked: true });
          this.props.onLock();
        }
      })
      .catch(err => console.log(err));
  }

  handleSelect(event) {
    event.preventDefault();
    this.setState({ isDisabled: true });
    console.log("SELECTION: " + event.target[0].value);
    axios
      .post("/selectTrain", {
        train_id: event.target[0].value
      })
      .then(info => {
        this.setState({ toCheckout: true });
      })
      .catch(err => console.log(err));
  }

  render() {
    if (this.state.toCheckout === true) {
      document.getElementById('head').scrollIntoView();
      return <Redirect to="/Checkout" />;
    }

    return (
      <div className='container'>

        <TrainSelection
          disabled={this.state.isDisabled}
          stations={this.state.Stations}
          date={this.state.date}
          stationfrom={this.state.stationfrom}
          stationto={this.state.stationto}
          time={this.state.time}
          handleDateChange={this.handleDateChange}
          handleInputChange={this.handleInputChange}
          handleSubmit={this.handleSubmit}
        />
        <TrainList
          disabled={this.state.isDisabled}
          trains={this.state.AvailTrains}
          handleSelect={this.handleSelect}
        />
      </div>
    );
  }
}

export default Train;
