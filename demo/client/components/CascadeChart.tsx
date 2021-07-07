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
      colorEnd: 1,
      useEndAsStart: false,
    }; 

    const colors = interpolateColors(7, Scales.interpolateCool, colorRangeInfo);

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
          },
          x: {
            ticks: {
              color: 'rgb(1,1,1)',
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

    config.data.labels = ['Initial Success', '1 Retry', '2 Retry', '3 Retry', '4 Retry', '5 Retry', 'DLQ']; 
    config.data.datasets[0].data = [10,20,40,100,60,40,15];
    const chart = new Chart((document.getElementById('chartId') as HTMLCanvasElement), config as ChartConfiguration);
    socket.addListener('heartbeat', (payload:any) => {
      config.data.labels = payload.topics;
      config.data.datasets[0].data = payload.levelCounts;
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
