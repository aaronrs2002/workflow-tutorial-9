import React, { useEffect, useState } from "react";
import Validate from "./Validate";
import axios from "axios";
import TicketList from "./TicketList";
import DateSelector from "./DateSelector";
import timestamp from "./timestamp";

const WorkFlow = (props) => {
    let [func, setFunc] = useState("add");
    let [loaded, setLoaded] = useState(false);
    let [stepsData, setStepsData] = useState([]);
    let [confirm, setConfirm] = useState("");
    let [onDeckDelete, setOnDeckDelete] = useState("");
    let [activeStep, setActiveStep] = useState(null);
    let [activeTaskList, setActiveTaskList] = useState("add/delete tasks");
    let [ticketSelected, setTicketSelected] = useState("default");
    let [existingData, setExistingData] = useState(false);
    let [uuid, setUuid] = useState();
    let [activeTitle, setActiveTitle] = useState("default");

    const fillStepFields = (step) => {

        if (func === "edit") {
            console.log("stepsData[step].stepTitle: " + stepsData[step].stepTitle + " - func: " + func);
            console.log("stepsData[step].stepPrice: " + stepsData[step].stepPrice);
            console.log("JSON.stringify(stepsData[step]): " + JSON.stringify(stepsData[step]));
            document.querySelector("[name='stepTitle']").value = stepsData[step].stepTitle;
            document.querySelector("[name='stepPrice']").value = stepsData[step].stepPrice;
            if (stepsData[step]) {
                document.querySelector("[name='start-step-select-year']").value = stepsData[step].stepStart.substring(0, 4);
                document.querySelector("[name='start-step-select-month']").value = stepsData[step].stepStart.substring(5, 7);
                document.querySelector("[name='start-step-select-day']").value = stepsData[step].stepStart.substring(8, 10);
                document.querySelector("[name='end-step-select-year']").value = stepsData[step].stepEnd.substring(0, 4);
                document.querySelector("[name='end-step-select-month']").value = stepsData[step].stepEnd.substring(5, 7);
                document.querySelector("[name='end-step-select-day']").value = stepsData[step].stepEnd.substring(8, 10);
            }

        }

    }

    const resetFields = () => {
        document.querySelector("[name='stepTitle']").value = "";
        document.querySelector("[name='stepPrice']").value = "";
        [].forEach.call(document.querySelectorAll("select[data-selector]"), (e) => {
            e.selectedIndex = 0;
        });
    }

    const populateFields = () => {
        sessionStorage.removeItem("activeTitle");
        sessionStorage.removeItem("uuid");
        setStepsData((stepsData) => []);
        let whichTicket = document.querySelector("[name='ticketList']").value;
        let selectedNum;
        setTicketSelected((ticketSelected) => whichTicket);
        if (whichTicket === "default") {
            props.showAlert("Wich ticket?", "warning");
            props.setActiveTicket((activeTicket) => null);
            setStepsData((stepsData) => []);
            sessionStorage.removeItem("activeTitle");
            return false;
        }

        for (let i = 0; i < props.ticketInfo.length; i++) {
            if (whichTicket === props.ticketInfo[i].uuid) {
                setUuid((uuid) => whichTicket);
                sessionStorage.setItem("uuid", props.ticketInfo[i].uuid);
                selectedNum = i;
                setActiveTitle((activeTitle) => props.ticketInfo[i].ticketId)
            }
        }
        props.setActiveTicket((activeTicket) => whichTicket);
        sessionStorage.setItem("activeTitle", props.ticketInfo[selectedNum].ticketId);
        //CLIENT SIDE GET INFO BASED ON A SPECIFIC TICKET
        axios.get("/api/workflow/get-workflow/" + whichTicket, props.config).then(
            (res) => {
                props.getMessages(whichTicket);
                if (res.data.success === 0) {
                    let preMessage = "Server message: ";
                    if (res.data.message === "Invalid token") {
                        preMessage = "Try logging in again: ";
                    }
                    props.showAlert(preMessage + res.data.message, "danger");
                    return false;
                }

                if (res.data && res.data.length === 0) {
                    props.showAlert("No data yet.", "info");
                    setStepsData((stepsData) => []);
                    setExistingData((existingData) => false);
                    return false;
                } else {
                    try {
                        let dataSuccess = JSON.parse(res.data[0].stepsData);
                        if (dataSuccess.length === 0) {
                            props.showAlert("No Steps entered yet.", "info");
                            return false;
                        } else {
                            setStepsData((stepsData) => dataSuccess);
                            setExistingData((existingData) => true);
                            fillStepFields(0);
                            resetFields();
                            setActiveStep((activeStep) => null);
                            setFunc((func) => "add");
                            sessionStorage.setItem("uuid", res.data[0].uuid);
                        }
                    } catch (error) {
                        console.log("worked around " + error);
                    }
                }
            }, (error) => {
                props.showAlert("Something is broken: " + error, "danger");
            }
        );
    }


    const updateStep = (newStep) => {
        let tempTitle;
        let tempPrice;
        let tempStepStart = document.querySelector("[name='start-step-select-year']").value + "-" + document.querySelector("[name='start-step-select-month']").value + "-" + document.querySelector("[name='start-step-select-day']").value;
        let tempStepEnd = document.querySelector("[name='end-step-select-year']").value + "-" + document.querySelector("[name='end-step-select-month']").value + "-" + document.querySelector("[name='end-step-select-day']").value;
        let tempActiveTaskList = ["task demo:delete-demo"];




        try {
            if (stepsData[activeStep].stepStart) {
                stepsData[activeStep].stepStart = tempStepStart;
                stepsData[activeStep].stepEnd = tempStepEnd;

            }

        } catch (error) {
            stepsData[activeStep] = { stepTitle: tempTitle, stepPrice: tempPrice, stepStart: tempStepStart, stepEnd: tempStepEnd, tasks: tempActiveTaskList }
        }





        let whichTicket = document.querySelector("[name='ticketList']").value;
        setTicketSelected((ticketSelected) => whichTicket);

        let tempStepData = stepsData;
        if (newStep === false) {
            try {
                if (document.querySelector("[name='stepTitle']").value !== "") {
                    tempStepData[activeStep].stepTitle = document.querySelector("[name='stepTitle']").value;

                }
            } catch (error) {
                console.log("no title to update");
            }
            try {
                if (document.querySelector("[name='stepPrice']").value !== "") {
                    tempStepData[activeStep].stepPrice = document.querySelector("[name='stepPrice']").value;

                }
            } catch (error) {
                console.log("no stepPrice to update");
            }
        } else {

            if (func === "add") {
                Validate(["stepTitle", "stepPrice", "start-step-select-year", "start-step-select-month", "start-step-select-day", "end-step-select-year", "end-step-select-month", "end-step-select-day"]);
                tempTitle = document.querySelector("[name='stepTitle']").value;
                tempPrice = document.querySelector("[name='stepPrice']").value;
            } else {
                tempActiveTaskList = activeTaskList;
            }
            if (document.querySelector(".error")) {
                props.showAlert("Fill out fields", "warning");
                return false;
            } else {
                if (activeTaskList === null) {
                    tempActiveTaskList = [];
                }
                if (func !== "delete") {
                    tempStepData = [...tempStepData, { stepTitle: tempTitle, stepPrice: tempPrice, stepStart: tempStepStart, stepEnd: tempStepEnd, tasks: tempActiveTaskList }]
                }


            }
        }
        let tempObj = [];
        if (func === "delete") {
            tempTitle = tempStepData[activeStep].stepTitle;
            tempPrice = tempStepData[activeStep].stepPrice;
            for (let i = 0; i < tempStepData.length; i++) {
                if (i !== parseInt(activeStep)) {
                    tempObj.push(tempStepData[i]);
                }
            }
            tempStepData = tempObj;

        }

        let updateObj = { uuid: uuid, stepsData: JSON.stringify(tempStepData) };

        axios.put("/api/workflow/update-workflow/", updateObj, props.config).then(
            (res) => {
                if (res.data.affectedRows === 0) {
                    console.log("updateObj[0].iuud: " + updateObj[0].uuid);
                    props.showAlert("Nothing was updated in the database. ", "warning");
                } else {
                    setActiveStep((activeStep) => []);
                    populateFields();
                    if (document.querySelector("[stepTitle]")) {
                        document.querySelector("[stepTitle]").value = "";
                        document.querySelector("[stepPrice]").value = "";
                        [].forEach.call(document.querySelectorAll("select[data-selector='date']"), (e) => {
                            e.selectedIndex = 0;
                        });
                    }


                    //OPTION 1

                    axios.put("/api/workflow/update-workflow/", { uuid: uuid, stepsData: JSON.stringify(tempStepData) }, props.config).then(
                        (res) => {
                            if (res.data.affectedRows === 0) {
                                props.showAlert("Update failed.", "warning");
                            } else {



                                let newData = {
                                    ticketId: activeTitle,
                                    uuid: uuid,
                                    title: encodeURIComponent(timestamp() + ":" + props.userEmail + " " + func + "ed ticket: " + activeTitle.substring(activeTitle.lastIndexOf(":") + 1, activeTitle.length).replace(/[!'()*]/g, escape)),
                                    message: encodeURIComponent(props.userEmail + " just performed a step " + func)
                                }
                                axios.post("api/messages/post-message/", newData, props.config).then(
                                    (res) => {
                                        if (res.data.affectedRows === 0) {
                                            props.showAlert("That did not post.", "warning");
                                        } else {

                                            document.querySelector("[name='messageTitle']").value = ""
                                            document.querySelector("[name='message']").value = "";
                                            props.showAlert("A message was posted regarding your update.", "success");
                                            props.getTickets(props.userEmail);
                                        }
                                    }, (error) => {
                                        props.showAlert("There was an error: " + error, "danger");
                                    }
                                )

                                setActiveStep((activeStep) => []);
                                populateFields();
                                if (document.querySelector("[stepTitle]")) {
                                    document.querySelector("[stepTitle]").value = "";
                                    document.querySelector("[stepPrice]").value = "";
                                    [].forEach.call(document.querySelectorAll("select[data-selector='date']"), (e) => {
                                        e.selectedIndex = 0;
                                    });
                                }



                            }
                        }, (error) => {
                            console.log(error);
                            props.showAlert("Your submission did not go through.", "danger");
                        }
                    );



                    //OPTION 2
                    /*  window.location = "#messageBoard";
                       document.querySelector("[name='messageTitle']").value = props.userEmail + " made a/an " + func;
                       document.querySelector("[name='message']").value = props.userEmail + " just performed a step " + func + " at " + timestamp();
                       props.showAlert("Success. Would you like to post this mesage?", "success");
   */




                }
            }, (error) => {
                console.log(error);
                props.showAlert("Your submission did not go through.", "danger");
            }
        );
    }


    const postStep = () => {
        let whichTicket = document.querySelector("[name='ticketList']").value;
        setTicketSelected((ticketSelected) => whichTicket);
        if (whichTicket === "default") {
            props.showAlert("Wich ticket?", "warning");
            return false;
        }
        let tempStepStart = document.querySelector("[name='start-step-select-year']").value + "-" + document.querySelector("[name='start-step-select-month']").value + "-" + document.querySelector("[name='start-step-select-day']").value;
        let tempStepEnd = document.querySelector("[name='end-step-select-year']").value + "-" + document.querySelector("[name='end-step-select-month']").value + "-" + document.querySelector("[name='end-step-select-day']").value;

        let tempSteps = [...stepsData, { stepTitle: document.querySelector("[name='stepTitle']").value, stepPrice: document.querySelector("[name='stepPrice']").value, stepStart: tempStepStart, stepEnd: tempStepEnd, tasks: [] }];

        axios.put("/api/workflow/update-workflow/", { uuid: uuid, ticketId: activeTitle, stepsData: JSON.stringify(tempSteps) }, props.config).then(
            (res) => {
                if (res.data.affectedRows === 0) {
                    props.showAlert("Message: " + res.data.message, "warning");

                } else {
                    let newStepTitle = document.querySelector("[name='stepTitle']").value;
                    setStepsData((stepsData) => tempSteps);

                    props.showAlert(newStepTitle + " added. Select step to edit.", "success");
                    /* document.querySelector("[name='stepTitle']").value = "";
                     document.querySelector("[name='stepPrice']").value = "";
                     [].forEach.call(document.querySelectorAll("select[data-selector='date']"), (e) => {
                         e.selectedIndex = 0;
                     });*/
                    setFunc((func) => "edit");
                    setTimeout(() => {
                        if (document.querySelector("select[name='selectStep'] option[value='" + newStepTitle + "']")) {
                            document.querySelector("select[name='selectStep'] option[value='" + newStepTitle + "']").selected = true;
                        } else {
                            document.querySelector("[name='stepTitle']").value = "";
                            document.querySelector("[name='stepPrice']").value = "";
                            [].forEach.call(document.querySelectorAll("select[data-selector='date']"), (e) => {
                                e.selectedIndex = 0;
                            });
                        }
                    }, 1000);
                }
            }, (error) => {
                props.showAlert("Your submission did not go through: " + error, "danger");
            }
        );
    }





    const createStep = () => {
        Validate(["stepTitle", "stepPrice", "start-step-select-year", "start-step-select-month", "start-step-select-day", "end-step-select-year", "end-step-select-month", "end-step-select-day"]);

        if (document.querySelector(".error")) {
            props.showAlert("Your step needs a name and a price/time.", "warning");
            return false;
        } else {
            if (existingData === false) {
                postStep();
                setExistingData((existingData) => true);
            } else {
                updateStep(true);
            }
        }


    }

    const selectStep = (stepNum) => {
        setActiveStep((activeStep) => stepNum);
        setActiveTaskList((activeTaskList) => stepsData[stepNum].tasks);
    }

    const stepSelector = () => {
        let whichStep = document.querySelector("select[name='selectStep']").value;
        if (whichStep === "default") {
            resetFields();
            setActiveStep((activeStep) => null);
            return false;
        }
        fillStepFields(whichStep);
        setActiveTaskList((activeTaskList) => stepsData[whichStep].tasks);
        setActiveStep((activeStep) => whichStep);
        setOnDeckDelete((onDeckDelete) => stepsData[whichStep].stepTitle);
        setConfirm((confirm) => "deleteStep");
        selectStep(whichStep);

    }

    const deleteStep = () => {
        let tempDelete = [];
        for (let i = 0; i < stepsData.length; i++) {
            if (stepsData[i].stepTitle !== onDeckDelete) {
                tempDelete.push(stepsData[i]);
            }
        }

        setStepsData((stepsData) => tempDelete);
        setConfirm((confirm) => "");
        document.querySelector("[name='selectStep']").selectedIndex = 0;
        updateStep(true);

    }



    const removeTask = (taskNum) => {
        let tempData = stepsData;
        let tempList = [];
        for (let i = 0; i < activeTaskList.length; i++) {
            if (i !== taskNum) {
                tempList.push(activeTaskList[i]);
            }
        }
        tempData[activeStep].tasks = tempList;
        setStepsData((stepsData) => tempData);
        setActiveTaskList((activeTaskList) => tempList);

    }

    const addTask = () => {

        let tempData = stepsData;
        let tempList = activeTaskList;

        Validate(["addTask"]);

        if (document.querySelector(".error")) {
            props.showAlert("Write a task", "warning");
            return false;
        } else {
            tempList = [...tempList, document.querySelector("[name='addTask']").value + ":not-complete"];
            setActiveTaskList((activeTaskList) => tempList);
            tempData[activeStep].tasks = tempList;
            document.querySelector("[name='addTask']").value = "";

        }
    }


    const updateStatus = (task) => {
        let tempActiveTaskList = activeTaskList;
        const status = document.querySelector("[name='taskStatus-" + task + "']").value;
        if (status === "default") {
            return false;
        }

        if (tempActiveTaskList[task].indexOf(":") !== -1) {

            tempActiveTaskList[task] = tempActiveTaskList[task].substring(0, tempActiveTaskList[task].indexOf(":"));

            switch (status) {
                case "waiting":
                    tempActiveTaskList[task] = tempActiveTaskList[task] + ":waiting";
                    break;
                case "hold":
                    tempActiveTaskList[task] = tempActiveTaskList[task] + ":hold";
                    break;
                case "in-progress":
                    tempActiveTaskList[task] = tempActiveTaskList[task] + ":in-progress";
                    break;
                case "review":
                    tempActiveTaskList[task] = tempActiveTaskList[task] + ":review";
                    break;
                case "complete":
                    tempActiveTaskList[task] = tempActiveTaskList[task] + ":complete";
                    break;
            }

            setActiveTaskList((activeTaskList) => tempActiveTaskList);
        }
    }


    const switchMode = (mode) => {

        setFunc((func) => mode);
        if (mode !== "delete" && document.querySelector("[name='stepTitle']")) {
            resetFields();
        }


        setActiveStep((activeStep) => null);

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
                } else {
                    props.showAlert("I am not sure which ticket you are on.", "warning");
                    props.getMessages("reset");
                }
            }, 500);
            setLoaded((loaded) => true);
        }
    }, []);


    return (

        <React.Fragment>
            <div className="row">
                <div className={props.ticketInfo !== null ? "col-md-12" : "hide"}>
                    <TicketList ticketInfo={props.ticketInfo} populateFields={populateFields} />
                </div>

                <div className="col-md-12">
                    <div className="btn-group block">
                        <button className={func === "add" ? "btn btn-primary active" : "btn btn-primary"} onClick={() => switchMode("add")}>New Step</button>
                        <button className={func === "edit" ? "btn btn-primary active" : "btn btn-primary"} onClick={() => switchMode("edit")}>Edit Step</button>
                        <button className={func === "delete" ? "btn btn-primary active" : "btn btn-primary"} onClick={() => switchMode("delete")}>Delete Step</button>
                    </div>
                </div>

                {func !== "add" ?
                    <div className="col-md-12">
                        <select className="form-control my-2" onChange={() => stepSelector()} name="selectStep">
                            <option value="default">Select step</option>
                            {stepsData ? stepsData.map((step, i) => {
                                return <option key={i} value={i}>{step.stepTitle}</option>
                            }) : null}
                        </select>
                    </div> : null}
                {func !== "delete" ?
                    <React.Fragment>
                        <div className="col-md-12">
                            <input type="text" className="form-control" placeholder="Step Title" name="stepTitle" />
                            <input type="text" className="form-control" placeholder="Step Price" name="stepPrice" />
                        </div>

                        <div className="col-md-12"><h5 className="block"> Start Step </h5></div>
                        <DateSelector menu={"start-step"} />
                        <div className="col-md-12"><h5 className="block"> End Step </h5></div>
                        <DateSelector menu={"end-step"} />
                        <div className="col-md-12 py-2">
                            {func === "add" ? <button className="btn btn-primary w-100" onClick={() => createStep()}>Create Step</button> : null}
                            {func === "edit" ? <button className="btn btn-primary w-100" onClick={() => updateStep(false)}>Update Step</button> : null}
                        </div>
                    </React.Fragment>
                    : null}



                {func === "delete" && confirm === "deleteStep" && activeStep !== null ?
                    <div className="col-md-12 alert alert-warning">
                        <p>Are you sure you want to delete {onDeckDelete}</p>
                        <button className="btn btn-secondary" onClick={() => setConfirm((confirm) => "")}>No</button>
                        <button className="btn btn-warning" onClick={() => deleteStep()}>Yes</button>
                    </div>
                    : null}
            </div>

            <div className="row row-col-1 row-col-md-4 pt-5">

                {(typeof stepsData) === "object" ?

                    stepsData.map((step, i) => {

                        return (
                            <div className="col" key={i} data-step={i}>
                                <div className={
                                    step.tasks.toString().indexOf(":hold") === -1 &&
                                        step.tasks.toString().indexOf(":review") === -1 &&
                                        step.tasks.toString().indexOf(":in-progress") === -1 &&
                                        step.tasks.toString().indexOf(":waiting") === -1 &&
                                        step.tasks.toString().indexOf("add/delete tasks") === -1
                                        ? "card mb-4 rounded-3 shadow-sw alert-success" : "card mb-4 rounded-3 shadow-sw alert-secondary"}
                                    id={step.stepTitle ? step.stepTitle.replaceAll(" ", "-") + "-card" : step.stepTitle + "-card"}>

                                    <div className="card-header py-3">
                                        <h5 className={parseInt(activeStep) === i ? "card-title pricing-card-title active" : "card-title pricing-card-title"} >{step.stepTitle + ": $" + step.stepPrice}</h5>
                                    </div>
                                    <div className="card-body">




                                        {func === "edit" && parseInt(activeStep) === i ?
                                            <ul className="list-group">
                                                {(typeof activeTaskList) === "object" ? activeTaskList.map((task, j) => {
                                                    return (<li className="list-group-item list-group-item-secondary" key={j} data-remove={task} >{task} <i className="fas fa-trash pointer"
                                                        key={i} onClick={() => removeTask(j)}></i>

                                                        <select name={"taskStatus-" + j} className="form-control" onChange={() => updateStatus(j)}>
                                                            <option value="default">Select Task Status</option>
                                                            <option value="waiting">Waiting</option>
                                                            <option value="hold">On Hold</option>
                                                            <option value="in-progress">In Progress</option>
                                                            <option value="review">Ready for Review</option>
                                                            <option value="complete">Complete</option>
                                                        </select>

                                                    </li>)
                                                }) : null}
                                                <div className="input-group mb-3">
                                                    <input type="text" className="form-control" name="addTask" placeholder="Add Task" />
                                                    <button className="w-100 btn btn-primary" onClick={() => addTask()}>Add</button>
                                                </div>
                                            </ul>
                                            :
                                            <div data-steplist={i} >
                                                <ul className="list-group mt-3 mb-4" data-step={step.stepTitle}>

                                                    {(typeof step.tasks) === "object" && step.tasks.length > 0 ? step.tasks.map((task, j) => {


                                                        let colorCode = "danger";
                                                        if (task.indexOf(":hold") !== -1) {
                                                            colorCode = "warning";
                                                        }
                                                        if (task.indexOf(":in-progress") !== -1) {
                                                            colorCode = "info";
                                                        }
                                                        if (task.indexOf(":review") !== -1) {
                                                            colorCode = "dark";
                                                        }
                                                        if (task.indexOf(":complete") !== -1) {
                                                            colorCode = "success";
                                                        }
                                                        return (<li key={j} className={"list-group-item list-group-item-" + colorCode} data-step={step.stepTitle}
                                                            name={task.substring(0, task.indexOf(":"))} >{task}</li>)

                                                    }) : null}
                                                </ul>
                                            </div>

                                        }
                                    </div>
                                    {func === "edit" && parseInt(activeStep) === i ?
                                        <div className="card-footer text-muted">

                                            <button className="btn w-100 btn-lg btn-primary" onClick={() => updateStep(false)}>Update Step</button>

                                        </div> : null}
                                </div>
                            </div>
                        )
                    })

                    : null}

            </div>

        </React.Fragment >)



}

export default WorkFlow;
