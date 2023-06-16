
export async function draw(param) {
    try {
        console.log(param)

        if (window.myChart !== undefined) {
            console.log('destroy', window.myChart)
            window.myChart.destroy();
        }

        const response = await fetch('../sample-data/reports.json');
        const reports = await response.json();
        const mostRecentDay = new Date(Math.max(...reports.map(report => new Date(report.WorkDate))));
        const lastSevenDays = [];
        const maintenanceTimePerDay = {};

        //Obtain last 7 days from the most recent date
        for(let i = 6; i >= 0 ; i--){
            const date = param !== undefined ? new Date(param) : new Date(mostRecentDay);
            date.setDate(date.getDate() - i);
            lastSevenDays.unshift(date.toLocaleDateString('ja-JP').replace(/\//g, '-'));
        }

        //initialize maintenanceTimePerDay
        lastSevenDays.forEach(date => { maintenanceTimePerDay[date] = 0});

        //Assign maintenance time to date
        reports.forEach(report => {
            const workDate = new Date(report.WorkDate).toLocaleDateString('ja-JP').replace(/\//g, '-');
            const maintenanceTime = report.WorkTime.Maintenance;
            if(maintenanceTimePerDay.hasOwnProperty(workDate)) {
                maintenanceTimePerDay[workDate] += maintenanceTime;
            }
        })

        const datesArray = Object.keys(maintenanceTimePerDay)
        const maintenanceTimeArray = Object.values(maintenanceTimePerDay)

    // and just rendering very simple chart according to tutorial page: https://www.chartjs.org/docs/latest/getting-started/usage.html
    const ctx = document.getElementById('chartCanvas');
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: datesArray,
            datasets: [{
                label: 'Maintenance Time(Min):',
                data: maintenanceTimeArray,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 3
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
} catch(e) {
    console.log('Error', e)
}
};
