import { Component, OnInit, Input } from "@angular/core";
import * as d3 from "d3";

@Component({
  selector: "app-d3-line-chart",
  templateUrl: "./d3-line-chart.component.html",
  styleUrls: ["./d3-line-chart.component.scss"]
})
export class D3LineChartComponent implements OnInit {
  @Input() data: any;
  constructor() {}

  ngOnInit() {}

  ngAfterContentInit() {
    // Define margins, dimensions, and some line colors
    const margin = { top: 40, right: 120, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Define the scales and tell D3 how to draw the line
    const x = d3
      .scaleLinear()
      .domain([1910, 2010])
      .range([0, width]);
    const y = d3
      .scaleLinear()
      .domain([0, 40000000])
      .range([height, 0]);
    const line = d3
      .line()
      .defined(d => d)
      .x(d => x(d.year))
      .y(d => y(d.population));

    const chart = d3
      .select("svg")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const tooltip = d3.select("#tooltip");
    const tooltipLine = chart.append("line");

    // Add the axes and a title
    const xAxis = d3.axisBottom(x).tickFormat(d3.format(".4"));
    const yAxis = d3.axisLeft(y).tickFormat(d3.format(".2s"));
    chart.append("g").call(yAxis);
    chart
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
    chart
      .append("text")
      .html("State Population Over Time")
      .attr("x", 200);

    // Load the data and draw a chart
    let states, tipBox;

    states = this.data;

    chart
      .selectAll()
      .data(states)
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", d => d.color)
      .attr("stroke-width", 2)
      .datum(d => d.history)
      .attr("d", line);

    chart
      .selectAll()
      .data(states)
      .enter()
      .append("text")
      .html(d => d.name)
      .attr("fill", d => d.color)
      .attr("alignment-baseline", "middle")
      .attr("x", width)
      .attr("dx", ".5em")
      .attr("y", d => y(d.currentPopulation));

    var mouseG = chart.append("g").attr("class", "mouse-over-effects");
    tipBox = mouseG
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("opacity", 0)
      .on("mousemove", drawTooltip)
      .on("mouseout", removeTooltip);

    var mousePerLine = mouseG
      .selectAll(".mouse-per-line")
      .data(states)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    mousePerLine
      .append("circle")
      .attr("r", 4)
      .attr("data-idx", (d, i) => i)
      .style("fill", d => d.color)
      .style("opacity", "0");

    function removeTooltip() {
      if (tooltip) tooltip.style("display", "none");
      if (tooltipLine) tooltipLine.attr("stroke", "none");

      d3.selectAll(".mouse-per-line circle").style("opacity", "0");
    }

    function drawTooltip() {
      const year =
        Math.floor((x.invert(d3.mouse(tipBox.node())[0]) + 5) / 10) * 10;

      /* states.sort((a, b) => {
        return (
          b.history.find(h => h.year == year).population -
          a.history.find(h => h.year == year).population
        );
      }); */

      states.forEach((state, i) => {
        for (let h of state.history) {
          if (h && h.year === year) {
            let p = h.population;

            let posY = y(p);
            let posX = x(year);
            let selector = `circle[data-idx="${i}"]`;
            d3.select(selector).attr(
              "transform",
              `translate(${posX}, ${posY})`
            );
          }
        }
      });

      tooltipLine
        .attr("stroke", "black")
        .attr("x1", x(year))
        .attr("x2", x(year))
        .attr("y1", 0)
        .attr("y2", height);

      d3.selectAll(".mouse-per-line circle").style("opacity", "1");

      tooltip
        .html(year)
        .style("display", "block")
        .style("left", `${d3.event.pageX + 20}px`)
        .style("top", `${d3.event.pageY - 20}px`)
        .selectAll()
        .data(states)
        .enter()
        .append("div")
        .style("color", d => d.color)
        .html(d => {
          //d.name + ": " + d.history.find(h => h.year == year).population;

          let name = d.name;
          let msg = "";

          for (let h of d.history) {
            if (h && h.year === year) {
              msg = name + ": " + h.population;
            }
          }

          return msg;
        });
    }
  }
}
