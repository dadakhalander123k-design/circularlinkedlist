/**
 * Circular Linked List Core Data Structure & Validation Engine
 * 
 * Provides real pointer-based node representations, circular link validation,
 * insertion, deletion, searching, and traversal operations.
 */

export interface CLLNode {
  id: string;
  value: number;
  nextId: string | null;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
  code?: 'CORRECT' | 'NULL_POINTER' | 'DISCONNECTED' | 'WRONG_HEAD' | 'BROKEN_CYCLE' | 'EMPTY';
}

export class CircularLinkedListModel {
  public nodes: Map<string, CLLNode> = new Map();
  public headId: string | null = null;

  constructor(initialValues?: number[]) {
    if (initialValues && initialValues.length > 0) {
      this.initFromValues(initialValues);
    }
  }

  /**
   * Initializes a valid circular linked list from an array of numbers.
   */
  public initFromValues(values: number[]) {
    this.nodes.clear();
    this.headId = null;
    if (values.length === 0) return;

    const createdNodes: CLLNode[] = values.map((val, idx) => ({
      id: `node-${idx}-${val}-${Math.random().toString(36).substring(2, 6)}`,
      value: val,
      nextId: null,
    }));

    for (let i = 0; i < createdNodes.length; i++) {
      const nextIdx = (i + 1) % createdNodes.length;
      createdNodes[i].nextId = createdNodes[nextIdx].id;
      this.nodes.set(createdNodes[i].id, createdNodes[i]);
    }

    this.headId = createdNodes[0].id;
  }

  /**
   * Returns nodes in traversal order starting from HEAD.
   */
  public getTraversalOrder(): CLLNode[] {
    if (!this.headId || this.nodes.size === 0) return [];
    const result: CLLNode[] = [];
    const visited = new Set<string>();

    let currId: string | null = this.headId;
    while (currId && !visited.has(currId) && this.nodes.has(currId)) {
      const node = this.nodes.get(currId)!;
      result.push(node);
      visited.add(currId);
      currId = node.nextId;
      if (currId === this.headId) break;
    }

    return result;
  }

  /**
   * Retrieves the tail node (the node whose next pointer is HEAD in a valid list).
   */
  public getTail(): CLLNode | null {
    if (!this.headId || this.nodes.size === 0) return null;
    let curr = this.nodes.get(this.headId);
    if (!curr) return null;

    const visited = new Set<string>();
    while (curr && curr.nextId && !visited.has(curr.id)) {
      visited.add(curr.id);
      if (curr.nextId === this.headId) {
        return curr;
      }
      curr = this.nodes.get(curr.nextId);
    }
    return curr || null;
  }

  /**
   * Connects a node's NEXT pointer to targetId.
   */
  public connect(fromId: string, toId: string | null) {
    const node = this.nodes.get(fromId);
    if (node) {
      node.nextId = toId;
    }
  }

  /**
   * Sets the HEAD pointer to a specific node.
   */
  public setHead(newHeadId: string | null) {
    this.headId = newHeadId;
  }

  /**
   * Validates whether current structure satisfies true Circular Linked List invariants:
   * 1. List is not empty when expected.
   * 2. Every node has a non-null next pointer.
   * 3. Starting at HEAD and following next pointers visits every registered node exactly once and returns to HEAD.
   * 4. Tail node explicitly points to HEAD, NEVER to NULL.
   */
  public validate(): ValidationResult {
    if (!this.headId) {
      if (this.nodes.size === 0) {
        return { isValid: true, message: 'Valid empty circular linked list.', code: 'EMPTY' };
      }
      return { isValid: false, message: 'HEAD pointer is not assigned!', code: 'WRONG_HEAD' };
    }

    if (!this.nodes.has(this.headId)) {
      return { isValid: false, message: 'HEAD points to an invalid or non-existent node.', code: 'WRONG_HEAD' };
    }

    // Check for null pointers
    for (const node of this.nodes.values()) {
      if (node.nextId === null) {
        return {
          isValid: false,
          message: `Node [${node.value}] points to NULL. In a Circular Linked List, pointers never end in NULL.`,
          code: 'NULL_POINTER',
        };
      }
      if (!this.nodes.has(node.nextId)) {
        return {
          isValid: false,
          message: `Node [${node.value}] points to an unknown target.`,
          code: 'DISCONNECTED',
        };
      }
    }

    // Follow cycle from HEAD
    const visited = new Set<string>();
    let currId: string | null = this.headId;

    while (currId && !visited.has(currId)) {
      visited.add(currId);
      const currNode = this.nodes.get(currId);
      if (!currNode || !currNode.nextId) break;
      currId = currNode.nextId;
      if (currId === this.headId) break;
    }

    if (currId !== this.headId) {
      return {
        isValid: false,
        message: 'The structure does not loop back to HEAD. The cycle is broken.',
        code: 'BROKEN_CYCLE',
      };
    }

    if (visited.size !== this.nodes.size) {
      return {
        isValid: false,
        message: `Disjoint nodes detected! Only ${visited.size} of ${this.nodes.size} nodes are part of the active circle.`,
        code: 'DISCONNECTED',
      };
    }

    return {
      isValid: true,
      message: '✓ Valid Circular Linked List: Tail loops back to HEAD.',
      code: 'CORRECT',
    };
  }

