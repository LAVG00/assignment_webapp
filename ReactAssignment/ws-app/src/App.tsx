import React from 'react';
import './App.css';
import { Chart ,ChartConfiguration, ChartDataset, LineController, LineElement  } from "chart.js/auto"
import tasksData from './json_data/tasks.json';
import wsData from './json_data/ws.json';
import { IDurationsByJobTaskId, ITaskType } from './Types';
import ChartDataLabels,  {Context} from 'chartjs-plugin-datalabels';


function App() {
  const chartRef = React.useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = React.useRef<Chart | null>(null);
  const [displayDatasets, setdisplayDatasets] = React.useState(true)
  const [legendItems, setLegendItems] = React.useState<any[]>([]);
  const [dropdownState, setDropdownState] = React.useState(false);

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

  function processTaskData(): ITaskType{
    const taskNamesbyId: ITaskType = {};
    tasksData.data.forEach((item => {
      const { Id, TaskName, Color } = item;
      taskNamesbyId[Id]= { [TaskName]: Color};
    }))
    return taskNamesbyId;
  }

  function generateUniqueHours(data: IDurationsByJobTaskId) {
    return Array.from(
      new Set(Object.values(data).flatMap((hourData: any) => Object.keys(hourData)))
    );
  }

  function generateDatasets(wsData: IDurationsByJobTaskId, taskData: ITaskType , uniqueHours: string[]){
    const barDatasets = Object.entries(wsData).map(([jobTaskId, hourData]) => {
      const taskName = taskData[jobTaskId] ? Object.keys(taskData[jobTaskId])[0] : jobTaskId;
      const taskColor = taskData[jobTaskId] ? Object.values(taskData[jobTaskId])[0] : 'transparent';
      return {
        label: taskName,
        data: uniqueHours.map((hour: any) => hourData[hour] ?? 0),
        backgroundColor: taskColor,
        stack: 'stack'
      }
    });
    const lineDataset = {
      label: 'Total',
      data: uniqueHours.map( (hour: any) => Object.values(wsData).reduce( (total,hourData) => total + (hourData[hour] ?? 0),0)),
      backgroundColor: 'blue',
      borderColor: 'blue',
      type: 'line',
      fill: false
    }


    return [lineDataset, ...barDatasets];
  }

  function hideShowAll() {
    console.log(displayDatasets)
    chartInstanceRef.current?.data.datasets.forEach( (dataset, index) => {
      if(displayDatasets) {
        chartInstanceRef.current?.hide(index)
      } else {
        chartInstanceRef.current?.show(index)
      }
      setdisplayDatasets(!displayDatasets);
    });
    
  }

  function toggleDropdown() {
    setDropdownState((prevState) => !prevState);
  }

  function toggleDataset(index: number, item: any) {
    const meta = chartInstanceRef.current?.getDatasetMeta(index);
    if (meta) {
      meta.hidden = !meta.hidden;
      chartInstanceRef.current?.update();

      setLegendItems(prevLegendItems => {
        const updatedItems = prevLegendItems.map((item, i) => {
          if (i === index) {
            return {...item,hidden: meta.hidden};
          }
          return item;
        });
        return updatedItems;
      });
    }
    
  }

  React.useEffect(()=>{
    const durationsByJobTaskId = processWSData();
    const taskNamesbyId = processTaskData();
    const uniqueHours = generateUniqueHours(durationsByJobTaskId);
    const datasets = generateDatasets(durationsByJobTaskId, taskNamesbyId , uniqueHours);
    const chartConfig: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: uniqueHours,
        datasets: datasets as ChartDataset<'bar', number[]>[],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
            },
            stacked: true,
          },
          y: {
            title: {
              display: true,
            },
            stacked: true,
          },
        },
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            color: 'White',
            display: 'auto',
            align: "center",
            formatter: (value:any, context:Context) => {
              if(value > 0){
                return value 
              } else{
                return ""
              }
            }
          }
        }
      },
    };

    const ctx = chartRef.current?.getContext('2d');
    if (ctx) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      Chart.register(LineController, LineElement, ChartDataLabels);
      chartInstanceRef.current = new Chart(ctx, chartConfig);
      if(chartInstanceRef.current.legend && chartInstanceRef.current.legend.legendItems) {
        setLegendItems(chartInstanceRef.current.legend.legendItems);
      } else {
        setLegendItems([]);
      }
    }
  }, [])

  return (
    <div className="App">
      <div className="menu-container">
        <div className={`dropdown-menu${dropdownState ? ' active' : ''}`}>
          <div className="dropdown-menu-button" onClick={toggleDropdown}>
            Tasks
          </div>
          <div className="dropdown-menu-content">
            {legendItems.map((legendItem: any, i: number) => (
              <div key={i} className={`legend-item${legendItem.hidden ? ' legend-item-hidden' : ''}`}  onClick={() => toggleDataset(i, legendItem)}>
                <span className="legend-marker" style={{ backgroundColor: legendItem.fillStyle }}></span>
                <span className="legend-text">{legendItem.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="dropdown-menu-button" onClick={hideShowAll} >{displayDatasets ? 'Hide Datasets' : 'Show Datasets'}  </div>
      </div>
      <canvas ref={chartRef}></canvas>
      
    </div>
  );
}

export default App;
