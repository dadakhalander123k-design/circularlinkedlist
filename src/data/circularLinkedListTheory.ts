export interface MultiLangCode {
  c?: string;
  cpp?: string;
  java?: string;
  python?: string;
}

export interface CodeExplanationLine {
  lineNum: string;
  code: string;
  explanation: string;
}

export interface CircularLinkedListModule {
  id: string; // 'theory-01' to 'theory-17'
  number: string; // '01' to '17'
  category: string;
  title: string;
  subtitle: string;
  readTime: string;
  summary: string;
  analogyTitle?: string;
  analogyContent?: string;
  csApplications?: string[];
  coreTopics?: string[];
  executionSteps?: {
    step: number;
    index: number;
    value: number;
    target: number;
    comparison: string;
    result: string;
    isMatch: boolean;
  }[];
  pseudocode?: string;
  complexityDerivation?: {
    caseType: string;
    complexity: string;
    description: string;
    formula: string;
  }[];
  derivationTable?: {
    size: string;
    best: string;
    avg: string;
    worst: string;
  }[];
  spaceAnalysis?: {
    type: string;
    complexity: string;
    details: string;
  }[];
  advantages?: {
    title: string;
    description: string;
    tag: string;
  }[];
  disadvantages?: {
    title: string;
    description: string;
    impact: string;
  }[];
  decisionCriteria?: {
    scenario: string;
    recommendation: string;
    rationale: string;
  }[];
  edgeCases?: {
    scenario: string;
    input: string;
    behavior: string;
    output: string;
  }[];
  comparisonMatrix?: {
    feature: string;
    singlyLinkedList: string;
    circularLinkedList: string;
  }[];
  masterRulebook?: string[];
  codeSnippets?: MultiLangCode;
  codeExplanations?: CodeExplanationLine[];
  keyFormula?: string;
  keyFormulaLabel?: string;
  keyTakeaway: string;
}

export type LinearSearchModule = CircularLinkedListModule;

