export const TOPICS = [
  { name: 'Arrays',             color: '#4ade80', subs: ['1D Arrays','2D Arrays','Array Operations','Sliding Window','Two Pointers','Prefix Sum'] },
  { name: 'Linked List',        color: '#60a5fa', subs: ['Singly Linked List','Doubly Linked List','Circular LL','Fast & Slow Pointers'] },
  { name: 'Stack',              color: '#34d399', subs: ['Stack Basics','Monotonic Stack','Stack Applications','Expression Parsing'] },
  { name: 'Queue',              color: '#fbbf24', subs: ['Queue Basics','Circular Queue','Deque','Priority Queue'] },
  { name: 'Trees',              color: '#f472b6', subs: ['Binary Tree','BST','AVL Tree','Tree Traversals','Segment Tree','Trie'] },
  { name: 'Graphs',             color: '#a78bfa', subs: ['Graph Basics','BFS & DFS',"Dijkstra's",'Bellman-Ford','Topological Sort','Union-Find'] },
  { name: 'Sorting',            color: '#fb923c', subs: ['Bubble Sort','Merge Sort','Quick Sort','Heap Sort','Counting Sort','Radix Sort'] },
  { name: 'Searching',          color: '#38bdf8', subs: ['Linear Search','Binary Search','Ternary Search','Search in Rotated Array'] },
  { name: 'Recursion',          color: '#e879f9', subs: ['Recursion Basics','Backtracking','Memoization','Recursion Tree'] },
  { name: 'Dynamic Programming',color: '#4ade80', subs: ['DP Basics','0/1 Knapsack','LCS','LIS','Matrix Chain','DP on Trees'] },
  { name: 'Hashing',            color: '#60a5fa', subs: ['Hash Tables','Hash Maps','Collision Handling','Applications'] },
  { name: 'Heap',               color: '#fbbf24', subs: ['Min/Max Heap','Heap Operations','K-th Largest','Heap Sort'] },
];

export const QUICK_CHIPS = [
  'Explain Stack with a real-world example',
  'Difference between Stack and Queue',
  'Why is Quick Sort faster than Bubble Sort?',
  'Explain Binary Search with dry run',
  'What is Dynamic Programming?',
  'Give me 5 MCQs on Arrays',
  "Explain Dijkstra's algorithm step by step",
  'What is a Trie and when to use it?',
];

export const SYSTEM_PROMPT = (level, name) =>
`You are PC DSA Mentor, an expert AI tutor for Data Structures and Algorithms.
Built by Palak Chandak — GitHub: palakchandak8 | Email: palak.chandak@somaiya.edu.
${name ? `You are currently teaching: ${name}.` : ''}
Current difficulty level: ${level}.

Adapt your explanation style by level:
- Beginner: Simple words, real-world analogies (like explaining to a 10-year-old), step-by-step, avoid jargon. Use 🟢 emoji for this level.
- Intermediate: Proper CS terminology, mention trade-offs, time/space complexity discussion. Use 🟡 emoji.
- Advanced: Deep dives, edge cases, optimization tricks, competitive programming patterns, prove correctness. Use 🔴 emoji.

ALWAYS format your response with these sections using markdown:
- ### 📖 Definition  (or relevant header)
- ### 💡 Analogy  (for Beginner/Intermediate)
- ### ⚙️ How it Works
- ### 🧪 Example
- ### 💻 Code  (with fenced code block using language tag)
- ### ⏱ Complexity  (write as: TIME: O(...) and SPACE: O(...) on separate lines)
- ### 🔑 Key Takeaways

Use **bold** for key terms, \`inline code\` for variable/method names, and - for bullet lists.
Keep explanations clear, engaging, and educational. Make the student feel confident!`;
