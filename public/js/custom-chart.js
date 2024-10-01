// (function ($) {
//     "use strict";

//     /*Sale statistics Chart*/
//     if ($('#myChart').length) {
//         var ctx = document.getElementById('myChart').getContext('2d');
//         var chart = new Chart(ctx, {
//             // The type of chart we want to create
//             type: 'line',
            
//             // The data for our dataset
//             data: {
//                 labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//                 datasets: [{
//                         label: 'Sales',
//                         tension: 0.3,
//                         fill: true,
//                         backgroundColor: 'rgba(44, 120, 220, 0.2)',
//                         borderColor: 'rgba(44, 120, 220)',
//                         data: [18, 17, 4, 3, 2, 20, 25, 31, 25, 22, 20, 9]
//                     },
//                     {
//                         label: 'Visitors',
//                         tension: 0.3,
//                         fill: true,
//                         backgroundColor: 'rgba(4, 209, 130, 0.2)',
//                         borderColor: 'rgb(4, 209, 130)',
//                         data: [40, 20, 17, 9, 23, 35, 39, 30, 34, 25, 27, 17]
//                     },
//                     {
//                         label: 'Products',
//                         tension: 0.3,
//                         fill: true,
//                         backgroundColor: 'rgba(380, 200, 230, 0.2)',
//                         borderColor: 'rgb(380, 200, 230)',
//                         data: [30, 10, 27, 19, 33, 15, 19, 20, 24, 15, 37, 6]
//                     }

//                 ]
//             },
//             options: {
//                 plugins: {
//                 legend: {
//                     labels: {
//                     usePointStyle: true,
//                     },
//                 }
//                 }
//             }
//         });
//     } //End if

//     /*Sale statistics Chart*/
//     if ($('#myChart2').length) {
//         var ctx = document.getElementById("myChart2");
//         var myChart = new Chart(ctx, {
//             type: 'bar',
//             data: {
//             labels: ["900", "1200", "1400", "1600"],
//             datasets: [
//                 {
//                     label: "US",
//                     backgroundColor: "#5897fb",
//                     barThickness:10,
//                     data: [233,321,783,900]
//                 }, 
//                 {
//                     label: "Europe",
//                     backgroundColor: "#7bcf86",
//                     barThickness:10,
//                     data: [408,547,675,734]
//                 },
//                 {
//                     label: "Asian",
//                     backgroundColor: "#ff9076",
//                     barThickness:10,
//                     data: [208,447,575,634]
//                 },
//                 {
//                     label: "Africa",
//                     backgroundColor: "#d595e5",
//                     barThickness:10,
//                     data: [123,345,122,302]
//                 },
//             ]
//             },
//             options: {
//                 plugins: {
//                     legend: {
//                         labels: {
//                         usePointStyle: true,
//                         },
//                     }
//                 },
//                 scales: {
//                     y: {
//                         beginAtZero: true
//                     }
//                 }
//             }
//         });
//     } //end if
    
// })(jQuery);


// (function ($) {
//     "use strict";
  
//     var ctx = document.getElementById('myChart').getContext('2d');
//     var chart;
  
//     // Function to initialize the chart
//     function initializeChart(labels, data) {
//       if (chart) {
//         chart.destroy(); // Destroy previous chart instance
//       }
  
//       chart = new Chart(ctx, {
//         type: 'line',
//         data: {
//           labels: labels,
//           datasets: [{
//             label: 'Sales',
//             tension: 0.3,
//             fill: true,
//             backgroundColor: 'rgba(44, 120, 220, 0.2)',
//             borderColor: 'rgba(44, 120, 220)',
//             data: data
//           }]
//         },
//         options: {
//           plugins: {
//             legend: {
//               labels: {
//                 usePointStyle: true,
//               },
//             }
//           }
//         }
//       });
//     }
  
//     // Default: Show monthly data
//     var monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//     var monthlyData = [18, 17, 4, 3, 2, 20, 25, 31, 25, 22, 20, 9];
  
//     initializeChart(monthlyLabels, monthlyData);
  
//     // Function to handle the filter change
//     function updateChart(period) {
//       let labels, data;
  
//       switch (period) {
//         case 'daily':
//           labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
//           data = [5, 10, 7, 8, 12, 15, 9]; // Example daily data
//           break;
//         case 'weekly':
//           labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4','Week 5','Week 6','Week 7'];
//           data = [100, 200, 150, 250]; // Example weekly data
//           break;
//         case 'monthly':
//           labels = monthlyLabels;
//           data = monthlyData;
//           break;
//         case 'yearly':
//           labels = ['2023', '2024', '2025', '2026'];
//           data = [5000, 7000, 8000, 9500]; // Example yearly data
//           break;
//         default:
//           labels = monthlyLabels;
//           data = monthlyData;
//       }
  
//       initializeChart(labels, data);
//     }
  
//     // Event listeners for the buttons
//     $('#dailyBtn').on('click', function () {
//       updateChart('daily');
//     });
  
//     $('#weeklyBtn').on('click', function () {
//       updateChart('weekly');
//     });
  
//     $('#monthlyBtn').on('click', function () {
//       updateChart('monthly');
//     });
  
//     $('#yearlyBtn').on('click', function () {
//       updateChart('yearly');
//     });
  
//   })(jQuery);
//   document.addEventListener("DOMContentLoaded", () => {
//     const dailySales = JSON.parse(document.getElementById('dailySales').value);
//     const weeklySales = JSON.parse(document.getElementById('weeklySales').value);
//     const monthlySales = JSON.parse(document.getElementById('monthlySales').value);
//     const yearlySales = JSON.parse(document.getElementById('yearlySales').value);
  
