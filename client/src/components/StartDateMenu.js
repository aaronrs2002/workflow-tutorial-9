import React from "react";
import counters from "./counters";

const StartDateMenu = (props) => {

    return (<div className="row my-2">
        <div className="col-4">
            <label>{props.dateTitle} Year</label>
            <select className="form-control" name="startYear" data-title={props.dateTitle}>
                <option value="default">Select Year</option>
                {counters.years.map((theYear, i) => {


                    return (<option key={i} value={theYear}>{theYear}</option>)
                })}
            </select>
        </div>
        <div className="col-4">
            <label>{props.dateTitle} Month</label>
            <select className="form-control" name="startMonth" data-title={props.dateTitle}>
                <option value="default">Select Month</option>
                {counters.months.map((theMonth, i) => {
                    let tempNum = i + 1;
                    if (tempNum < 10) {
                        tempNum = "0" + tempNum;
                    }

                    return (<option key={i} value={tempNum}>{theMonth}</option>)
                })}

            </select>
        </div>
        <div className="col-4">
            <label>{props.dateTitle} Day</label>
            <select className="form-control" name="startDay" data-title={props.dateTitle}>
                <option value="default">Select Day</option>
                {counters.days.map((count, i) => {
                    if (i < 32 && i !== 0) {
                        return <option key={i} value={count}>{count}</option>
                    }

                })}
            </select>
        </div>
    </div>)

}

export default StartDateMenu;