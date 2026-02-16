/**
 * Code Executor Module - Judge0 Cloud Integration
 * Handles code execution, validation, and edge case testing
 */

// Judge0 API Configuration
const JUDGE0_API_BASE = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = "your-api-key-here"; // Add your RapidAPI key here
const JUDGE0_HEADERS = {
  "Content-Type": "application/json",
  "X-RapidAPI-Key": JUDGE0_API_KEY,
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
};

export const LANGUAGES = {
  javascript: { id: "javascript", name: "JavaScript", icon: "🟨", judge0Id: 63 },
  python: { id: "python", name: "Python", icon: "🐍", judge0Id: 71 },
  java: { id: "java", name: "Java", icon: "☕", judge0Id: 62 },
  cpp: { id: "cpp", name: "C++", icon: "⚙️", judge0Id: 54 },
};

export const TEST_CASES = {
  twoSum: [
    { input: "[2,7,11,15], 9", expected: "[0,1]", description: "Basic case" },
    { input: "[3,2,4], 6", expected: "[1,2]", description: "Different order" },
    { input: "[3,3], 6", expected: "[0,1]", description: "Duplicate elements" },
  ],
  reverseString: [
    { input: '["h","e","l","l","o"]', expected: '["o","l","l","e","h"]', description: "Normal string" },
    { input: '["a"]', expected: '["a"]', description: "Single character" },
  ],
  fibonacci: [
    { input: "2", expected: "1", description: "F(2)" },
    { input: "3", expected: "2", description: "F(3)" },
    { input: "4", expected: "3", description: "F(4)" },
    { input: "10", expected: "55", description: "F(10)" },
  ],
  maxArea: [
    { input: "[1,8,6,2,5,4,8,3,7]", expected: "49", description: "Complex array" },
    { input: "[1,1]", expected: "1", description: "Two elements" },
  ],
  longestSubstring: [
    { input: '"abcabcbb"', expected: "3", description: "Repeating chars" },
    { input: '"bbbbb"', expected: "1", description: "All same" },
    { input: '""', expected: "0", description: "Empty string" },
    { input: '"au"', expected: "2", description: "Two unique" },
  ],
};

/**
 * Submit code to Judge0 for execution
 */
export const submitCodeToJudge0 = async (code, languageId, stdin) => {
  try {
    const response = await fetch(`${JUDGE0_API_BASE}/submissions?wait=false`, {
      method: "POST",
      headers: JUDGE0_HEADERS,
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: stdin || "",
      }),
    });

    if (!response.ok) {
      throw new Error(`Judge0 API error: ${response.status}`);
    }

    const data = await response.json();
    return data.token; // Returns submission token
  } catch (err) {
    throw new Error(`Failed to submit code: ${err.message}`);
  }
};

/**
 * Poll Judge0 for submission results
 */
