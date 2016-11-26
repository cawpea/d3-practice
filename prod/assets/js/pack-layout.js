var svgWidth = 320;
var svgHeight = 320;
var allData;
var pack;
var packElements;
var circles;
var texts;

function updatePackLayout(dataSet, year) {
  // カラーを準備
  var color = d3.schemeCategory10;

  var data = d3.hierarchy(dataSet)
    .sum(function(d) { 
      return d[year]; 
    })
    .sort(function(a, b) { 
      return b.value - a.value; 
    });

  console.log(data);

  packElements = d3.select('#myGraph')
    .selectAll('g')
    .data( pack( data ).descendants() )
    .transition()
    .duration(500)
    .attr('transform', function(d, i) {
      return 'translate(' + d.x + ', ' + d.y + ')'
    });

  circles = packElements.selectAll('circle')
    .attr('r', 0)
    .transition()
    .duration(500)
    .attr('r', function(d) {
      return d.r;
    })
}

function drawPackLayout(dataSet, year) {
  // カラーを準備
  var color = d3.schemeCategory10;

  //パックレイアウト
  pack = d3.pack()
    .size([ svgWidth, svgHeight ]);

  var data = d3.hierarchy(dataSet)
    .sum(function(d) { 
      return d[year]; 
    })
    .sort(function(a, b) { 
      return b.value - a.value; 
    });

  console.log(data);

  packElements = d3.select('#myGraph')
    .selectAll('g')
    .data( pack(data).descendants() )
    .enter()
    .append('g')
    .attr('transform', function(d, i) {
      return 'translate(' + d.x + ', ' + d.y + ')'
    });

  circles = packElements.append('circle')
    .attr('r', 0)
    .transition()
    .duration(function(d, i) {
      return d.depth * 1000 + 500;
    })
    .attr('r', function(d) {
      return d.r;
    })
    .style('fill', function(d, i) {
      return color[i];
    });

  texts = packElements.append('text')
    .style('opacity', 0)
    .transition()
    .duration(3000)
    .style('opacity', 1.0)
    .text(function(d, i) {
      if(d.depth === 1) {
        return d.data.name;
      } 
      return null;
    });
} 

(function() {
  d3.json('/data/pack-layout.json', function(error, data) {
    allData = data;
    drawPackLayout( allData, 'year2000');
  });
  d3.selectAll('input').on('click', function() {
    year = d3.select(this).attr('data-year');
    updatePackLayout( allData, year );
  });
}());