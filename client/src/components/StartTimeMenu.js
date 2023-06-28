import React from "react";
import counters from "./counters";

const StartTimeMenu = (props) => {

    return (<React.Fragment>
        <div className="col-4">
            <label>{props.dateTitle} Hour</label>
            <select className="form-control" name="startHour" data-title={props.dateTitle}>
                <option>Select Hour</option>

                {counters.days.map((count, i) => {
                    if (i <= 12 && i !== 0) {
                        return <option key={i} value={count}>{count}</option>
                    }

                })}
            </select>
        </div>
        <div className="col-4">
            <label>{props.dateTitle} Minute</label>
            <select className="form-control" name="startMinute" data-title={props.dateTitle}>
                <option>Select Minute</option>
                {counters.days.map((count, i) => {

                    return <option key={i} value={count}>{count}</option>


                })}
            </select>
        </div>
        <div className="col-4">
            <label>{props.dateTitle} AM/PM</label>
            <select className="form-control" name="startAmPm" data-title={props.dateTitle}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
            </select>
        </div>
    </React.Fragment>)

}

export default StartTimeMenu;