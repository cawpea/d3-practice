var flatData = [
  { "name": "Top Level", "parent": null },
  { "name": "Level 2: A", "parent": "Top Level" },
  { "name": "Level 2: B", "parent": "Top Level" },
  { "name": "Son of A", "parent": "Level 2: A" },
  { "name": "Daughter of A", "parent": "Level 2: A" }
];

var margin = {
  top: 20,
  right: 90,
  bottom: 30,
  left: 90
};

var width = 1000 - margin.left - margin.right;
var height = 900 - margin.top - margin.bottom;

var columnWidth = 200;

class DirectoryTree {
  constructor(root) {
    this.vDepth = 0;
    this.treemap = d3.tree()
      .size([width, height]);

    this.$svg = d3.select(root);
  }
  init() {
    this.getJsonData();
  }
  getJsonData() {
    var _this = this;
    d3.json('/data/directory-tree.json', function(error, data) {
      _this.treeData = data;
      _this.setTreeData();
      _this.appendNode();
    });
  }
  setTreeData() {
    this.nodes = d3.hierarchy( this.treeData, function(d) {
      return d.children;
    });

    this.setLayoutData();    

    // この時点で各ノードのx, y座標が算出される。
    this.nodes = this.treemap( this.nodes );
  }
  //最も遠い子孫（長男）を取得する関数
  getUnsonNode( node ) {
    node.vDepth = this.vDepth;
    if( node.children === undefined || node.children === null || node.children.length === 0 ) {
      return node;
    }
    return this.getUnsonNode( node.children[0] );
  }
  getBrotherNode( node ) {
    if( node.parent === undefined || node.parent === null ) {
      //このノードはルートノードである
      return null;
    }
    else if( node.parent.children.length - 1 === node.childIndex ) {
      //このノードは末っ子である
      return null;
    }
    var brotherNode = node.parent.children[node.childIndex + 1];
    return brotherNode;
  }
  setLayoutData() {
    // var followEledestson = function( node ) {
    //   var eledestson = _this.getUnsonNode( node );
    //   return _this.getBrotherNode( eledestson );
    // }

    // var followBrother = function( node ) {
    //   var oldNode = node;
    //   var youngNode = followEledestson( oldNode );

    //   while( youngNode !== null ) {
    //     oldNode = youngNode;
    //     youngNode = followEledestson( oldNode );
    //   }
    //   return oldNode;
    // }

    // var node = followBrother( this.nodes );
    // var parentNode;
    // var uncleNode = this.getBrotherNode( node.parent );

    // while( uncleNode !== null ) {
    //   console.log( uncleNode.data.name );
    //   if( uncleNode !== null ) {
    //     node = followBrother( uncleNode );
    //     console.log(node.data.name);
    //   }
    //   uncleNode = this.getBrotherNode( node.parent );
    // }
    
    // var parentNode = oldNode.parent;
    // var uncleNode = this.getBrotherNode( parentNode );

    this.setNodeInfo( this.nodes, 0 );

    this.nodes.leaves().map((node) => {
      this.setLeafLength( node );
    });

    this.nodes.descendants().map((node) => {
      this.setVerticalIndex(node);
    });

  }
  setNodeInfo(node, childIndex) {
    //各子ノードに対して、親からのインデックス番号を保持する
    node.childIndex = childIndex;

    //親ノードの場合は、子の数を保持する
    if( node.children === undefined || node.children === null ) {
      node.childrenLength = 0;
      return;
    }
    node.childrenLength = node.children.length;

    for( var i = 0, len = node.children.length; i < len; i++ ) {
      this.setNodeInfo( node.children[i], i );
    }
  }
  // 各親ノードに対して、自分の子孫に存在する葉っぱの数を保持する。子→親の順番で保持する。
  setLeafLength(node) {
    if( node.children === undefined || node.children === null ) {
      node.leafLength = 0;
    }else {
      let leafLength = node.childrenLength;
      node.children.map((n) => {
        if( n.leafLength > 0 ) {
          leafLength += n.leafLength - 1; //最初の子は親と同じy座標に位置するため-1する
        }
        else if( n.childrenLength > 0 ) {
          leafLength += n.childrenLength - 1; //最初の子は親と同じy座標に位置するため-1する
        }
      });
      node.leafLength = leafLength;
    }
    if( node.parent !== null ) {
      this.setLeafLength( node.parent );
    }
  }
  //各ノードに対して、縦方向の位置情報（インデックス番号）を割り当てる。親→子の順番で割り当てる。
  setVerticalIndex(node) {
    let verticalIndex = 0;

    //調査用
    if( node.data.name === 'm' ) {
      console.log( node.data.name );
    }

    if( node.parent === undefined || node.parent === null ) {
      //ルートノードの場合は一番上に表示する
      verticalIndex = 0;
    }
    else if( node.childIndex === 0 ) {
      //長男ノードの場合は親の隣に位置するため、縦方向の位置は同じ
      verticalIndex = node.parent.verticalIndex;
    }
    else {
      //兄弟ノードの場合は自分の兄の縦方向の１つ下の位置
      node.parent.children.map((brotherNode) => {
        if(brotherNode.childIndex === node.childIndex - 1) {
          verticalIndex = brotherNode.verticalIndex + brotherNode.leafLength;
          verticalIndex -= brotherNode.leafLength > 0 ? 1 : 0;
        }
      });
      verticalIndex += 1;
    }
    node.verticalIndex = verticalIndex;
  }
  appendNode() {
    this.$svg
      .attr('width', width + margin.left + margin.right )
      .attr('height', height + margin.top + margin.bottom);

    let g = this.$svg.append('g')
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    let link = g.selectAll('.link')
      .data( this.nodes.descendants().slice(1) )
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', function(d) {
        return 'M' + d.y + ',' + d.x
          + ' C' + (d.y + d.parent.y) / 2 + ',' + d.x
          + ' ' + (d.y + d.parent.y) / 2 + ',' + d.parent.x
          + ' ' + d.parent.y + ',' + d.parent.x;
      });

    let node = g.selectAll('.node')
      .data(this.nodes.descendants())
      .enter()
      .append('g')
      .attr('class', function(d) {
        return 'node' + (d.children ? ' node--internal' : ' node--leaf');
      })
      .attr('transform', function(d) {
        return 'translate(' + d.y + ', ' + d.x + ')';
      });

    node.append('circle')
      .attr('r', 10);

    node.append('text')
      .attr('dx', function(d) {
        return d.children ? '-5px' : '5px';
      })
      .attr('dy', '.35em')
      .attr('x', function(d) {
        return d.children ? -13 : 13;
      })
      .style('text-anchor', function(d) {
        return d.children ? 'end' : 'start';
      })
      .text(function(d) {
        return d.data.name + ' leaf: ' + d.leafLength + ' verticalIndex: ' + d.verticalIndex;
      });
  }
}

(function() {
  new DirectoryTree('#tree').init();
}());