import React, { useState, useEffect } from "react";
import DateSelector from "./DateSelector";
import Validate from "./Validate";
import localData from "./localData/localData";
import timestamp from "./timestamp";
import axios from "axios";
import usStates from "./localData/usStates";
import BudgetChart from "./BudgetChart";
import TicketList from "./TicketList";

const Invoices = (props) => {
    let [loaded, setLoaded] = useState(false);
    const tagNames = ["due-select-year", "due-select-month", "due-select-day"];
    const eventColors = ['#B5F021', '#07F730', '#9C27B0', '#12E0CF', '#BED5FA', '#6826F0', '#E9F04D', '#60F7ED', '#A863E0', '#FAC6AA', "#E3F07D", "#F78060"];
    const listItemColors = ['#F44336', '#E91E63', '#9C27B0', '#008FFB', '#00E396', '#775DD0', '#00E396', '#ED6E5F', '#B0EBF7', '#E1C366', "#AB63F7", "#C3EDBB"];
    const abrevs = [" (name): ", " (email): ", " (phone): ", " (address): ", " (city): ", " (state): ", " (zipCode): "];
    let [name, setInvoiceTo] = useState("");
    let [itemizedList, setItemizedList] = useState([]);
    let [preTaxTotal, setPreTaxTotal] = useState(0);
    let [recipientInfo, setRecipientInfo] = useState(null);
    const recipientFields = ["name", "email", "phone", "address", "city", "state", "zipCode"];
    let [currentDate, setCurrentDate] = useState(null);
    let [dueDate, setDueDate] = useState(null);
    let [func, setFunc] = useState("add");
    let [savedInvoices, setSavedInvoices] = useState(null);
    let [confirm, setConfirm] = useState("");
    let [amounts, setAmounts] = useState([]);
    let [labels, setLabels] = useState([]);
    let [itemizedCosts, setItemizedCosts] = useState([]);
    let [itemizedLabels, setItemizedLabels] = useState([]);
    let [itemsSum, setItemsSum] = useState(0);
    let [uuid, setUuid] = useState();
    let [activeTitle, setActiveTitle] = useState("default");

    const buildItemChart = (theObj) => {
        let tempCosts = [];
        let tempLabels = [];
        for (let i = 0; i < theObj.length; i++) {
            tempCosts.push(theObj[i].itemPrice);
            tempLabels.push(theObj[i].itemName);
        }

        setItemizedCosts((itemizedCosts) => tempCosts);
        setItemizedLabels((itemizedLabels) => tempLabels);
    }

    const calculate = (obj) => {
        let tempCost = 0;
        for (let i = 0; i < obj.length; i++) {
            tempCost = parseFloat(tempCost) + parseFloat(obj[i].itemPrice);
        }
        setPreTaxTotal((preTaxTotal) => tempCost);
    }

    const deleteItem = (which) => {
        let tempList = [];
        let tempCost = 0;
        for (let i = 0; i < itemizedList.length; i++) {
            if (which !== i) {
                tempList.push(itemizedList[i]);
            }
        }
        setPreTaxTotal((preTaxTotal) => tempCost);
        setItemizedList((itemizedList) => tempList);
        calculate(tempList);
    }

    const addItem = () => {
        Validate([...recipientFields, "due-select-year", "due-select-month", "due-select-day", "itemName", "itemPrice"]);
        if (document.querySelector(".error")) {
            props.showAlert("Something is missing from your fields.", "warning");
            return false;
        }
        updateInvoiceInfo();
        let tempList = itemizedList;
        let tempTotal = 0;
        let tempName = document.querySelector("[name='itemName']").value;
        let tempCost = document.querySelector("[name='itemPrice']").value;
        for (let i = 0; i < tempList.length; i++) {
            if (tempName === tempList[i].invoiceItem) {
                props.showAlert(tempList[i].invoiceItem + " already exists.", "warning");
                return false;
            }
        }
        tempList = [...tempList, { itemName: tempName, itemPrice: parseFloat(tempCost) }];
        setPreTaxTotal((preTaxTotal) => tempTotal);
        setItemizedList((itemizedList) => tempList);
        document.querySelector("[name='itemName']").value = "";
        document.querySelector("[name='itemPrice']").value = "";
        calculate(tempList);
        buildItemChart(tempList);
        window.location = "#invoiceAddrWrap";
    }



    const updateInvoiceInfo = () => {
        let tempInvoiceTo = "";
        if (document.querySelector("[name='name']").value) {
            tempInvoiceTo = document.querySelector("[name='name']").value;
        }
        setInvoiceTo((invoiceTo) => tempInvoiceTo);
        let tempCurrentDate = timestamp();
        let tempDueDate = "";
        for (let i = 0; i < tagNames.length; i++) {
            let spaceBar = "-";
            if (i === 2) {
                spaceBar = "";
            }
            // tempCurrentDate = tempCurrentDate + document.querySelector("select[name='" + tagNames[i] + "'][data-title='" + tagTitles[0] + "']").value + spaceBar;
            tempDueDate = tempDueDate + document.querySelector("select[name='" + tagNames[i] + "']").value + spaceBar;
        }
        if (tempCurrentDate.indexOf("default") === -1) {
            setCurrentDate((currentDate) => tempCurrentDate);
        }
        if (tempDueDate.indexOf("default") === -1) {
            setDueDate((dueDate) => tempDueDate);
        }

        if ((tempCurrentDate + tempDueDate).indexOf("default") !== -1) {
            setCurrentDate((currentDate) => null);
            setDueDate((dueDate) => null);
        }
        let recipientFieldsConcat = "";

        for (let i = 0; i < recipientFields.length; i++) {
            let tempField = "";
            try {
                if (document.querySelector("[name='" + recipientFields[i] + "']").value) {
                    tempField = document.querySelector("[name='" + recipientFields[i] + "']").value;
                }
            } catch (error) {
                console.log("Bypass error: " + error);
            }
            recipientFieldsConcat = recipientFieldsConcat + abrevs[i] + tempField;
        }
        setRecipientInfo((recipientInfo) => recipientFieldsConcat);
    }



    const saveInvoice = (print) => {
        let whichTicket = document.querySelector("[name='ticketList']").value;
        if (whichTicket === "default") {
            props.showAlert("Which ticket?", "warning");
            return false;
        }

        Validate([...recipientFields, "due-select-year", "due-select-month", "due-select-day"]);
        if (document.querySelector(".error")) {
            props.showAlert("Something is missing.", "warning");
            return false;
        } else {
            let timeSold = timestamp();

            updateInvoiceInfo();
            let testSelects = [];

            let prepList = [];
            for (let i = 0; i < itemizedList.length; i++) {
                prepList.push({
                    itemName: itemizedList[i].itemName,

                    itemPrice: itemizedList[i].itemPrice,

                })
            }
            [].forEach.call(document.querySelectorAll("select"), (e) => {

                if (e.value === "default") {
                    props.showAlert("Check your dates.", "warning");
                    e.classList.add("error");
                    return false;
                }
            });
            if (document.querySelector(".error")) {
                props.showAlert("Check your fields.", "warning");
                return false;
            }
            if (print === true) {/*may need later*/
                window.print();
            }


            //CLIENT SIDE POST SALE
            let tempDueDate = "";
            for (let i = 0; i < tagNames.length; i++) {
                let theHyphen = "-";
                if (i === 2) {
                    theHyphen = "";
                }
                tempDueDate = tempDueDate + document.querySelector("[name='" + tagNames[i] + "']").value + theHyphen;
            }
            let sendData = {
                invoiceId: props.userEmail + ":" + timeSold,
                preTaxTotal: Number(preTaxTotal).toFixed(2),
                itemizedList: JSON.stringify(prepList),
                invoiceRecipient: recipientInfo,
                invoiceDueDate: tempDueDate,
                ticketId: props.activeTitle,
                uuid: uuid
            }
            axios.post("api/invoices/add-invoice", sendData, props.config).then(
                (res) => {
                    [].forEach.call(document.querySelectorAll("input"), (e) => {
                        e.value = "";
                    });
                    [].forEach.call(document.querySelectorAll("select[data-selector]"), (e) => {
                        e.selectedIndex = 0;
                    });
                    setForNewInvoice();
                    populateFields();

                }, (error) => {
                    console.log("Error: " + error);
                }
            )
        }
    }

    //CLIENT SIDE REQUEST FOR ALL INVOICES REGARD A SINGLE TICKET
    const populateFields = () => {

        let whichTicket = document.querySelector("[name='ticketList']").value;
        if (whichTicket === "default") {
            props.setActiveTicket((activeTicket) => null);

            setAmounts((amounts) => []);
            setLabels((labels) => []);
            return false;
        } else {

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

            axios.get("/api/invoices/get-invoices/" + whichTicket, props.config).then(
                (res) => {
                    if (res.data.success === 0) {
                        let preMessage = "Server message: ";
                        if (res.data.message === "Invalid token") {
                            preMessage = "Try logging in again: ";
                        }
                        props.showAlert(preMessage + res.data.message, "danger");
                        return false;
                    }
                    let tempAmounts = [];
                    let tempLabels = [];
                    let prepItemSum = parseFloat(0);
                    for (let i = 0; i < res.data.length; i++) {
                        prepItemSum = parseFloat(prepItemSum) + parseFloat(res.data[i].preTaxTotal);
                        if (tempLabels.indexOf(res.data[i].invoiceId) === -1) {
                            tempAmounts.push(parseFloat(res.data[i].preTaxTotal));
                            console.log("JSON.stringify(res.data[i]): " + JSON.stringify(res.data[i]));
                            tempLabels.push(res.data[i].invoiceRecipient.substring(res.data[i].invoiceRecipient.indexOf("(name):") + 7, res.data[i].invoiceRecipient.indexOf("(email):")) + ": " + res.data[i].invoiceId);
                        } else {
                            tempAmounts[tempLabels.indexOf(res.data[i].invoiceId)] = Math.round(tempAmounts[tempLabels.indexOf(res.data[i].invoiceId)]) + Math.round(res.data[i].preTaxTotal);
                        }
                        res.data[i].itemizedList = JSON.parse(res.data[i].itemizedList);
                    }
                    setAmounts((amounts) => tempAmounts);
                    setLabels((labels) => tempLabels);
                    setItemsSum((itemsSum) => prepItemSum);
                    setSavedInvoices((savedInvoices) => res.data);


                }, (error) => {
                    console.log(error);
                }
            )

        }

    }

    const setForNewInvoice = () => {
        setFunc((func) => "add");
        setDueDate((dueDate) => null);
        setCurrentDate((currentDate) => "");
        setRecipientInfo((recipientInfo) => "");
        setItemizedList((itemizedList) => []);
        setPreTaxTotal((preTaxTotal) => 0);
        setItemizedLabels((itemizedLabels) => []);
        setItemizedCosts((itemizedCosts) => []);

    }

    //DISPLAY A SPECIFIC INVOICE
    const specificInvoice = () => {

        let selectedInvoice = document.querySelector("[name='invoiceList']").value;
        if (selectedInvoice === "default") {
            return false;
        }
        let tempLabels = [];
        let tempCosts = [];
        for (let i = 0; i < savedInvoices[selectedInvoice].itemizedList.length; i++) {
            tempLabels.push(savedInvoices[selectedInvoice].itemizedList[i].itemName);
            tempCosts.push(savedInvoices[selectedInvoice].itemizedList[i].itemPrice);
        }

        setItemizedCosts((itemizedCosts) => tempCosts);
        setItemizedLabels((itemizedLabels) => tempLabels);
        setItemizedList((itemizedList) => savedInvoices[selectedInvoice].itemizedList);
        setPreTaxTotal((preTaxTotal) => savedInvoices[selectedInvoice].preTaxTotal);
        setRecipientInfo((recipientInfo) => savedInvoices[selectedInvoice].invoiceRecipient);
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


    return (
        <div >
            <div className="row">
                <div className="col-md-12 mt-3 noPrint">
                    <h3 >Select Ticket: Build an invoice</h3>

                    <TicketList populateFields={populateFields} ticketInfo={props.ticketInfo} />

                    <div className="btn-group block my-2">
                        <button className={func === "add" ? "btn btn-primary active" : "btn btn-primary"} onClick={() => setForNewInvoice()}>Add Invoice</button>
                        <button className={func === "view" ? "btn btn-primary active" : "btn btn-primary"} onClick={() => setFunc((func) => "view")}>View Invoice</button>

                    </div>
                </div>
            </div>



            {func !== "view" ?
                <div className="mb-1 noPrint ">
                    <div className="row">


                        <div className="col-md-6"><input type="text" name="name" className="form-control mb-1" placeholder="Name" onChange={() => updateInvoiceInfo()} /></div>
                        <div className="col-md-3"><input type="text" name="email" className="form-control mb-1" placeholder="Email Address" onChange={() => updateInvoiceInfo()} /></div>
                        <div className="col-md-3"> <input type="text" name="phone" className="form-control mb-1" placeholder="Phone Number" onChange={() => updateInvoiceInfo()} /></div>
                        <div className="col-md-3"> <input type="text" name="address" className="form-control mb-1" placeholder="Address" onChange={() => updateInvoiceInfo()} /></div>
                        <div className="col-md-3"><input type="text" name="city" className="form-control mb-1" placeholder="City" onChange={() => updateInvoiceInfo()} /></div>
                        <div className="col-md-3">
                            <select className="form-control" name="state" onChange={() => updateInvoiceInfo()}>
                                <option value="default">Select a State</option>
                                {usStates ? usStates.map((stateAbbr, i) => {
                                    return (<option key={i} value={stateAbbr}>{stateAbbr}</option>)
                                }) : null}

                            </select></div>
                        <div className="col-md-3"><input type="text" name="zipCode" className="form-control mb-1" placeholder="Zip Code" onChange={() => updateInvoiceInfo()} /></div>
                    </div>
                    <hr />
                    <div>
                        <div className="row">
                            <DateSelector menu={"due"} />
                            <div className="col-md-12">
                                <label>Build itemized list of products/services</label>
                                <input type="text" name="itemName" className="form-control mt-2" placeholder="Item or Service" />

                                <input type="text" name="itemPrice" className="form-control mt-2" placeholder="Cost (Numbers only 00.00)" />
                                <button className="btn btn-success w-100 my-2" onClick={() => addItem()}>Add to invoice</button>
                            </div>
                        </div>
                    </div>
                </div> :



                <div className="row">
                    <div className="col-md-12 noPrint">
                        <select className="form-control" name="invoiceList" onChange={() => specificInvoice()}>
                            <option value="default">Select an invoice</option>
                            {savedInvoices !== null ?
                                savedInvoices.map((invoice, i) => {
                                    return <option key={i} value={i}>{invoice.invoiceRecipient.substring(8, invoice.invoiceRecipient.indexOf("(email)")) + " - " + invoice.invoiceId.substring(invoice.invoiceId.indexOf(":") + 1, invoice.invoiceId.length)}</option>
                                })
                                : null}

                        </select>
                    </div>
                </div>



            }
            {recipientInfo ?
                <div className="row">
                    <div className="col-md-12 ">
                        <div className=" card ">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-3">
                                        <div id="invoiceAddrWrap">
                                            <img src={localData[0].plannerInfo.logo} alt="logo" />

                                            {(typeof localData[0]) === "object" ?
                                                <ul className="list-unstyled">
                                                    <li><a href={localData[0].plannerInfo.url} target='_blank' >{localData[0].plannerInfo.company}</a> </li>
                                                    <li><a href={'mailto:' + props.userEmail} >{props.userEmail}</a></li>
                                                    <li><a href={"tel:" + localData[0].plannerInfo.phone}>{localData[0].plannerInfo.phone}</a></li>
                                                </ul> :
                                                null}
                                        </div>
                                    </div>
                                    <div className="col-md-5"></div>
                                    <div className="col-md-4">
                                        <h4 className="card-heading">Invoice to:<br />{recipientInfo.substring(recipientInfo.indexOf("(name):") + 7, recipientInfo.indexOf("(email):"))}</h4>

                                        <ul className="list-unstyled">
                                            <li> <small>{recipientInfo.substring(recipientInfo.indexOf("(email): "), recipientInfo.indexOf("(phone): "))} </small></li>
                                            <li> <small>{recipientInfo.substring(recipientInfo.indexOf("(phone): "), recipientInfo.indexOf("(address): "))} </small></li>
                                            <li> <small>{recipientInfo.substring(recipientInfo.indexOf("(address): "), recipientInfo.indexOf("(city): "))} </small></li>
                                            <li> <small>{recipientInfo.substring(recipientInfo.indexOf("(city): "), recipientInfo.indexOf("(zipCode): "))} </small></li>
                                            <li> <small>{recipientInfo.substring(recipientInfo.indexOf("(zipCode): "), recipientInfo.length)} </small></li>
                                        </ul>
                                        <ul className="list-unstyled">
                                            {currentDate !== null ? <li><label>Invoice created: {currentDate}</label></li> : null}
                                            {dueDate !== null ? <li> <label>Due date: {dueDate}</label></li> : null}
                                        </ul>
                                    </div>

                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <ul className="list-group mb-5">
                                            {itemizedList.length > 0 ? itemizedList.map((item, i) => {
                                                return (<li className="list-group-item" key={i}>{func === "add" ? <button className="btn btn-light noPrint" onClick={() => deleteItem(i)}><i className="fas fa-trash noPrint m-1"  ></i> </button> : null} {i + 1} - {item.itemName} - ${item.itemPrice} </li>)
                                            }) : null}
                                            <li className="list-group-item list-group-item-dark">Pre Tax: ${parseFloat(preTaxTotal).toFixed(2)} </li>
                                            <li className="list-group-item list-group-item-dark">Total: ${parseFloat(preTaxTotal + (preTaxTotal * localData[0].plannerInfo.tax)).toFixed(2)} </li>
                                        </ul>
                                    </div>
                                </div>

                                {confirm === "save-to-db" && func === "add" ?
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="alert alert-warning" role="alert">
                                                Are you sure you are ready to submit?
                                                <div>
                                                    <button type="button" className="btn btn-secondary m-1" onClick={() => setConfirm((confirm) => "")}>No</button>
                                                    <button type="button" className="btn btn-danger m-1" onClick={() => saveInvoice(false)}>Yes</button>

                                                </div>
                                            </div>
                                        </div>
                                    </div> :
                                    <div className="row">
                                        <div className={func === "view" ? "hide" : "noPrint col-md-12"}>
                                            <button className="btn btn-success w-100" onClick={() => setConfirm((confirm) => "save-to-db")}>Save to database</button>
                                        </div>
                                    </div>}
                                <div className="row">
                                    <div className="noPrint col-md-12   mt-2">
                                        <button className="btn btn-secondary w-100" onClick={() => window.print()}>Print</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> : null
            }

            {
                itemizedCosts.length > 0 && itemizedLabels.length > 0 ?
                    <div className="row noPrint">
                        <hr className="my-2" />
                        <div className="col-md-6 my-2 noPrint">

                            <BudgetChart amounts={itemizedCosts} labels={itemizedLabels} title={"Breakdown by list item"} theColors={listItemColors} />
                        </div>
                        <div className="col-md-6 my-2 noPrint">

                            <ul className="list-group chartHeightMatch">
                                {preTaxTotal !== 0 ? <li className="list-group-item list-group-item-dark">Invoice breakdown for pre tax total: ${Number(preTaxTotal).toFixed(2)}</li> : null}
                                {(typeof itemizedCosts) === "object" ? itemizedCosts.map((itemPrice, i) => {
                                    return (<li key={i} className="list-group-item">{itemizedLabels[i]} ${itemPrice} - {((itemPrice / preTaxTotal) * 100).toFixed(2)}%</li>)
                                }) : null}
                            </ul>

                        </div>

                    </div> : null
            }

            <hr className="my-2 noPrint" />
            {
                (typeof itemizedList) === "object" && labels.length > 0 ?
                    <div className="row noPrint">
                        <div className="col-md-6 mb-5 noPrint">

                            <BudgetChart amounts={amounts} labels={labels} title={"Ticket invoices"} theColors={eventColors} />
                        </div>
                        <div className="col-md-6 mb-5 noPrint">
                            <h4>Ticket expense totals:</h4>
                            <ul className="list-group chartHeightMatch">
                                {itemsSum !== 0 ? <li className="list-group-item list-group-item-dark">Total invoices from all tickets: ${itemsSum.toFixed(2)}</li> : null}
                                {(typeof amounts) === "object" ? amounts.map((itemPrice, i) => {
                                    return (<li key={i} className="list-group-item">{labels[i].substring(0, labels[i].length - 3)} <br />${itemPrice}</li>)
                                }) : null}
                            </ul>

                        </div>

                    </div> : null
            }



        </div >)
}

export default Invoices;
