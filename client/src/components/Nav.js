import React, { useState, useEffect } from "react";

const Nav = (props) => {
    let [mobileNav, setMobileNav] = useState(false);
    const toggleMobileNav = (whatSection) => {
        props.setActiveModule((activeModule) => whatSection);
        localStorage.setItem("activeModule", whatSection);

        if (mobileNav === false) {
            setMobileNav((mobileNav) => true);
        } else {
            setMobileNav((mobileNav) => false);
        }
    }

    return (<nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <a className="navbar-brand" href="#">{props.userEmail}</a>
        <button className="navbar-toggler" onClick={() => toggleMobileNav()}>
            <span className="navbar-toggler-icon"></span>
        </button>
        <div className={mobileNav === false ? "collapse navbar-collapse" : "collapse navbar-collapse show animiated fadeIn"}>

            <ul className="navbar-nav mr-auto">
                {sessionStorage.getItem("activeTicket") ?
                    <li className="nav-item">
                        <a className="nav-link" href="#messageBoard">Messages <i className="fas fa-comment"></i></a>
                    </li> : null}
                <li className={props.activeModule === "ticketBuilder" ? "nav-item active" : "nav-item"}>
                    <a className="nav-link" href="#" onClick={() => toggleMobileNav("ticketBuilder")}>Ticket Builder</a>
                </li>
                <li className={props.activeModule === "workflow" ? "nav-item active" : "nav-item"}>
                    <a className="nav-link" href="#" onClick={() => toggleMobileNav("workflow")}>Workflow</a>
                </li>
                <li className={props.activeModule === "timeline" ? "nav-item active" : "nav-item"}>
                    <a className="nav-link" href="#" onClick={() => toggleMobileNav("timeline")}>Timeline</a>
                </li>
                <li className={props.activeModule === "invoices" ? "nav-item active" : "nav-item"}>
                    <a className="nav-link" href="#" onClick={() => toggleMobileNav("invoices")}>Invoices</a>
                </li>
                <li className={props.activeModule === "clockInOut" ? "nav-item active" : "nav-item"}>
                    <a className="nav-link" href="#" onClick={() => toggleMobileNav("clockInOut")}>ClockInOut</a>
                </li>


            </ul>
        </div>
    </nav>)

}

export default Nav;
