var dataSet = [300, 130, 5, 60, 240];

var HorizontalBarGraph = function() {
  this.init();
};
HorizontalBarGraph.prototype = {
  init: function() {
    this.initGraph();
    this.setAxis();
    this.bindEvents();
  },
  bindEvents: function() {
    var _this = this;
    d3.select('#updateButton').on('click', function() {
      _this.getData( _this.updateGraph );
    });
  },
  initGraph: function() {
    d3.select('#myGraph')
      .selectAll('rect')
      .data(dataSet)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', function(d,i) { 
        return i * 25;
      })
      .attr('width', function(d, i) {
        return d + 'px';
      })
      .attr('height', '20px')
      .on('click', function() {
        d3.select(this)
          .style('fill', 'cyan');
      });
  },
  updateGraph: function(dataSet) {
    d3.select('#myGraph')
      .selectAll('rect')
      .data(dataSet)
      .transition() //アニメーションさせる
      .delay(function(d, i) { //遅延実行する
        return i * 500
      })
      .duration(2500) //アニメーションのスピードを調整
      .attr('width', function(d, i) {
        return d + 'px';
      });
  },
  getData: function( callback ) {
    d3.csv('/data/mydata.csv', function(error, data) {
      var dataSet = [];
      for( var i = 0, len = data.length; i < len; i++ ) {
        dataSet.push( data[i].item1 );
      }
      callback( dataSet );
    });
  },
  setAxis: function() {
    var xScale = d3.scaleLinear()
      .domain([0, 300])
      .range([0, 300]);

    d3.select('#myGraph')
      .append('g')
      .attr('class', 'axis')
      .attr('transform', "translate(10, " + ((1 + dataSet.length) * 20 + 5) + ")")
      .call( d3.axisBottom( xScale ).ticks(5) );
  }
}

window.addEventListener('load', function() {
  new HorizontalBarGraph();
});
