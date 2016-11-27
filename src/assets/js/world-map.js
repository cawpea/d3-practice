var svgWidth = 640;
var svgHeight = 640;
var degree = 0;
var earthSize = 280;
var earthPath;

var earth = d3.geoOrthographic()
  .translate([ svgWidth/2, svgHeight/2 ])
  .clipAngle(90)
  .scale( earthSize )
  .rotate( [degree, -25] );

var path = d3.geoPath()
  .projection(
    // d3.geoMercator()
    //   .translate([ svgWidth/2, svgHeight/2 ])
    //   .scale(100)
    earth
  );

d3.json('/data/world-map.json', function(error, data) {
  earthPath = d3.select('#myGraph')
    .append('circle')
    .attr('cx', svgWidth / 2)
    .attr('cy', svgHeight / 2)
    .attr('r', earthSize)
    .style('fill', 'url(#grad)');

  earthPath = d3.select('#myGraph')
    .selectAll('path')
    .data( data.features )
    .enter()
    .append('path')
    .attr('d', path)
    .style('fill', function(d, i) {
      console.log( d.id );
      return 'hsl(' + i + ', 80%, 60%)';
    });

  window.requestAnimationFrame( rotateEarth );
});

function rotateEarth() {
  earth.rotate([degree, -25]);
  degree += 1;
  earthPath
    .attr('d', path);

  window.requestAnimationFrame( rotateEarth );
}