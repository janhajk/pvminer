$.getJSON(
    'https://solarweb.servus.janschaer.ch/data/json',
    function(data) {

        Highcharts.chart('container', {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: 'Strom'
            },
            subtitle: {
                text: document.ontouchstart === undefined ?
                    'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'kW'
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },
            data: {
                columnsURL: 'https://solarweb.servus.janschaer.ch/data/json',
                dataRefreshRate: 2,
                enablePolling: true,
                firstRowAsNames: false
            },
            series: [{
                    type: 'area',
                    name: 'Stromproduktion',
                },
                {
                    type: 'area',
                    name: 'Stromverbrauch',
                }
            ]
        });
    }
);
