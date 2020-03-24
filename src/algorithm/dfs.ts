import Graph from './struct/graph/Graph'
import GraphVertex from './struct/graph/GraphVertex'

interface IParams {
  currentVertex: GraphVertex;
  previousVertex: GraphVertex;
  nextVertex?: GraphVertex;
}
interface ICallback {
  allowTraversal?: (params?: any) => boolean;
  enterVertex: (params?: IParams) => void;
  leaveVertex: (params?: IParams) => void
}

/**
 * 初始化 callback
 * @property {(vertices: object) => object} [allowTraversal] 
 *  确定 DFS 是否应该从顶点遍历其邻居节点，默认情况下，不允许再次访问同一个顶点
 * @property {(vertices: object) => object} [enterVertex] 当 DFS 遍历进入顶点时调用
 * @property {(vertices: object) => object} [leaveVertex] 当 DFS 遍历离开顶点时调用
 * @param callbacks 
 */
const initCallbacks = (callbacks = {}) => {
  const initiatedCallback = (callbacks || {}) as ICallback

  const stubCallback = () => {}

  const allowTraversalCallback = (
    () => {
      const seen = {}
      return (({ nextVertex }) => {
        if(!seen[nextVertex.getKey()]) {
          seen[nextVertex.getKey()] = true
          return true
        }
        return false
      })
    }
  )()

  initiatedCallback.allowTraversal = (callbacks as ICallback).allowTraversal || allowTraversalCallback
  initiatedCallback.enterVertex = (callbacks as ICallback).enterVertex || stubCallback
  initiatedCallback.leaveVertex = (callbacks as ICallback).leaveVertex || stubCallback

  return initiatedCallback
}

const depthFirstSearchRecursive = (graph: Graph, currentVertex: GraphVertex, previousVertex: GraphVertex, callback: ICallback) => {
  callback.enterVertex({ currentVertex, previousVertex })

  graph.getNeighbors(currentVertex).map((nextVertex) => {
    if(callback.allowTraversal({ previousVertex, currentVertex, nextVertex })) {
      depthFirstSearchRecursive(graph,  nextVertex, currentVertex, callback)
    }
  })

  callback.leaveVertex({ currentVertex, previousVertex })
}

/**
 * DFS 遍历 Graph
 * @param graph Graph 数据结构实例
 * @param startVertex 开始节点
 * @param callback 配置回调
 */
export default function depthFirstSearch(graph: Graph, startVertex: GraphVertex, callback?: ICallback) {
  const previousVertex = null
  depthFirstSearchRecursive(graph, startVertex, previousVertex, initCallbacks(callback))
}