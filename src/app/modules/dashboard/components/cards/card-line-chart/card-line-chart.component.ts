import { Component, OnInit, AfterViewInit } from "@angular/core";
import { ChartConfiguration } from "chart.js";
import Chart from 'chart.js/auto';

@Component({
  selector: "app-card-line-chart",
  templateUrl: "./card-line-chart.component.html",
  standalone: true
})
export class CardLineChartComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
    ngAfterViewInit() {
    const config: ChartConfiguration<"line"> = {
      type: "line",
      data: {
        labels: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
        ],
        datasets: [
          {
            label: `${new Date().getFullYear()}`, // Ensure the label is a string
            backgroundColor: "rgba(76, 81, 191, 0.2)", // Add transparency for fill effect
            borderColor: "#4c51bf",
            data: [65, 78, 66, 44, 56, 67, 75],
            fill: false,
          },
          {
            label: `${new Date().getFullYear() - 1}`, // Ensure the label is a string
            fill: false,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderColor: "#fff",
            data: [40, 68, 86, 74, 56, 60, 87],
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: "white", // Updated from 'fontColor' to 'color'
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
            text: "Sales Charts",
            color: "white", // Updated from 'fontColor' to 'color'
          },
        },
        interaction: {
          mode: "nearest",
          intersect: true,
        },
        scales: {
          x: {
            ticks: {
              color: "rgba(255,255,255,.7)", // Updated from 'fontColor' to 'color'
            },
            grid: {
              display: false,
              color: "rgba(33, 37, 41, 0.3)",
            },
          },
          y: {
            ticks: {
              color: "rgba(255,255,255,.7)", // Updated from 'fontColor' to 'color'
            },
            grid: {
              color: "rgba(255, 255, 255, 0.15)",
            },
          },
        },
      },
    };
    
    // Get the canvas element and initialize the chart
    const canvas = document.getElementById("line-chart") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      new Chart(ctx, config);
    }
    
    
  }
}
