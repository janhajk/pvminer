function createChart() {
    Highcharts.chart('container', {
        chart: {
            type: 'spline'
        },
        title: {
            text: 'Strom'
        },
        data: {
            rowsURL: 'https://solarweb.servus.janschaer.ch/data/json',
            enablePolling: true,
            dataRefreshRate: 2
        }
    });
}



createChart();