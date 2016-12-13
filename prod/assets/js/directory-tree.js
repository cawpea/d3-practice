'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var margin = {
  top: 20,
  right: 90,
  bottom: 10,
  left: 5
};

// 内部データ更新時のメソッド識別値
var NODE_METHOD = {
  UPDATE_NAME: 'updateName',
  TOGGLE_CHILDREN: 'toggleChildren',
  DELETE: 'delete'
};

var DirectoryTree = function () {
  function DirectoryTree(root, wrapper) {
    _classCallCheck(this, DirectoryTree);

    this.vDepth = 0;
    // this.treemap = d3.tree()
    //   .size([viewWidth, viewHeight]);

    this.$svgWrap = d3.select(wrapper);
    this.$svg = d3.select(root);

    this.svgWidth = 1000;
    this.svgHeight = 900;
    this.columnWidth = 250;
  }

  _createClass(DirectoryTree, [{
    key: 'init',
    value: function init() {
      var _this2 = this;

      this.getJsonData(function (data) {
        _this2.treeData = data;
        _this2.bindEvents();
        _this2.setTreeData();
        _this2.setLayoutData();
        _this2.appendBackground();
        _this2.appendContainer();
        _this2.appendNode();
      });
    }
  }, {
    key: 'getJsonData',
    value: function getJsonData(callback) {
      d3.json('/data/directory-tree.json', function (error, data) {
        if (error) throw error;
        callback(data);
      });
    }
  }, {
    key: 'bindEvents',
    value: function bindEvents() {
      var _this3 = this;

      document.addEventListener('keydown', function (e) {
        _this3.onKeydownView(e);
      });
    }
  }, {
    key: 'onKeydownView',
    value: function onKeydownView(e) {
      var isDeleteKey = e.which === 8;
      var selectedNode = this.$nodeWrap.select('.node.is-selected').data();
      this.deleteNode(selectedNode);
    }
  }, {
    key: 'deleteNode',
    value: function deleteNode(node) {}
  }, {
    key: 'setTreeData',
    value: function setTreeData() {
      this.nodes = d3.hierarchy(this.treeData, function (d) {
        return d.children;
      });
      this.nodeList = this.nodes.descendants();

      this.nodeList = this.nodeList.map(function (d) {
        d.isShow = true;
        return d;
      });

      this.columnCount = d3.max(this.nodeList, function (d) {
        return d.depth;
      }) + 1;

      this.svgWidth = this.columnCount * this.columnWidth;
      // この時点で各ノードのx, y座標が算出される。
      // this.nodes = this.treemap( this.nodes );
    }
  }, {
    key: 'setLayoutData',
    value: function setLayoutData() {
      var _this4 = this;

      //各子ノードに対して、親からのインデックス番号を保持する
      this.setChildProperties(this.nodes, 0, true);

      // 各親ノードに対して、自分の子孫に存在する葉っぱの数を保持する。子→親の順番で保持する。
      this.nodes.leaves().map(function (node) {
        _this4.setLeafLength(node);
      });

      //各ノードに対して、縦方向の位置情報（インデックス番号）を割り当てる。親→子の順番で割り当てる。
      this.nodeList.map(function (node) {
        _this4.setVerticalIndex(node);
      });

      //各ノードのx,y座標を算出
      this.nodeList.map(function (node) {
        node.x = node.depth * _this4.columnWidth;
        node.y = node.verticalIndex * 50;
      });
    }
    /*
    子ノードのレイアウト設定処理。全ての子ノードに対して再帰的に実行する。
     @param node (Uo) ノード情報
    @param childIndex (int) 親ノードを基準のした場合のノードの位置インデックス
    @param isShow (Boolean) ノードを表示する場合はtrue、そうでない場合はfalse
    */

  }, {
    key: 'setChildProperties',
    value: function setChildProperties(node, childIndex, isShow) {
      node.childIndex = childIndex;
      node.isShow = isShow;

      //親ノードの場合は、子の数を保持する
      if (node.children === undefined || node.children === null) {
        node.childrenLength = 0;

        //親が閉じられている場合は全ての子ノードを非表示にする
        var isCloseChildren = node._children !== undefined && node._children.length > 0;
        if (isCloseChildren) {
          isShow = false;

          for (var i = 0, len = node._children.length; i < len; i++) {
            this.setChildProperties(node._children[i], i, isShow);
          }
        }
      } else {
        node.childrenLength = node.children.length;

        for (var _i = 0, _len = node.children.length; _i < _len; _i++) {
          this.setChildProperties(node.children[_i], _i, isShow);
        }
      }
    }
  }, {
    key: 'setLeafLength',
    value: function setLeafLength(node) {
      if (node.children === undefined || node.children === null) {
        node.leafLength = 0;
      } else {
        var leafLength = node.childrenLength;
        node.children.map(function (n) {
          if (n.leafLength > 0) {
            leafLength += n.leafLength - 1; //最初の子は親と同じy座標に位置するため-1する
          } else if (n.childrenLength > 0) {
            leafLength += n.childrenLength - 1; //最初の子は親と同じy座標に位置するため-1する
          }
        });
        node.leafLength = leafLength;
      }
      if (node.parent !== null) {
        this.setLeafLength(node.parent);
      }
    }
  }, {
    key: 'setVerticalIndex',
    value: function setVerticalIndex(node) {
      var verticalIndex = 0;

      if (node.parent === undefined || node.parent === null) {
        //ルートノードの場合は一番上に表示する
        verticalIndex = 0;
      } else if (node.childIndex === 0 || !node.isShow) {
        //長男ノードの場合は親の隣に位置するため、縦方向の位置は同じ
        verticalIndex = node.parent.verticalIndex;
      } else if (node.parent.children !== null) {
        //兄弟ノードの場合は自分の兄の縦方向の１つ下の位置
        node.parent.children.map(function (brotherNode) {
          if (brotherNode.childIndex === node.childIndex - 1) {
            verticalIndex = brotherNode.verticalIndex + brotherNode.leafLength;
            verticalIndex -= brotherNode.leafLength > 0 ? 1 : 0;
          }
        });
        verticalIndex += 1;
      }
      node.verticalIndex = verticalIndex;
    }
  }, {
    key: 'appendBackground',
    value: function appendBackground() {
      var $background = this.$svg.append('g');

      for (var i = 0, len = this.svgWidth / this.columnWidth; i < len; i++) {
        $background.append('rect').attr('width', this.columnWidth).attr('height', this.svgHeight).attr('fill', i % 2 === 0 ? '#EEE' : '#FFF').attr('x', i * this.columnWidth).attr('y', 0);
      }
    }
  }, {
    key: 'appendContainer',
    value: function appendContainer() {
      this.$svg.attr('width', this.svgWidth).attr('height', this.svgHeight);

      this.$nodeWrap = this.$svg.append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
    }
  }, {
    key: 'appendNode',
    value: function appendNode() {
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

      //ノード全体をラップするgroup要素
      this.$nodes = this.$nodeWrap.selectAll('.node').data(this.nodes.descendants()).enter().append('g').attr('class', function (d) {
        return 'node' + (d.children ? ' node--branch' : ' node--leaf');
      }).attr('width', this.columnWidth).attr('opacity', 1).attr('transform', function (d) {
        return 'translate(' + d.x + ', ' + d.y + ')';
      }).on('click', function (d) {
        _this.$nodes.classed('is-selected', false);
        d3.select(this).classed('is-selected', true);
      }).on('dblclick', function (d) {
        _this.changeNodeTextbox(d3.select(this), d);
      });

      //背景に敷くためのrect要素を先に要素追加しておき、後でプロパティを設定する
      var $nodesBg = this.$nodes.append('rect');

      //ノード名の左側に表示するアイコン
      var $nodeHead = this.$nodes.append('circle').attr('r', 3);

      //ノード名用text要素
      var $nodeText = this.$nodes.append('text').attr('class', 'node-name').attr('dx', function (d) {
        return '5px';
      }).attr('dy', '.35em').attr('x', function (d) {
        return 13;
      }).style('text-anchor', function (d) {
        return 'start';
      }).text(function (d) {
        return d.data.name;
      });

      //名前用text要素からサイズをキャッシュしておき、他要素のレイアウトの計算に使用する。
      this.$nodes.each(function (d) {
        var bbox = this.getBBox();
        d._nameWidth = bbox.width + bbox.x;
        d._nameHeight = bbox.height - bbox.y;
      });

      //背景用rect要素のプロパティを設定
      $nodesBg.attr('height', function (d) {
        return d._nameHeight;
      }).attr('class', 'node-bg').attr('width', this.columnWidth - 5).attr('x', 0).attr('y', function (d) {
        return -(d._nameHeight / 2);
      }).attr('fill', 'transparent');

      //親ノードのみをキャッシュ
      this.$branches = d3.selectAll('.node');

      this.appendLineToChild();
      this.appendToggleChildren();
    }
  }, {
    key: 'updateNode',
    value: function updateNode(param) {

      if (param) {
        switch (param.type) {
          case NODE_METHOD.UPDATE_NAME:
            // 指定されたパラメータを元に内部データを更新する
            this.nodeList.map(function (node) {
              if (param.data.id !== node.data.id) return true;
              for (var key in param.data) {
                node.data[key] = param.data[key];
              }
            });
            break;
          case NODE_METHOD.TOGGLE_CHILDREN:
            // ノードレイアウト情報を更新する。
            this.setLayoutData();
            break;
        }
      }

      // 内部データを元に各ノードの状態を更新する
      this.$nodes.data(this.nodeList).classed('is-close', false).transition().on('end', function (d) {
        // アニメーションが終わった後にノードを非表示にする
        if (!d.isShow) {
          d3.select(this).classed('is-close', true);
        }
      }).duration(800).attr('opacity', function (d) {
        return d.isShow ? 1 : 0;
      }).attr('transform', function (d) {
        return 'translate(' + d.x + ', ' + d.y + ')';
      });

      this.$nodes.selectAll('.node-name').text(function (d) {
        return d.data.name;
      });

      this.updateToggleChildren();
    }
  }, {
    key: 'changeNodeTextbox',
    value: function changeNodeTextbox($node, d) {
      var _this = this;

      $node.classed('is-editing', true);

      //テキストボックスを生成し、編集状態にする
      var $inputNode = this.$svgWrap.append('input').attr('type', 'text').attr('value', d.data.name).attr('class', 'node-textbox').attr('style', 'left:' + d.x + 'px; top:' + d.y + 'px; width:' + (this.columnWidth - 6) + 'px; margin-top:10px;').on('blur', function () {
        //テキストボックスからフォーカスが外れた場合は元のラベルを更新する
        $node.classed('is-editing', false);
        _this.$svgWrap.selectAll('.node-textbox').remove();

        _this.updateNode({
          type: NODE_METHOD.UPDATE_NAME,
          data: {
            id: d.data.id,
            name: d3.select(this).node().value
          }
        });
      });

      $inputNode.node().focus();
    }
  }, {
    key: 'appendTextboxForNode',
    value: function appendTextboxForNode() {
      var _this5 = this;

      var textboxSize = {
        width: this.columnWidth,
        height: 20
      };

      this.$nodeTextboxes = [];
      this.$svgWrap.selectAll('.node-textbox').remove();

      this.nodeList.map(function (node) {
        var $input = _this5.$svgWrap.append('input').attr('class', 'node-textbox node-textbox-' + node.data.id).attr('data-id', node.data.id).attr('type', 'text').attr('style', 'left:' + node.x + 'px; top:' + (node.y + 6) + 'px; width:' + textboxSize.width + 'px; height:' + textboxSize.height + 'px;').attr('value', node.data.name);

        _this5.$nodeTextboxes.push($input);
      });
    }
  }, {
    key: 'appendToggleChildren',
    value: function appendToggleChildren() {
      var _this6 = this;

      var circleRadius = 8;

      this.$nodeToggles = this.$branches.append('g').attr('class', 'node-toggle').attr('transform', 'translate(' + (this.columnWidth - circleRadius * 2) + ', 0)').on('click', function (d) {
        _this6.toggleChildren(d);
      });

      var $circles = this.$nodeToggles.append('circle').attr('r', circleRadius);

      var $texts = this.$nodeToggles.append('text').attr('class', 'node-toggle-label').attr('width', circleRadius * 2).attr('height', circleRadius * 2).attr('text-anchor', 'middle').attr('dy', 4).text(function (d) {
        return d._children ? '+' : '-';
      });
    }
  }, {
    key: 'updateToggleChildren',
    value: function updateToggleChildren() {
      this.$nodeToggles.selectAll('text').text(function (d) {
        return d._children ? '+' : '-';
      });
    }
  }, {
    key: 'appendLineToChild',
    value: function appendLineToChild() {
      var _this7 = this;

      this.$branchLines = this.$branches.append('line').attr('stroke', 'black').attr('stroke-width', 1).attr('stroke-dasharray', '1 4').attr('x1', function (d) {
        return d._nameWidth + 10;
      }).attr('y1', function (d) {
        return 0;
      }).attr('x2', function (d) {
        return _this7.columnWidth;
      }).attr('y2', function (d) {
        return 0;
      });
    }
  }, {
    key: 'toggleChildren',
    value: function toggleChildren(parentData) {
      var parentId = parentData.data.id;

      if (parentData.isOpen === undefined) {
        parentData.isOpen = false;
      } else {
        parentData.isOpen = !parentData.isOpen;
      }

      if (parentData.isOpen) {
        parentData.children = parentData._children;
        parentData._children = null;
      } else {
        parentData._children = parentData.children;
        parentData.children = null;
      }

      this.updateNode({
        type: NODE_METHOD.TOGGLE_CHILDREN
      });
    }
  }]);

  return DirectoryTree;
}();

(function () {
  new DirectoryTree('#tree', '.tree-wrap').init();
})();