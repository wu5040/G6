/**
 * @fileOverview random layout
 * @author shiwu.wyy@antfin.com
 */

import { IPointTuple, NodeConfig } from '../types';
import { BaseLayout } from './layout';
import { clone, isNumber } from '@antv/util';
import { cloneDeep } from 'lodash';

/**
 * 随机布局
 */
export default class SankeyLayout extends BaseLayout {
  /** 布局中心 */
  public center: IPointTuple = [0, 0];
  /** 宽度 */
  public width: number = 300;
  /** 高度 */
  public height: number = 300;
  /** layout 方向, 可选 TB, BT, LR, RL */
  public rankdir: 'TB' | 'BT' | 'LR' | 'RL' = 'TB';
  /** 节点宽度，当 rankdir 为 LR 时，若该值为 undefined，将会根据当前图的大小、ranksep、padding 自动计算出高度；若指定了该值，则有可能超出图宽度限制 */
  public nodeWidth: number | undefined;
  /** 节点高度，当 rankdir 为 LR 时，该值将作为最小节点高度 */
  public nodeHeight: number | undefined;
  /** 节点水平间距(px) */
  public nodesepFunc: ((d?: any) => number) | undefined;
  /** 每一层节点之间间距 */
  public ranksepFunc: ((d?: any) => number) | undefined;
  /** 节点水平间距(px) */
  public nodesep: number = 10;
  /** 每一层节点之间间距 */
  public ranksep: number = 50;
  /** 节点分层的方式，undefined 代表按有向图自动排列节点。也可以指定为节点数据中的一个 Number 类型的字段名，将根据该字段值决定该节点的层级。 */
  public ordering: string | undefined;
  /** 一个节点上边的排序方式（连入顺序），undefined 代表按照端点位置自动计算连入节点的位置，以避免过多边的交叉。也可以指定为边数据中的一个字段名，将首先根据该字段值决定一个节点上边的排序方式。 */
  public edgeOrdering: string | undefined;
  /** 边权重（粗细）的字段名，默认为 weight。若边数据中不存在 weight，权重值将会被统一设置为 1 */
  public edgeWeightName: string;
  /** 全图上、右、下、左四个方向上的留白距离 */
  public padding: number[] | number;

  /** 存储每一层的节点 */
  private levels: any[][];

  /** 节点数最多的一层所含节点数量 */
  private levelMaxNodes: number;

