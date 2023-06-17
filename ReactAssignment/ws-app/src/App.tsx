import React from 'react';
import './App.css';
import Chart, { ChartConfiguration  } from "chart.js/auto"
import tasksData from './json_data/tasks.json';
import wsData from './json_data/ws.json';
import { IDurationsByJobTaskId } from './Types';


function App() {
  const chartRef = React.useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = React.useRef<Chart | null>(null);

  function processWSData(): IDurationsByJobTaskId {
    const durationsByJobTaskId: IDurationsByJobTaskId = {};

    wsData.data.List.forEach((item) => {
      const { Hour, JobTaskId, Override } = item;

      const duration = Override?.Duration ?? 0;

      if(!durationsByJobTaskId[JobTaskId]) {
        durationsByJobTaskId[JobTaskId] = {};
      }

      if(durationsByJobTaskId[JobTaskId][Hour]) {
        durationsByJobTaskId[JobTaskId][Hour] += duration
      } else{
        durationsByJobTaskId[JobTaskId][Hour] = duration;
      }


    });
    return durationsByJobTaskId;
  }

  function getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
  
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
  
    return color;
  }


  React.useEffect(()=>{
    const durationsByJobTaskId = processWSData();
    const uniqueHours = Array.from(
      new Set(
        Object.values(durationsByJobTaskId)
          .flatMap((hourData) => Object.keys(hourData))
      )
    );

    const datasets = Object.entries(durationsByJobTaskId).map(([jobTaskId, hourData], index) => ({
      label: jobTaskId,
      data: uniqueHours.map((hour:any) => hourData[hour] ?? 0),
      backgroundColor: getRandomColor(),
      stack: 'stack',
    }));

    const chartConfig: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: uniqueHours,
        datasets: datasets,
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Hour',
            },
            stacked: true,
          },
          y: {
            title: {
              display: true,
              text: 'Duration',
            },
            stacked: true,
          },
        },
      },
    };

    const ctx = chartRef.current?.getContext('2d');
    if (ctx) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      chartInstanceRef.current = new Chart(ctx, chartConfig);
    }

        console.log(uniqueHours)
    console.log(durationsByJobTaskId);
  }, [])

  return (
    <div className="App">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

export default App;
