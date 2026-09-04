/**
 * Circular Linked List Core Data Structure & Validation Engine
 * Enhanced with Educational Memory Addresses (1000, 1002, 1004, 1006...)
 */

export interface CLLNode {
  id: string;
  address: number;
  value: number;
  nextId: string | null;
  nextAddress: number | null;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
  code?: 'CORRECT' | 'NULL_POINTER' | 'DISCONNECTED' | 'WRONG_HEAD' | 'BROKEN_CYCLE' | 'EMPTY';
}

export class CircularLinkedListModel {
  public nodes: Map<string, CLLNode> = new Map();
  public headId: string | null = null;
  public tailId: string | null = null;
  private nextAddressCounter: number = 1000;

  constructor(initialValues?: number[]) {
    if (initialValues && initialValues.length > 0) {
      this.initFromValues(initialValues);
    }
  }

  /**
   * Initializes a valid circular linked list from an array of numbers with stable sequential addresses (1000, 1002, 1004...).
   */
  public initFromValues(values: number[], startAddress: number = 1000) {
    this.nodes.clear();
    this.headId = null;
    this.tailId = null;
    this.nextAddressCounter = startAddress;
    if (values.length === 0) return;

    const createdNodes: CLLNode[] = values.map((val, idx) => {
      const addr = startAddress + idx * 2;
      return {
        id: `node-${addr}`,
        address: addr,
        value: val,
        nextId: null,
        nextAddress: null,
      };
    });

    for (let i = 0; i < createdNodes.length; i++) {
      const nextIdx = (i + 1) % createdNodes.length;
      createdNodes[i].nextId = createdNodes[nextIdx].id;
      createdNodes[i].nextAddress = createdNodes[nextIdx].address;
      this.nodes.set(createdNodes[i].id, createdNodes[i]);
    }

    this.headId = createdNodes[0].id;
    this.tailId = createdNodes[createdNodes.length - 1].id;
    this.nextAddressCounter = startAddress + createdNodes.length * 2;
  }

  /**
   * Finds a node by its educational memory address.
   */
  public getNodeByAddress(addr: number): CLLNode | undefined {
    for (const node of this.nodes.values()) {
      if (node.address === addr) return node;
    }
    return undefined;
  }

  /**
   * Connects a node's NEXT pointer using addresses.
   */
  public connectByAddress(fromAddress: number, toAddress: number | null): {
    success: boolean;
    message: string;
    targetNode?: CLLNode;
  } {
    const fromNode = this.getNodeByAddress(fromAddress);
    if (!fromNode) {
      return { success: false, message: `Source node at address ${fromAddress} does not exist.` };
    }

    if (toAddress === null) {
      fromNode.nextId = null;
      fromNode.nextAddress = null;
      return { success: true, message: `Node at ${fromAddress} NEXT set to NULL.` };
    }

    const targetNode = this.getNodeByAddress(toAddress);
    if (!targetNode) {
      return {
        success: false,
        message: `Address ${toAddress} does not belong to any node.`,
      };
    }

    fromNode.nextId = targetNode.id;
    fromNode.nextAddress = targetNode.address;

    return {
      success: true,
      message: `NEXT updated: ${fromAddress} → ${toAddress}`,
      targetNode,
    };
  }

  /**
   * Sets the HEAD pointer by address.
   */
  public setHeadByAddress(addr: number): boolean {
    const target = this.getNodeByAddress(addr);
    if (!target) return false;
    this.headId = target.id;
    return true;
  }

  /**
   * Sets the TAIL pointer by address.
   */
  public setTailByAddress(addr: number): boolean {
    const target = this.getNodeByAddress(addr);
    if (!target) return false;
    this.tailId = target.id;
    return true;
  }

  public getHeadAddress(): number | null {
    if (!this.headId) return null;
    return this.nodes.get(this.headId)?.address ?? null;
  }

