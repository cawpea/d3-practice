'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var margin = {
  top: 20,
  right: 90,
  bottom: 10,
  left: 5
};

// ノード更新時のメソッド識別用
var NODE_METHOD = {
  UPDATE_NAME: 'updateName',
  TOGGLE_CHILDREN: 'toggleChildren',
  DELETE_NODE: 'deleteNode',
  APPEND_NODE_TEMP: 'appendNodeTemp'
};

// ノード追加時の位置
var APPEND_DIRECTION = {
  TO_BOTTOM: 'appendToBottom',
  TO_RIGHT: 'appendToRight'
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
    this.nodeHeight = 25;
  }

  _createClass(DirectoryTree, [{
    key: 'init',
    value: function init() {
      var _this2 = this;

      this.getJsonData(function (data) {
        _this2.bindEvents();
        _this2.updateNodesData(data);
        _this2.updateNodesLayout();
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
      var isEnterKey = e.which === 13;
      var isDeleteKey = e.which === 8;
      var isTabKey = e.which === 9;

      if (isDeleteKey) {
        this.deleteSelectedNode();
      } else if (isEnterKey || isTabKey) {
        e.preventDefault();
        var selectedNodes = this.getSelectedNodes();
        var direction = isTabKey ? APPEND_DIRECTION.TO_RIGHT : APPEND_DIRECTION.TO_BOTTOM;

        if (selectedNodes === null || selectedNodes.length === 0) {
          return;
        }

        var selectedNode = selectedNodes[0];
        if (selectedNode._isEdit) {
          if (!this.isNodeNameEmpty()) {
            this.editEndNodeName();
          }
          return;
        }
        this.appendTempNode(selectedNode, direction);
      }
    }
  }, {
    key: 'createNodeData',
    value: function createNodeData(nodeObj) {
      return d3.hierarchy(nodeObj, function (d) {
        return d.children;
      });
    }
  }, {
    key: 'updateNodesData',
    value: function updateNodesData(jsonData) {
      this.nodes = this.createNodeData(jsonData);
      this.nodeList = this.nodes.descendants();

      this.nodeList = this.nodeList.map(function (d) {
        d._isShow = true;
        d._isEdit = false;
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
    key: 'updateNodesLayout',
    value: function updateNodesLayout() {
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
        node._x = node.depth * _this4.columnWidth;
        node._y = node._verticalIndex * 50;
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
      node._childIndex = childIndex;
      node._isShow = isShow;
      node._isTemp = !!node.data._isTemp;

      //親ノードの場合は、子の数を保持する
      if (node.children === undefined || node.children === null) {
        node._childrenLength = 0;

        //親が閉じられている場合は全ての子ノードを非表示にする
        var isCloseChildren = node._children !== undefined && node._children.length > 0;
        if (isCloseChildren) {
          isShow = false;

          for (var i = 0, len = node._children.length; i < len; i++) {
            this.setChildProperties(node._children[i], i, isShow);
          }
        }
      } else {
        node._childrenLength = node.children.length;

        for (var _i = 0, _len = node.children.length; _i < _len; _i++) {
          this.setChildProperties(node.children[_i], _i, isShow);
        }
      }
    }
  }, {
    key: 'setLeafLength',
    value: function setLeafLength(node) {
      if (node.children === undefined || node.children === null) {
        node._leafLength = 0;
      } else {
        var leafLength = node._childrenLength;
        node.children.map(function (n) {
          if (n._leafLength > 0) {
            leafLength += n._leafLength - 1; //最初の子は親と同じy座標に位置するため-1する
          } else if (n._childrenLength > 0) {
            leafLength += n._childrenLength - 1; //最初の子は親と同じy座標に位置するため-1する
          }
        });
        node._leafLength = leafLength;
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
      } else if (node._childIndex === 0 || !node._isShow) {
        //長男ノードの場合は親の隣に位置するため、縦方向の位置は同じ
        verticalIndex = node.parent._verticalIndex;
      } else if (node.parent.children !== null) {
        //兄弟ノードの場合は自分の兄の縦方向の１つ下の位置
        node.parent.children.map(function (brotherNode) {
          if (brotherNode._childIndex === node._childIndex - 1) {
            verticalIndex = brotherNode._verticalIndex + brotherNode._leafLength;
            verticalIndex -= brotherNode._leafLength > 0 ? 1 : 0;
          }
        });
        verticalIndex += 1;
      }
      node._verticalIndex = verticalIndex;
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

      this.appendBackground();

      this.$nodeWrap = this.$svg.append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
    }
  }, {
    key: 'createNode',
    value: function createNode(dataSet) {
      var _this = this;

      var $nodes = this.$nodeWrap.selectAll('.node').data(dataSet, function (d) {
        return d.data.id;
      }).enter().append('g').attr('class', function (d) {
        return 'node' + (d.children ? ' node--branch' : ' node--leaf');
      }).attr('width', this.columnWidth).attr('height', this.nodeHeight).attr('opacity', 1).attr('transform', function (d) {
        return 'translate(' + d._x + ', ' + d._y + ')';
      }).on('click', function (d) {
        _this.setSelectedNodes([d]);
      }).on('dblclick', function (d) {
        _this.editStartNodeName(d);
      });

      //背景に敷くためのrect要素を先に要素追加しておき、後でプロパティを設定する
      var $nodesBg = $nodes.append('rect');

      //ノード名の左側に表示するアイコン
      var $nodeHead = $nodes.append('circle').attr('r', 3);

      //ノード名用text要素
      var $nodeText = $nodes.append('text').attr('class', 'node-name').attr('dx', function (d) {
        return '5px';
      }).attr('dy', '.35em').attr('x', function (d) {
        return 13;
      }).style('text-anchor', function (d) {
        return 'start';
      }).text(function (d) {
        return d.data.name;
      });

      //名前用text要素からサイズをキャッシュしておき、他要素のレイアウトの計算に使用する。
      $nodes.each(function (d) {
        var bbox = this.getBBox();
        d._nameWidth = bbox.width + bbox.x;
        d._nameHeight = bbox.height - bbox.y;
      });

      //背景用rect要素のプロパティを設定
      $nodesBg.attr('height', function (d) {
        return d._nameHeight;
      }).attr('class', 'node-bg').attr('width', this.columnWidth - 5).attr('height', this.nodeHeight).attr('x', 0).attr('y', -(this.nodeHeight / 2)).attr('fill', 'transparent');

      return $nodes;
    }
  }, {
    key: 'appendNode',
    value: function appendNode() {
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

      this.$nodes = this.createNode(this.nodeList);

      //親ノードのみをキャッシュ
      this.$branches = d3.selectAll('.node--branch');

      this.appendLineToChild();
      this.appendToggleChildren();
    }
  }, {
    key: 'updateNode',
    value: function updateNode(param) {
      var _this5 = this;

      if (param) {
        var _ret = function () {
          switch (param.type) {
            case NODE_METHOD.UPDATE_NAME:
              // 指定されたパラメータを元に内部データを更新する
              _this5.nodeList.map(function (node) {
                if (param.data.id !== node.data.id) return true;
                for (var key in param.data) {
                  node.data[key] = param.data[key];
                }
              });
              break;
            case NODE_METHOD.TOGGLE_CHILDREN:
              // ノードレイアウト情報を更新する。
              _this5.updateNodesLayout();
              break;
            case NODE_METHOD.DELETE_NODE:
              // 対象ノードをデータから削除し、各ノードの位置を再計算する。
              var parentNode = null;
              var deleteNode = null;
              _this5.nodes.each(function (d) {
                if (param.data.id !== d.data.id) {
                  return true;
                }
                deleteNode = d;
                parentNode = d.parent;
                return false;
              });

              if (parentNode === null) {
                return {
                  v: void 0
                };
              }

              // 確認処理を行い、キャンセルした場合は処理を中断する。
              var hasChildren = deleteNode.children && deleteNode.children.length > 0 || deleteNode._children && deleteNode._children.length > 0;
              var doConfirm = param.confirm && typeof param.confirm === 'function';
              if (hasChildren && doConfirm && !param.confirm()) {
                return {
                  v: void 0
                };
              }

              parentNode.children.map(function (d, i) {
                if (d.data.id !== deleteNode.data.id) {
                  return true;
                }
                parentNode.children.splice(i, 1);
              });

              _this5.nodeList = _this5.nodes.descendants();
              _this5.updateNodesLayout();
              break;
            case NODE_METHOD.APPEND_NODE_TEMP:
              _this5.nodeList = _this5.nodes.descendants();
              _this5.updateNodesLayout();
              break;
          }
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }

      var $newNode = this.createNode(this.nodeList);

      // 内部データを元に各ノードの状態を更新する
      this.$nodes = this.$nodeWrap.selectAll('.node').data(this.nodeList, function (d) {
        // idをもとに変更前と変更後のノード情報を紐づける
        return d.data.id;
      }).classed('is-close', false).transition().on('end', function (d) {
        // アニメーションが終わった後にノードを非表示にする
        if (!d._isShow) {
          d3.select(this).classed('is-close', true);
        }
      }).duration(800).attr('opacity', function (d) {
        return d._isShow ? 1 : 0;
      }).attr('transform', function (d) {
        return 'translate(' + d._x + ', ' + d._y + ')';
      });

      var $delNodes = this.$nodeWrap.selectAll('.node').data(this.nodeList, function (d) {
        return d.data.id;
      }).exit().remove();

      var $texts = this.$nodes.selectAll('.node-name').text(function (d) {
        return d.data.name;
      });

      if ($newNode !== undefined && $newNode !== null && $newNode.data().length > 0) {
        //内部データを更新した後、追加されたノードは編集状態にする
        var newNodeData = $newNode.data()[0];
        this.editStartNodeName(newNodeData);
        this.setSelectedNodes([newNodeData]);
      }

      this.updateToggleChildren();
    }
  }, {
    key: 'setSelectedNodes',
    value: function setSelectedNodes(selectNodes) {
      var selectIds = [];
      selectNodes.map(function (d) {
        selectIds.push(d.data.id);
      });

      this.$nodes.each(function (d) {
        var $node = d3.select(this);
        var isSelected = selectIds.indexOf(d.data.id) > -1;
        $node.classed('is-selected', isSelected);
      });
    }
  }, {
    key: 'getSelectedNodes',
    value: function getSelectedNodes() {
      var selectedNodes = this.$nodeWrap.select('.node.is-selected').data();
      if (selectedNodes === undefined && selectedData.length === 0) {
        return null;
      }
      return selectedNodes;
    }
  }, {
    key: 'deleteSelectedNode',
    value: function deleteSelectedNode() {
      var selectedNodes = this.getSelectedNodes();

      for (var i = 0, len = selectedNodes.length; i < len; i++) {
        this.deleteNode(selectedNodes[i]);
      }
    }
  }, {
    key: 'deleteNode',
    value: function deleteNode(node) {
      //編集中には削除処理を実行しない
      if (node._isEdit) {
        return;
      }

      this.updateNode({
        type: NODE_METHOD.DELETE_NODE,
        data: {
          id: node.data.id
        },
        confirm: function (_confirm) {
          function confirm() {
            return _confirm.apply(this, arguments);
          }

          confirm.toString = function () {
            return _confirm.toString();
          };

          return confirm;
        }(function () {
          return confirm('子階層のキーワードも削除されますが、本当に削除してもよろしいですか？');
        })
      });
    }
  }, {
    key: 'editStartNodeName',
    value: function editStartNodeName(node) {
      var _this = this;
      var $node = void 0;

      this.$nodes.each(function (d) {
        if (d.data.id === node.data.id) {
          $node = d3.select(this);
          return false;
        }
      });

      if ($node === undefined) {
        return;
      }

      node._isEdit = true;
      $node.classed('is-editing', true);

      //テキストボックスを生成し、編集状態にする
      var $inputNode = this.$svgWrap.append('input').attr('type', 'text').attr('value', node.data.name).attr('class', 'node-textbox').attr('style', 'left:' + node._x + 'px; top:' + node._y + 'px; width:' + (this.columnWidth - 6) + 'px; height:' + this.nodeHeight + 'px; margin-top:4px;').on('blur', function () {
        var isEmpty = this.value.trim() === '';
        var newNodeName = d3.select(this).node().value;

        //テキストボックスからフォーカスが外れた場合は元のラベルを更新する
        node._isEdit = false;
        $node.classed('is-editing', false);
        _this.$svgWrap.selectAll('.node-textbox').remove();

        if (isEmpty) {
          if (node._isTemp) {
            //ノード追加時の場合は追加前の状態に戻す
            _this.deleteNode(node);
            return;
          } else {
            //空文字の場合は元の名前に戻す
            newNodeName = node.data.name;
          }
        }

        _this.updateNode({
          type: NODE_METHOD.UPDATE_NAME,
          data: {
            id: node.data.id,
            name: newNodeName
          }
        });
      });

      $inputNode.node().focus();
    }
  }, {
    key: 'editEndNodeName',
    value: function editEndNodeName() {
      var $inputNode = this.$svgWrap.selectAll('.node-textbox');
      if ($inputNode.data().length === 0) {
        return;
      }
      $inputNode.node().blur();
    }
  }, {
    key: 'isNodeNameEmpty',
    value: function isNodeNameEmpty() {
      var isEmpty = true;
      var $inputNode = this.$svgWrap.selectAll('.node-textbox');
      if ($inputNode.data().length === 0) {
        return isEmpty;
      }
      isEmpty = $inputNode.node().value.trim() === '';
      return isEmpty;
    }
  }, {
    key: 'appendTempNode',
    value: function appendTempNode(selectedNode, direction) {
      var parentNode = selectedNode.parent;
      if (parentNode === null) {
        return;
      }

      this.tempId = this.tempId ? --this.tempId : -1;

      var tempNodeObj = {
        id: this.tempId,
        name: '',
        children: null,
        _isTemp: true
      };

      // ノード追加を行うための一時ノードを生成してツリーに加える
      var tempNodeData = this.createNodeData(tempNodeObj);

      switch (direction) {
        case APPEND_DIRECTION.TO_RIGHT:
          tempNodeData.depth = selectedNode.depth + 1;
          tempNodeData.parent = selectedNode;

          if (selectedNode.children === undefined || selectedNode.children === null) {
            selectedNode.children = [tempNodeData];
          } else {
            selectedNode.children.splice(0, 0, tempNodeData);
          }
          break;
        case APPEND_DIRECTION.TO_BOTTOM:
          tempNodeData.depth = selectedNode.depth;
          tempNodeData.parent = selectedNode.parent;

          parentNode.children.splice(selectedNode._childIndex + 1, 0, tempNodeData);
          break;
      }

      this.updateNode({
        type: NODE_METHOD.APPEND_NODE_TEMP
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