//     // Function to update the chart based on the selected time period
//     const updateChart = (labels, data) => {
//       initializeChart(labels, data);
//     };
  
//     // Event listeners for the buttons
//     document.getElementById('dailyBtn').addEventListener('click', () => {
//       updateChart(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], dailySales);
//     });
  
//     document.getElementById('weeklyBtn').addEventListener('click', () => {
//       updateChart(['Week 1', 'Week 2', 'Week 3', 'Week 4'], weeklySales);
//     });
  
//     document.getElementById('monthlyBtn').addEventListener('click', () => {
//       updateChart(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], monthlySales);
//     });
  
//     document.getElementById('yearlyBtn').addEventListener('click', () => {
//       updateChart(['2021', '2022', '2023', '2024'], yearlySales);
//     });
//   });
  
//   document.addEventListener("DOMContentLoaded", () => {
//     const dailySales = document.getElementById('dailySales').value;
//     const weeklySales = document.getElementById('weeklySales').value;
//     const monthlySales = document.getElementById('monthlySales').value;
//     const yearlySales = document.getElementById('yearlySales').value;

//     const updateChart = (salesData) => {
//         // Assuming you have a chart instance already created (myChart)
//         myChart.data.datasets[0].data = salesData;
//         myChart.update();
//     };

//     document.getElementById('dailyBtn').addEventListener('click', () => updateChart([dailySales]));
//     document.getElementById('weeklyBtn').addEventListener('click', () => updateChart([weeklySales]));
//     document.getElementById('monthlyBtn').addEventListener('click', () => updateChart([monthlySales]));
//     document.getElementById('yearlyBtn').addEventListener('click', () => updateChart([yearlySales]));
// });

// (function ($) {
//     "use strict";
  
//     var ctx = document.getElementById('myChart').getContext('2d');
//     var chart;
  
//     // Function to initialize the chart
//     function initializeChart(labels, data) {
//       if (chart) {
//         chart.destroy(); // Destroy previous chart instance
//       }
  
//       chart = new Chart(ctx, {
//         type: 'line',
//         data: {
//           labels: labels,
//           datasets: [{
//             label: 'Sales',
//             tension: 0.3,
//             fill: true,
//             backgroundColor: 'rgba(44, 120, 220, 0.2)',
//             borderColor: 'rgba(44, 120, 220)',
//             data: data
//           }]
//         },
//         options: {
//           plugins: {
//             legend: {
//               labels: {
//                 usePointStyle: true,
//               },
//             }
//           }
//         }
//       });
//     }
  
//     // Event listeners for the buttons
//     $('#dailyBtn').on('click', function () {
//       updateChart(JSON.parse($('#dailySales').val()));
//     });
  
//     $('#weeklyBtn').on('click', function () {
//       updateChart(JSON.parse($('#weeklySales').val()));
//     });
  
//     $('#monthlyBtn').on('click', function () {
//       updateChart(JSON.parse($('#monthlySales').val()));
//     });
  
//     $('#yearlyBtn').on('click', function () {
//       updateChart(JSON.parse($('#yearlySales').val()));
//     });
  
//     // Function to update the chart based on the selected time period
//     function updateChart(data) {
//       if (!data || data.every(val => val === 0)) {
//         // Fill with zeros if no sales data available
//         data = Array(data.length).fill(0);
//       }
  
//       let labels = generateLabels(data.length);
//       initializeChart(labels, data);
//     }
  
//     // Generate labels based on the number of data points
//     function generateLabels(length) {
//       switch (length) {
//         case 7: return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
//         case 4: return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
//         case 12: return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//         default: return [];
//       }
//     }
  
//     // Initialize with monthly data by default
//     $(document).ready(function () {
//       let monthlyData = JSON.parse($('#monthlySales').val());
//       initializeChart(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], monthlyData);
//     });
  
//   })(jQuery);
(function ($) {
    "use strict";
  
    var ctx = document.getElementById('myChart').getContext('2d');
    var chart;
  
    function initializeChart(labels, data) {
      if (chart) {
        chart.destroy();
      }
  
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Sales',
            tension: 0.3,
            fill: true,
            backgroundColor: 'rgba(44, 120, 220, 0.2)',
            borderColor: 'rgba(44, 120, 220)',
            data: data
          }]
        },
        options: {
          plugins: {
            legend: {
              labels: {
                usePointStyle: true,
              },
            }
          }
        }
      });
    }
  
    // Event listeners for the buttons
    $('#dailyBtn').on('click', function () {
      const labels = JSON.parse($('#dailyLabels').val());
      const data = JSON.parse($('#dailyData').val());
      initializeChart(labels, data);
    });
  
    $('#weeklyBtn').on('click', function () {
      const labels = JSON.parse($('#weeklyLabels').val());
      const data = JSON.parse($('#weeklyData').val());
      initializeChart(labels, data);
    });
  
    $('#monthlyBtn').on('click', function () {
      const labels = JSON.parse($('#monthlyLabels').val());
      const data = JSON.parse($('#monthlyData').val());
      initializeChart(labels, data);
    });
  
    $('#yearlyBtn').on('click', function () {
      const labels = JSON.parse($('#yearlyLabels').val());
      const data = JSON.parse($('#yearlyData').val());
      initializeChart(labels, data);
    });
  
    // Initialize chart with default data (e.g., daily sales)
    $(document).ready(function () {
      const labels = JSON.parse($('#dailyLabels').val());
      const data = JSON.parse($('#dailyData').val());
      initializeChart(labels, data);
    });
  
  })(jQuery);
  