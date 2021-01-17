// explore the json
let jsondata = d3.json("data/samples.json")
// console.log(jsondata)

// defining an empty global variable
let data;

//init function to fill in the select option
function init() {
  d3.json("data/samples.json").then(startdata => {
    data = startdata;
    let values_selected = startdata.names;

    let option_selected = d3.select("#selDataset");

    values_selected.forEach(value => {
      option_selected
        .append("option")
        .text(value)
        .attr("value", function() {
          return value;
        });
    });
  });
}

// start filling the data inside the select option
init();

d3.selectAll("#selDataset").on("change", plots_and_table);

//function for bar plot 
function demographic_table(dataset) {
  let filtered_data_table = data.metadata.filter(value => value.id == dataset);

  let div_value = d3.select(".panel-body");
  div_value.html("");
  div_value.append("p").text(`id: ${filtered_data_table[0].id}`);
  div_value.append("p").text(`ethnicity: ${filtered_data_table[0].ethnicity}`);
  div_value.append("p").text(`gender: ${filtered_data_table[0].gender}`);
  div_value.append("p").text(`age: ${filtered_data_table[0].age}`);
  div_value.append("p").text(`location: ${filtered_data_table[0].location}`);
  div_value.append("p").text(`bbtype: ${filtered_data_table[0].bbtype}`);
  div_value.append("p").text(`wfreq: ${filtered_data_table[0].wfreq}`);
}

// function for demographic table
function bar_plot(dataset) {
  let filtered_data_barplot = data.samples.filter(d => d.id === dataset);
  let otuid = filtered_data_barplot.map(d => d.otu_ids);
  otuid = treatOuid(otuid[0].slice(0, 10));
  let values = filtered_data_barplot.map(d => d.sample_values);
  values = values[0].slice(0, 10);

  let otu_label = filtered_data_barplot.map(v => v.otu_labels);
  let names = treatBacName(otu_label[0]).slice(0, 10);
  
  let trace1 = {
    x: values,
    y: otuid,
    text: names,
    type: "bar",
    orientation: "h"
  };

  let layout = {
    yaxis: {
      autorange: "reversed"
    }
  };

  let data_array = [trace1];

  Plotly.newPlot("bar", data_array, layout);
}

//function for bubble chart 
function bubble_chart(dataset) {
  let filtered_data_bubble = data.samples.filter(d => d.id === dataset);
  let otuid = filtered_data_bubble.map(d => d.otu_ids);
  otuid = otuid[0];
  let values_y = filtered_data_bubble.map(d => d.sample_values);
  values_y = values_y[0];

  let otu_label = filtered_data_bubble.map(d => d.otu_labels);
  otu_label = treatBacName(otu_label[0]);

  let trace2 = {
    x: otuid,
    y: values_y,
    mode: "markers",
    marker: {size: values_y},
    text: otu_label
  };

  let data2 = [trace2];

  let layout = {
    showlegend: false,
    xaxis: { title: "OTU ID" }
  };

  Plotly.newPlot("bubble", data2, layout);
}

//function for gauge chart using value selected
function gauge_chart(dataset) {
  let filter_data_gauge = data.metadata.filter(d => d.id == dataset);
  let weeklyFreq = filter_data_gauge[0].wfreq;

  let data2 = [
    {
      domain: { x: [0, 1], y: [0, 1] },
      title: {text: "Belly Button Washing Frequency - Scrubs per Week"},
      type: "indicator",
      mode: "gauge",
      gauge: {
        axis: {
          range: [0, 9],
          tickvals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          ticks: "outside"
        },
      steps: [
          { range: [0, 1], color: "#a09f74" },
          { range: [1, 2], color: "#a09f55" },
          { range: [2, 3], color: "#a3a13c" },
          { range: [3, 4], color: "#aca909" },
          { range: [4, 5], color: "#9bac09" },
          { range: [5, 6], color: "#7bac09" },
          { range: [6, 7], color: "#60ac09" },
          { range: [7, 8], color: "#45ac09" },
          { range: [8, 9], color: "#2aac09" }
        ],
      threshold: {
          line: { color: "red", width: 4 },
          thickness: 1,
          value: weeklyFreq
        }
      }
    }
  ];

  var layout = { width: 600, height: 500, margin: { t: 0, b: 0 } };
  Plotly.newPlot("gauge", data2, layout);
}

// function that takes the table and the three charts/plots
function plots_and_table() {
  let dataset = d3.select("#selDataset").property("value");
  demographic_table(dataset);
  bar_plot(dataset);
  bubble_chart(dataset);
  gauge_chart(dataset);
}

// function to return the name of the bacteria.
// if an array value has more than one name, it will consider the last name of the value
// return just the 10 first values of the result
function treatBacName(name) {
  let listOfBact = [];

  for (let i = 0; i < name.length; i++) {
    let stringName = name[i].toString();
    let splitValue = stringName.split(";");
    if (splitValue.length > 1) {
      listOfBact.push(splitValue[splitValue.length - 1]);
    } else {
      listOfBact.push(splitValue[0]);
    }
  }
  return listOfBact; 
}

function treatOuid(name) {
  let listOfOtuid = [];
  for (let i = 0; i < name.length; i++) {
    listOfOtuid.push(`OTU ${name[i]}`);
  }
  return listOfOtuid;
}