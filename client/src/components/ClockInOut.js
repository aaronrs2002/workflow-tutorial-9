import React, { useEffect, useState } from "react";
import NumberToTime from "./NumberToTime";
import HourlyBarChart from "./HourlyBarChart";
import DateSelector from "./DateSelector";
import StartTimeMenu from "./StartTimeMenu";
import axios from "axios";
import TicketList from "./TicketList";


const ClockInOut = (props) => {
    let [time, setTime] = useState("");
    let second = 0;
    let minute = 0;
    let hour = 0;
    let [runTimer, setRunTimer] = useState(true);
    let [loaded, setLoaded] = useState(false);
    let [timeClock, setTimeClock] = useState([]);
    let [clockedIn, setClockedIn] = useState(false);
    let [totalHours, setTotalHours] = useState(0);
    let [employeeHours, setEmployeeHours] = useState([]);

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

    const inOut = (inOrOut, usingCurrentTime) => {
        //data-func="clockOut"
        /* if (inOrOut === "in") {
             document.querySelector("button[data-func='clockOut']").setAttribute("disabled", "false");
 
         } else {
             document.querySelector("button[data-func='clockOut']").setAttribute("disabled", "disabled");
         }*/
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
            console.log("JSON.stringify(tempInOrOut): " + JSON.stringify(tempInOrOut));

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
            ticketId: whichTicket,
            hours: JSON.stringify(tempInOrOut)
        }


        /*START CLIENT SIDE PUT ATTENDEE HOURS*/
        axios.put("/api/tickets/add-hours", putData, props.config).then(
            (res) => {
                if (res.data.affectedRows === 0) {
                    props.showAlert("That didn't work: " + res.data.message, "danger");
                } else {
                    props.showAlert("Time added.", "success");
                }
            }, (error) => {
                props.showAlert("That didn't work: " + error, "danger");
            }
        );


        setTimeClock((timeClock) => tempInOrOut);
        setEmployeeHours((employeeHours) => tempInOrOut);
    }



    const addSecond = () => {

        if (runTimer !== false) {

            let tempSecond = Number(second);
            let tempMinute = Number(minute);
            let tempHour = Number(hour);
            tempSecond = second + 1;
            second = Number(second) + 1;
            if (tempSecond >= 60) {
                tempMinute = (Number(tempMinute) + 1);
                minute = tempMinute;
                tempSecond = 0;
                second = 0;
            }
            if (tempMinute >= 60) {
                tempHour = (Number(tempHour) + 1);
                hour = tempHour;
                tempMinute = 0;
                minute = 0;
            }
            if (tempSecond < 10) {
                tempSecond = "0" + tempSecond;
            }
            if (tempMinute < 10) {
                tempMinute = "0" + tempMinute;
            }
            if (tempHour < 10) {
                tempHour = "0" + tempHour;
            }
            setTime((time) => tempHour + ":" + tempMinute + ":" + tempSecond); return false;
        } else {
            clearInterval(addSecond);
            return false;
        }


    }



    const startTimer = (trueFalse) => {
        if (runTimer !== false) {
            setRunTimer((runTimer) => true);
            setInterval(addSecond, 1000)
        } else {
            setTime((time) => "");
            setRunTimer((runTimer) => false);
            clearInterval(addSecond);
            console.log("TRIED TO STOP!");

            return false;
        }


    }



    /* useEffect(() => {
         if (loaded === false && (typeof employeeHours) === "object" && employeeHours.length > 0) {
 
             for (let i = 0; i < employeeHours.length; i++) {
                 employeeHours[i].timeIn = parseInt(employeeHours[i].timeIn);
 
                 if ((typeof employeeHours[i].timeOut) === "number") {
                     employeeHours[i].timeOut = parseInt(employeeHours[i].timeOut);
                 }
 
             }
 
             let tempData = [];
 
 
             for (let i = 0; i < employeeHours.length; i++) {
                 if (employeeHours[i] && employeeHours[i].timeOut !== "noTimeYet") {
                     tempData.push(employeeHours[i]);
                 } else {
                     console.log("JSON.stringify(employeeHours[i]): " + JSON.stringify(employeeHours[i]));
 
                 }
 
             }
 
             getTotal(tempData);
 
             setTimeClock((timeClock) => tempData);
             //  console.log(tempData[tempData.length - 1].timeOut);
             if ((typeof tempData[tempData.length - 1].timeOut) !== "number" || tempData[tempData.length - 1].timeOut === null || tempData[tempData.length - 1].timeOut === "noTimeYet") {
                 console.log("should eb logged in with red button showing to log out")
                 setClockedIn((clockedIn) => true)
             } else {
                 console.log("should BE LOGGED OU WITH GREEEN BUTTON " + JSON.stringify(tempData));
             }
 
 
 
             setLoaded((loaded) => true);
         }
     });*/

    //[{"timeIn":1648241326300,"timeOut":1648241591265}]


    // console.log("(typeof timeClock): " + (typeof timeClock));
    // console.log("JSON.stringify(timeClock): " + JSON.stringify(timeClock));
    const populateFields = () => {

        let whichTicket = document.querySelector("[name='ticketList']").value;
        if (whichTicket === "default") {
            props.setActiveTicket((activeTicket) => null);
            sessionStorage.removeItem("activeTicket");
            return false;
        }
        props.setActiveTicket((activeTicket) => whichTicket);
        sessionStorage.setItem("activeTicket", whichTicket);

        axios.get("api/tickets/grab-ticket/" + whichTicket, props.config).then(
            (res) => {
                let tempHours = [];

                console.log("JSON.stringify(res.data[0].hours): " + JSON.stringify(res.data[0].hours));
                console.log("(typeof res.data[0].hours): " + (typeof res.data[0].hours));
                res.data[0].hours = JSON.parse(res.data[0].hours);

                for (let i = 0; i < res.data[0].hours.length; i++) {
                    console.log("res.data[0].hours[i].employee: " + res.data[0].hours[i].employee + " - props.userEmail: " + props.userEmail);
                    if (res.data[0].hours[i].employee === props.userEmail)
                        tempHours.push({ timeIn: res.data[0].hours[i].timeIn, timeOut: res.data[0].hours[i].timeOut })
                }
                setTimeClock((timeClock) => tempHours);
                getTotal(tempHours);
                setEmployeeHours((employeeHours) => tempHours);

                props.getMessages(whichTicket);

            }, (error) => {
                props.showAlert("That didn't work", "danger");
            }
        )
    }

    useEffect(() => {
        if (loaded === false) {
            if (props.ticketInfo === null) {
                props.getTickets(props.userEmail);
            }
            setTimeout(() => {
                if (sessionStorage.getItem("activeTicket")) {
                    document.querySelector("select[name='ticketList'] option[value='" + sessionStorage.getItem("activeTicket") + "']").selected = true;
                    populateFields();
                }
            }, 500);
            setLoaded((loaded) => true);
        }
    }, []);

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

                <div className="list-group  hide">
                    <h2>Clock IN/OUT </h2>
                    {clockedIn === false ?
                        <button type="button" className="list-group-item list-group-item-success" onClick={() => inOut("in", true)}>Clock In</button> :
                        <button type="button" className="list-group-item list-group-item-danger" onClick={() => inOut("out", true)}>Clock Out</button>}
                </div>
                <input type="text" name="filter" className="form-control" placeholder="Filter hours" onChange={() => filterHours()} />
                <ul className="list-group" id="clockInOutWindow">
                    {(typeof timeClock) === "object" && timeClock.length > 0 ?
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
            {(typeof timeClock) === "object" && timeClock.length > 0 ?
                <div className="col-md-12">
                    <HourlyBarChart email={props.userEmail} employeeHours={timeClock} />
                </div> : <div className="col-md-12"><h2 >{!sessionStorage.getItem("activeTicket") ? "Select a ticket above" : "This ticket has no time posted."}</h2></div>}

            <div className="col-md-12 hide">
                <h2>Clock Timer </h2>
                <div className="list-group">
                    {time.length === 0 ? <button className="list-group-item list-group-item-success" onClick={() => startTimer(true)}>Start Timer</button> :
                        <button className="list-group-item list-group-item-danger" onClick={() => startTimer(false)}>Stop Timer</button>
                    }
                </div><h2>Time:{time}</h2>
                {time.length !== "" ? <button className="btn btn-block" onClick={() => startTimer(false)}>Reset Timer</button> : null}
            </div>
        </div>
    )

}

export default ClockInOut;


/*
{"attendeeId":"2023-03-29:aaron@web-presence.biz:smith-wedding:georgia@flores.net",
"hours":"[{\"timeIn\":1677855600000,\"timeOut\":1677888000000},
    {\"timeIn\":1677943800000,\"timeOut\":1677976200000},{\"timeIn\":1677762000000,\"timeOut\":1677794400000},
    {\"timeIn\":1677686400000,\"timeOut\":1677723300000},{\"timeIn\":1678028400000,\"timeOut\":\"noTimeYet\"}]"}

[{"attendeeId":"2023-03-29:aaron@web-presence.biz:smith-wedding:aaron@web-presence.biz","fname":"Aaron","lname":"Smith","phone":"222.333.4444","email":"aaron@web-presence.biz","guest":"true","roleInEvent":"Groom","profileImg":"img/aaronSmithThumb.jpg","sections":"%5B%5D","hours":"%5B%7B%22timeIn%22:1680220800000,%22timeOut%22:1680239700000%7D%5D"}]

%5B%7B%22timeIn%22:1680220800000,%22timeOut%22:1680239700000%7D,%7B%22timeIn%22:1680312600000,%22timeOut%22:%22noTimeYet%22%7D%5D

*/