  public getTailAddress(): number | null {
    if (this.tailId && this.nodes.has(this.tailId)) {
      return this.nodes.get(this.tailId)!.address;
    }
    const tailNode = this.getTail();
    return tailNode ? tailNode.address : null;
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
   * Retrieves the tail node.
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
      if (toId && this.nodes.has(toId)) {
        node.nextAddress = this.nodes.get(toId)!.address;
      } else {
        node.nextAddress = null;
      }
    }
  }

  /**
   * Sets the HEAD pointer.
   */
  public setHead(newHeadId: string | null) {
    this.headId = newHeadId;
  }

  /**
   * Validates whether current structure satisfies Circular Linked List invariants.
   */
  public validate(): ValidationResult {
    if (!this.headId) {
      if (this.nodes.size === 0) {
        return { isValid: true, message: 'Valid empty circular linked list.', code: 'EMPTY' };
      }
      return { isValid: false, message: 'HEAD pointer is not assigned!', code: 'WRONG_HEAD' };
    }

    if (!this.nodes.has(this.headId)) {
      return { isValid: false, message: 'HEAD points to an invalid or non-existent address.', code: 'WRONG_HEAD' };
    }

    // Check for null pointers
    for (const node of this.nodes.values()) {
      if (node.nextId === null) {
        return {
          isValid: false,
          message: `Node at address ${node.address} [${node.value}] points to NULL. A Circular Linked List never ends with NULL.`,
          code: 'NULL_POINTER',
        };
      }
      if (!this.nodes.has(node.nextId)) {
        return {
          isValid: false,
          message: `Node at address ${node.address} points to an unknown target address.`,
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
        message: `Disjoint nodes detected! Only ${visited.size} of ${this.nodes.size} nodes are in the active circle.`,
        code: 'DISCONNECTED',
      };
    }

    const headNode = this.nodes.get(this.headId)!;
    const tailNode = this.getTail();

    return {
      isValid: true,
      message: `✓ Valid Circular Linked List: TAIL (${tailNode?.address}) loops back to HEAD (${headNode.address}).`,
      code: 'CORRECT',
    };
  }

  /**
   * Inserts a value at the beginning.
   */
  public insertBeginning(val: number): CLLNode {
    const addr = this.nextAddressCounter;
    this.nextAddressCounter += 2;

    const newNode: CLLNode = {
      id: `node-${addr}`,
      address: addr,
      value: val,
      nextId: null,
      nextAddress: null,
    };

    if (!this.headId || this.nodes.size === 0) {
      newNode.nextId = newNode.id; // Self-loop for 1 node
      newNode.nextAddress = newNode.address;
      this.nodes.set(newNode.id, newNode);
      this.headId = newNode.id;
      this.tailId = newNode.id;
      return newNode;
    }

    const headNode = this.nodes.get(this.headId)!;
    const tail = this.getTail();
    newNode.nextId = this.headId;
    newNode.nextAddress = headNode.address;
    this.nodes.set(newNode.id, newNode);

    if (tail) {
      tail.nextId = newNode.id;
      tail.nextAddress = newNode.address;
      this.tailId = tail.id;
    }
    this.headId = newNode.id;
    return newNode;
  }

  /**
   * Inserts a value at the end.
   */
  public insertEnd(val: number): CLLNode {
    const addr = this.nextAddressCounter;
    this.nextAddressCounter += 2;

    const newNode: CLLNode = {
      id: `node-${addr}`,
      address: addr,
      value: val,
      nextId: null,
      nextAddress: null,
    };

    if (!this.headId || this.nodes.size === 0) {
      newNode.nextId = newNode.id;
      newNode.nextAddress = newNode.address;
      this.nodes.set(newNode.id, newNode);
      this.headId = newNode.id;
      this.tailId = newNode.id;
      return newNode;
    }

    const headNode = this.nodes.get(this.headId)!;
    const tail = this.getTail();
    newNode.nextId = this.headId;
    newNode.nextAddress = headNode.address;
    this.nodes.set(newNode.id, newNode);

    if (tail) {
      tail.nextId = newNode.id;
      tail.nextAddress = newNode.address;
    }
    this.tailId = newNode.id;
    return newNode;
  }

  /**
   * Inserts a value after a specific node.
   */
  public insertAfter(prevNodeId: string, val: number): CLLNode | null {
    const prevNode = this.nodes.get(prevNodeId);
    if (!prevNode) return null;

    const addr = this.nextAddressCounter;
    this.nextAddressCounter += 2;

    const newNode: CLLNode = {
      id: `node-${addr}`,
      address: addr,
      value: val,
      nextId: prevNode.nextId,
      nextAddress: prevNode.nextAddress,
    };

    this.nodes.set(newNode.id, newNode);
    prevNode.nextId = newNode.id;
    prevNode.nextAddress = newNode.address;
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
      this.tailId = null;
      return oldHead;
    }

    const tail = this.getTail();
    const newHeadId = oldHead.nextId;
    this.headId = newHeadId;

    if (tail && newHeadId) {
      const newHead = this.nodes.get(newHeadId);
      tail.nextId = newHeadId;
      tail.nextAddress = newHead ? newHead.address : null;
      this.tailId = tail.id;
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

    let prev: CLLNode | null = null;
    for (const node of this.nodes.values()) {
      if (node.nextId === tail.id) {
        prev = node;
        break;
      }
    }

    if (prev && this.headId) {
      const headNode = this.nodes.get(this.headId)!;
      prev.nextId = this.headId;
      prev.nextAddress = headNode.address;
      this.tailId = prev.id;
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
      prevNode.nextAddress = targetNode.nextAddress;
    }
    this.nodes.delete(nodeId);
    return targetNode;
  }
}
