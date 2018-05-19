import React, { Component } from "react";
import { Link } from "react-router-dom";
import DatePicker from "react-date-picker";
import moment from "moment";
import axios from "axios";

class TrainSelection extends Component {
  render() {
    let timeobj = [
      { sel: "Morning (6AM-12PM)", name: "MOR" },
      { sel: "Afternoon (12PM-6PM)", name: "AFT" },
      { sel: "Evening (6PM-12AM)", name: "EVE" },
      { sel: "Midnight (12AM-6PM)", name: "NIT" }
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
              <input type="submit" value="Find Train" />
            </td>
          </tr>
        </table>
      </form>
    );
  }
}

class TrainList extends Component {}

class Train extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
    axios
      .post("/getTrains", {
        date: this.state.date,
        day: this.state.day,
        stationfrom: this.state.stationfrom,
        stationto: this.state.stationto,
        time: this.state.time
      })
      .then(info => {
        this.setState({ AvailTrains: info });
        console.log(JSON.stringify(this.state.AvailTrains));
      })
      .catch(err => console.log(err));
  }

  render() {
    return (
      <div>
        <TrainSelection
          stations={this.state.Stations}
          date={this.state.date}
          stationfrom={this.state.stationfrom}
          stationto={this.state.stationto}
          time={this.state.time}
          handleDateChange={this.handleDateChange}
          handleInputChange={this.handleInputChange}
          handleSubmit={this.handleSubmit}
        />
      </div>
    );
  }
}

export default Train;
