import Vertex from './GraphVertex'

export default class GraphEdge {
  startVertex: Vertex;
  endVertex: Vertex;
  weight: number;

  /**
   * 
   * @param startVertex 起始节点
   * @param endVertex 结束节点
   * @param weight 权重
   */
  constructor(startVertex: Vertex, endVertex: Vertex, weight = 0) {
    this.startVertex = startVertex
    this.endVertex = endVertex
    this.weight = weight
  }

  /**
   * 获取边的ID
   */
  getKey(): string {
    const startVertexKey = this.startVertex.getKey()
    const endVertexKey = this.endVertex.getKey()

    return `${startVertexKey}_${endVertexKey}`
  }

  reverse() {
    const tmp = this.startVertex
    this.startVertex = this.endVertex
    this.endVertex = tmp

    return this
  }

  public toString() {
    return this.getKey()
  }
}