  public getDefaultCfg() {
    return {
      center: [0, 0],
      width: 300,
      height: 300,
      rankdir: 'LR',
      nodesep: 10,
      ranksep: 150,
      edgeWeightName: 'weight',
      padding: 10,
      nodeHeight: 30,
      nodeWidth: 10
    };
  }
  /**
   * 执行布局
   */
  public execute() {
    const self = this;
    const nodes = self.nodes;
    const edges = self.edges;
    const center = self.center;
    if (!self.width && typeof window !== 'undefined') {
      self.width = window.innerWidth;
    }
    if (!self.height && typeof window !== 'undefined') {
      self.height = window.innerHeight;
    }

    const cnodes: any[] = cloneDeep(nodes);
    const cedges: any[] = cloneDeep(edges);

    const nodeMap = {};
    cnodes.forEach(node => {
      nodeMap[node.id] = node;
      node.outEdges = [];
      node.inEdges = [];
      node.outDegree = 0;
      node.inDegree = 0;
      node.outWeight = 0;
      node.inWeight = 0;
      node.anchorPoints = [];
    });
    cedges.forEach(edge => {
      edge.weight = edge[self.edgeWeightName];
      edge.fourPoints = [];
      edge.controlPoints = [];
      const sourceNode = nodeMap[edge.source];
      sourceNode.outEdges.push(edge);
      sourceNode.outDegree ++;
      sourceNode.outWeight += edge.weight;
      const targetNode = nodeMap[edge.target];
      targetNode.inEdges.push(edge);
      targetNode.inDegree ++;
      targetNode.inWeight += edge.weight;
    });

    // get self.levels
    if (!self.ordering) {
      self.autoLevels(cnodes, nodeMap);
    } else {
      self.orderedLevels(cnodes, nodeMap);
    }

    // node sizes and edge width
    const padding = self.padding;
    // 暂时先考虑 LR 的情况
    const widthPadding = isNumber(padding) ? padding * 2 : (padding[1] + padding[3]);
    const heightPadding = isNumber(padding) ? padding * 2 : (padding[0] + padding[2]);
    const levelsCount = self.levels.length;
    const nodeWidth = self.nodeWidth || (self.width - widthPadding - (levelsCount - 1) * self.ranksep) / levelsCount;
    // the sum of the weights comes from the first level
    let weightSum = 0;
    self.levels[0].forEach(node => {
      weightSum += node.outWeight;
    });

    const levelNodeNum = self.levelMaxNodes || self.levels[0].length;
    const layoutHeight = self.height - heightPadding - (self.levelMaxNodes - 1) * self.nodesep;
    const heightRatio = layoutHeight / weightSum;

    self.levels.forEach((level, i) => {
      level.forEach((node, j) => {
        if (i === 0) {
          node.length = heightRatio * node.outWeight || self.nodeHeight;
        }
        else {
          node.length = heightRatio * node.inWeight || self.nodeHeight;
        }
        node.level = i;
        node.posIdx = j;
        node.outEdges.forEach(edge => {
          edge.size = heightRatio * edge.weight;
        });
      });
    });

    // order the nodes for each level
    // from 0 - max level
    self.levels.forEach(level => {
      level.forEach(node => {
        let meanRelatedNodePos = 0;
        node.outEdges.forEach(edge => {
          meanRelatedNodePos += nodeMap[edge.target].posIdx;
        }); 
        meanRelatedNodePos /= node.outEdges.length;
        node.posIdx = meanRelatedNodePos;
      });
    });
    // from max - 0 level
    for (let i = self.levels.length - 1; i >= 0; i --) {
      const level = self.levels[i];
      level.forEach(node => {
        let meanRelatedNodePos = 0;
        node.inEdges.forEach(edge => {
          meanRelatedNodePos += nodeMap[edge.source].posIdx;
        }); 
        meanRelatedNodePos /= node.inEdges.length;
        node.posIdx = meanRelatedNodePos;
      });
    }

    // arrange the positions for nodes according to the posIdx
    const sortNodes = (nodea, nodeb) => {
      return nodea.posIdx - nodeb.posIdx;
    }
    const topPadding = isNumber(padding) ? padding : padding[0];
    const leftPadding = isNumber(padding) ? padding : padding[3];
    let positionOffsetX = leftPadding;
    self.levels.forEach(level => {
      level.sort(sortNodes);
      let positionOffsetY = topPadding;
      level.forEach(node => {
        node.x = positionOffsetX;
        node.y = positionOffsetY;
        positionOffsetY += (node.length + self.nodesep);
      });
      positionOffsetX += (nodeWidth + self.ranksep);
    });

    // order the edges for each node, and calculates the four points for an edge
    const sortOutEdges = (edgea, edgeb) => {
      return nodeMap[edgea.target].posIdx - nodeMap[edgeb.target].posIdx;
    };
    const sortInEdges = (edgea, edgeb) => {
      return nodeMap[edgea.source].posIdx - nodeMap[edgeb.source].posIdx;
    };
    cnodes.forEach(node => {
      node.outEdges.sort(sortOutEdges);
      node.inEdges.sort(sortInEdges);
      // calculate the two source points (p0, p1) for outEdges of a node
      let positionOffsetY = 0;
      node.outEdges.forEach((oedge, i) => {
        // if the widths of the two ends of an edge can be different
        oedge.fourPoints[0] = { x: node.x + nodeWidth, y: positionOffsetY };
        oedge.fourPoints[1] = { x: node.x + nodeWidth, y: positionOffsetY + oedge.size }; 

        // // if the edge is a simple cubic bezier curve with even size along it
        node.anchorPoints.push([1, (positionOffsetY + oedge.size / 2) / node.length]);
        oedge.sourceAnchor = node.anchorPoints.length - 1;

        oedge.outPosIdx = i;
        positionOffsetY += oedge.size;
      });
      // calculate the two target points (p2, p3) for outEdges of a node
      positionOffsetY = 0;
      node.inEdges.forEach((iedge, i) => {

        // if the widths of the two ends of an edge can be different
        iedge.fourPoints[2] = { x: node.x, y: positionOffsetY };
        iedge.fourPoints[3] = { x: node.x, y: positionOffsetY + iedge.size }; 

        // // if the edge is a simple cubic bezier curve with even size along it
        node.anchorPoints.push([0, (positionOffsetY + iedge.size / 2) / node.length]);
        iedge.targetAnchor = node.anchorPoints.length - 1;

        iedge.inPosIdx = i;
        positionOffsetY += iedge.size;
      });
    });

    // calculate the controlpoints for edges, if the widths of the two ends of an edge can be different
    cedges.forEach(edge => {
      edge.controlPoints = [
        { x: (edge.fourPoints[0].x + edge.fourPoints[2].x) / 2, y: edge.fourPoints[0].y  },
        { x: (edge.fourPoints[0].x + edge.fourPoints[2].x) / 2, y: edge.fourPoints[2].y },
        { x: (edge.fourPoints[0].x + edge.fourPoints[2].x) / 2, y: edge.fourPoints[1].y },
        { x: (edge.fourPoints[0].x + edge.fourPoints[2].x) / 2, y: edge.fourPoints[3].y }
      ];
    });

    // copy the useful infomations to the origin data
    nodes.forEach((node, i) => {
      node.x = cnodes[i].x;
      node.y = cnodes[i].y;
      node.style = {};
      node.style.width = nodeWidth;
      node.style.height = cnodes[i].length;
      node.anchorPoints = cnodes[i].anchorPoints;
    });
    edges.forEach((edge, i) => {
      edge.size = cedges[i].size;
      edge.sourceAnchor = cedges[i].sourceAnchor;
      edge.targetAnchor = cedges[i].targetAnchor;
    });
  }
  private autoLevels(nodes, nodeMap) {
    const self = this;
    const levels = [];
    let levelMaxNodes = 0;
    let minInDegree = 0;
    let minOutDegree = 0;
    nodes.forEach(node => {
      if (minInDegree > node.inDegree) {
        minInDegree = node.inDegree;
      }
      if (minOutDegree > node.outDegree) {
        minOutDegree = node.outDegree;
      }
    });

    levels.push([]);
    let addedCount = 0;
    nodes.forEach(node => {
      if (node.inDegree === minInDegree) {
        levels[0].push(node);
        node.addedToLevel = true;
        addedCount++;
      }
    });
    levelMaxNodes = addedCount;

    let levelCount = 1;
    while (addedCount < nodes.length) {
      levels.push([]); 
      let levelNodeCount = 0;
      levels[levelCount - 1].forEach(node => {
        node.outEdges.forEach(oedge => {
          const targetNode = nodeMap[oedge.target];
          if (!targetNode.addedToLevel) {
            levels[levelCount].push(nodeMap[oedge.target]);
            targetNode.addedToLevel = true;
            addedCount++;
            levelNodeCount++;
          }
        });
      });
      if (levelNodeCount > levelMaxNodes) levelMaxNodes = levelNodeCount;
      levelCount++;
    }
    self.levelMaxNodes = levelMaxNodes;
    self.levels = levels;
  }
  private orderedLevels(nodes, edges) {
    const levels = [];
    return levels;
  }
}
