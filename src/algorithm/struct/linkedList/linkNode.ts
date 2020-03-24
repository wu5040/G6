export default class LinkedListNode {
  value: unknown;
  next: LinkedListNode | null;

  constructor(value: unknown, next?: LinkedListNode | null) {
    this.value = value
    this.next = next
  }
}