export const CIRCULAR_LINKED_LIST_MODULES: CircularLinkedListModule[] = [
  // =========================================================================
  // MODULE 01: INTRODUCTION TO CIRCULAR LINKED LIST
  // =========================================================================
  {
    id: 'theory-01',
    number: '01',
    category: 'INTRODUCTION',
    title: 'Introduction to Circular Linked List',
    subtitle: 'Core Definition, Continuous Traversal & Absence of NULL',
    readTime: '~3 min read',
    summary:
      'A Circular Linked List (CLL) is a type of linked list in which the last node does not point to NULL. Instead, the last node points back to the first node, forming a closed circle.',
    analogyTitle: 'The Endless Carousel / Relay Ring',
    analogyContent:
      'In a normal linear queue, there is a clear start and a dead end. In a circular track or carousel, moving forward never hits a dead end; continuing past the final position seamlessly returns you right back to the beginning.',
    csApplications: [
      'Round-robin CPU scheduling in operating systems',
      'Multiplayer game turn management',
      'Continuous media playback & music playlists',
      'High-throughput circular ring buffers',
      'Repeated cyclical task schedulers',
    ],
    coreTopics: [
      'Last node points back to the first node instead of NULL.',
      'Forms an unbroken, continuous loop of traversable nodes.',
      'No NULL pointer exists at the end of the list.',
      'Naturally models repeating round-robin workflows.',
    ],
    keyTakeaway:
      'In a Circular Linked List, the last node points back to the first node, creating a continuous loop with no NULL termination.',
  },

  // =========================================================================
  // MODULE 02: WHAT IS A CIRCULAR LINKED LIST?
  // =========================================================================
  {
    id: 'theory-02',
    number: '02',
    category: 'FUNDAMENTALS',
    title: 'What is a Circular Linked List?',
    subtitle: 'Node Anatomy, Data & Next Fields, and lastNode.next == head Condition',
    readTime: '~3 min read',
    summary:
      'A circular linked list consists of individual nodes. Each node contains a DATA field and a NEXT pointer. The vital structural invariant is that lastNode.next == head.',
    analogyTitle: 'Handshakes in a Closed Circle',
    analogyContent:
      'Each participant holds a value in their pocket and extends their right hand to grip the next person. The final participant extends their hand to grip the very first person, completing the circuit.',
    comparisonMatrix: [
      {
        feature: 'Last node points to',
        singlyLinkedList: 'NULL',
        circularLinkedList: 'First node (head)',
      },
      {
        feature: 'Structure',
        singlyLinkedList: 'Linear',
        circularLinkedList: 'Circular',
      },
      {
        feature: 'Traversal ending',
        singlyLinkedList: 'NULL',
        circularLinkedList: 'Back to starting node',
      },
      {
        feature: 'Suitable for cycles',
        singlyLinkedList: 'Less suitable',
        circularLinkedList: 'Very suitable',
      },
    ],
    coreTopics: [
      'Node Structure: [ DATA | NEXT ]',
      'Data: Stores the payload value (e.g. integer 10, 20, 30)',
      'Next: Stores the memory address/reference to the next node',
      'Core Invariant: lastNode.next == head',
    ],
    keyFormula: 'lastNode.next == head',
    keyFormulaLabel: 'Fundamental CLL Invariant',
    keyTakeaway:
      'Every node stores data and a next pointer. The circular structure is established by ensuring lastNode.next == head.',
  },

  // =========================================================================
  // MODULE 03: BASIC STRUCTURE AND IMPORTANT TERMS
  // =========================================================================
  {
    id: 'theory-03',
    number: '03',
    category: 'STRUCTURE',
    title: 'Basic Structure and Important Terms',
    subtitle: 'Head, Node, Next Pointer, and Last Node Relationships',
    readTime: '~3 min read',
    summary:
      'Understanding a circular linked list requires mastering four foundational terms: Head (reference to the first node), Node (unit storing data & pointer), Next (address of successor), and Last Node (node whose next points to Head).',
    coreTopics: [
      'Head: The entry pointer/reference that identifies the first node of the list.',
      'Node: A discrete data structure element containing data and a link to the next node.',
      'Next: The pointer attribute storing the memory address/reference of the next node.',
      'Last node: The final node in the sequence whose next pointer points back to head.',
    ],
    keyFormula: 'head = 10  |  last = 40  |  last.next = head',
    keyFormulaLabel: 'Example Relationship',
    keyTakeaway:
      'Head provides the entry point into the list, while the last node completes the circle by pointing back to head.',
  },

  // =========================================================================
  // MODULE 04: OPERATIONS ON CIRCULAR LINKED LIST
  // =========================================================================
  {
    id: 'theory-04',
    number: '04',
    category: 'OPERATIONS',
    title: 'Operations on Circular Linked List',
    subtitle: 'Taxonomy of Insertion, Deletion, Searching, and Traversal',
    readTime: '~3 min read',
    summary:
      'A Circular Linked List supports eight essential primitive operations spanning insertion (beginning, end, position), deletion (beginning, end, position), searching, and traversal/display.',
    coreTopics: [
      '1. Insertion at beginning — adding a new node before the current head',
      '2. Insertion at end — appending a new node after the current last node',
      '3. Insertion at any position — inserting at an arbitrary 1-indexed location',
      '4. Deletion at beginning — removing the current head and pointing last to head.next',
      '5. Deletion at end — removing the last node and re-linking second-last to head',
      '6. Deletion at any position — bypassing and freeing a node at position p',
      '7. Searching — sequential matching stopping upon returning to head',
      '8. Traversal / display — visiting each node exactly once using a do-while loop',
    ],
    keyTakeaway:
      'Every operation on a CLL must preserve the circular property: the last node must always maintain an active link back to head.',
  },

  // =========================================================================
  // MODULE 05: INSERTION AT BEGINNING
  // =========================================================================
  {
    id: 'theory-05',
    number: '05',
    category: 'INSERTION',
    title: 'Insertion at Beginning',
    subtitle: 'Adding a New Node Before the Current First Node & Updating Head',
    readTime: '~4 min read',
    summary:
      'Insertion at beginning adds a new node before the current first node. Because the last node points to the current head, we must locate the last node, update its next pointer to the new node, point the new node to the old head, and update head.',
    coreTopics: [
      '1. Create a new node and allocate memory.',
      '2. Put the value into the node (newNode->data = data).',
      '3. If list is empty (head == NULL), point newNode->next = newNode and set head = newNode.',
      '4. Otherwise, traverse using a temporary pointer until temp->next == head (finds the last node).',
      '5. Make the new node point to the old head (newNode->next = head).',
      '6. Make the last node point to the new node (temp->next = newNode).',
      '7. Update head to the new node (head = newNode).',
    ],
    codeSnippets: {
      c: `void insertBeginning(int data) {
    Node *newNode = malloc(sizeof(Node));
    newNode->data = data;

    if (head == NULL) {
        head = newNode;
        newNode->next = head;
        return;
    }

    Node *temp = head;

    while (temp->next != head)
        temp = temp->next;

    newNode->next = head;
    temp->next = newNode;
    head = newNode;
}`,
      java: `void insertBeginning(int data) {
    Node newNode = new Node(data);

    if (head == null) {
        head = newNode;
        newNode.next = head;
        return;
    }

    Node temp = head;

    while (temp.next != head)
        temp = temp.next;

    newNode.next = head;
    temp.next = newNode;
    head = newNode;
}`,
      python: `def insert_beginning(self, data):
    new_node = Node(data)

    if self.head is None:
        self.head = new_node
        new_node.next = self.head
        return

    temp = self.head

    while temp.next != self.head:
        temp = temp.next

    new_node.next = self.head
    temp.next = new_node
    self.head = new_node`,
    },
    keyTakeaway:
      'Inserting at the beginning requires updating both the new node’s next pointer and the last node’s next pointer to maintain the cycle.',
  },

  // =========================================================================
  // MODULE 06: INSERTION AT END
  // =========================================================================
  {
    id: 'theory-06',
    number: '06',
    category: 'INSERTION',
    title: 'Insertion at End',
    subtitle: 'Appending a New Node After the Current Last Node',
    readTime: '~4 min read',
    summary:
      'Insertion at end adds a new node after the current last node. The new node becomes the last node, pointing back to head, while the previous last node points to the new node.',
    coreTopics: [
      '1. Create a new node and assign its data.',
      '2. If the list is empty, make it the head and point it to itself.',
      '3. Otherwise, traverse until temp->next == head to locate the last node.',
      '4. Make the last node point to the new node (temp->next = newNode).',
      '5. Make the new node point to the head (newNode->next = head).',
    ],
    codeSnippets: {
      c: `void insertEnd(int data) {
    Node *newNode = malloc(sizeof(Node));
    newNode->data = data;

    if (head == NULL) {
        head = newNode;
        newNode->next = head;
        return;
    }

    Node *temp = head;

    while (temp->next != head)
        temp = temp->next;

    temp->next = newNode;
    newNode->next = head;
}`,
      java: `void insertEnd(int data) {
    Node newNode = new Node(data);

    if (head == null) {
        head = newNode;
        newNode.next = head;
        return;
    }

    Node temp = head;

    while (temp.next != head)
        temp = temp.next;

    temp.next = newNode;
    newNode.next = head;
}`,
      python: `def insert_end(self, data):
    new_node = Node(data)

    if self.head is None:
        self.head = new_node
        new_node.next = self.head
        return

    temp = self.head

    while temp.next != self.head:
        temp = temp.next

    temp.next = new_node
    new_node.next = self.head`,
    },
    keyTakeaway:
      'The new node becomes the last node: the previous last node points to it, and it points back to head.',
  },

  // =========================================================================
  // MODULE 07: INSERTION AT ANY POSITION
  // =========================================================================
  {
    id: 'theory-07',
    number: '07',
    category: 'INSERTION',
    title: 'Insertion at Any Position',
    subtitle: 'Splicing a Node at Arbitrary Position p: Previous → New Node → Next',
    readTime: '~4 min read',
    summary:
      'Inserting at position p inserts a new element into the circular linked list at index p. If p is 1, it delegates to insertion at the beginning. Otherwise, it moves to node p-1 and splices the new node in.',
    coreTopics: [
      '1. Create the new node.',
      '2. If position is 1, perform beginning insertion.',
      '3. Otherwise move to the node before the desired position (p - 1).',
      '4. Connect the new node to the next node (newNode->next = temp->next).',
      '5. Connect the previous node to the new node (temp->next = newNode).',
    ],
    codeSnippets: {
      c: `void insertAtPosition(int data, int position) {
    Node *newNode = malloc(sizeof(Node));
    newNode->data = data;

    if (head == NULL) {
        if (position == 1) {
            head = newNode;
            newNode->next = head;
        }
        return;
    }

    if (position == 1) {
        Node *temp = head;

        while (temp->next != head)
            temp = temp->next;

        newNode->next = head;
        temp->next = newNode;
        head = newNode;
        return;
    }

    Node *temp = head;

    for (int i = 1; i < position - 1 && temp->next != head; i++)
        temp = temp->next;

    newNode->next = temp->next;
    temp->next = newNode;
}`,
      java: `void insertAtPosition(int data, int position) {
    Node newNode = new Node(data);

    if (head == null) {
        if (position == 1) {
            head = newNode;
            newNode.next = head;
        }
        return;
    }

    if (position == 1) {
        insertBeginning(data);
        return;
    }

    Node temp = head;

    for (int i = 1; i < position - 1 && temp.next != head; i++)
        temp = temp.next;

    newNode.next = temp.next;
    temp.next = newNode;
}`,
      python: `def insert_at_position(self, data, position):
    new_node = Node(data)

    if self.head is None:
        if position == 1:
            self.head = new_node
            new_node.next = self.head
        return

    if position == 1:
        self.insert_beginning(data)
        return

    temp = self.head

    for _ in range(position - 2):
        if temp.next == self.head:
            return
        temp = temp.next

    new_node.next = temp.next
    temp.next = new_node`,
    },
    keyTakeaway:
      'Previous → Next becomes Previous → New Node → Next, seamlessly splicing the element without breaking the cycle.',
  },

  // =========================================================================
  // MODULE 08: DELETION AT BEGINNING
  // =========================================================================
  {
    id: 'theory-08',
    number: '08',
    category: 'DELETION',
    title: 'Deletion at Beginning',
    subtitle: 'Removing the First Node and Re-pointing the Last Node to the New Head',
    readTime: '~4 min read',
    summary:
      'Deletion at the beginning removes the first node (head). If there is only one node, head becomes NULL. Otherwise, the last node must be located and updated to point to the new head (head->next).',
    coreTopics: [
      '1. Check whether the list is empty (head == NULL).',
      '2. If there is only one node (head->next == head), free head and set head = NULL.',
      '3. Otherwise find the last node (last->next != head).',
      '4. Move head pointer to the second node (head = head->next).',
      '5. Make the last node point to the new head (last->next = head).',
      '6. Free the memory of the original head node.',
    ],
    codeSnippets: {
      c: `void deleteBeginning() {
    if (head == NULL)
        return;

    if (head->next == head) {
        free(head);
        head = NULL;
        return;
    }

    Node *last = head;

    while (last->next != head)
        last = last->next;

    Node *temp = head;
    head = head->next;
    last->next = head;

    free(temp);
}`,
      java: `void deleteBeginning() {
    if (head == null)
        return;

    if (head.next == head) {
        head = null;
        return;
    }

    Node last = head;

    while (last.next != head)
        last = last.next;

    head = head.next;
    last.next = head;
}`,
      python: `def delete_beginning(self):
    if self.head is None:
        return

    if self.head.next == self.head:
        self.head = None
        return

    last = self.head

    while last.next != self.head:
        last = last.next

    self.head = self.head.next
    last.next = self.head`,
    },
    keyTakeaway:
      'When deleting the beginning, update head = head.next and ensure the last node points to the new head.',
  },

  // =========================================================================
  // MODULE 09: DELETION AT END
  // =========================================================================
  {
    id: 'theory-09',
    number: '09',
    category: 'DELETION',
    title: 'Deletion at End',
    subtitle: 'Locating the Second-Last Node and Updating its Next Pointer to Head',
    readTime: '~4 min read',
    summary:
      'Deletion at the end removes the last node. The essential requirement is to locate the second-last node whose next->next points to head, update its next pointer to head, and free the discarded last node.',
    coreTopics: [
      '1. Check whether the list is empty.',
      '2. If there is only one node, free it and set head = NULL.',
      '3. Traverse until temp->next->next == head to find the second-last node.',
      '4. Set temp->next = head to bypass the last node.',
      '5. Free the memory of the deleted last node.',
    ],
    codeSnippets: {
      c: `void deleteEnd() {
    if (head == NULL)
        return;

    if (head->next == head) {
        free(head);
        head = NULL;
        return;
    }

    Node *temp = head;

    while (temp->next->next != head)
        temp = temp->next;

    Node *last = temp->next;
    temp->next = head;

    free(last);
}`,
      java: `void deleteEnd() {
    if (head == null)
        return;

    if (head.next == head) {
        head = null;
        return;
    }

    Node temp = head;

    while (temp.next.next != head)
        temp = temp.next;

    temp.next = head;
}`,
      python: `def delete_end(self):
    if self.head is None:
        return

    if self.head.next == self.head:
        self.head = None
        return

    temp = self.head

    while temp.next.next != self.head:
        temp = temp.next

    temp.next = self.head`,
    },
    keyTakeaway:
      'Locate the second-last node by checking temp.next.next == head, then set temp.next = head.',
  },

  // =========================================================================
  // MODULE 10: DELETION AT ANY POSITION
  // =========================================================================
  {
    id: 'theory-10',
    number: '10',
    category: 'DELETION',
    title: 'Deletion at Any Position',
    subtitle: 'Removing Node at Position p by Linking Node (p-1) to Node (p+1)',
    readTime: '~4 min read',
    summary:
      'To delete a node at position p, locate the node before it at position p - 1, re-link its next pointer to del->next, and release the memory of the target node.',
    coreTopics: [
      '1. Check whether the list is empty.',
      '2. If position is 1, delegate to deleteBeginning().',
      '3. Move to the node before the target position (p - 1).',
      '4. Store the node to be deleted in a temporary pointer (del = temp->next).',
      '5. Change previous node’s next pointer: temp->next = del->next.',
      '6. Delete/free the unwanted node.',
    ],
    codeSnippets: {
      c: `void deleteAtPosition(int position) {
    if (head == NULL)
        return;

    if (position == 1) {
        deleteBeginning();
        return;
    }

    Node *temp = head;

    for (int i = 1; i < position - 1; i++) {
        if (temp->next == head)
            return;
        temp = temp->next;
    }

    if (temp->next == head)
        return;

    Node *del = temp->next;
    temp->next = del->next;

    free(del);
}`,
      java: `void deleteAtPosition(int position) {
    if (head == null)
        return;

    if (position == 1) {
        deleteBeginning();
        return;
    }

    Node temp = head;

    for (int i = 1; i < position - 1; i++) {
        if (temp.next == head)
            return;
        temp = temp.next;
    }

    if (temp.next == head)
        return;

    temp.next = temp.next.next;
}`,
      python: `def delete_at_position(self, position):
    if self.head is None:
        return

    if position == 1:
        self.delete_beginning()
        return

    temp = self.head

    for _ in range(position - 2):
        if temp.next == self.head:
            return
        temp = temp.next

    if temp.next == self.head:
        return

    temp.next = temp.next.next`,
    },
    keyTakeaway:
      'Bypass the deleted node: connect node (p-1) directly to node (p+1), preserving list integrity.',
  },

  // =========================================================================
  // MODULE 11: SEARCHING IN CIRCULAR LINKED LIST
  // =========================================================================
  {
    id: 'theory-11',
    number: '11',
    category: 'SEARCHING',
    title: 'Searching in Circular Linked List',
    subtitle: 'Sequential Search with Loop Termination Upon Returning to Head',
    readTime: '~3 min read',
    summary:
      'Searching in a circular linked list inspects each node for a matching key. Because there is no NULL pointer, the search cannot check while (temp != NULL); instead, it terminates when the traversal returns to head.',
    coreTopics: [
      'START at current = head.',
      'Check if current->data == key. If YES, return FOUND (1 / true).',
      'If NO, advance current = current->next.',
      'Check if current has returned back to head.',
      'If current == head, stop and return NOT FOUND (0 / false).',
      'Otherwise, continue searching the next node.',
    ],
    codeSnippets: {
      c: `int search(int key) {
    if (head == NULL)
        return 0;

    Node *temp = head;

    do {
        if (temp->data == key)
            return 1;

        temp = temp->next;
    } while (temp != head);

    return 0;
}`,
      java: `boolean search(int key) {
    if (head == null)
        return false;

    Node temp = head;

    do {
        if (temp.data == key)
            return true;

        temp = temp.next;
    } while (temp != head);

    return false;
}`,
      python: `def search(self, key):
    if self.head is None:
        return False

    temp = self.head

    while True:
        if temp.data == key:
            return True

        temp = temp.next

        if temp == self.head:
            break

    return False`,
    },
    keyTakeaway:
      'Never search until NULL in a CLL; always terminate the search when temp returns to head.',
  },

  // =========================================================================
  // MODULE 12: TRAVERSAL / DISPLAY
  // =========================================================================
  {
    id: 'theory-12',
    number: '12',
    category: 'TRAVERSAL',
    title: 'Traversal / Display',
    subtitle: 'Visiting Every Node and Printing Data Using do-while Loops',
    readTime: '~3 min read',
    summary:
      'Traversal visits every node in the circle to display or process its payload. Using while(temp != NULL) causes an infinite loop; the standard idiom is a do-while loop that exits when temp == head.',
    coreTopics: [
      '1. Start with current = head.',
      '2. Display current->data.',
      '3. Advance current = current->next.',
      '4. Evaluate if current == head.',
      '5. If YES, STOP traversal (all nodes visited).',
      '6. If NO, continue to display the next node.',
    ],
    codeSnippets: {
      c: `void display() {
    if (head == NULL) {
        printf("List is empty\\n");
        return;
    }

    Node *temp = head;

    do {
        printf("%d ", temp->data);
        temp = temp->next;
    } while (temp != head);

    printf("\\n");
}`,
      java: `void display() {
    if (head == null) {
        System.out.println("List is empty");
        return;
    }

    Node temp = head;

    do {
        System.out.print(temp.data + " ");
        temp = temp.next;
    } while (temp != head);

    System.out.println();
}`,
      python: `def display(self):
    if self.head is None:
        print("List is empty")
        return

    temp = self.head

    while True:
        print(temp.data, end=" ")
        temp = temp.next

        if temp == self.head:
            break

    print()`,
    },
    keyTakeaway:
      'A do-while loop ensures the first node is processed before checking the termination condition temp != head.',
  },

  // =========================================================================
  // MODULE 13: COMPLETE EXAMPLE STRUCTURE IN C, JAVA AND PYTHON
  // =========================================================================
  {
    id: 'theory-13',
    number: '13',
    category: 'IMPLEMENTATION',
    title: 'Complete Example Structure in C, Java and Python',
    subtitle: 'Node Definitions, Class Wrappers, and LAST → HEAD Relationship',
    readTime: '~4 min read',
    summary:
      'The complete implementation structure of a Circular Linked List across C, Java, and Python follows the same core blueprint: a node structure storing data and next pointer, with the invariant relationship LAST → HEAD.',
    coreTopics: [
      'C: struct Node with int data and struct Node* next pointer.',
      'Java: class Node with int data and Node next reference.',
      'Python: Node class and CircularLinkedList class with self.head.',
      'Universal invariant: HEAD → [DATA|NEXT] → ... → [DATA|NEXT] → HEAD.',
    ],
    codeSnippets: {
      c: `typedef struct Node {
    int data;
    struct Node *next;
} Node;

Node *head = NULL;`,
      java: `class Node {
    int data;
    Node next;

    Node(int data) {
        this.data = data;
        this.next = null;
    }
}

Node head = null;`,
      python: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


class CircularLinkedList:
    def __init__(self):
        self.head = None`,
    },
    keyTakeaway:
      'Across all programming languages, the crucial relationship remains: the last node’s next pointer points directly back to head.',
  },

  // =========================================================================
  // MODULE 14: ADVANTAGES OF CIRCULAR LINKED LIST
  // =========================================================================
  {
    id: 'theory-14',
    number: '14',
    category: 'ANALYSIS',
    title: 'Advantages of Circular Linked List',
    subtitle: 'Continuous Traversal, No NULL, Cyclic Suitability & Tail Pointer Efficiency',
    readTime: '~3 min read',
    summary:
      'Circular linked lists offer unique advantages over linear linked lists, including continuous circular access from any node, no terminating NULL pointers, natural modeling of cyclic workflows, and O(1) insertion efficiency when maintaining a tail pointer.',
    advantages: [
      {
        title: 'Continuous Traversal',
        description: 'We can start from any node and continue around the entire list without encountering a dead end.',
        tag: 'TRAVERSAL',
      },
      {
        title: 'No NULL at the End',
        description: 'Unlike standard lists ending in NULL (40 → NULL), the last node points back to HEAD (40 → HEAD).',
        tag: 'ROBUSTNESS',
      },
      {
        title: 'Useful for Cyclic Processes',
        description: 'Naturally suitable for applications where processing repeats cyclically, like turn games and scheduling.',
        tag: 'ARCHITECTURE',
      },
      {
        title: 'Efficient Insertion with Tail Pointer',
        description: 'If a tail pointer is maintained, insertion at both beginning and end can be performed in O(1) time.',
        tag: 'EFFICIENCY',
      },
    ],
    keyTakeaway:
      'Continuous cyclic traversal and O(1) insertion capability with a tail pointer make CLL an indispensable data structure for cyclic systems.',
  },

  // =========================================================================
  // MODULE 15: DISADVANTAGES OF CIRCULAR LINKED LIST
  // =========================================================================
  {
    id: 'theory-15',
    number: '15',
    category: 'ANALYSIS',
    title: 'Disadvantages of Circular Linked List',
    subtitle: 'Traversal Cautions, Infinite Loop Hazards, Complexity & Linear Search',
    readTime: '~3 min read',
    summary:
      'Key disadvantages include the requirement for cautious traversal logic, high risk of infinite loops when standard NULL checks are used, increased pointer management complexity, and O(n) search time.',
    disadvantages: [
      {
        title: 'Traversal Requires Extra Care',
        description: 'There is no NULL to signal that traversal has finished. Code must actively check current == head.',
        impact: 'TERMINATION LOGIC',
      },
      {
        title: 'Infinite Loop Possibility',
        description: 'If an incorrect stopping condition like while(current != NULL) is used, the program will never terminate.',
        impact: 'BUG RISK',
      },
      {
        title: 'More Difficult Than Normal Linked List',
        description: 'Because the last node must always point back to head, all insertions and deletions require extra pointer coordination.',
        impact: 'MAINTENANCE',
      },
      {
        title: 'Searching is Still Linear',
        description: 'Even though the structure is circular, finding an element still requires examining nodes one-by-one in O(n) time.',
        impact: 'O(n) LIMITATION',
      },
    ],
    keyTakeaway:
      'Always use a cycle-aware stopping condition such as current == head to prevent runaway infinite loops.',
  },

  // =========================================================================
  // MODULE 16: APPLICATIONS OF CIRCULAR LINKED LIST
  // =========================================================================
  {
    id: 'theory-16',
    number: '16',
    category: 'APPLICATIONS',
    title: 'Applications of Circular Linked List',
    subtitle: 'Round-Robin Scheduling, Playlists, Multiplayer Turns & Buffers',
    readTime: '~4 min read',
    summary:
      'Circular linked lists are the ideal choice in operating systems (Round-Robin CPU scheduling), media players (looping playlists), game engines (multiplayer turn loops), and circular ring buffers.',
    csApplications: [
      'Round-Robin Scheduling: Process A → Process B → Process C → Process D → Process A',
      'Music Playlists: Song 1 → Song 2 → Song 3 → Song 4 → Song 1 (seamless track looping)',
      'Multiplayer Games: Player 1 → Player 2 → Player 3 → Player 4 → Player 1 (cyclic turn rotation)',
      'Circular Buffers: continuous producer-consumer streaming with wrapped memory',
      'Repeated Task Scheduling: cyclic recurring daemon processes in OS kernels',
    ],
    keyTakeaway:
      'Whenever a program needs to cycle repeatedly through an ordered collection of resources, a Circular Linked List is the ideal data structure.',
  },

  // =========================================================================
  // MODULE 17: TIME COMPLEXITY OF CIRCULAR LINKED LIST OPERATIONS
  // =========================================================================
  {
    id: 'theory-17',
    number: '17',
    category: 'COMPLEXITY',
    title: 'Time Complexity of Circular Linked List Operations',
    subtitle: 'Asymptotic Big-O Derivations & The Tail Pointer O(1) Optimization',
    readTime: '~4 min read',
    summary:
      'When only a head pointer is maintained, insertion and deletion at the beginning/end require O(n) time to locate the last node. Maintaining a tail pointer optimizes beginning and end insertions to O(1). Searching and traversal remain O(n).',
    complexityDerivation: [
      {
        caseType: 'Insert at beginning',
        complexity: 'O(n)*',
        description: 'Find last node when only head is available',
        formula: 'O(1) with tail pointer',
      },
      {
        caseType: 'Insert at end',
        complexity: 'O(n)*',
        description: 'Find last node',
        formula: 'O(1) with tail pointer',
      },
      {
        caseType: 'Insert at position',
        complexity: 'O(n)',
        description: 'May need to travel to position p',
        formula: 'O(p) ≤ O(n)',
      },
      {
        caseType: 'Delete beginning',
        complexity: 'O(n)*',
        description: 'Find last node when only head is available',
        formula: 'O(1) with tail pointer',
      },
      {
        caseType: 'Delete end',
        complexity: 'O(n)',
        description: 'Find second-last node',
        formula: 'O(n) traversal',
      },
      {
        caseType: 'Delete position',
        complexity: 'O(n)',
        description: 'May need to travel to position p',
        formula: 'O(p) ≤ O(n)',
      },
      {
        caseType: 'Search',
        complexity: 'O(n)',
        description: 'May check every node in worst case',
        formula: 'O(n) comparisons',
      },
      {
        caseType: 'Traversal',
        complexity: 'O(n)',
        description: 'Visits every node in circle',
        formula: 'O(n) visits',
      },
    ],
    keyFormula: 'Need to travel through nodes? → O(n)  |  Directly have pointer? → O(1)',
    keyFormulaLabel: 'Golden Rule of Complexity',
    keyTakeaway:
      'Maintaining a tail pointer reduces beginning and end insertions to O(1); all other operations are O(n).',
  },
];

// Backwards-compatible alias for any legacy references
export const LINEAR_SEARCH_MODULES = CIRCULAR_LINKED_LIST_MODULES;

export default CIRCULAR_LINKED_LIST_MODULES;
