const container = document.getElementById("container");
const tooltip = document.createElement("div");
tooltip.setAttribute("id", "tooltip");
container.appendChild(tooltip);

fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
)
  .then((response) => response.json())
  .then((response) => {
    const data = response;

    makeScatterPlot(data);
  });

function makeScatterPlot(data) {
  const getYear = (d) => {
    let year = new Date(0, 0, 1, 0, 0, 0, 0);
    year.setFullYear(d["Year"]);
    return year;
  };

  const getMinSec = (d) => {
    let [mm, ss] = d["Time"].split(":").map((x) => Number(x));
    let date = new Date(0, 0, 0, 0, 0, 0, 0);
    date.setMinutes(mm);
    date.setSeconds(ss);
    return date;
  };

  const minX = d3.min(data, (d) => getYear(d));
  const maxX = d3.max(data, (d) => getYear(d));

  const minY = d3.min(data, (d) => getMinSec(d));
  const maxY = d3.max(data, (d) => getMinSec(d));

  const yPad = 1;

  minX.setFullYear(minX.getFullYear() - yPad);
  maxX.setFullYear(maxX.getFullYear() + yPad);

  // Next Make scale to fit the whole thing
  const w = 900;
  const h = 600;
  const padding = 60;

  const xScale = d3
    .scaleTime()
    .domain([minX, maxX])
    .range([padding, w - padding]);

  const yScale = d3
    .scaleTime()
    .domain([minY, maxY])
    .range([padding, h - padding]);

  const svg = d3
    .select(".container")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  // Title code starts here
  
  svg.append("text")
    .attr("id", "title")
    .attr("class", "title")
    .attr("text-anchor", "middle")
    .attr("x", w / 2)
    .attr("y", padding / 2)
    .text("Doping In Professional Bicycle Racing")
  
  // Y-axis label code starts here
  
  svg.append("text")
    .attr("id", "y-label")
    .attr("text-anchor", "end")
    .attr("x", padding + 40)
    .attr("y", h / 12)
    .text("Time (mins)");
  
  // X-axis label code starts here
  
  svg.append("text")
    .attr("id", "x-label")
    .attr("text-anchor", "middle")
    .attr("x", w / 2)
    .attr("y", h - padding / 3)
    .text("Year");
 
  // Legend code start here

  let legend = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", `translate(${w - 2 * padding - 150}, ${padding + 10})`);

  legend
    .append("rect")
    .attr("width", 120)
    .attr("height", "3em")
    .attr("fill", "none");

  let legendData = [
    { class: "doping", text: "Riders with doping allegations" },
    { class: "not-doping", text: "No doping allegations" }
  ];

  legend
    .selectAll("rect")
    .exit()
    .data(legendData)
    .enter()
    .append("rect")
    .attr("class", (d) => d.class)
    .attr("x", "0.25em")
    .attr("y", (d, i) => `${0.25 + i * 1.5}em`)
    .attr("width", "1em")
    .attr("height", "1em");

  legend
    .selectAll("text")
    .exit()
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", "1.5em")
    .attr("y", (d, i) => `${1.1 + i * 1.5}em`)
    .attr("font-size", "1em")
    .text((d) => d.text);

  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .classed("dot", true)
    .classed("doping", (d, i) => d["Doping"] !== "")
    .classed("not-doping", (d, i) => d["Doping"] === "")
    .attr("cx", (d, i) => xScale(getYear(d)))
    .attr("cy", (d, i) => yScale(getMinSec(d)))
    .attr("r", 7)
    .attr("data-xvalue", (d) => getYear(d))
    .attr("data-yvalue", (d) => getMinSec(d))
    .on("mouseover", (d, i) => {
      // d doesnt not represent data here. For some reason, i, originally for index, is the data. The same issue as the Bar Graph project
      tooltip.setAttribute("data-year", getYear(i));
      tooltip.style.visibility = "visible";
      tooltip.style.transform = `translate(${
        xScale(getYear(i)) + 10
      }px, ${yScale(getMinSec(i))}px )`;

      let info = [
        `${i["Name"]} (${i["Nationality"]})`,
        `Year: ${i["Year"]}`,
        `Place: ${i["Place"]}`,
        `Time: ${i["Time"]}`,
        `Doping: ${i["Doping"]}`,
        `URL: ${i["URL"]}`
      ];
      tooltip.innerHTML = info.join("<br>");
    })
    .on("mouseout", (d) => {
      tooltip.style.visibility = "hidden";
    });

  // Make a tooltip here
  // First make a div element by appending to the container div and then change its style visibility on the mouse over in svg

  let timeFormat = d3.timeFormat("%M:%S");
  const xAxis = d3
    .axisBottom(xScale)
    .tickFormat(d3.scaleTime().tickFormat(10, "%Y"));
  const yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);

  svg
    .append("g")
    .attr("transform", `translate(0, ${h - padding})`)
    .attr("id", "x-axis")
    .call(xAxis);
  svg
    .append("g")
    .attr("transform", `translate(${padding}, 0)`)
    .attr("id", "y-axis")
    .call(yAxis);
}