  /**
   * Inserts a value at the beginning of the circular list.
   */
  public insertBeginning(val: number): CLLNode {
    const newNode: CLLNode = {
      id: `node-${Date.now()}-${val}-${Math.random().toString(36).substring(2, 5)}`,
      value: val,
      nextId: null,
    };

    if (!this.headId || this.nodes.size === 0) {
      newNode.nextId = newNode.id; // Self-loop for 1 node
      this.nodes.set(newNode.id, newNode);
      this.headId = newNode.id;
      return newNode;
    }

    const tail = this.getTail();
    newNode.nextId = this.headId;
    this.nodes.set(newNode.id, newNode);

    if (tail) {
      tail.nextId = newNode.id;
    }
    this.headId = newNode.id;
    return newNode;
  }

  /**
   * Inserts a value at the end of the circular list.
   */
  public insertEnd(val: number): CLLNode {
    const newNode: CLLNode = {
      id: `node-${Date.now()}-${val}-${Math.random().toString(36).substring(2, 5)}`,
      value: val,
      nextId: null,
    };

    if (!this.headId || this.nodes.size === 0) {
      newNode.nextId = newNode.id;
      this.nodes.set(newNode.id, newNode);
      this.headId = newNode.id;
      return newNode;
    }

    const tail = this.getTail();
    newNode.nextId = this.headId;
    this.nodes.set(newNode.id, newNode);

    if (tail) {
      tail.nextId = newNode.id;
    }
    return newNode;
  }

  /**
   * Inserts a value after a specific node.
   */
  public insertAfter(prevNodeId: string, val: number): CLLNode | null {
    const prevNode = this.nodes.get(prevNodeId);
    if (!prevNode) return null;

    const newNode: CLLNode = {
      id: `node-${Date.now()}-${val}-${Math.random().toString(36).substring(2, 5)}`,
      value: val,
      nextId: prevNode.nextId,
    };

    this.nodes.set(newNode.id, newNode);
    prevNode.nextId = newNode.id;
    return newNode;
  }

  /**
   * Deletes the beginning node (HEAD).
   */
  public deleteBeginning(): CLLNode | null {
    if (!this.headId || this.nodes.size === 0) return null;
    const oldHead = this.nodes.get(this.headId);
    if (!oldHead) return null;

    if (this.nodes.size === 1) {
      this.nodes.clear();
      this.headId = null;
      return oldHead;
    }

    const tail = this.getTail();
    const newHeadId = oldHead.nextId;
    this.headId = newHeadId;
    if (tail && newHeadId) {
      tail.nextId = newHeadId;
    }
    this.nodes.delete(oldHead.id);
    return oldHead;
  }

  /**
   * Deletes the tail node.
   */
  public deleteEnd(): CLLNode | null {
    if (!this.headId || this.nodes.size === 0) return null;
    if (this.nodes.size === 1) {
      return this.deleteBeginning();
    }

    const tail = this.getTail();
    if (!tail) return null;

    // Find previous of tail
    let prev: CLLNode | null = null;
    for (const node of this.nodes.values()) {
      if (node.nextId === tail.id) {
        prev = node;
        break;
      }
    }

    if (prev && this.headId) {
      prev.nextId = this.headId;
    }
    this.nodes.delete(tail.id);
    return tail;
  }

  /**
   * Deletes a node by its ID.
   */
  public deleteNode(nodeId: string): CLLNode | null {
    if (!this.nodes.has(nodeId)) return null;
    if (nodeId === this.headId) {
      return this.deleteBeginning();
    }

    const targetNode = this.nodes.get(nodeId)!;
    let prevNode: CLLNode | null = null;
    for (const node of this.nodes.values()) {
      if (node.nextId === nodeId) {
        prevNode = node;
        break;
      }
    }

    if (prevNode) {
      prevNode.nextId = targetNode.nextId;
    }
    this.nodes.delete(nodeId);
    return targetNode;
  }
}
