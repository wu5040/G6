import React, { useEffect } from 'react';
import G6 from '../../../src';
import { IGraph } from '../../../src/interface/graph';
import { mix } from '@antv/util';

const data = {
  nodes: [
    // --- level1 ---
    {
      id: 'ali',
      label: '阿里经济体',
      subs: [{
        id: 'gaode',
        label: '高德'
      }, {
        id: 'taobao',
        label: '淘宝'
      }, {
        id: 'youku',
        label: '优酷'
      }, {
        id: 'other',
        label: '其它'
      }]
    },
    {
      id: 'outer',
      label: '外部流量采购',
      subs: [{
        id: 'qutoutiao',
        label: '趣头条'
      }, {
        id: 'aiqiyi',
        label: '爱奇艺'
      }, {
        id: 'other',
        label: '其它'
      }]
    },
    {
      id: 'merchant',
      label: '商家自主引流'
    },
    {
      id: 'offline',
      label: '线下推广',
    },
    {
      id: 'push',
      label: '推送引流',
    },
    {
      id: 'nature',
      label: '自然流量',
    },

// --- level2 ---
    {
      id: 'search',
      label: '搜索',
    },
    {
      id: 'app',
      label: '应用中心',
    },
    {
      id: 'homepage',
      label: '首页封腰',
    },

// --- level3 ---
    {
      id: 'digit',
      label: '数字金融线',
      subs: [{
        id: 'huabei',
        label: '花呗'
      }, {
        id: 'jiebei',
        label: '借呗'
      }, {
        id: 'manage',
        label: '大理财'
      }, {
        id: 'insurance',
        label: '保险'
      }],
    }
  ],
  edges: [
    {
      source: 'ali',
      target: 'app',
      sourceSub: 'gaode',
      weight: 5,
    },
    {
      source: 'ali',
      target: 'homepage',
      sourceSub: 'gaode',
      weight: 2,
    },
    {
      source: 'ali',
      target: 'search',
      sourceSub: 'taobao',
      weight: 15,
    },
    {
      source: 'ali',
      target: 'homepage',
      sourceSub: 'taobao',
      weight: 20,
    },
    {
      source: 'ali',
      target: 'other',
      sourceSub: 'homepage',
      weight: 1,
    },

    {
      source: 'outer',
      target: 'search',
      sourceSub: 'qutoutiao',
      weight: 5,
    },
    {
      source: 'outer',
      target: 'homepage',
      sourceSub: 'other',
      weight: 25,
    },

    {
      source: 'merchant',
      target: 'app',
      weight: 30,
    },


    {
      source: 'offline',
      target: 'app',
      weight: 15,
    },


    {
      source: 'push',
      target: 'search',
      weight: 8,
    },


    {
      source: 'nature',
      target: 'search',
      weight: 68,
    },
    {
      source: 'nature',
      target: 'app',
      weight: 40,
    },
    {
      source: 'nature',
      target: 'homepage',
      weight: 30,
    },
// ---level2 -> level3---
    {
      source: 'search',
      target: 'digit',
      targetSub: 'huabei',
      weight: 30,
    },
    {
      source: 'search',
      target: 'digit',
      targetSub: 'jiebei',
      weight: 16,
    },
    {
      source: 'search',
      target: 'digit',
      targetSub: 'manage',
      weight: 50,
    },

    {
      source: 'app',
      target: 'digit',
      targetSub: 'huabei',
      weight: 20,
    },
    {
      source: 'app',
      target: 'digit',
      targetSub: 'manage',
      weight: 40,
    },
    {
      source: 'app',
      target: 'digit',
      targetSub: 'huabei',
      weight: 30,
    },

    {
      source: 'homepage',
      target: 'digit',
      targetSub: 'manage',
      weight: 70,
    },
    {
      source: 'homepage',
      target: 'digit',
      targetSub: 'insurace',
      weight: 8,
    },
  ],
};

let graph: IGraph = null;

