var dataSet = {
  nodes: [
    { name: 'Apple' },
    { name: 'Google' },
    { name: 'Amazon' },
    { name: 'Microsoft' }
  ],
  links: [
    { source: 0, target: 1 },
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 3, target: 0 }
  ]
};

//フォースレイアウトの設定
var force = d3.forceSimulation()
  .force('link', d3.forceLink().id(function(d) { return d.links }))

//ノードとノードを結ぶ線を描画
var link = d3.select('#myGraph')
  .selectAll('line')
  .data( dataSet.links )
  .enter()
  .append('line')
  .attr('class', 'forceLine');

//ノードを示す円を描画
var node = d3.select('#myGraph')
  .selectAll('circle')
  .data( dataSet.nodes )
  .enter()
  .append('circle')
  .attr('r', 10);

//再描画時（tickイベント発生時）に線を描画