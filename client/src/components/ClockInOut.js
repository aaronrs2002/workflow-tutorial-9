import React, { useEffect, useState } from "react";
import NumberToTime from "./NumberToTime";
import HourlyBarChart from "./HourlyBarChart";
import DateSelector from "./DateSelector";
import StartTimeMenu from "./StartTimeMenu";
import axios from "axios";
import TicketList from "./TicketList";
import timestamp from "./timestamp";

const ClockInOut = (props) => {
    let [loaded, setLoaded] = useState(false);
    let [timeClock, setTimeClock] = useState([]);
    let [clockedIn, setClockedIn] = useState(false);
    let [totalHours, setTotalHours] = useState(0);
    let [employeeHours, setEmployeeHours] = useState([]);
    let [activeTitle, setActiveTitle] = useState("default");

    const getTotal = (data) => {
        let tempTotal = 0;
        for (let i = 0; i < data.length; i++) {
            if (data[i].timeOut !== "noTimeYet") {
                tempTotal = Number(tempTotal) + Number(((((data[i].timeOut - data[i].timeIn) / 1000) / 60) / 60).toFixed(2));
            }
        }
        setTotalHours((totalHours) => tempTotal);
    }

    const filterHours = () => {
        getTotal([]);
        setTimeClock((timeClock) => null);
        let tempData = [];
        let filterVal = document.querySelector("input[name='filter']").value;
        const tempInOrOut = employeeHours;
        for (let i = 0; i < tempInOrOut.length; i++) {
            let dateStr = NumberToTime(tempInOrOut[i].timeIn);
            if (dateStr.indexOf(filterVal) !== -1) {
                tempData.push(tempInOrOut[i]);
            }
        }
        getTotal(tempData);
        setTimeClock((timeClock) => tempData);
    }

    const populateFields = () => {
        getTotal([]);
        setTimeClock((timeClock) => null);
        let whichTicket = document.querySelector("[name='ticketList']").value;
        if (whichTicket === "default") {
            props.setActiveTicket((activeTicket) => null);
            sessionStorage.removeItem("activeTicket");
            return false;
        }
        for (let i = 0; i < props.ticketInfo.length; i++) {
            if (whichTicket === props.ticketInfo[i].uuid) {
                setActiveTitle((activeTitle) => props.ticketInfo[i].ticketId);
                sessionStorage.setItem("activeTitle", props.ticketInfo[i].ticketId);
                props.getMessages(whichTicket);
            }
        }
        props.setActiveTicket((activeTicket) => whichTicket);

        sessionStorage.setItem("uuid", whichTicket);

        axios.get("api/tickets/grab-ticket/" + whichTicket, props.config).then(
            (res) => {

                if (!res.data[0].hours) {
                    props.showAlert("The server responded with: " + JSON.stringify(res), "info");
                    return false;
                } else {


                    let tempHours = [];
                    res.data[0].hours = JSON.parse(res.data[0].hours);
                    for (let i = 0; i < res.data[0].hours.length; i++) {
                        if (res.data[0].hours[i].employee === props.userEmail) {
                            tempHours.push(res.data[0].hours[i]);
                            if (res.data[0].hours[i].timeOut === "noTimeYet") {
                                setClockedIn((clockedIn) => true);
                            }
                        }
                    }

                    setTimeClock((timeClock) => tempHours);
                    getTotal(tempHours);
                    setEmployeeHours((employeeHours) => tempHours);

                    props.getMessages(whichTicket);
                }

            }, (error) => {
                props.showAlert("That didn't work", "danger");
            }
        )
    }

    const inOut = (inOrOut, usingCurrentTime) => {
        setTimeClock((timeClock) => null);
        let tempInOrOut = [];
        let whichTicket = document.querySelector("[name='ticketList']").value;
        if (whichTicket === "default") {
            props.showAlert("Which ticket?", "warning");
            return false;
        }
        if (usingCurrentTime === true) {
            usingCurrentTime = Date.now();
        } else {
            let year = document.querySelector("[name='Timeclock-select-year']").value;
            let month = document.querySelector("[name='Timeclock-select-month']").value;
            let day = document.querySelector("[name='Timeclock-select-day']").value;
            let hour = document.querySelector("[name='startHour']").value;
            let minute = document.querySelector("[name='startMinute']").value;
            let amPm = document.querySelector("[name='startAmPm']").value;
            if (amPm === "PM") {
                hour = (parseInt(hour) + 12);
            }
            if ((year + month + day + hour + minute).indexOf("default") !== -1) {
                props.showAlert("Hold on. This date and time is missing something", "warning");
                return false;
            }
            usingCurrentTime = Date.parse(year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":00");
        }



        if (inOrOut === "in") {

            if (employeeHours !== null) {
                tempInOrOut = [...employeeHours, { employee: props.userEmail, timeIn: usingCurrentTime, timeOut: "noTimeYet" }];

            }
            setClockedIn((clockedIn) => true);
            setTimeClock((timeClock) => tempInOrOut);
        } else {
            getTotal(tempInOrOut);

            tempInOrOut = timeClock;


            if (tempInOrOut[tempInOrOut.length - 1].timeOut === "noTimeYet") {
                setClockedIn((clockedIn) => true);
                tempInOrOut[tempInOrOut.length - 1].timeOut = usingCurrentTime;
            }
            setTimeout(() => {
                getTotal(tempInOrOut);
            }, 1000);
            setClockedIn((clockedIn) => false);
        }

        let putData = {
            ticketId: activeTitle,
            hours: JSON.stringify(tempInOrOut),
            uuid: whichTicket
        }


        /*START CLIENT SIDE PUT ATTENDEE HOURS*/
        axios.put("/api/tickets/add-hours", putData, props.config).then(
            (res) => {
                if (res.data.affectedRows === 0) {
                    props.showAlert("That didn't work: " + res.data.message, "danger");
                } else {
                    props.showAlert("Time added.", "success");
                    populateFields();
                }
            }, (error) => {
                props.showAlert("That didn't work: " + error, "danger");
            }
        );


        setTimeClock((timeClock) => tempInOrOut);
        setEmployeeHours((employeeHours) => tempInOrOut);
    }


    useEffect(() => {
        if (props.ticketInfo === null) {
            props.getTickets(props.userEmail);
        }


        if (loaded === false && props.ticketInfo) {

            setTimeout(() => {
                if (sessionStorage.getItem("uuid")) {
                    document.querySelector("select[name='ticketList'] option[value='" + sessionStorage.getItem("uuid") + "']").selected = true;
                    populateFields();
                }
                let currentTime = timestamp();

                if (document.querySelector("[name='Timeclock-select-year']")) { document.querySelector("[name='Timeclock-select-year']").value = currentTime.substring(0, 4); }
                if (document.querySelector("[name='Timeclock-select-month']")) { document.querySelector("[name='Timeclock-select-month'] option[value='" + currentTime.substring(5, 7) + "']").selected = true; }
                if (document.querySelector("[name='Timeclock-select-day']")) { document.querySelector("[name='Timeclock-select-day'] option[value='" + currentTime.substring(8, 10) + "']").selected = true; }
                if (document.querySelector("[name='startHour']")) { document.querySelector("[name='startHour'] option[value='" + currentTime.substring(14, 16) + "']").selected = true; }
                if (document.querySelector("[name='startMinute']")) { document.querySelector("[name='startMinute'] option[value='" + currentTime.substring(17, 19) + "']").selected = true; }
                if (document.querySelector("[name='startAmPm']")) { document.querySelector("[name='startAmPm'] option[value='" + currentTime.substring(11, 13) + "']").selected = true; }
            }, 1000);
            setLoaded((loaded) => true);
        }
    });



    return (

        <div className={props.activeModule === "calendar" ? "row mt-3" : "row"}>

            <div className="col-md-12 mt-3 noPrint">
                <h3 >Select Ticket</h3>

                <TicketList populateFields={populateFields} ticketInfo={props.ticketInfo} />


            </div>



            <div className="col-md-12">
                <h2>Date/Time Selection</h2> </div>
            <DateSelector menu={"Timeclock"} />
            <StartTimeMenu dateTitle={"Timeclock"} />
            <hr />


            <div className="col-md-12">

                <h2>Clock IN/OUT </h2>
                <div className="btn-group block " role="group">
                    {clockedIn === false ?
                        <button type="button" className="btn btn-success" data-func="clockIn" onClick={() => inOut("in", false)}>Clock In Set Time</button> :
                        <button type="button" className="btn btn-danger" data-func="clockOut" onClick={() => inOut("out", false)} >Clock Out Set Time</button>}
                </div>
            </div>

            <div className="col-md-12  ">


                <input type="text" name="filter" className="form-control" placeholder="Filter hours" onChange={() => filterHours()} />
                <ul className="list-group" id="clockInOutWindow">
                    {(typeof timeClock) === "object" && timeClock !== null ?
                        timeClock.map((tc, i) => {
                            if (tc.timeOut !== "noTimeYet") {
                                return (<li className="list-group-item" key={i}>{NumberToTime(tc.timeIn) + " - " + NumberToTime(tc.timeOut) + " Worked: " + ((((tc.timeOut - tc.timeIn) / 1000) / 60) / 60).toFixed(2) + " Hours"}</li>)
                            } else {
                                return (<li className="list-group-item list-group-item-light" key={i}>{NumberToTime(tc.timeIn) + " - Currently working."}</li>)
                            }
                        })
                        : null}
                </ul>
                <hr />
                <h3 >Total Hours: {totalHours.toFixed(3)}</h3>
            </div>
            {(typeof timeClock) === "object" && timeClock !== null ?
                <div className="col-md-12">
                    <HourlyBarChart email={props.userEmail} employeeHours={timeClock} />
                </div> : <div className="col-md-12"><h2 >{!sessionStorage.getItem("activeTicket") ? "Select a ticket above" : "This ticket has no time posted."}</h2></div>}


        </div>
    )

}

export default ClockInOut;

