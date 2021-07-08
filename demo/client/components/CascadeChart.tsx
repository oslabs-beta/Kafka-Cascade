import React, { FC, useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import socket from '../socket';
import { ChartConfiguration } from 'chart.js/types/index.esm';
import * as Scales from 'd3-scale-chromatic';

interface ChartProps {
  
}

// interface ChartState {

// }

export const CascadeChart: FC<ChartProps> = (props: ChartProps) => {
  // const [state, setState] = useState(0);
  
  useEffect(() => {
    const colorRangeInfo = {
      colorStart: 0,
      colorEnd: 0.9,
      useEndAsStart: true,
    }; 

    // scale options: https://github.com/d3/d3-scale-chromatic
    const colorScale = Scales.interpolateInferno;
    let colors:any;

    const config = {
      type: 'bar',
      options: {
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false,
            }
          },
          x: {
            grid: {
              display: false,
            }
          }
        },
      },
      data: {
        labels:[],
        datasets: [{
          axis: 'y',
          backgroundColor: colors,
          borderColor: colors,
          data: [],
          borderWdith: 0,
        }]
      }
    }

    // config.data.labels = ['Initial Success', '1st Retry', '2nd Retry', '3rd Retry', '4th Retry', '5th Retry', 'DLQ']; 
    // config.data.datasets[0].data = [10,20,40,100,60,40,15];

    const chart = new Chart((document.getElementById('chartId') as HTMLCanvasElement), config as ChartConfiguration);
    socket.addListener('heartbeat', (payload:any) => {
      config.data.datasets[0].data = payload.levelCounts;

      if(config.data.labels.length !== payload.levelCounts.length) {
        colors = interpolateColors(payload.levelCounts.length, colorScale, colorRangeInfo);
        config.data.datasets[0].backgroundColor = colors;
        config.data.datasets[0].borderColor = colors;
        config.data.labels = buildLabels(payload.levelCounts.length);
      }

      chart.update();
    });
  });

  return (
    <div>
      <canvas id="chartId"></canvas>
    </div>
  );
}

function interpolateColors(dataLength:number, colorScale:any, colorRangeInfo: {colorStart: number, colorEnd: number, useEndAsStart:boolean}) {
  const { colorStart, colorEnd } = colorRangeInfo;
  const colorRange = colorEnd - colorStart;
  const colorArray = [];

  for (let i = 0; i < dataLength; i++) {
    const colorPoint = calculatePoint(i, colorRange / dataLength, colorRangeInfo);
    colorArray.push(colorScale(colorPoint));
  }

  return colorArray;
} 

function calculatePoint(i:number, intervalSize:number, colorRangeInfo: {colorStart: number, colorEnd: number, useEndAsStart:boolean}) {
  const { colorStart, colorEnd, useEndAsStart } = colorRangeInfo;
  return (useEndAsStart
    ? (colorEnd - (i * intervalSize))
    : (colorStart + (i * intervalSize)));
}

function buildLabels(count:number) {
  const labels = new Array(count);
  labels[0] = 'Initial Success';
  labels[count-1] = 'DLQ';
  for(let i = 1; i < count - 1; i++) {
    if(i === 1) labels[i] = '1st Retry';
    else if(i === 2) labels[i] = '2nd Retry';
    else if(i === 3) labels[i] = '3rd Retry';
    else labels[i] = i + 'th Retry';
  }
  return labels;
}
