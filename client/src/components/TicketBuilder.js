import React, { useState, useEffect } from "react";
import axios from "axios";
import timestamp from "./timestamp";
import Validate from "./Validate";
import TicketList from "./TicketList";
import DateSelector from "./DateSelector";
import randomizeX from "./uuid";



const TicketBuilder = (props) => {
    let [func, setFunc] = useState("add");
    let [loaded, setLoaded] = useState(false);
    let [confirm, setConfirm] = useState("");
    let priorityLevels = ["all", "low", "medium", "high", "critical"];
    let [uuid, setUuid] = useState();
    let [activeTitle, setActiveTitle] = useState("default");

    const resetFunction = (whatFunc) => {
        sessionStorage.removeItem("activeTitle");
        sessionStorage.removeItem("uuid");
        props.setActiveTicket((activeTicket) => null);
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
            resetFunction("add");

            return false;
        }
        for (let i = 0; i < props.ticketInfo.length; i++) {
            try {
                if (whichTicket === props.ticketInfo[i].uuid) {
                    setUuid((uuid) => whichTicket);
                    props.setActiveTicket((activeTicket) => whichTicket);
                    sessionStorage.setItem("uuid", whichTicket);
                    setActiveTitle((activeTitle => props.ticketInfo[i].ticketId));
                    sessionStorage.setItem("activeTitle", props.ticketInfo[i].ticketId);
                    props.getMessages(whichTicket);
                }
            } catch (error) {
                console.log("I don't loke this one: " + error);

            }
        }


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

    const buildWorkFlow = (ticket, id) => {
        axios.post("/api/workflow/add-workflow/", { ticketId: ticket, stepsData: "[]", uuid: id }, props.config).then(
            (res) => {
                if (res.data.affectedRows === 0) {
                    console.log("Workflow Not created.")

                } else {
                    console.log("Workflow  created.")
                }
            }, (error) => {
                props.showAlert("Workflow was not created: " + error, "danger");
            }
        );
    }

    const addTicket = () => {
        const dueDate = document.querySelector("[name='due-select-year']").value + "-" + document.querySelector("[name='due-select-month']").value + "-" + document.querySelector("[name='due-select-day']").value
        let tempUUID = randomizeX();
        let tempTicketID = timestamp() + "-due-" + dueDate + ":" + props.userEmail + ":" + document.querySelector("[name='ticketTitle']").value;
        Validate(["ticketTitle", "ticketInfo", "priority", "bugNewFeature", "assignedTo", "due-select-year", "due-select-month", "due-select-day"]);

        if (document.querySelector(".error")) {
            props.showAlert("You are missing fields information.", "danger");
            return false;
        } else {

            let tkObj = {
                ticketId: tempTicketID,
                ticketInfo: document.querySelector("[name='ticketInfo']").value.replace(/[&\/\\#,+()$~%'"*?<>{}@“]/g, ''),
                priority: document.querySelector("[name='priority']").value,
                bugNewFeature: document.querySelector("[name='bugNewFeature']").value,
                assignedTo: document.querySelector("[name='assignedTo']").value,
                uuid: tempUUID

            }
            axios.post("/api/tickets/add-ticket/", tkObj, props.config).then(
                (res) => {

                    if (res.data.affectedRows >= 1) {
                        sessionStorage.setItem("uuid", tempUUID);
                        props.showAlert(document.querySelector("[name='ticketTitle']").value + " added.", "success");
                        props.getTickets(props.userEmail);
                        resetFunction("add");
                        buildWorkFlow(tempTicketID, tempUUID);

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
            originalId: originalTicketId,
        }

        axios.put("/api/invoices/update-invoices-ticketId/", updateObj, props.config).then(
            (res) => {
                if (res.data.affectedRows >= 1) {
                    console.log("Invoices updated: " + JSON.stringify(res.data));

                } else {
                    console.log("Invoices updated- there is a possibliuty that this ticket has no invoices yet: " + JSON.stringify(res.data));

                }

            }, (error) => {
                props.showAlert("Server error on invoice update.", "danger");
            }
        )

    }
    const postSuccess = (whichTicket) => {
        let newData = {
            ticketId: whichTicket,
            title: encodeURIComponent(timestamp() + ":" + props.userEmail + ": " + func),
            message: props.userEmail + " " + func + "ed ticket: " + whichTicket
        }
        axios.post("api/messages/post-message/", newData, props.config).then(
            (res) => {
                if (res.data.affectedRows === 0) {
                    props.showAlert("That did not update.", "warning");
                } else {
                    props.showAlert(whichTicket + " updated.", "success");

                    props.getTickets(props.userEmail);
                    resetFunction("edit");
                    props.getMessages("reset");
                }
            }, (error) => {
                props.showAlert("There was an error sending the update message: " + error, "danger");
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
            let ticketEdit = activeTitle;
            ticketEdit = ticketEdit.substring(0, ticketEdit.indexOf(":") + 3) + "-due-" + dueDate + ":" + props.userEmail + ":" + document.querySelector("[name='ticketTitle']").value

            let tkObj = {
                ticketId: ticketEdit,
                ticketInfo: document.querySelector("[name='ticketInfo']").value.replace(/[&\/\\#,+()$~%'"*?<>{}@“]/g, ''),
                priority: document.querySelector("[name='priority']").value,
                bugNewFeature: document.querySelector("[name='bugNewFeature']").value,
                assignedTo: document.querySelector("[name='assignedTo']").value,
                originalTitle: activeTitle
            }
            axios.put("/api/tickets/update-ticket/", tkObj, props.config).then(
                (res) => {

                    if (res.data.affectedRows >= 1) {
                        postSuccess(ticketEdit);



                        updateInvoices(ticketEdit, activeTitle);

                    } else {
                        props.showAlert("Something went wrong", "danger");
                    }


                }, (error) => {
                    props.showAlert("Something went wrong: " + error, "danger");
                });
        }


    }


    const deleteTicket = () => {/*THIS FUNCTION ONLY DELETES THE TICKET FROM THE TICKET TABLE. MESSAGES, INVOICES AND WORKFLOW ARE PRESERVED BY DESIGN*/
        let whichTicket = document.querySelector("[name='ticketList']").value;

        if (whichTicket === "default") {
            return false;
        }
        axios.delete("/api/tickets/delete-ticket/" + whichTicket, props.config).then(

            (res) => {
                if (res.data.affectedRows > 0) {

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

        if (props.ticketInfo === null) {
            props.getTickets(props.userEmail);
        }
        if (loaded === false && props.ticketInfo) {



            setTimeout(() => {
                if (sessionStorage.getItem("uuid")) {
                    document.querySelector("select[name='ticketList'] option[value='" + sessionStorage.getItem("uuid") + "']").selected = true;
                    setUuid((uuid) => sessionStorage.getItem("uuid"))
                    populateFields();
                } else {
                    props.showAlert("I am not sure which ticket you are on.", "warning");
                    props.getMessages("reset");
                }
            }, 500);
            setLoaded((loaded) => true);
        }
    }, []);





    return (<div className="row">

        <div className={props.ticketInfo !== null && func !== "add" ? "col-md-6" : "hide"}>
            <TicketList ticketInfo={props.ticketInfo} populateFields={populateFields} />
        </div>

        {props.ticketInfo !== null && func !== "add" ?
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
