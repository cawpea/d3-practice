var svgWidth = 520;
var svgHeight = 240;
var barWidth = svgWidth / 11;

var dataSet = d3.range(100).map(d3.randomBates(10));

var x = d3.scaleLinear()
  .rangeRound([0, svgWidth]);

//ヒストグラムのデータを設定
var bins = d3.histogram()
  .domain( x.domain() )
  .thresholds( x.ticks(20) )
  (dataSet);

var y = d3.scaleLinear()
  .domain([0, d3.max(bins, function(d) {
    return d.length;
  })])
  .range([svgHeight, 0]);

//ヒストグラムを描画
var barElements = d3.select('#myGraph')
  .selectAll('rect')
  .data( bins )
  .enter()
  .append('rect')
  .attr('class', 'bar')
  .attr('transform', function(d, i) {
    return 'translate(' + x(d.x0) + ', ' + y(d.length) + ')'
  })
  .attr('width',  x(bins[0].x1) - x(bins[0].x0) - 1 )
  .attr('height', function(d) {
    return svgHeight - y(d.length);
  });
