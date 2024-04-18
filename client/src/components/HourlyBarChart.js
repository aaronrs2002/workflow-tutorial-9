import React, { Component, ReactDOM, useState, useEffect } from "react";
import NumberToTime from "./NumberToTime";
import ApexCharts from 'apexcharts';
import ReactApexChart from 'react-apexcharts';




const HourlyBarChart = (props) => {
    let [loaded, setLoaded] = useState(false);
    let [options, setOptions] = useState({

        series: [{
            data: []
            // data: [totals[0], totals[1], totals[2], totals[3], totals[4], totals[5], totals[6], totals[7], totals[8], totals[9], totals[10], totals[11], totals[12], totals[13], totals[14], totals[15], totals[16], totals[17], totals[18], totals[19], totals[20], totals[21], totals[22], totals[23], totals[24], totals[25], totals[26], totals[27]]
        }],
        chart: {
            type: 'bar',
            height: 'auto'
        },
        plotOptions: {
            bar: {
                horizontal: true,
                dataLabels: {
                    position: 'top',
                },
            }
        },
        dataLabels: {
            enabled: true,
            offsetX: -6,
            style: {
                fontSize: '12px',
                colors: ['#fff']
            }
        },
        stroke: {
            show: true,
            width: 1,
            colors: ['#fff']
        },
        tooltip: {
            shared: true,
            intersect: false
        },
        xaxis: {
            categories: []
        },

    });

    const addUpDayTotals = (data) => {
        let tempOptions = options;
        let daysList = [];
        let daysTotal = [];
        if ((typeof data) === "object" && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                let dateHere = NumberToTime(new Date(data[i].timeIn));
                dateHere = dateHere.toString();
                dateHere = dateHere.toString().substring(0, 10)
                if (daysList.indexOf(dateHere)) {
                    daysList.push(dateHere);
                    daysTotal.push(0);
                }
                for (let i = 0; i < daysList.length; i++) {
                    for (let j = 0; j < data.length; j++) {
                        let dateHere = new Date(Number(data[j].timeIn));
                        dateHere = dateHere.toString();
                        let yrMoSelected = daysList[i].substring(0, 7);
                        if (data[j].timeOut !== "noTimeYet" && yrMoSelected === NumberToTime(dateHere).substring(0, 7)) {
                            let tempNum = (daysTotal[i] + Number(((((data[i].timeOut - data[i].timeIn) / 1000) / 60) / 60).toFixed(2)));
                            daysTotal[i] = parseFloat(tempNum).toFixed(2);
                        }
                    }
                }

                tempOptions.series[0].data = daysTotal;
                tempOptions.xaxis.categories = daysList;
                setOptions((options) => tempOptions);
            }//end end date
        } else {
            return false;
        }
    }

    useEffect(() => {
        if (loaded === false && (typeof props.employeeHours) === "object" && props.employeeHours.length > 0) {
            addUpDayTotals(props.employeeHours);

            setLoaded((loaded) => true);
        }
    });

    return (
        <div className="col-md-12" id="chart" data-chart="bar">
            {options.series[0].data.length > 0 ? <div >
                <label>Hours Worked</label>
                <ReactApexChart options={options} series={options.series} type="bar" />
            </div> : null}

        </div>
    );
}




export default HourlyBarChart;


