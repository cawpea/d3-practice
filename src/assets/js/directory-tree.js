var margin = {
  top: 20,
  right: 90,
  bottom: 10,
  left: 5
};

class DirectoryTree {
  constructor(root, wrapper) {
    this.vDepth = 0;
    // this.treemap = d3.tree()
    //   .size([viewWidth, viewHeight]);

    this.$svgWrap = d3.select(wrapper);
    this.$svg = d3.select(root);

    this.svgWidth = 1000;
    this.svgHeight = 900;
    this.columnWidth = 250;
  }
  init() {
    this.getJsonData();
  }
  getJsonData() {
    var _this = this;
    d3.json('/data/directory-tree.json', function(error, data) {
      _this.treeData = data;
      _this.setTreeData();
      _this.setLayoutData();    
      _this.appendBackground();
      _this.appendContainer();
      _this.appendNode();
    });
  }
  setTreeData() {
    this.nodes = d3.hierarchy( this.treeData, function(d) {
      return d.children;
    });
    this.nodeList = this.nodes.descendants();

    this.nodeList = this.nodeList.map((d) => {
      d.isShow = true;
      return d;
    });

    this.columnCount = d3.max( this.nodeList, function(d) {
      return d.depth;
    }) + 1;

    this.svgWidth = this.columnCount * this.columnWidth;
    // この時点で各ノードのx, y座標が算出される。
    // this.nodes = this.treemap( this.nodes );
  }
  setLayoutData() {
    //各子ノードに対して、親からのインデックス番号を保持する
    this.setChildProperties( this.nodes, 0, true );

    // 各親ノードに対して、自分の子孫に存在する葉っぱの数を保持する。子→親の順番で保持する。
    this.nodes.leaves().map((node) => {
      this.setLeafLength( node );
    });

    //各ノードに対して、縦方向の位置情報（インデックス番号）を割り当てる。親→子の順番で割り当てる。
    this.nodeList.map((node) => {
      this.setVerticalIndex(node);
    });

    //各ノードのx,y座標を算出
    this.nodeList.map((node) => {
      node.x = node.depth * this.columnWidth;
      node.y = node.verticalIndex * 50;
    });
  }
  /*
  子ノードのレイアウト設定処理。全ての子ノードに対して再帰的に実行する。

  @param node (Uo) ノード情報
  @param childIndex (int) 親ノードを基準のした場合のノードの位置インデックス
  @param isShow (Boolean) ノードを表示する場合はtrue、そうでない場合はfalse
  */
  setChildProperties(node, childIndex, isShow) {
    node.childIndex = childIndex;
    node.isShow = isShow;

    //親ノードの場合は、子の数を保持する
    if( node.children === undefined || node.children === null ) {
      node.childrenLength = 0;

      //親が閉じられている場合は全ての子ノードを非表示にする
      let isCloseChildren = node._children !== undefined && node._children.length > 0;
      if( isCloseChildren ) {
        isShow = false;

        for( let i = 0, len = node._children.length; i < len; i++ ) {
          this.setChildProperties( node._children[i], i, isShow );
        }
      }
    }else {
      node.childrenLength = node.children.length;

      for( let i = 0, len = node.children.length; i < len; i++ ) {
        this.setChildProperties( node.children[i], i, isShow );
      }
    }
  }
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
  setVerticalIndex(node) {
    let verticalIndex = 0;

    if( node.parent === undefined || node.parent === null ) {
      //ルートノードの場合は一番上に表示する
      verticalIndex = 0;
    }
    else if( node.childIndex === 0 || !node.isShow ) {
      //長男ノードの場合は親の隣に位置するため、縦方向の位置は同じ
      verticalIndex = node.parent.verticalIndex;
    }
    else if( node.parent.children !== null ) {
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
  appendBackground() {
    let $background = this.$svg.append('g');

    for( let i = 0, len = this.svgWidth / this.columnWidth; i < len; i++ ) {
      $background.append('rect')
        .attr('width', this.columnWidth)
        .attr('height', this.svgHeight)
        .attr('fill', i % 2 === 0 ? '#EEE' : '#FFF' )
        .attr('x', i * this.columnWidth)
        .attr('y', 0);
    }
  }
  appendContainer() {
    this.$svg
      .attr('width', this.svgWidth )
      .attr('height', this.svgHeight );

    this.$nodeWrap = this.$svg.append('g')
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

  }
  appendNode() {
    var _this = this;

    // let link = g.selectAll('.link')
    //   .data( this.nodes.descendants().slice(1) )
    //   .enter()
    //   .append('path')
    //   .attr('class', 'link')
    //   .attr('d', function(d) {
    //     return 'M' + d.y + ',' + d.x
    //       + ' C' + (d.y + d.parent.y) / 2 + ',' + d.x
    //       + ' ' + (d.y + d.parent.y) / 2 + ',' + d.parent.x
    //       + ' ' + d.parent.y + ',' + d.parent.x;
    //   });

    this.$nodes = this.$nodeWrap.selectAll('.node')
      .data(this.nodes.descendants())
      .enter()
      .append('g')
      .attr('class', function(d) {
        return 'node' + (d.children ? ' node--branch' : ' node--leaf');
      })
      .attr('width', this.columnWidth)
      .attr('opacity', 1)
      .attr('transform', function(d) {
        return 'translate(' + (d.x) + ', ' + (d.y) + ')';
      });

    this.$nodes.append('circle')
      .attr('r', 3);

    this.$nodes.append('text')
      .attr('class', 'node-name')
      .attr('dx', function(d) {
        return '5px';
      })
      .attr('dy', '.35em')
      .attr('x', function(d) {
        return 13;
      })
      .style('text-anchor', function(d) {
        return 'start';
      })
      .text(function(d) {
        return d.data.name;
      })
      .on('dblclick', function(d) {
        _this.changeNodeTextbox( d3.select(this), d );
      });

    this.$branches = d3.selectAll('.node--branch');

    this.appendLineToChild();
    this.appendToggleChildren();
  }
  updateNode() {
    this.$nodes = this.$nodeWrap.selectAll('.node')
      .data( this.nodeList )
      .classed('is-close', false)
      .transition()
      .on('end', function(d) {
        // アニメーションが終わった後にノードを非表示にする
        if( !d.isShow ) {
          d3.select(this).classed('is-close', true);
        }
      })
      .duration(800)
      .attr('opacity', (d) => {
        return d.isShow ? 1 : 0;
      })
      .attr('transform', (d) => {
        return `translate(${d.x}, ${d.y})`;
      });

    this.$nodes.selectAll('.node-name')
      .text((d) => {
        return d.data.name;
      });

    this.updateToggleChildren();
  }
  changeNodeTextbox($node, d) {
    let _this = this;

    $node.classed('is-editing', true);

    //テキストボックスを生成し、編集状態にする
    let $inputNode = this.$svgWrap.append('input')
      .attr('type', 'text')
      .attr('value', d.data.name)
      .attr('class', 'node-textbox')
      .attr('style', `left:${d.x}px; top:${d.y}px; width:${this.columnWidth - 6}px; margin-top:10px;`)
      .on('blur', function() {
        //テキストボックスからフォーカスが外れた場合は元のラベルを更新する
        d.data.name = d3.select(this).node().value;
        $node.classed('is-editing', false);
        _this.$svgWrap.selectAll('.node-textbox').remove();
        _this.updateNode();
      });

    $inputNode.node().focus();
  }
  appendTextboxForNode() {
    let textboxSize = {
      width: this.columnWidth,
      height: 20
    };

    this.$nodeTextboxes = [];
    this.$svgWrap.selectAll('.node-textbox').remove();

    this.nodeList.map((node) => {
      let $input = this.$svgWrap.append('input')
        .attr('class', 'node-textbox node-textbox-' + node.data.id)
        .attr('data-id', node.data.id)
        .attr('type', 'text')
        .attr('style', `left:${node.x}px; top:${node.y + 6}px; width:${textboxSize.width}px; height:${textboxSize.height}px;`)
        .attr('value', node.data.name);

      this.$nodeTextboxes.push( $input );
    });
  }
  appendToggleChildren() {
    let circleRadius = 8;

    this.$nodeToggles = this.$branches.append('g')
      .attr('class', 'node-toggle')
      .attr('transform', `translate(${this.columnWidth - circleRadius * 2}, 0)`)
      .on('click', (d) => {
        this.toggleChildren(d);
      });

    let $circles = this.$nodeToggles.append('circle')
      .attr('r', circleRadius);

    let $texts = this.$nodeToggles.append('text')
      .attr('class', 'node-toggle-label')
      .attr('width', circleRadius * 2)
      .attr('height', circleRadius * 2)
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .text((d) => {
        return d._children ? '+' : '-';
      });
  }
  updateToggleChildren() {
    this.$nodeToggles.selectAll('text')
      .text((d) => {
        return d._children ? '+' : '-';
      });
  }
  appendLineToChild() {
    this.$branches.selectAll('.node-name').each(function(d) {
      let bbox = this.getBBox();
      d._nameWidth = bbox.width + bbox.x;
    });

    this.$branchLines = this.$branches
      .append('line')
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '1 4')
      .attr('x1', (d) => {
        return d._nameWidth + 10;
      })
      .attr('y1', (d) => {
        return 0;
      })
      .attr('x2', (d) => {
        return this.columnWidth;
      })
      .attr('y2', (d) => {
        return 0;
      });
  }
  updateLineToChild() {
    console.log( this.$branchLines );
  }
  toggleChildren( parentData ) {
    let parentId = parentData.data.id;

    if( parentData.isOpen === undefined ) {
      parentData.isOpen = false;
    }else {
      parentData.isOpen = !parentData.isOpen;
    }

    if( parentData.isOpen ) {
      parentData.children = parentData._children;
      parentData._children = null;
    }else {
      parentData._children = parentData.children;
      parentData.children = null;
    }
    this.setLayoutData();
    this.updateNode();
  }
}

(function() {
  new DirectoryTree('#tree', '.tree-wrap').init();
}());