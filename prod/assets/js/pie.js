drawPie('mydata2008.csv');

//セレクトメニューが選択された場合の処理
d3.select('#year').on('change', function() {
  d3.select('#myGraph').selectAll('*').remove();
  drawPie('mydata' + this.value + '.csv', this.value);
});

function drawPie(fileName, year) {
  //データセットはCSVファイル
  d3.csv('/data/' + fileName, function(error, data) {
    var dataSet = [];
    for(var i in data[0]) {
      dataSet.push(data[0][i]);
    }
    render(dataSet);
  });
}

function render(dataSet) {
  var svgWidth = 320;
  var svgHeight = 240;

  //円グラフの座標値を計算するメソッド
  var pie = d3.pie();

  //円グラフの外径、内径を設定
  var arc = d3.arc().innerRadius(30).outerRadius(100);

  //円グラフを描画
  var pieElements = d3.select('#myGraph')
    .selectAll('g')
    .data(pie(dataSet))
    .enter()
    .append('g')
    .attr('transform', 'translate(' + svgWidth / 2 + ', ' + svgHeight / 2 + ')');

  //データの追加
  pieElements
    .append('path')
    .attr('class', 'pie')
    .style('fill', function(d, i) {
      return ['red', 'orange', 'yellow', 'cyan', 'green'][i];
    })
    .transition()
    .duration(1000)
    .delay(function(d, i) {
      return i * 1000;
    })
    .ease(d3.easeLinear)
    .attrTween('d', function(d, i) { //補間処理をする
      var interpolate = d3.interpolate(
        { startAngle: d.startAngle, endAngle: d.startAngle }, //各部分の開始角度
        { startAngle: d.startAngle, endAngle: d.endAngle } //各部分の終了角度
      );
      return function(t) {
        return arc(interpolate(t));
      }
    });

  //合計の数と文字の表示
  var textElements = d3.select('#myGraph')
    .append('text')
    .attr('class', 'total')
    .attr('transform', 'translate(' + svgWidth / 2 + ', ' + (svgHeight / 2 + 5) + ')')
    .text('合計:' + d3.sum(dataSet));

  //数値を円弧の中に表示
  pieElements
    .append('text')
    .attr('class', 'pieNum')
    .attr('transform', function(d, i) {
      return 'translate(' + arc.centroid(d) + ')';
    })
    .text(function(d, i) {
      return d.value;
    })
}
