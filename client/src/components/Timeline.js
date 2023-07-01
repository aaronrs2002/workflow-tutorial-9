
import React, { useState, useEffect } from "react";
import ApexCharts from "apexcharts";
import ReactApexChart from "react-apexcharts";
import TicketList from "./TicketList";
import axios from "axios";

const Timeline = (props) => {
    let [loaded, setLoaded] = useState(false);
    let [performingUpdate, setPerformingUpdate] = useState(false);
    let [currentData, setCurrentData] = useState({
        eventName: "default",
        timelineHeight: 350,
        series: [
            {
                data: null
            }
        ],
        options: {
            fill: {
                colors: ["#FAF916", "#D6BE0B", "#EBB70C", "#D68F0B", "#F57E00"]
            },
            chart: {
                height: 350,
                type: 'rangeBar'
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    distributed: true,
                    dataLabels: {

                        hideOverflowingLabels: false
                    }
                }
            },
            dataLabels: {
                enabled: false,
                formatter: function (val, opts) {
                    var label = opts.w.globals.labels[opts.dataPointIndex]

                    return label.toUpperCase();
                },
                style: {
                    fontSize: '1rem',
                    fontWeight: 'bold',
                },
                offsetX: 0,
                dropShadow: {
                    enabled: true
                }

            },
            type: 'datetime',
            xaxis: {
                type: 'datetime',
                labels: {
                    show: true,
                    rotate: -45,
                    rotateAlways: false,
                    hideOverlappingLabels: true,
                    showDuplicates: false,
                    trim: false,
                    minHeight: undefined,
                    maxHeight: 120,
                    style: {
                        colors: [],
                        fontSize: '1rem',
                        fontFamily: 'Raleway, Arial, sans-serif',
                        fontWeight: 400,
                        cssClass: 'apexcharts-xaxis-label',
                    },
                    offsetX: 0,
                    offsetY: 0,
                    // format: 'MMM/dd h:mm TT',
                    format: 'MMM/dd',
                    formatter: undefined,
                    datetimeUTC: false,
                    datetimeFormatter: {
                        year: 'yyyy',
                        month: "MMM 'yy",
                        day: 'dd MMM',
                        // hour: 'HH:mm',
                    },
                },

            },
            tooltip: {
                theme: "light",
                x: {
                    format: 'MMM dd h:mm TT'
                },



            },
            yaxis: {
                show: true
            },
            grid: {
                row: {
                    colors: ['#f3f4f5', '#fff'],
                    opacity: 1
                }
            }
        },
    });

    const grabStepDates = (ticket) => {

        let tempData = currentData;


        //CLIENT SIDE GET INFO BASED ON A SPECIFIC TICKET
        axios.get("/api/workflow/get-workflow/" + ticket, props.config).then(
            (res) => {
                if (res.data.length === 0) {
                    props.showAlert("No data yet.", "info");
                    return false;
                } else {

                    let selectedTimeline = [];
                    if ((typeof res.data[0].stepsData) === "string") {
                        res.data[0].stepsData = JSON.parse(res.data[0].stepsData);
                    }

                    for (let i = 0; i < res.data[0].stepsData.length; i++) {
                        let colorNumber = Math.floor(Math.random() * tempData.options.fill.colors.length);


                        selectedTimeline.push({
                            x: res.data[0].stepsData[i].stepTitle,
                            y: [
                                new Date(res.data[0].stepsData[i].stepStart).getTime(),
                                new Date(res.data[0].stepsData[i].stepEnd).getTime()
                            ],
                            fillColor: tempData.options.fill.colors[colorNumber]
                        });
                    }
                    //  console.log("JSON.stringify(selectedTimeline): " + JSON.stringify(selectedTimeline));
                    tempData.series[0].data = [...tempData.series[0].data, ...selectedTimeline];
                    tempData.series[0].timelineHeight = selectedTimeline.length * 95;

                    setCurrentData((currentData) => tempData);
                }
            }, (error) => {
                props.showAlert("Something is broken: " + error, "danger");
            }
        );
    }

    const populateFields = () => {
        let tempData = currentData;
        setPerformingUpdate((performingUpdate) => true);

        let whichTicket = document.querySelector("[name='ticketList']").value;

        if (whichTicket === "default") {
            props.setActiveTicket((activeTicket) => null);
            sessionStorage.removeItem("activeTicket");
            return false;
        }


        props.setActiveTicket((activeTicket) => whichTicket);
        sessionStorage.setItem("activeTicket", whichTicket);
        props.getMessages(whichTicket);

        let endYear = whichTicket.substring(whichTicket.indexOf("-due-") + 5).substring(0, 4);
        let endMonth = whichTicket.substring(whichTicket.indexOf("-due-") + 5).substring(5, 7);
        let endDay = whichTicket.substring(whichTicket.indexOf("-due-") + 5).substring(8, 10);

        let starting = whichTicket.substring(0, 10);
        let ending = endYear + "-" + endMonth + "-" + endDay;
        let priorityLevel = document.querySelector("select[name='ticketList'] option[value='" + whichTicket + "']").getAttribute("data-level");

        if (priorityLevel === "low") {
            tempData.options.fill.colors = ["#4A1EFC", "#1A26D9", "#2968EF", "#1A87D9", "#0FD1FA", "#646FD9", "#64AAD9"];
        }
        if (priorityLevel === "medium") {
            tempData.options.fill.colors = ["#FAD907", "#D9D114", "#C5F021", "#6FD914", "#34FC17", "#BFF06F", "#7DD959"];
        }
        if (priorityLevel === "high") {
            tempData.options.fill.colors = ["#FA5505", "#D96E11", "#F09C20", "#D99C11", "#FCCD14", "#D9AD41", "#D98B41"];
        }
        if (priorityLevel === "critical") {
            tempData.options.fill.colors = ["#FC2619", "#D9164D", "#F025BF", "#BE16D9", "#9A0AFA", "#BE3CFA", "#F054B5"];
        }

        let selectedTimeline = [{
            x: whichTicket.substring(whichTicket.lastIndexOf(":") + 1),
            y: [
                new Date(starting).getTime(),
                new Date(ending).getTime()
            ],
            fillColor: tempData.options.fill.colors[0]
        }];

        tempData.series[0].data = selectedTimeline;
        tempData.series[0].timelineHeight = selectedTimeline.length * 95;

        setCurrentData((currentData) => tempData);
        grabStepDates(whichTicket);
        setTimeout(() => {
            setPerformingUpdate((performingUpdate) => false);
        }, 1000);
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

            <div className="col-md-12">
                {(typeof props.ticketInfo) === "object" ?
                    <TicketList ticketInfo={props.ticketInfo} populateFields={populateFields} />
                    : null}
            </div>
            : null}
        <div className="col-md-12">
            <h2>Timeline</h2>
        </div>
        <div className="col-md-12">
            <div className="block" data-chart="timeline">
                {(typeof currentData.series[0].data) === "object" && performingUpdate === false && currentData.series[0].data ?
                    <ReactApexChart options={currentData.options} series={currentData.series} type="rangeBar" height={currentData.timelineHeight} width={window.innerWidth - 50} />
                    : <div className="loader"></div>}
            </div>
        </div>
    </div>)
}

export default Timeline;
