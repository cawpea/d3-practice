var svgWidth = 320;
var svgHeight = 240;

var dataSet = {
  children: [
    { value: 20 },
    { value: 15 },
    { 
      value: 10,
      children: [
        { value: 8 },
        { 
          value: 6,
          children: [
            { value: 3 },
            { value: 3 }
          ]
        }
      ]
    }
  ]
};

var treemap = d3.treemap()
  .size([ svgWidth, svgHeight ]);

var data = d3.hierarchy(dataSet)
  .sum(function(d) {
    return d.value;
  })
  .sort(function(a, b) {
    return b.value - a.value;
  });

treeElements = d3.select('#myGraph')
  .selectAll('rect')
  .data( treemap(data).descendants() )
  .enter();

treeElements
  .append('rect')
  .attr('class', 'block')
  .attr('x', function(d, i) {
    return d.x0;
  })
  .attr('y', function(d, i) {
    return d.y0;
  })
  .attr('height', function(d, i) {
    return d.y1 - d.y0;
  })
  .transition()
  .delay(function(d, i) {
    return d.depth * 500;
  })
  .attr('width', function(d, i) {
    return d.x1 - d.x0;
  })
  .style('opacity', function(d, i) {
    return d.depth / 3;
  })

treeElements
  .append('text')
  .attr('class', 'name')
  .attr('transform', function(d, i) {
    return 'translate(' + (d.x0 + ((d.x1 - d.x0) / 2)) + ', ' + (d.y0 + ((d.y1 - d.y0) / 2)) + ')';
  })
  .attr('dy', '0.35em')
  .text(function(d, i) {
    if( d.depth === 0 || d.children ) {
      return null;
    }
    return d.value;
  });