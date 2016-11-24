var dataSet = [];
var svgEle = document.getElementById('myGraph');
var svgWidth = window.getComputedStyle(svgEle, null).getPropertyValue('width');
var svgHeight = window.getComputedStyle(svgEle, null).getPropertyValue('height');
svgWidth = parseFloat(svgWidth) - 60; //値は単位付きなので単位を削除する
svgHeight = parseFloat(svgHeight) - 60; //値は単位付きなので単位を削除する

var offsetX = 30;
var offsetY = 20;
var scale = 2.0;
var rangeYear = 10; //10年分を表示

//最大値と最小値の年数を求める
var year;
var startYear; //最初の年
var currentYear; //最初の表示基準年
var margin;

function render() {
  year = d3.extent(data, function(d) {
    return d.year;
  });
  startYear = year[0]; //最初の年
  currentYear = 2000; //最初の表示基準年
  margin = svgWidth / (rangeYear - 1);
  this.drawGraphs();
}

function drawGraphs() {
  //最初にグラフを表示する
  pickupData(data, currentYear - startYear)

  drawGraph( dataSet, 'item1', 'itemA' );
  drawGraph( dataSet, 'item2', 'itemB' );
  drawGraph( dataSet, 'item3', 'itemC' );
  drawScale();
}

//折れ線グラフを表示するための関数
function drawGraph(dataSet, itemName, cssClassName) {
  //折れ線グラフの座標値を計算するメソッド
  var line = d3.line()
    .x(function(d, i) {
      return offsetX + i * margin; //X座標は出現順番×間隔
    })
    .y(function(d, i) {
      return svgHeight - (d[itemName] * scale) - offsetY; //データからY座標を減算
    })
    //曲線で表示
    .curve(d3.curveNatural)

  //折れ線グラフを描画
  var lineElements = d3.select('#myGraph')
    .append('path')
    .attr('class', 'line ' + cssClassName)
    .attr('d', line(dataSet));
}

//グラフの目盛りを表示するための関数
function drawScale() {
  //目盛りを表示するためにスケールを設定
  var yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([scale * 100, 0]);

  //目盛りを表示
  d3.select('#myGraph')
    .append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + offsetX + ', ' + ((100 - (scale - 1) * 100) + offsetY) + ')')
    .call(
      d3.axisLeft(yScale)
    );

  //横方向の線を表示する
  d3.select('#myGraph')
    .append('rect')
    .attr('class', 'axis_x')
    .attr('width', svgWidth)
    .attr('height', 1)
    .attr('transform', 'translate(' + offsetX + ', ' + ( svgHeight - offsetY ) + ')');

  //横の目盛りを表示するためにD3スケールを設定
  var xScale = d3.scaleTime()
    .domain([new Date( currentYear + '/1/1'), new Date( (currentYear + rangeYear - 1) + '/1/1')])
    .range([0, svgWidth]);

  //横の目盛りを表示
  d3.select('#myGraph')
    .append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + offsetX + ', ' + ( svgHeight - offsetY ) + ')')
    .call(
      d3.axisBottom(xScale)
        .ticks(10)
        .tickFormat(function(d, i) {
          var fmtFunc = d3.timeFormat('%Y年%m月');
          return fmtFunc(d);
        })
    )
    .selectAll('text')
    .attr('transform', 'rotate(90)')
    .attr('dx', '0.7em')
    .attr('dy', '-0.4em')
    .style('text-anchor', 'start');
}

// JSONデータから表示する範囲のデータセットを抽出し、SVG要素ないを消去
function pickupData(data, start) {
  dataSet = [];
  for(var i = 0; i < rangeYear; i++) {
    dataSet[i] = data[start + i];
    d3.select('#myGraph').selectAll('*').remove();
  }
}

(function() {
  d3.json('/data/mydata.json', function(error, d) {
    data = d;
    render();
  });
  // 「前へ」ボタンにイベントを割り当てる
  d3.select('#prev').on('click', function() {
    // 最小値（年）より大きい場合は年数を１つ減らす
    if( currentYear > year[0] ) {
      currentYear = currentYear - 1;
    }
    //グラフを表示
    drawGraphs();
  });
  //「次へ」ボタンにイベントを割り当てる
  d3.select('#next').on('click', function() {
    // 最大値（年）＋範囲より小さい場合は年数を１つ増やす
    if( currentYear <= year[1] - rangeYear ) {
      currentYear = currentYear + 1;
    }
    //グラフを表示
    drawGraphs();
  });
}());
