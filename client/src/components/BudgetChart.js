import React, { Component, ReactDOM } from "react";
import ReactApexChart from 'react-apexcharts';

class BudgetChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            series: [],
            total: 0,
            chartWidth: 400,
            position: 'left',
            horizontalAlign: 'left',
            offsetX: 0,
            offsetY: 0,
            dataLabels: {
                enabled: false,
            },

            options: {
                fill: {
                    colors: props.theColors
                },
                breakpoint: 500,
                chart: {
                    height: "80%",
                    width: "80%",
                    position: 'center',
                    horizontalAlign: 'center',
                },
                legend: {
                    show: false,

                    showForSingleSeries: false,
                    showForNullSeries: true,
                    showForZeroSeries: true,
                    position: 'center',
                    horizontalAlign: 'center',
                    floating: true,
                    formatter: undefined,
                    inverseOrder: false,
                    width: "80%",
                    height: "auto",
                    onItemClick: {
                        toggleDataSeries: true
                    },
                    onItemHover: {
                        highlightDataSeries: true
                    },
                    tooltipHoverFormatter: undefined,
                    customLegendItems: [],
                    offsetX: 0,
                    offsetY: 0,
                    labels: {
                        colors: undefined,
                        useSeriesColors: false
                    },
                    markers: {
                        width: 12,
                        height: 12,
                        strokeWidth: 0,
                        strokeColor: '#fff',
                        fillColors: undefined,
                        radius: 12,
                        customHTML: undefined,
                        onClick: undefined,
                        offsetX: 0,
                        offsetY: 0
                    },
                    itemMargin: {
                        horizontal: 0,
                        vertical: 0
                    },
                    onItemClick: {
                        toggleDataSeries: true
                    },
                    onItemHover: {
                        highlightDataSeries: true
                    },
                },
                labels: [],
                plotOptions: {
                    pie: {
                        donut: {
                            labels: {
                                show: true,
                            },
                            size: '80%'
                        }
                    },
                    bar: {
                        dataLabels: {
                            position: 'bottom'
                        }
                    }
                },
                responsive: [
                    {

                        options: {
                            chart: {
                                width: "80%",
                                height: "80%",
                                position: 'center',
                                horizontalAlign: 'center',
                                offsetX: 0,
                                offsetY: 0,

                            },

                            legend: {

                                width: 150,
                                height: "auto",
                                position: 'center',
                                horizontalAlign: 'center',
                                offsetX: 0,
                                offsetY: 0,
                            }
                        }
                    }
                ]
                ,
                xaxis: {
                    type: 'datetime'
                },
                plotOptions: {
                    pie: {
                        customScale: 1,
                        labels: false,

                    }
                }
            },
        };
        this.updatePie = this.updatePie.bind(this);
    }

    updatePie = () => {
        let tempTotal = 0;
        let amounts = this.props.amounts
        for (let i = 0; i < amounts.length; i++) {
            tempTotal = tempTotal + amounts[i];
        }
        this.setState({
            total: tempTotal,
            series: amounts,
            options: {
                labels: this.props.labels,
            }
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.options.labels !== this.props.labels && this.props.amounts !== this.state.series) {

            this.updatePie();
        }
    }
    render() {
        return (<div className="card">
            <h5 className="card-title m-2">{this.props.title}</h5>
            <div id="chart" data-chart="income" className="d-flex justify-content-center card-body">
                <ReactApexChart options={this.state.options} series={this.props.amounts} type="donut" width={this.state.chartWidth} />
            </div>
        </div>
        );
    }
}

export default BudgetChart;

