import { Component, OnInit, AfterViewInit } from "@angular/core";
import {ChartConfiguration } from "chart.js";
import Chart from 'chart.js/auto';

@Component({
  selector: "app-card-bar-chart",
  templateUrl: "./card-bar-chart.component.html",
  standalone: true
})
export class CardBarChartComponent implements OnInit, AfterViewInit {
  constructor() {}

  ngOnInit() {}
  ngAfterViewInit() {
    const config: ChartConfiguration<"bar"> = {
      type: "bar",
      data: {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [
          {
            label: `${new Date().getFullYear()}`,
            backgroundColor: "#ed64a6",
            borderColor: "#ed64a6",
            data: [30, 78, 56, 34, 100, 45, 13],
            barThickness: 8,
          },
          {
            label: `${new Date().getFullYear() - 1}`,
            backgroundColor: "#4c51bf",
            borderColor: "#4c51bf",
            data: [27, 68, 86, 74, 10, 4, 87],
            barThickness: 8,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: "rgba(0,0,0,.4)", // Legend label color
            },
            align: "end",
            position: "bottom",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
          title: {
            display: false,
            text: "Orders Chart",
          },
        },
        interaction: {
          mode: "nearest",
          intersect: true,
        },
        scales: {
          x: {
            ticks: {
              color: "rgba(255,255,255,.7)", // Updated for Chart.js v4
            },
            display: true,
            title: {
              display: false,
              text: "Month",
              color: "white", // Updated to 'color'
            },
            grid: {
              display: false,
              color: "rgba(33, 37, 41, 0.3)",
            },
          },
          y: {
            ticks: {
              color: "rgba(255,255,255,.7)", // Updated for Chart.js v4
            },
            display: true,
            title: {
              display: false,
              text: "Value",
              color: "white", // Updated to 'color'
            },
            grid: {
              color: "rgba(255, 255, 255, 0.15)",
            },
          },
        },
      },
    };
    
    // Initialize the chart
    const canvas = document.getElementById("bar-chart") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      new Chart(ctx, config);
    }
    
    
  }
}
