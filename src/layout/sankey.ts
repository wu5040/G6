/**
 * @fileOverview random layout
 * @author shiwu.wyy@antfin.com
 */

import { IPointTuple, NodeConfig } from '../types';
import { BaseLayout } from './layout';
import { clone, isNumber } from '@antv/util';

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
  /** 节点宽度，当 rankdir 为 LR 时，若该值为 undefined，将会根据当前图的大小、ranksep、padding 自动计算出高度；若指定了该值，则有可能超出图高度限制 */
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
  private levels: NodeConfig[][];
  /** 一层节点数量最大值 */
  private maxNodeNumALevel: number;

  public getDefaultCfg() {
    return {
      center: [0, 0],
      width: 300,
      height: 300,
      rankdir: 'LR',
      nodesep: 10,
      ranksep: 50,
      edgeWeightName: 'weight',
      padding: 10
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

    const cnodes = clone(nodes);
    const cedges = clone(edges);

    const nodeMap = {};
    cnodes.forEach(node => {
      nodeMap[node.id] = node;
      node.outEdges = [];
      node.inEdges = [];
      node.outDegree = 0;
      node.inDegree = 0;
    });
    cedges.forEach(edge => {
      const sourceNode = nodeMap[edge.source];
      sourceNode.outEdges.push(edge);
      sourceNode.outDegree ++;
      const targetNode = nodeMap[edge.target];
      targetNode.inEdges.push(edge);
      targetNode.inDegree ++;
      edge.weight = edge[self.edgeWeightName];
    });

    // get self.levels
    if (!self.ordering) {
      self.autoLevels(cnodes, cedges);
    } else {
      self.orderedLevels(cnodes, cedges);
    }

    // node sizes
    const padding = self.padding;
    const heightPadding = isNumber(padding) ? padding * 2 : (padding[0] + padding[2]);
    const levelsCount = self.levels.length;
    const nodeHeight = self.nodeHeight || (self.height - heightPadding - (levelsCount - 1) * self.ranksep) / levelsCount;

  }
  private autoLevels(nodes, nodeMap) {
    const self = this;
    const levels = [];
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
    let maxNodeNumALevel = 0;
    nodes.forEach(node => {
      if (node.inDegree === minInDegree) {
        levels.push(node);
        node.addedToLevel = true;
        addedCount++;
        maxNodeNumALevel++;
      }
    });

    let levelCount = 1;
    while (addedCount < nodes.length) {
      levels.push([]); 
      let levelNodeNum = 0;
      levels[levelCount - 1].forEach(node => {
        node.outEdges.forEach(oedge => {
          const targetNode = nodeMap[oedge.target];
          if (!targetNode.addedToLevel) {
            levels[levelCount].push(nodeMap[oedge.target]);
            targetNode.addedToLevel = true;
            addedCount++;
            levelNodeNum++;
          }
        });
        if (levelNodeNum > maxNodeNumALevel) {
          maxNodeNumALevel = levelNodeNum;
        }
        levelCount++;
      });
    }
    self.maxNodeNumALevel = maxNodeNumALevel;
    self.levels = levels;
  }
  private orderedLevels(nodes, edges) {
    const levels = [];
    return levels;
  }
}
