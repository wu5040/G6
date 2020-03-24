import GraphEdge from './GraphEdge'
import LinkedList from '../linkedList'
import LinkedListNode from '../linkedList/linkNode';

export default class GraphVertex {
  value: string;
  edges: LinkedList;

  /**
   * 
   * @param value 节点ID
   */
  constructor(value: string) {
    if(value === undefined) {
      throw new Error('Graph Vertex must have a value')
    }

    /**
     * 比较两条边
     * @param edgeA 第一条边
     * @param edgeB 第二条边
     */
    const edgeComparator = (edgeA: GraphEdge, edgeB: GraphEdge) => {
      if(edgeA.getKey() === edgeB.getKey()) {
        return 0
      }

      return edgeA.getKey() < edgeB.getKey() ? -1 : 1
    }

    this.value = value
    this.edges = new LinkedList(edgeComparator)
  }

  /**
   * 添加指定边
   * @param edge 边的实例
   */
  public addEdge(edge: GraphEdge) {
    this.edges.append(edge)

    return this
  }

  /**
   * 删除指定边
   * @param edge 
   */
  public deleteEdge(edge: GraphEdge) {
    this.edges.delete(edge)
  }

  /**
   * 返回当前节点的所邻居
   */
  public getNeighbors(): GraphVertex[] {
    const edges = this.edges.toArray()

    const neighborConverter = (node: LinkedListNode) => {
      return (node.value as GraphEdge).startVertex === this 
        ? (node.value as GraphEdge).endVertex : (node.value as GraphEdge).startVertex
    }

    return edges.map(neighborConverter)
  }

  /**
   * 返回当前节点所有的边
   */
  public getEdges(): GraphEdge[] {
    return this.edges.toArray().map(linkedlistNode => linkedlistNode.value) as GraphEdge[]
  }

  /**
   * 获取节点的度数
   */
  public getDegree(): number {
    return this.edges.toArray().length
  }

  /**
   * 节点是否有指定的邻居
   * @param vertex 节点实例
   */
  public hasNeighbor(vertex: GraphVertex): boolean {
    const vertexNode = this.edges.find({
      callback: (edge: GraphEdge) => edge.startVertex === vertex || edge.endVertex === vertex
    })

    return !!vertexNode
  }

  /**
   * 查找是否存在指定边
   * @param requiredEdge 边的实例
   */
  public hasEdge(requiredEdge: GraphEdge) {
    const edgeNode = this.edges.find({
      callback: edge => edge === requiredEdge
    })

    return !!edgeNode
  }

  /**
   * 查找和指定的节点之间的边
   * @param vertex 节点实例
   */
  public findEdge(vertex: GraphVertex): GraphEdge | null {
    const edgeFinder = (edge: GraphEdge) => {
      return edge.startVertex === vertex || edge.endVertex === vertex
    }

    const edge = this.edges.find({ callback: edgeFinder }) as LinkedListNode

    return edge ? edge.value as GraphEdge : null
  }

  /**
   * 获取节点的唯一标识符
   */
  public getKey(): string {
    return this.value
  }

  /**
   * 删除所有的边
   */
  public deleteAllEdges() {
    this.getEdges().map(edge => this.deleteEdge(edge))
  }

  /**
   * 返回节点的字符串形式
   * @param callback 自定义函数
   */
  public toString(callback?: Function) {
    return callback ? callback(this.value) : `${this.value}`
  }
}