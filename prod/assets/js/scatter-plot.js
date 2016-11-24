var svg = d3.select('#myGraph');
var svgEle = document.getElementById('myGraph');
var svgWidth = window.getComputedStyle(svgEle, null).getPropertyValue('width');
var svgHeight = window.getComputedStyle(svgEle, null).getPropertyValue('height');
svgWidth = parseFloat(svgWidth);
svgHeight = parseFloat(svgHeight);

var offsetX = 30;
var offsetY = 20;
var xScale;
var yScale;
var yAxisHeight = svgHeight - 20;
var xAxisWidth = svgWidth - 40;

var circleElements;
var dataSet = [];

// データセットの更新
function updateData(data) {
  var result = data.map(function(d, i) {
    var x = Math.round(Math.random() * svgWidth);
    var y = Math.round(Math.random() * svgHeight);
    return [x, y];
  });
  return result;
}

//散布図の更新
function updateGraph() {
  circleElements = d3.select('#myGraph')
    .selectAll('circle')
    .data( dataSet )
    .transition()
    .attr('cx', function(d, i) {
      return xScale(d[0]) + offsetX;
    })
    .attr('cy', function(d, i) {
      return svgHeight - yScale(d[1]) - offsetY;
    });
}

//目盛りの表示
function drawScale() {
  var maxX = d3.max(dataSet, function(d, i) {
    return d[0];
  });
  var maxY = d3.max(dataSet, function(d, i) {
    return d[1];
  })
  //縦の目盛りを表示するためにD3スケールを設定
  yScale = d3.scaleLinear()
    .domain([0, maxY]) //元のデータ範囲
    .range([yAxisHeight, 0]); //実際の出力サイズ

  //目盛りを表示
  svg
    .append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + offsetX + ', ' + (svgHeight - yAxisHeight - offsetY) + ')')
    .call(
      d3.axisLeft(yScale)
    );

  //横の目盛りを表示するためにD3スケールを設定
  xScale = d3.scaleLinear()
    .domain([0, maxX])
    .range([0, xAxisWidth]);

  //目盛りを表示
  svg
    .append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + offsetX + ', ' + (svgHeight - offsetY) + ')')
    .call(
      d3.axisBottom(xScale)
    );

  //グリッドの表示
  var grid = svg.append('g');
  // 横方向と縦方向のグリッド間隔を自動生成
  var rangeX = d3.range(50, maxX, 50);
  var rangeY = d3.range(20, maxY, 20);

  //縦方向のグリッドを生成
  grid.selectAll('line.y')
    .data(rangeY)
    .enter()
    .append('line')
    .attr('class', 'grid')
    .attr('x1', offsetX)
    .attr('y1', function(d, i) {
      return svgHeight - yScale(d) - offsetY;
    })
    .attr('x2', maxX + offsetX)
    .attr('y2', function(d, i) {
      return svgHeight - yScale(d) - offsetY;
    });

  //横方向のグリッドを生成
  grid.selectAll('line.x')
    .data(rangeX)
    .enter()
    .append('line')
    .attr('class', 'grid')
    .attr('x1', function(d, i) {
      return xScale(d) + offsetX;
    })
    .attr('y1', svgHeight - offsetY)
    .attr('x2', function(d, i) {
      return xScale(d) + offsetX;
    })
    .attr('y2', svgHeight - yAxisHeight - offsetY);
}

function init(data) {
  //ツールチップを表示する
  var tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tip');

  data.forEach(function(d, i) {
    dataSet.push([ d.total/100, d.bug*1, d.time*1 ]);
  });

  //目盛りを表示する
  drawScale();

  //散布図を描画
  circleElements = svg
    .selectAll('circle')
    .data(dataSet);

  circleElements
    .enter()
    .append('circle')
    .attr('class', 'mark')
    .attr('cx', svgWidth / 2 + offsetX)
    .attr('cy', svgHeight / 2 - offsetY)
    .attr('r', 100)
    .attr('opacity', 0)
    .on('mouseover', function(d) {
      var x = parseInt( xScale(d[0]) );
      var y = parseInt( yScale(d[1]) );
      var data = d3.select(this).datum(); //要素のデータを読み出す
      var dx = parseInt(data[0]);
      var dy = parseInt(data[1]);
      var t = parseInt(data[2]);

      tooltip
        .style('left', (offsetX + x) + 'px')
        .style('top', (offsetY +  30 + y) + 'px')
        .style('visibility', 'visible')
        .text( t + '時間' );
    })
    .on('mouseout', function() {
      tooltip.style('visibility', 'hidden');
    })
    .transition()
    .duration(2000)
    .ease( d3.easeBounce )
    .attr('cx', function(d, i) {
      return xScale(d[0]) + offsetX;
    })
    .attr('cy', function(d, i) {
      return yScale(d[1]);
    })
    .attr('r', 5)
    .attr('opacity', 1.0);

  // // タイマーを使って２秒毎に位置を変化させる
  // setInterval(function() {
  //   dataSet = updateData(dataSet);
  //   updateGraph();
  // }, 5000);
}

(function() {
  d3.csv('/data/scatter-plot.csv', function(error, data) {
    init(data);
  });
}());