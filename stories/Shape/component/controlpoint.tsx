import React, { useEffect } from 'react'
import G6 from '../../../src'
import { IGraph } from '../../../src/interface/graph'

let graph: IGraph = null

const data = {
  nodes: [{
    id: 'node1',
    x: 150,
    y: 100,
    size: 40,
    // anchorPoints: [[ 1, 0.5 ], [ 1, 0 ]]
  }, {
    id: 'node2',
    x: 250,
    y: 150,
    size: 40,
    // anchorPoints: [[ 0, 0.5 ], [ 0, 1 ]]
  }],
  edges: [{
    id: 'edge1',
    source: 'node1',
    target: 'node2',
    // sourceAnchor: 0,
    // targetAnchor: 0
  }]
};

G6.registerEdge('line-arrow', {
  getPath(points) {
    const startPoint = points[0];
    const endPoint = points[1];
    return [
    [ 'M', startPoint.x, startPoint.y ],
    [ 'L', endPoint.x / 3 + 2 / 3 * startPoint.x, startPoint.y ],
    [ 'L', endPoint.x / 3 + 2 / 3 * startPoint.x, endPoint.y ],
    [ 'L', endPoint.x, endPoint.y ]];
  },
  getShapeStyle(cfg) {
    const startPoint = cfg.startPoint;
    const endPoint = cfg.endPoint;
    const controlPoints = this.getControlPoints(cfg);
    let points = [ startPoint ]; // 添加起始点
    // 添加控制点
    if (controlPoints) {
    points = points.concat(controlPoints);
    }
    // 添加结束点
    points.push(endPoint);
    const path = this.getPath(points);
    const style = Object.assign({}, G6.Global.defaultEdge.style, {
    stroke: '#BBB',
    lineWidth: 1,
    path,
    startArrow: {
        path: 'M 6,0 L -6,-6 L -3,0 L -6,6 Z',
        d: 6
    },
    endArrow: {
        path: 'M 6,0 L -6,-6 L -3,0 L -6,6 Z',
        d: 6
    }
    }, cfg.style);
    return style;
  }
}, 'line');

const ControlPoint = () => {
  const container = React.useRef()

  useEffect(() => {
    if(!graph) {
      graph = new G6.Graph({
        container: container.current as string | HTMLElement,
        width: 1000,
        height: 1000,
        defaultNode: {
          style: {
          fill: '#DEE9FF',
          stroke: '#5B8FF9'
          }
        },
        defaultEdge: {
          shape: 'polyline',
          style: {
            radius: 10,
            offset: 30,
            endArrow: true,
            stroke: '#F6BD16'
          }
        },
        modes: {
          // 支持的 behavior
          default: [ 'drag-node' ]
        }
      });
    }
    graph.get('canvas').set('localRefresh', false);
    graph.data(data)
    graph.render()

    setTimeout(() => {
        const node = graph.getNodes()[1];
        graph.emit('node:dragstart', { x: 250, y: 150, item: node });
        graph.emit('node:drag', { x: 50, y: 50, item: node });
        graph.emit('node:dragend', { x: 50, y: 50, item: node });
    }, 1000);
  })

  return (
    <div ref={container}></div>
  )
}

export default ControlPoint