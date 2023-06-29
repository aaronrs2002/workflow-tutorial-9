import React, { useState, useEffect } from "react";
import axios from "axios";
import timestamp from "./timestamp";
import Validate from "./Validate";
import TicketList from "./TicketList";
import DateSelector from "./DateSelector";



const TicketBuilder = (props) => {
    let [func, setFunc] = useState("add");
    let [loaded, setLoaded] = useState(false);
    let [confirm, setConfirm] = useState("");
    let priorityLevels = ["all", "low", "medium", "high", "critical"];

    /*
                        <option value="default">Select priority level</option>
                        <option value="low">Low priority</option>
                        <option value="medium">Medium priority</option>
                        <option value="high">High priority</option>
                        <option value="critical">Critical priority</option>
    */


    const resetFunction = (whatFunc) => {
        [].forEach.call(document.querySelectorAll("select"), (e) => {
            e.selectedIndex = 0;
        });
        setFunc((func) => whatFunc);
        if (document.querySelector("[name='ticketTitle']") && document.querySelector("[name='ticketInfo']")) {
            document.querySelector("[name='ticketTitle']").value = "";
            document.querySelector("[name='ticketInfo']").value = "";
            document.querySelector("[name='assignedTo']").value = "";
        }
    }


    const populateFields = () => {
        if (func === "add") {
            setFunc("edit");
        }

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

                if (document.querySelector("[name='ticketTitle']")) {
                    document.querySelector("[name='ticketTitle']").value = res.data[0].ticketId.substring(res.data[0].ticketId.lastIndexOf(":") + 1);
                    document.querySelector("[name='ticketInfo']").value = res.data[0].ticketInfo;
                    document.querySelector("[name='priority']").value = res.data[0].priority;
                    document.querySelector("[name='bugNewFeature']").value = res.data[0].bugNewFeature;
                    document.querySelector("[name='assignedTo']").value = res.data[0].assignedTo;


                    document.querySelector("[name='due-select-year']").value = res.data[0].ticketId.substring(res.data[0].ticketId.lastIndexOf("-due-") + 5).substring(0, 4);
                    document.querySelector("[name='due-select-month']").value = res.data[0].ticketId.substring(res.data[0].ticketId.lastIndexOf("-due-") + 5).substring(5, 7);
                    document.querySelector("[name='due-select-day']").value = res.data[0].ticketId.substring(res.data[0].ticketId.lastIndexOf("-due-") + 5).substring(8, 10);

                }


                props.getMessages(whichTicket);

            }, (error) => {
                props.showAlert("That didn't work", "danger");
            }
        )
    }

    const addTicket = () => {
        Validate(["ticketTitle", "ticketInfo", "priority", "bugNewFeature", "assignedTo", "due-select-year", "due-select-month", "due-select-day"]);

        if (document.querySelector(".error")) {
            props.showAlert("You are missing fields information.", "danger");
            return false;
        } else {
            const dueDate = document.querySelector("[name='due-select-year']").value + "-" + document.querySelector("[name='due-select-month']").value + "-" + document.querySelector("[name='due-select-day']").value
            let tkObj = {
                ticketId: timestamp() + "-due-" + dueDate + ":" + props.userEmail + ":" + document.querySelector("[name='ticketTitle']").value,
                ticketInfo: document.querySelector("[name='ticketInfo']").value,
                priority: document.querySelector("[name='priority']").value,
                bugNewFeature: document.querySelector("[name='bugNewFeature']").value,
                assignedTo: document.querySelector("[name='assignedTo']").value

            }
            axios.post("/api/tickets/add-ticket/", tkObj, props.config).then(
                (res) => {

                    if (res.data.affectedRows >= 1) {
                        props.showAlert(document.querySelector("[name='ticketTitle']").value + " added.", "success");
                        props.getTickets(props.userEmail);
                        resetFunction("add");
                    } else {
                        props.showAlert("Something went wrong: " + res.data.message, "danger");
                    }



                }, (error) => {
                    props.showAlert("Something went wrong: " + error, "danger");
                });
        }

    }

    const updateInvoices = (newTicketId, originalTicketId) => {
        let updateObj = {
            ticketId: newTicketId,
            originalId: originalTicketId
        }

        axios.put("/api/invoices/update-invoices-ticketId/", updateObj, props.config).then(
            (res) => {
                if (res.data.affectedRows >= 1) {
                    console.log("Invoices updated: " + JSON.stringify(res.data));

                } else {
                    props.showAlert("Invoice tickedIds did not update.", "danger");
                }

            }, (error) => {

            }
        )

    }

    const editTicket = () => {
        let whichTicket = document.querySelector("[name='ticketList']").value;
        if (whichTicket === "default") {
            props.showAlert("Which ticket?", "warning");
            return false;
        }

        Validate(["ticketTitle", "ticketInfo", "priority", "bugNewFeature", "assignedTo", "due-select-year", "due-select-month", "due-select-day"]);
        if (document.querySelector(".error")) {
            props.showAlert("You are missing fields information.", "danger");
            return false;
        } else {
            const dueDate = document.querySelector("[name='due-select-year']").value + "-" + document.querySelector("[name='due-select-month']").value + "-" + document.querySelector("[name='due-select-day']").value
            let ticketEdit = document.querySelector("[name='ticketList']").value;
            ticketEdit = ticketEdit.substring(0, ticketEdit.indexOf(":") + 3) + "-due-" + dueDate + ":" + props.userEmail + ":" + document.querySelector("[name='ticketTitle']").value

            let tkObj = {
                ticketId: ticketEdit,
                ticketInfo: document.querySelector("[name='ticketInfo']").value,
                priority: document.querySelector("[name='priority']").value,
                bugNewFeature: document.querySelector("[name='bugNewFeature']").value,
                assignedTo: document.querySelector("[name='assignedTo']").value,
                originalTitle: props.activeTicket
            }
            axios.put("/api/tickets/update-ticket/", tkObj, props.config).then(
                (res) => {

                    if (res.data.affectedRows >= 1) {
                        props.showAlert(document.querySelector("[name='ticketTitle']").value + " updated.", "success");
                        sessionStorage.removeItem("activeTicket");
                        props.getTickets(props.userEmail);
                        resetFunction("edit");
                        props.getMessages("reset");


                        updateInvoices(ticketEdit, props.activeTicket);

                    } else {
                        props.showAlert("Something went wrong", "danger");
                    }


                }, (error) => {
                    props.showAlert("Something went wrong: " + error, "danger");
                });
        }


    }


    const deleteTicket = () => {
        let whichTicket = document.querySelector("[name='ticketList']").value;

        if (whichTicket === "default") {
            return false;
        }
        axios.delete("/api/tickets/delete-ticket/" + whichTicket, props.config).then(

            (res) => {
                if (res.data.affectedRows > 0) {
                    sessionStorage.removeItem("activeTicket");
                    props.showAlert("Success in deleting.", "info");
                    props.getTickets(props.userEmail);
                    resetFunction("delete");
                    setConfirm((confirm) => "");

                } else {
                    props.showAlert("That did not work.", "danger");
                }

            }, (error) => {
                props.showAlert("Something didn't work.", "danger");
            }
        )
    }

    const filterTickets = () => {
        let displayLevel = document.querySelector("select[name='priorityFilter']").value;
        if (displayLevel !== "all") {
            [].forEach.call(document.querySelectorAll("select[name='ticketList'] option[data-level]"), (e) => {
                e.classList.add("hide");
            });
            [].forEach.call(document.querySelectorAll("select[name='ticketList'] option[data-level='" + displayLevel + "']"), (e) => {
                e.classList.remove("hide");
            });
        } else {
            [].forEach.call(document.querySelectorAll("select[name='ticketList'] option[data-level]"), (e) => {
                e.classList.remove("hide");
            });
        }
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


    return (<div className="row">
        {props.ticketInfo !== null ?
            <div className="col-md-6">
                <TicketList ticketInfo={props.ticketInfo} populateFields={populateFields} />
            </div> : null
        }
        {props.ticketInfo !== null ?
            <div className="col-md-6">
                <select className="form-control text-capitalize" name="priorityFilter" onChange={() => filterTickets()}>
                    {priorityLevels ? priorityLevels.map((level, i) => {
                        let tempText = level;
                        if (i === 0) {
                            tempText = "All Level Tickets";
                        } else {
                            tempText = tempText + " priority tickets";
                        }
                        return (<option key={i} value={level}>{tempText}</option>)
                    }) : null}
                </select>
            </div> : null
        }
        <div className="col-md-12">
            <div className="btn-group block">
                <button className={func === "add" ? "btn btn-primary active" : "btn btn-primary"} onClick={() => resetFunction("add")}>New Ticket</button>
                <button className={func === "edit" ? "btn btn-primary active" : "btn btn-primary"} onClick={() => resetFunction("edit")}>Edit Ticket</button>
                <button className={func === "delete" ? "btn btn-primary active" : "btn btn-primary"} onClick={() => resetFunction("delete")}>Delete Ticket</button>
            </div>
        </div>


        {func !== "delete" ?
            <React.Fragment>
                <div className="col-md-12"><h5>Due date</h5></div>
                <DateSelector menu={"due"} />
                <div className="col-md-12">
                    <input type="text" className="form-control" name="ticketTitle" placeholder="Ticket title" />
                    <select className="form-control text-capitalize" name="priority">
                        {priorityLevels ? priorityLevels.map((level, i) => {
                            return (<option key={i} value={level}>{level + " priority"}</option>)
                        }) : null}
                    </select>
                    <select className="form-control" name="bugNewFeature">
                        <option value="default">Is this a bug or new feature?</option>
                        <option value="bug">Bug report</option>
                        <option value="newFeature">New feature request</option>
                    </select>

                    <input type="text" className="form-control" name='assignedTo' placeholder="Assigned to:" />
                    <textarea className="form-control" rows="5" name="ticketInfo" placeholder="Ticket info"></textarea>
                    {func === "add" ?
                        <button className="btn btn-primary btn-block" onClick={() => addTicket()}>Add ticket</button>
                        :
                        <button className="btn btn-primary  btn-block" onClick={() => editTicket()}>Edit ticket</button>}
                </div>

            </React.Fragment>
            :




            <div className="col-md-12">


                {confirm === "deleteTicket" ?
                    <div role="alert" className="alert alert-danger">
                        <p>Are you sure you want to delete this ticket?</p>
                        <button className="btn btn-warning" onClick={() => deleteTicket()}>Yes</button>
                        <button className="btn btn-secondary" onClick={() => setConfirm((confirm) => "")}>No</button>
                    </div> :
                    <button className="btn btn-danger btn-block" onClick={() => setConfirm((confirm) => "deleteTicket")}>Delete ticket</button>}
            </div>




        }
    </div>)
}

export default TicketBuilder;
