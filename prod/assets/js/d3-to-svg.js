var d3toSvg = function() {
  this.$myGraph = d3.select('#myGraph');
  this.init();
};
d3toSvg.prototype = {
  init: function() {
    this.$svg = this.$myGraph.append('svg')
    // this.fetchCSVData();
    // this.fetchJsonData();
    // this.fetchHtmlData();
    // this.fetchXmlData();
    this.fetchTextData();
  },
  initStyle: function() {
    for( var i = 0, len = 5; i < len; i++ ) {
      this.$svg.append('rect')
        .attr('x', '50px')
        .attr('y', i * 25 + 'px')
        .attr('width', '200px')
        .attr('height', '20px');
    }
    this.setStyleAll();
  },
  setStyle: function($svgElement) {
    $svgElement.attr('x', '10px')
      //属性を指定する
      .attr('y', '50px')
      .attr('width', '200px')
      .attr('height', '30px')
      //アニメーションをつける
      .transition()
      .duration(3000)
      .attr('width', '50px')
      //スタイルを指定する
      // .style('fill', 'red')
      // .style('stroke', 'black');
      // classを付与する
      .attr('class', 'bar_note');
  },
  setStyleAll: function() {
    d3.selectAll('rect')
      .transition()
      // 条件によりclassを付与する
      .attr('class', function(d, i) {
        if( i === 2 ) {
          return 'bar_note';
        }
      });
  },
  fetchCSVData: function() {
    var _this = this;
    d3.csv('/data/mydata.csv')
      // CSVから取得したデータの列名を変更する
      .row(function(d) {
        return {
          data1: d['item1'],
          data2: d['item2'],
          data3: d['item3']
        }
      })
      .get(function(error, data) {
        var dataSet = [];

        for( var i = 0, len = data.length; i < len; i++ ) {
          dataSet.push( data[i].data1 );
        }
        _this.showGraph( dataSet );
      });
  },
  fetchJsonData: function() {
    var _this = this;
    d3.json('/data/mydata.json', function(error, data) {
      if(error) {
        console.error(error);
        return;
      }
      console.log(data);
      var dataSet = [];
      for( var i = 0, len = data.length; i < len; i++ ) {
        dataSet.push( data[i].sales[0] )
      }
      _this.showGraph( dataSet );
    });
  },
  fetchHtmlData: function() {
    var _this = this;
    d3.html('/data/mydata.html', function(error, docFragment) {
      if( error ) {
        console.error( error );
        return;
      }
      var tr = docFragment.querySelectorAll('table tr');
      var dataSet = [];

      for( var i = 0, len = tr.length; i < len; i++ ) {
        var td = tr[i].querySelectorAll('td'); 
        if( !td || td.length === 0 ) {
          continue;
        }
        var d = td[0].firstChild.nodeValue;
        dataSet.push(d);
      }
      _this.showGraph( dataSet );
    });
  },
  fetchXmlData: function() {
    _this = this;
    d3.xml('/data/mydata.xml', function(error, xmlRoot) {
      if(error) {
        console.error(error);
        return;
      }
      var xmlData = xmlRoot.querySelectorAll('data');
      var salesRoot = xmlData[0];
      var salesData = salesRoot.querySelectorAll('sales');
      var dataSet = [];

      for( var i = 0, len = salesData.length; i < len; i++ ) {
        var d = salesData[i].firstChild.nodeValue;
        dataSet.push(d);
      }
      _this.showGraph( dataSet );
    });
  },
  fetchTextData: function() {
    var _this = this;
    d3.text('/data/mydata.txt', function(error, plainText) {
      if( error ) {
        console.error(error);
        return;
      }
      var data = plainText.split('\x0a')
      var dataSet = [];
      var sales = data[0].split('/');

      for( var i = 1, len = sales.length; i < len; i++ ) {
        dataSet.push( sales[i] );
      }
      _this.showGraph( dataSet );
    });
  },
  showGraph: function( dataSet ) {
    this.$svg
      .selectAll('rect')
      .data(dataSet)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('width', function(d, i) {
        return d;
      })
      .attr('height', 20)
      .attr('x', 9)
      .attr('y', function(d,i) {
        return i * 25;
      });
  }
};

window.addEventListener('load', function() {
  new d3toSvg();
});