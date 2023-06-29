import React from "react";

const TicketList = (props) => {

    return (<div >
        {props.ticketInfo !== null ?

            <select className="form-control" name="ticketList" onChange={() => props.populateFields()}>
                <option value="default">Select a ticket</option>
                {props.ticketInfo !== null ? props.ticketInfo.map((ticket, i) => {
                    return (<option key={i} data-level={ticket.priority} value={ticket.ticketId}>{ticket.ticketId.substring(ticket.ticketId.lastIndexOf(":") + 1) + " (priority: " + ticket.priority + ")"}</option>)
                }) : null}
            </select>
            : null
        }
    </div>)
}

export default TicketList;