const SankeyLayout = () => {
  const container = React.useRef();
  useEffect(() => {
    if (!graph) {

      G6.registerNode('sankey-node', {
        draw: (cfg, group) => {
          let attrs: any = {
            fill: '#098BFF',
            opacity: 0.2,
            width: 100,
            height: 30
          };
          if (cfg.style) {
            attrs = mix(attrs, cfg.style);
          }
          const rect = group.addShape('rect', {
            attrs: {
              ...attrs,
              x: 0,
              y: 0
            }
          });

          if (cfg.subs) {

          }

          if(cfg.label) {
            group.addShape('text', {
              attrs: {
                text: cfg.label,
                x: 0,
                y: 0,
                fill: '#000'
              }
            });
          }
          return rect
        }
      });
      G6.registerEdge('sankey-edge', {
        draw: (cfg: any, group) => {
          let attrs: any = {
            fill: '#ccc',
            lineWidth: 1,
            stroke: '#bbb',
            path: '',
            opacity: 0.5
          };
          if (cfg.style) {
            attrs = mix(attrs, cfg.style);
          }
          
          const sourceNode = cfg.sourceNode;
          const targetNode = cfg.targetNode;
          if (sourceNode && targetNode && sourceNode.getModel().anchorPoints && targetNode.getModel().anchorPoints) {
            group.addShape('text', {
              attrs: {
                text: `${sourceNode.getModel().label}-${targetNode.getModel().label}`,
                x: 0,
                y: 0
              }
            });
            const sourceNodeKeyShape = sourceNode.getKeyShape();
            const targetNodeKeyShape = targetNode.getKeyShape();
            const sourceAnchorPoints = sourceNode.getModel().anchorPoints;
            const targetAnchorPoints = targetNode.getModel().anchorPoints;
            const sourceAnchorPoint = {
              x: sourceAnchorPoints[cfg.sourceAnchor][0] * sourceNodeKeyShape.attr('width') + sourceNode.getModel().x,
              y: sourceAnchorPoints[cfg.sourceAnchor][1] * sourceNodeKeyShape.attr('height') + sourceNode.getModel().y,
            };
            const targetAnchorPoint = {
              x: targetAnchorPoints[cfg.targetAnchor][0] * targetNodeKeyShape.attr('width') + targetNode.getModel().x,
              y: targetAnchorPoints[cfg.targetAnchor][1] * targetNodeKeyShape.attr('height') + targetNode.getModel().y,
            };
            const fourPoints = [];
            fourPoints.push({
              x: sourceAnchorPoint.x,
              y: sourceAnchorPoint.y - cfg.size / 2,
            });
            fourPoints.push({
              x: sourceAnchorPoint.x,
              y: sourceAnchorPoint.y + cfg.size / 2,
            });
            fourPoints.push({
              x: targetAnchorPoint.x,
              y: targetAnchorPoint.y - cfg.size / 2,
            });
            fourPoints.push({
              x: targetAnchorPoint.x,
              y: targetAnchorPoint.y + cfg.size / 2,
            });

            const controlPoints = [
              { x: (fourPoints[0].x + fourPoints[2].x) / 2, y: fourPoints[0].y  },
              { x: (fourPoints[0].x + fourPoints[2].x) / 2, y: fourPoints[2].y },
              { x: (fourPoints[0].x + fourPoints[2].x) / 2, y: fourPoints[1].y },
              { x: (fourPoints[0].x + fourPoints[2].x) / 2, y: fourPoints[3].y }
            ];

            attrs.path = [
              [ 'M', fourPoints[0].x, fourPoints[0].y ],
              [ 'C', controlPoints[0].x, controlPoints[0].y, controlPoints[1].x, controlPoints[1].y, fourPoints[2].x, fourPoints[2].y ],
              [ 'L', fourPoints[3].x, fourPoints[3].y],
              [ 'C', controlPoints[3].x, controlPoints[3].y, controlPoints[2].x, controlPoints[2].y, fourPoints[1].x, fourPoints[1].y ],
              [ 'Z' ]
            ];
          }
          const path = group.addShape('path', {
            attrs
          });
          if (cfg.label) {
            group.addShape('text', {
              attrs: {
                text: cfg.label,
                x: 0,
                y: 0
              }
            });
          }
          return path
        }
      });
      const graph = new G6.Graph({
        container: container.current as string | HTMLElement,
        width: 1000,
        height: 500,
        layout: {
          type: 'sankey',
          ranksep: 350,
          nodesep: 30
        },
        defaultNode: {
          type: 'sankey-node'
        },
        defaultEdge: {
          type: 'sankey-edge'
        },
        modes: {
          default: ['drag-node', 'drag-canvas']
        }
      });
      data.nodes.forEach((node: any) => {
        node.label = node.id;
      })
      graph.data(data);
      graph.render();
      graph.getNodes().forEach(node => {
        node.refresh()
      });
      graph.getEdges().forEach(edge => {
        edge.refresh()
      });
      // graph.fitView();
    }
  });
  return <div ref={container}></div>;
};

export default SankeyLayout;
