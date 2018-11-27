function createChart() {
    Highcharts.stockChart('container', {
        chart: {
            type: 'spline',
            zoomType: 'x'
        },
        title: {
            text: 'Strom'
        },
        time: {
            timezone: 'Europe/Berlin',
            useUTC: false
        },
        data: {
            rowsURL: 'https://solarweb.servus.janschaer.ch/data/json/minute',
            enablePolling: true,
            dataRefreshRate: 60
        },
        xAxis: {
            type: 'datetime',
            plotBands: [{
                from: 4.5,
                to: 6.5,
                color: 'rgba(68, 170, 213, .2)'
            }]
        },
        yAxis: {
            title: {
                text: 'Strom [kW]'
            }
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
        }
    });
}



createChart();


function getSix() {
    var d = new Date(); // Today
    var tag = d.getDate();
    var monat = d.getMonth();
    var jahr = d.getFullYear();
    if (d.getHours() < 6) tag--;
    
}