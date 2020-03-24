import LinkedListNode from './linkNode'
import Comparator from '../comparator'

export default class LinkedList {
  head: string | LinkedListNode;
  tail: LinkedListNode;
  compare: Comparator;

  constructor(comparatorFunction: (a: unknown, b: unknown) => number) {
    this.head = null;
    this.tail = null;
    this.compare = new Comparator(comparatorFunction)
  }

  prepend(value: string) {
    const newNode = new LinkedListNode(value, this.head as LinkedListNode)
    this.head = newNode

    if(!this.tail) {
      this.tail = newNode
    }

    return this
  }

  append(value: unknown) {
    const newNode = new LinkedListNode(value)

    // 如果不存在头部节点，则将新创建的复制给头部
    if(!this.head) {
      this.head = newNode
      this.tail = newNode

      return this
    }

    this.tail.next = newNode
    this.tail = newNode

    return this
  }

  delete(value: unknown) {
    if(!this.head) {
      return null;
    }

    let deleteNode = null

    // If the head must be deleted then make next node that is differ
    // from the head to be a new head.
    while(this.head && this.compare.equal((this.head as LinkedListNode).value, value)) {
      deleteNode = this.head
      this.head = (this.head as LinkedListNode).next
    }

    let currentNode = this.head as LinkedListNode

    if(currentNode) {
      // If next node must be deleted then make next node to be a next next one.
      while(currentNode.next) {
        if(this.compare.equal(currentNode.next.value, value)) {
          deleteNode = currentNode.next
          currentNode.next = currentNode.next.next
        } else {
          currentNode = currentNode.next
        }
      }
    }

    // Check if tail must be deleted.
    if(this.compare.equal(this.tail.value, value)) {
      this.tail = currentNode
    }

    return deleteNode
  }

  /**
   * 在链表中查找指定的节点
   * @param value 要找的节点ID
   * @param callback 自定义的回调函数
   */
  find({ value = undefined, callback = undefined } ) {
    if(!this.head) {
      return null;
    }

    let currentNode = this.head as LinkedListNode

    while(currentNode) {
      // If callback is specified then try to find node by callback.
      if(callback && callback(currentNode.value)) {
        return currentNode
      }

      // If value is specified then try to compare by value..
      if(value !== undefined && this.compare.equal(currentNode.value, value)) {
        return currentNode
      }

      currentNode = currentNode.next
    }
    return null
  }

  toArray(): LinkedListNode[] {
    const nodes = []

    let currentNode = this.head as LinkedListNode
    while(currentNode) {
      nodes.push(currentNode)
      currentNode = currentNode.next
    }

    return nodes
  }

  toString(callback?: Function) {
    return this.toArray().map((node: any) => node.toString(callback)).toString()
  }
}