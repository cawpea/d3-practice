d3.csv('/data/mydata.csv', function(error, data) {
  var dataSet = [];
  var labelName = [];
  for(var i in data[0]) {
    dataSet.push(data[0][i]);
    labelName.push(i);
  }
  //svg要素の幅と高さを求める
  var svgEle = document.getElementById('myGraph');
  var svgWidth = window.getComputedStyle(svgEle, null).getPropertyValue('width');
  var svgHeight = window.getComputedStyle(svgEle, null).getPropertyValue('height');
  svgWidth = parseFloat(svgWidth);
  svgHeight = parseFloat(svgHeight);

  var offsetX = 50;
  var offsetY = 10;
  var barElements;
  var dataMax = 300;
  var barWidth = 20;
  var barMargin = 30;

   // グラフを描画
  barElements = d3.select('#myGraph')
    .selectAll('rect')
    .data( dataSet );

  // データの追加
  barElements.enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('height', 0)
    .attr('width', barWidth)
    .attr('x', function(d, i) {
      return offsetX + i * (barWidth + barMargin);
    })
    .attr('y', svgHeight - offsetY)
    .on('mouseover', function() {
      d3.select(this)
        .style('fill', 'red');
    })
    .on('mouseout', function() {
      d3.select(this)
        .style('fill', 'orange');
    })
    .transition()
    .duration(3000)
    .delay(function(d, i) {
      return i * 100;
    })
    .attr('y', function(d, i) {
      return svgHeight - d - offsetY;
    })
    .attr('height', function(d, i) {
      return d;
    });

  barElements.enter()
    .append('text')
    .attr('class', 'barNum')
    .attr('x', function(d, i) {
      return offsetX + i * (barWidth + barMargin) + 10;
    })
    .attr('y', svgHeight - 5 - offsetY )
    .text(function(d, i) {
      return d;
    });

  // 目盛りを表示するためにスケールを設定
  var yScale = d3.scaleLinear() //スケールを設定
    .domain([0, dataMax]) //元のデータ範囲
    .range([dataMax, 0]); //実際の出力サイズ

  d3.select('#myGraph')
    .append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + offsetX + ', ' + ((svgHeight - 300) - offsetY) + ')')
    .call(
      d3.axisLeft(yScale)
        //目盛りの数を指定
        .ticks(4)
        // 目盛りの書式を指定
        .tickFormat(d3.format('.1f'))
    );

  //横方向の線を引く
  d3.select('#myGraph')
    .append('rect')
    .attr('class', 'axis_x')
    .attr('width', 320)
    .attr('height', 1)
    .attr('transform', 'translate(' + offsetX + ', ' + (svgHeight - offsetY) + ')');

  //某のラベルを表示する
  barElements.enter()
    .append('text')
    .attr('class', 'barName')
    .attr('x', function(d, i) {
      return i * (barWidth + barMargin) + 10 + offsetX;
    })
    .attr('y', svgHeight - offsetY + 10)
    .text(function(d, i) {
      return labelName[i];
    }); var barMargin = 5;
});