export const getJudge0Results = async (token) => {
  try {
    const response = await fetch(`${JUDGE0_API_BASE}/submissions/${token}`, {
      method: "GET",
      headers: JUDGE0_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`Failed to get results: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    throw new Error(`Failed to get results: ${err.message}`);
  }
};

/**
 * Wait for Judge0 submission to complete
 */
export const waitForJudge0Result = async (token, maxAttempts = 30) => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const result = await getJudge0Results(token);

      // Status: 1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer, 5=Time Limit, 6=Compilation Error, 7=Runtime Error, 8=System Error
      if (result.status.id >= 3) {
        return result;
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
    } catch (err) {
      attempts++;
      if (attempts >= maxAttempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error("Execution timeout");
};

/**
 * Execute code using Judge0 API
 */
export const executeWithJudge0 = async (code, testCases, languageId) => {
  try {
    const results = [];

    for (const testCase of testCases) {
      try {
        // Submit code to Judge0
        const token = await submitCodeToJudge0(code, languageId, testCase.input);

        // Wait for result
        const result = await waitForJudge0Result(token);

        // Process result
        const output = result.stdout?.trim() || "";
        const expectedOutput = testCase.expected?.trim() || "";
        const passed = output === expectedOutput;

        results.push({
          test: testCase.description,
          input: testCase.input,
          expected: testCase.expected,
          actual: output || (result.stderr ? `Error: ${result.stderr}` : "No output"),
          passed,
          status: result.status?.description || "Unknown",
          time: result.time || "N/A",
          memory: result.memory || "N/A",
        });
      } catch (err) {
        results.push({
          test: testCase.description,
          input: testCase.input,
          expected: testCase.expected,
          actual: "ERROR",
          passed: false,
          error: err.message,
        });
      }
    }

    return results;
  } catch (err) {
    return {
      error: err.message,
      type: "execution",
    };
  }
};

/**
 * Validate code structure
 */
export const validateCode = (code, language) => {
  const errors = [];

  if (!code.trim()) {
    errors.push("Code cannot be empty");
  }

  if (language === "javascript") {
    if (!code.includes("function") && !code.includes("const") && !code.includes("let")) {
      errors.push("JavaScript code should contain a function definition");
    }
  } else if (language === "java") {
    if (!code.includes("class")) {
      errors.push("Java code should contain a class definition");
    }
  } else if (language === "python") {
    if (!code.includes("def")) {
      errors.push("Python code should contain a function definition");
    }
  } else if (language === "cpp") {
    if (!code.includes("int") && !code.includes("void")) {
      errors.push("C++ code should contain a function or method");
    }
  }

  return errors;
};

/**
 * Problem signature mapping - maps problem IDs to their function signatures and details
 */
const PROBLEM_SIGNATURES = {
  // ARRAY PROBLEMS
  arr1: { fn: "twoSum", params: ["nums: number[]", "target: number"], ret: "number[]", desc: "Return indices of two numbers that sum to target" },
  arr2: { fn: "maxProfit", params: ["prices: number[]"], ret: "number", desc: "Find max profit from buying and selling stock once" },
  arr3: { fn: "containsDuplicate", params: ["nums: number[]"], ret: "boolean", desc: "Check if array contains duplicates" },
  arr4: { fn: "isValidAnagram", params: ["s: string", "t: string"], ret: "boolean", desc: "Check if t is anagram of s" },
  arr5: { fn: "maxArea", params: ["height: number[]"], ret: "number", desc: "Find two lines with max area between them" },
  arr6: { fn: "productExceptSelf", params: ["nums: number[]"], ret: "number[]", desc: "Product of array except self at each index" },
  arr7: { fn: "maxSubArray", params: ["nums: number[]"], ret: "number", desc: "Find maximum sum contiguous subarray" },
  arr8: { fn: "threeSum", params: ["nums: number[]"], ret: "number[][]", desc: "Find all unique triplets that sum to zero" },
  arr9: { fn: "rotateArray", params: ["nums: number[]", "k: number"], ret: "void", desc: "Rotate array right by k steps in-place" },
  arr10: { fn: "searchRotated", params: ["nums: number[]", "target: number"], ret: "number", desc: "Search in rotated sorted array" },
  arr11: { fn: "majorityElement", params: ["nums: number[]"], ret: "number", desc: "Find element appearing more than n/2 times" },
  arr12: { fn: "nextPermutation", params: ["nums: number[]"], ret: "void", desc: "Modify array to next lexicographical permutation" },
  arr13: { fn: "trapRainWater", params: ["height: number[]"], ret: "number", desc: "Calculate water trapped after raining" },
  arr14: { fn: "setMatrixZeros", params: ["matrix: number[][]"], ret: "void", desc: "Set row and column to zero if element is zero" },
  arr15: { fn: "mergeIntervals", params: ["intervals: number[][]"], ret: "number[][]", desc: "Merge all overlapping intervals" },
  arr16: { fn: "findKthLargest", params: ["nums: number[]", "k: number"], ret: "number", desc: "Find kth largest element" },
  arr17: { fn: "canCompleteCircuit", params: ["gas: number[]", "cost: number[]"], ret: "number", desc: "Find starting gas station to complete tour" },
  arr18: { fn: "insertInterval", params: ["intervals: number[][]", "newInterval: number[]"], ret: "number[][]", desc: "Insert new interval into list" },
  arr19: { fn: "longestConsecutive", params: ["nums: number[]"], ret: "number", desc: "Length of longest consecutive sequence" },
  arr20: { fn: "spiralOrder", params: ["matrix: number[][]"], ret: "number[]", desc: "Return matrix elements in spiral order" },

  // STRING PROBLEMS
  str1: { fn: "reverseString", params: ["s: string"], ret: "string", desc: "Reverse the string" },
  str2: { fn: "isPalindrome", params: ["s: string"], ret: "boolean", desc: "Check if string is palindrome ignoring non-alphanumeric" },
  str3: { fn: "lengthOfLongestSubstring", params: ["s: string"], ret: "number", desc: "Length of longest substring without repeating" },
  str4: { fn: "groupAnagrams", params: ["strs: string[]"], ret: "string[][]", desc: "Group anagrams together" },
  str5: { fn: "longestCommonPrefix", params: ["strs: string[]"], ret: "string", desc: "Find longest common prefix" },
  str6: { fn: "wordPattern", params: ["pattern: string", "s: string"], ret: "boolean", desc: "Check if word pattern matches string" },
  str7: { fn: "isValidParentheses", params: ["s: string"], ret: "boolean", desc: "Check if parentheses are valid" },
  str8: { fn: "strStr", params: ["haystack: string", "needle: string"], ret: "number", desc: "Find index of needle in haystack" },
  str9: { fn: "multiply", params: ["num1: string", "num2: string"], ret: "string", desc: "Multiply two numbers represented as strings" },
  str10: { fn: "zigzagConvert", params: ["s: string", "numRows: number"], ret: "string", desc: "Zigzag conversion of string" },
  str11: { fn: "minWindow", params: ["s: string", "t: string"], ret: "string", desc: "Minimum window substring containing t" },
  str12: { fn: "compareVersions", params: ["version1: string", "version2: string"], ret: "number", desc: "Compare two version numbers" },
  str13: { fn: "simplifyPath", params: ["path: string"], ret: "string", desc: "Simplify Unix file path" },
  str14: { fn: "decodeString", params: ["s: string"], ret: "string", desc: "Decode string with encoded patterns" },
  str15: { fn: "largestNumber", params: ["nums: number[]"], ret: "string", desc: "Largest number by arranging digits" },
  str16: { fn: "countAndSay", params: ["n: number"], ret: "string", desc: "Look-and-say sequence" },
  str17: { fn: "licenseKeyFormatting", params: ["S: string", "K: number"], ret: "string", desc: "Format license key" },
  str18: { fn: "isSubsequence", params: ["s: string", "t: string"], ret: "boolean", desc: "Check if s is subsequence of t" },

  // LINKED LIST PROBLEMS
  ll1: { fn: "reverseList", params: ["head: ListNode"], ret: "ListNode", desc: "Reverse a linked list" },
  ll2: { fn: "detectCycle", params: ["head: ListNode"], ret: "ListNode", desc: "Detect cycle in linked list" },
  ll3: { fn: "middleNode", params: ["head: ListNode"], ret: "ListNode", desc: "Find middle node of linked list" },
  ll4: { fn: "mergeTwoLists", params: ["list1: ListNode", "list2: ListNode"], ret: "ListNode", desc: "Merge two sorted linked lists" },
  ll5: { fn: "removeNthFromEnd", params: ["head: ListNode", "n: number"], ret: "ListNode", desc: "Remove nth node from end" },
  ll6: { fn: "reorderList", params: ["head: ListNode"], ret: "void", desc: "Reorder linked list L0->Ln->L1->Ln-1" },
  ll7: { fn: "swapPairs", params: ["head: ListNode"], ret: "ListNode", desc: "Swap every two adjacent nodes" },
  ll8: { fn: "rotateRight", params: ["head: ListNode", "k: number"], ret: "ListNode", desc: "Rotate list right by k places" },
  ll9: { fn: "partitionList", params: ["head: ListNode", "x: number"], ret: "ListNode", desc: "Partition list around value x" },
  ll10: { fn: "intersectionNode", params: ["headA: ListNode", "headB: ListNode"], ret: "ListNode", desc: "Find intersection of two lists" },
  ll11: { fn: "sortList", params: ["head: ListNode"], ret: "ListNode", desc: "Sort linked list" },
  ll12: { fn: "copyRandomList", params: ["head: Node"], ret: "Node", desc: "Copy linked list with random pointer" },

  // STACK & QUEUE PROBLEMS
  sq1: { fn: "isValidParentheses", params: ["s: string"], ret: "boolean", desc: "Valid parentheses using stack" },
  sq2: { fn: "evalRPN", params: ["tokens: string[]"], ret: "number", desc: "Evaluate reverse Polish notation" },
  sq3: { fn: "dailyTemperatures", params: ["temperatures: number[]"], ret: "number[]", desc: "Days until warmer temperature" },
  sq4: { fn: "trappingRainWater", params: ["height: number[]"], ret: "number", desc: "Trap rain water between bars" },
  sq5: { fn: "largestRectangleArea", params: ["heights: number[]"], ret: "number", desc: "Largest rectangle in histogram" },
  sq6: { fn: "removeKDigits", params: ["num: string", "k: number"], ret: "string", desc: "Remove k digits to get smallest number" },
  sq7: { fn: "nextGreaterElement", params: ["nums1: number[]", "nums2: number[]"], ret: "number[]", desc: "Next greater element for each" },
  sq8: { fn: "moveZeros", params: ["nums: number[]"], ret: "void", desc: "Move zeros to end preserving order" },
  sq9: { fn: "zigzagLevelOrder", params: ["root: TreeNode"], ret: "number[][]", desc: "Zigzag level order traversal" },
  sq10: { fn: "implementQueue", params: [], ret: "Queue", desc: "Implement queue using stacks" },
  sq11: { fn: "implementStack", params: [], ret: "Stack", desc: "Implement stack using queues" },
  sq12: { fn: "minStack", params: [], ret: "MinStack", desc: "Implement stack with getMin" },

  // TREE PROBLEMS
  tree1: { fn: "inorderTraversal", params: ["root: TreeNode"], ret: "number[]", desc: "Inorder traversal of tree" },
  tree2: { fn: "levelOrder", params: ["root: TreeNode"], ret: "number[][]", desc: "Level order traversal" },
  tree3: { fn: "invertTree", params: ["root: TreeNode"], ret: "TreeNode", desc: "Invert binary tree" },
  tree4: { fn: "maxDepth", params: ["root: TreeNode"], ret: "number", desc: "Maximum depth of tree" },
  tree5: { fn: "isSymmetric", params: ["root: TreeNode"], ret: "boolean", desc: "Check if tree is symmetric" },
  tree6: { fn: "pathSum", params: ["root: TreeNode", "sum: number"], ret: "boolean", desc: "Check if path sum exists" },
  tree7: { fn: "buildTree", params: ["preorder: number[]", "inorder: number[]"], ret: "TreeNode", desc: "Build tree from preorder and inorder" },
  tree8: { fn: "lowestCommonAncestor", params: ["root: TreeNode", "p: TreeNode", "q: TreeNode"], ret: "TreeNode", desc: "Find lowest common ancestor" },
  tree9: { fn: "isValidBST", params: ["root: TreeNode"], ret: "boolean", desc: "Validate binary search tree" },
  tree10: { fn: "kthSmallest", params: ["root: TreeNode", "k: number"], ret: "number", desc: "Kth smallest in BST" },
  tree11: { fn: "zigzagLevelOrder", params: ["root: TreeNode"], ret: "number[][]", desc: "Zigzag level order traversal" },
  tree12: { fn: "rightSideView", params: ["root: TreeNode"], ret: "number[]", desc: "Right side view of tree" },
  tree13: { fn: "serializeDeserialize", params: ["root: TreeNode"], ret: "string", desc: "Serialize and deserialize tree" },
  tree14: { fn: "diameterTree", params: ["root: TreeNode"], ret: "number", desc: "Diameter of binary tree" },
  tree15: { fn: "sumRootLeaf", params: ["root: TreeNode"], ret: "number", desc: "Sum of root to leaf paths" },
  tree16: { fn: "maxPathSum", params: ["root: TreeNode"], ret: "number", desc: "Maximum path sum" },
  tree17: { fn: "flattenTree", params: ["root: TreeNode"], ret: "void", desc: "Flatten tree to linked list" },
  tree18: { fn: "populating", params: ["root: Node"], ret: "void", desc: "Populating next pointers" },

  // GRAPH PROBLEMS
  graph1: { fn: "numIslands", params: ["grid: string[][]"], ret: "number", desc: "Number of islands" },
  graph2: { fn: "courseSchedule", params: ["numCourses: number", "prerequisites: number[][]"], ret: "boolean", desc: "Course schedule possible" },
  graph3: { fn: "topologicalSort", params: ["numCourses: number", "prerequisites: number[][]"], ret: "number[]", desc: "Topological sort of courses" },
  graph4: { fn: "cloneGraph", params: ["node: Node"], ret: "Node", desc: "Clone a graph" },
  graph5: { fn: "wordLadder", params: ["beginWord: string", "endWord: string", "wordList: string[]"], ret: "number", desc: "Shortest word ladder length" },
  graph6: { fn: "alienDictionary", params: ["words: string[]"], ret: "string", desc: "Aliens dictionary order" },
  graph7: { fn: "isPalindrome", params: ["root: TreeNode"], ret: "boolean", desc: "Valid palindrome in binary tree" },
  graph8: { fn: "connectRich", params: ["trust: number[][]", "n: number"], ret: "number", desc: "Find judge in trust relationship" },
  graph9: { fn: "criticalConnections", params: ["n: number", "connections: number[][]"], ret: "number[][]", desc: "Critical connections in network" },
  graph10: { fn: "minimumEffort", params: ["heights: number[][]"], ret: "number", desc: "Climbing effort needed" },
  graph11: { fn: "pacificAtlantic", params: ["heights: number[][]"], ret: "number[][]", desc: "Pacific Atlantic water flow" },
  graph12: { fn: "surroundedRegion", params: ["board: string[][]"], ret: "void", desc: "Surrounded regions capture" },

  // DYNAMIC PROGRAMMING PROBLEMS
  dp1: { fn: "climbStairs", params: ["n: number"], ret: "number", desc: "Ways to climb n stairs" },
  dp2: { fn: "rob", params: ["nums: number[]"], ret: "number", desc: "House robber maximum loot" },
  dp3: { fn: "rob2", params: ["nums: number[]"], ret: "number", desc: "House robber on circular street" },
  dp4: { fn: "wordBreak", params: ["s: string", "wordDict: string[]"], ret: "boolean", desc: "Check if word break possible" },
  dp5: { fn: "coinChange", params: ["coins: number[]", "amount: number"], ret: "number", desc: "Minimum coins for amount" },
  dp6: { fn: "coinChange2", params: ["amount: number", "coins: number[]"], ret: "number", desc: "Coin combinations for amount" },
  dp7: { fn: "editDistance", params: ["word1: string", "word2: string"], ret: "number", desc: "Edit distance between strings" },
  dp8: { fn: "longestIncreasing", params: ["nums: number[]"], ret: "number", desc: "Longest increasing subsequence" },
  dp9: { fn: "longestCommonSubseq", params: ["text1: string", "text2: string"], ret: "number", desc: "Longest common subsequence" },
  dp10: { fn: "unique Paths", params: ["m: number", "n: number"], ret: "number", desc: "Unique paths in grid" },
  dp11: { fn: "uniquePaths2", params: ["obstacleGrid: number[][]"], ret: "number", desc: "Unique paths with obstacles" },
  dp12: { fn: "triangle", params: ["triangle: number[][]"], ret: "number", desc: "Minimum path sum in triangle" },
  dp13: { fn: "maximalSquare", params: ["matrix: string[][]"], ret: "number", desc: "Maximal square area" },
  dp14: { fn: "decodeWays", params: ["s: string"], ret: "number", desc: "Decode string ways" },
  dp15: { fn: "maxProduct", params: ["nums: number[]"], ret: "number", desc: "Maximum product subarray" },
  dp16: { fn: "interleaveStrings", params: ["s1: string", "s2: string", "s3: string"], ret: "boolean", desc: "Check if s3 is interleave of s1 and s2" },
  dp17: { fn: "distinctSubsequences", params: ["s: string", "t: string"], ret: "number", desc: "Distinct subsequences count" },
  dp18: { fn: "perfectSquares", params: ["n: number"], ret: "number", desc: "Least perfect squares sum" },
  dp19: { fn: "wordLadder2", params: ["beginWord: string", "endWord: string", "wordList: string[]"], ret: "string[][]", desc: "All shortest word ladders" },
  dp20: { fn: "buyStockCooldown", params: ["prices: number[]"], ret: "number", desc: "Max profit with cooldown" },

  // SEARCHING & SORTING PROBLEMS
  sort1: { fn: "binarySearch", params: ["nums: number[]", "target: number"], ret: "number", desc: "Binary search for target" },
  sort2: { fn: "searchInsert", params: ["nums: number[]", "target: number"], ret: "number", desc: "Search insert position" },
  sort3: { fn: "findMedianSorted", params: ["nums1: number[]", "nums2: number[]"], ret: "number", desc: "Median of sorted arrays" },
  sort4: { fn: "quickSelect", params: ["nums: number[]", "k: number"], ret: "number", desc: "Kth largest element" },
  sort5: { fn: "sortColors", params: ["nums: number[]"], ret: "void", desc: "Sort array of colors 0,1,2" },
  sort6: { fn: "mergeSorted", params: ["m: number", "n: number", "nums1: number[]", "nums2: number[]"], ret: "void", desc: "Merge sorted arrays" },
  sort7: { fn: "firstBadVersion", params: ["n: number"], ret: "number", desc: "Find first bad version" },
  sort8: { fn: "searchRotated2", params: ["nums: number[]", "target: number"], ret: "boolean", desc: "Search in rotated with duplicates" },
  sort9: { fn: "peakElement", params: ["nums: number[]"], ret: "number", desc: "Find peak element" },
  sort10: { fn: "hIndex", params: ["citations: number[]"], ret: "number", desc: "HIndex calculation" },
  sort11: { fn: "sortList", params: ["head: ListNode"], ret: "ListNode", desc: "Sort linked list" },
  sort12: { fn: "wiggleSort", params: ["nums: number[]"], ret: "void", desc: "Wiggle sort the array" },
  sort13: { fn: "reconstructQueue", params: ["people: number[][]"], ret: "number[][]", desc: "Reconstruct people queue" },
  sort14: { fn: "rearrangeArray", params: ["nums: number[]", "queries: number[][]"], ret: "number[]", desc: "Frequency queries on rearranged array" },
  sort15: { fn: "largestPerimeter", params: ["nums: number[]"], ret: "number", desc: "Largest perimeter triangle" },

  // HASH MAP PROBLEMS
  hash1: { fn: "twoSum", params: ["nums: number[]", "target: number"], ret: "number[]", desc: "Two sum using hash map" },
  hash2: { fn: "containsDuplicate", params: ["nums: number[]"], ret: "boolean", desc: "Contains duplicate" },
  hash3: { fn: "validAnagram", params: ["s: string", "t: string"], ret: "boolean", desc: "Valid anagram" },
  hash4: { fn: "groupAnagrams", params: ["strs: string[]"], ret: "string[][]", desc: "Group anagrams" },
  hash5: { fn: "topKFrequent", params: ["nums: number[]", "k: number"], ret: "number[]", desc: "Top k frequent elements" },
  hash6: { fn: "firstUnique", params: ["s: string"], ret: "number", desc: "First unique character" },
  hash7: { fn: "isIsomorphic", params: ["s: string", "t: string"], ret: "boolean", desc: "Isomorphic strings" },
  hash8: { fn: "wordPattern", params: ["pattern: string", "s: string"], ret: "boolean", desc: "Word pattern matching" },
  hash9: { fn: "happyNumber", params: ["n: number"], ret: "boolean", desc: "Check if happy number" },
  hash10: { fn: "ransomNote", params: ["ransomNote: string", "magazine: string"], ret: "boolean", desc: "Ransom note constructable" },
  hash11: { fn: "intersectionArrays", params: ["nums1: number[]", "nums2: number[]"], ret: "number[]", desc: "Intersection of arrays" },
  hash12: { fn: "majorityElement", params: ["nums: number[]"], ret: "number", desc: "Majority element" },
  hash13: { fn: "lruCache", params: [], ret: "LRUCache", desc: "LRU cache implementation" },

  // BIT MANIPULATION PROBLEMS
  bit1: { fn: "singleNumber", params: ["nums: number[]"], ret: "number", desc: "Single number in array" },
  bit2: { fn: "hammingDistance", params: ["x: number", "y: number"], ret: "number", desc: "Hamming distance" },
  bit3: { fn: "isPowerOfTwo", params: ["n: number"], ret: "boolean", desc: "Check if power of two" },
  bit4: { fn: "isUtf8", params: ["data: number[]"], ret: "boolean", desc: "UTF-8 validation" },
  bit5: { fn: "grayCode", params: ["n: number"], ret: "number[]", desc: "Gray code sequence" },
  bit6: { fn: "reverseBits", params: ["n: number"], ret: "number", desc: "Reverse bits of integer" },
  bit7: { fn: "numberOf1Bits", params: ["n: number"], ret: "number", desc: "Number of 1 bits" },
  bit8: { fn: "bitwise And", params: ["m: number", "n: number"], ret: "number", desc: "Bitwise AND of range" },
  bit9: { fn: "missingNumber", params: ["nums: number[]"], ret: "number", desc: "Missing number" },
  bit10: { fn: "singleNumber3", params: ["nums: number[]"], ret: "number[]", desc: "Single numbers III" },
};

/**
 * Get code template for language
 */
export const getCodeTemplate = (language, problemId) => {
  const sig = PROBLEM_SIGNATURES[problemId];
  if (!sig) {
    // Default template if problem not found
    return getDefaultTemplate(language);
  }

  switch (language) {
    case "javascript":
      return generateJSTemplate(sig);
    case "python":
      return generatePythonTemplate(sig);
    case "java":
      return generateJavaTemplate(sig);
    case "cpp":
      return generateCppTemplate(sig);
    default:
      return getDefaultTemplate(language);
  }
};

/**
 * Generate JavaScript template
 */
const generateJSTemplate = (sig) => {
  const fnName = sig.fn;
  const paramList = sig.params.map(p => p.split(": ")[0]).join(", ");
  
  if (sig.ret === "void") {
    return `function ${fnName}(${paramList}) {
    
}`;
  }

  return `function ${fnName}(${paramList}) {
    
}`;
};

/**
 * Generate Python template
 */
const generatePythonTemplate = (sig) => {
  const fnName = sig.fn.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
  const paramList = sig.params.map(p => p.split(": ")[0]).join(", ");

  if (sig.ret === "void") {
    return `def ${fnName}(${paramList}):
    
`;
  }

  return `def ${fnName}(${paramList}):
    
`;
};

/**
 * Generate Java template
 */
const generateJavaTemplate = (sig) => {
  const javaType = (type) => {
    return type.replace(/number\[\]/g, "int[]")
              .replace(/number/g, "int")
              .replace(/string/g, "String")
              .replace(/boolean/g, "boolean");
  };

  const javaParams = sig.params.map(p => {
    const [name, type] = p.split(": ");
    return `${javaType(type)} ${name}`;
  }).join(", ");

  const returnType = javaType(sig.ret);
  const returnStmt = sig.ret === "void" ? "" : `\n    return null;`;

  return `public ${returnType} ${sig.fn}(${javaParams}) {${returnStmt}
}`;
};

/**
 * Generate C++ template
 */
const generateCppTemplate = (sig) => {
  const cppType = (type) => {
    return type.replace(/number\[\]/g, "vector<int>&")
              .replace(/number/g, "int")
              .replace(/string/g, "string")
              .replace(/boolean/g, "bool");
  };

  const cppRetType = cppType(sig.ret);
  const cppParams = sig.params.map(p => {
    const [name, type] = p.split(": ");
    return `${cppType(type)} ${name}`;
  }).join(", ");

  const returnStmt = sig.ret === "void" ? "" : `\n    return 0;`;

  return `${cppRetType} ${sig.fn}(${cppParams}) {${returnStmt}
}`;
};

/**
 * Default template for unknown problems
 */
const getDefaultTemplate = (language) => {
  const templates = {
    javascript: `function solution(params) {
    
}`,
    python: `def solution(params):
    `,
    java: `public void solution(Object params) {
}`,
    cpp: `void solution(int params) {
}`,
  };
  return templates[language] || templates.javascript;
};

/**
 * Format execution results
 */
export const formatResults = (results) => {
  if (results.error) {
    return {
      success: false,
      message: `❌ ${results.type === "compilation" ? "Compilation Error" : "Execution Error"}: ${results.error}`,
      results: [],
    };
  }

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const allPassed = passed === total;

  return {
    success: allPassed,
    message: allPassed
      ? `✅ All ${total} test cases passed!`
      : `⚠️ ${passed}/${total} test cases passed`,
    results,
  };
};
