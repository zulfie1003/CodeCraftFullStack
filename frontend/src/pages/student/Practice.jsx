import { useState, useRef } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import "../../styles/practice.css";
import {
  Play,
  Share2,
  BookOpen,
  ChevronDown,
  Check,
  X,
  Copy,
  RefreshCw,
  Moon,
  Sun,
  Menu,
  X as XClose,
} from "lucide-react";
import {
  LANGUAGES,
  TEST_CASES,
  getCodeTemplate,
  executeWithJudge0,
  validateCode,
  formatResults,
} from "../../utils/codeExecutor";

const CODING_PROBLEMS = [
  // ============ ARRAY (20 problems) ============
  { id: "arr1", title: "Two Sum", difficulty: "Easy", category: "Array", likes: 2847, dislikes: 342, accepted: "45.2M", submissions: "85.4M", description: "Given an array of integers nums and target, return indices of two numbers that add up to target.", constraints: ["2 <= nums.length <= 10⁴", "-10⁹ <= nums[i] <= 10⁹"], examples: [{ input: "[2,7,11,15], 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9" }] },
  { id: "arr2", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", category: "Array", likes: 1923, dislikes: 287, accepted: "32.1M", submissions: "58.3M", description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. Find max profit from buying and selling once.", constraints: ["1 <= prices.length <= 10⁵", "0 <= prices[i] <= 10⁴"], examples: [{ input: "[7,1,5,3,6,4]", output: "5", explanation: "Buy 1, sell 6, profit = 5" }] },
  { id: "arr3", title: "Contains Duplicate", difficulty: "Easy", category: "Array", likes: 2134, dislikes: 198, accepted: "52.3M", submissions: "78.9M", description: "Given an integer array nums, return true if any value appears at least twice in the array.", constraints: ["1 <= nums.length <= 10⁵", "-10⁹ <= nums[i] <= 10⁹"], examples: [{ input: "[1,2,3,1]", output: "true", explanation: "1 appears twice" }] },
  { id: "arr4", title: "Valid Anagram", difficulty: "Easy", category: "Array", likes: 1645, dislikes: 156, accepted: "38.5M", submissions: "62.1M", description: "Given two strings s and t, return true if t is an anagram of s.", constraints: ["1 <= s.length, t.length <= 5×10⁴", "s and t consist of lowercase English letters"], examples: [{ input: '"anagram", "nagaram"', output: "true", explanation: "Both contain same characters" }] },
  { id: "arr5", title: "Container With Most Water", difficulty: "Medium", category: "Array", likes: 3421, dislikes: 512, accepted: "6.8M", submissions: "11.2M", description: "Find two lines that together with the x-axis form a container with the most water.", constraints: ["n == height.length", "2 <= n <= 10⁵", "0 <= height[i] <= 10⁴"], examples: [{ input: "[1,8,6,2,5,4,8,3,7]", output: "49", explanation: "Maximum area is 49" }] },
  { id: "arr6", title: "Product of Array Except Self", difficulty: "Medium", category: "Array", likes: 2876, dislikes: 423, accepted: "12.4M", submissions: "19.7M", description: "Given an array nums, return an array output where output[i] is the product of all except nums[i].", constraints: ["2 <= nums.length <= 10⁵", "-30 <= nums[i] <= 30"], examples: [{ input: "[1,2,3,4]", output: "[24,12,8,6]", explanation: "Product except self index" }] },
  { id: "arr7", title: "Maximum Subarray", difficulty: "Medium", category: "Array", likes: 3564, dislikes: 289, accepted: "28.5M", submissions: "45.2M", description: "Find the contiguous subarray with the largest sum using Kadane's algorithm.", constraints: ["1 <= nums.length <= 10⁵", "-10⁴ <= nums[i] <= 10⁴"], examples: [{ input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "[4,-1,2,1] has the largest sum" }] },
  { id: "arr8", title: "3Sum", difficulty: "Medium", category: "Array", likes: 2943, dislikes: 567, accepted: "8.2M", submissions: "15.3M", description: "Given an array nums of n integers, find all unique triplets that sum to 0.", constraints: ["3 <= nums.length <= 3×10³", "-10⁵ <= nums[i] <= 10⁵"], examples: [{ input: "[-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", explanation: "Unique triplets" }] },
  { id: "arr9", title: "Rotate Array", difficulty: "Medium", category: "Array", likes: 1876, dislikes: 345, accepted: "18.3M", submissions: "29.4M", description: "Rotate an array to the right by k steps in-place with O(1) space.", constraints: ["1 <= nums.length <= 10⁵", "0 <= k <= 2×10⁵"], examples: [{ input: "[1,2,3,4,5,6,7], k=3", output: "[5,6,7,1,2,3,4]", explanation: "Rotated right by 3" }] },
  { id: "arr10", title: "Search in Rotated Sorted Array", difficulty: "Medium", category: "Array", likes: 2134, dislikes: 298, accepted: "9.8M", submissions: "16.7M", description: "Search for a target value in a rotated sorted array in O(log n) time.", constraints: ["1 <= nums.length <= 5000", "-10⁴ <= nums[i] <= 10⁴"], examples: [{ input: "[4,5,6,7,0,1,2], 0", output: "4", explanation: "Target found at index 4" }] },
  { id: "arr11", title: "Majority Element", difficulty: "Easy", category: "Array", likes: 1654, dislikes: 178, accepted: "25.3M", submissions: "39.8M", description: "Find the element that appears more than n/2 times using Boyer-Moore voting algorithm.", constraints: ["1 <= nums.length <= 5×10⁴", "-10⁹ <= nums[i] <= 10⁹"], examples: [{ input: "[3,2,3]", output: "3", explanation: "3 appears 2 times (more than n/2)" }] },
  { id: "arr12", title: "Next Permutation", difficulty: "Medium", category: "Array", likes: 1923, dislikes: 412, accepted: "7.5M", submissions: "13.2M", description: "Modify array to the next lexicographically greater permutation in-place.", constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 100"], examples: [{ input: "[1,2,3]", output: "[1,3,2]", explanation: "Next permutation" }] },
  { id: "arr13", title: "Trapping Rain Water", difficulty: "Hard", category: "Array", likes: 2891, dislikes: 534, accepted: "5.2M", submissions: "9.8M", description: "Calculate the amount of water trapped after raining given elevation map.", constraints: ["n == height.length", "0 <= height[i] <= 10⁴"], examples: [{ input: "[0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "Water trapped between heights" }] },
  { id: "arr14", title: "Set Matrix Zeroes", difficulty: "Medium", category: "Array", likes: 1534, dislikes: 276, accepted: "8.9M", submissions: "15.1M", description: "Set entire row and column to 0 if an element is 0 using O(1) space.", constraints: ["m == matrix.length", "n == matrix[0].length"], examples: [{ input: "[[1,1,1],[1,0,1],[1,1,1]]", output: "[[1,0,1],[0,0,0],[1,0,1]]", explanation: "0s propagate" }] },
  { id: "arr15", title: "Merge Intervals", difficulty: "Medium", category: "Array", likes: 1867, dislikes: 289, accepted: "11.3M", submissions: "19.2M", description: "Given an array of intervals, merge all overlapping intervals.", constraints: ["1 <= intervals.length <= 10⁴", "0 <= start_i <= end_i <= 10⁴"], examples: [{ input: "[[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "Overlapping merged" }] },
  { id: "arr16", title: "Kth Largest Element", difficulty: "Medium", category: "Array", likes: 1756, dislikes: 234, accepted: "10.2M", submissions: "17.3M", description: "Find the kth largest element in an unsorted array without fully sorting.", constraints: ["1 <= k <= nums.length <= 10⁵", "-10⁴ <= nums[i] <= 10⁴"], examples: [{ input: "[3,2,1,5,6,4], k=2", output: "5", explanation: "2nd largest is 5" }] },
  { id: "arr17", title: "Gas Station", difficulty: "Medium", category: "Array", likes: 1234, dislikes: 198, accepted: "6.8M", submissions: "11.5M", description: "Determine the starting gas station index to complete a circular tour.", constraints: ["n == gas.length == cost.length", "1 <= n <= 10⁵"], examples: [{ input: "gas=[1,2,3,4,5], cost=[3,4,5,1,2]", output: "3", explanation: "Can start at index 3" }] },
  { id: "arr18", title: "Insert Interval", difficulty: "Medium", category: "Array", likes: 987, dislikes: 156, accepted: "5.3M", submissions: "9.1M", description: "Insert a new interval into a list of non-overlapping intervals.", constraints: ["0 <= intervals.length <= 10⁴", "newInterval.length == 2"], examples: [{ input: "[[1,5]], [2,7]", output: "[[1,7]]", explanation: "Intervals merged" }] },
  { id: "arr19", title: "Longest Consecutive", difficulty: "Medium", category: "Array", likes: 1645, dislikes: 234, accepted: "8.7M", submissions: "15.2M", description: "Find the length of the longest consecutive elements sequence in O(n) time.", constraints: ["0 <= nums.length <= 10⁵", "-10⁹ <= nums[i] <= 10⁹"], examples: [{ input: "[100,4,200,1,3,2]", output: "4", explanation: "[1,2,3,4] is longest" }] },
  { id: "arr20", title: "Spiral Matrix", difficulty: "Medium", category: "Array", likes: 1456, dislikes: 289, accepted: "7.2M", submissions: "12.8M", description: "Return all elements of a matrix in spiral order (clockwise).", constraints: ["m == matrix.length", "n == matrix[i].length", "1 <= m, n <= 10"], examples: [{ input: "[[1,2,3],[4,5,6],[7,8,9]]", output: "[1,2,3,6,9,8,7,4,5]", explanation: "Spiral order" }] },

  // ============ STRING (18 problems) ============
  { id: "str1", title: "Reverse String", difficulty: "Easy", category: "String", likes: 1924, dislikes: 892, accepted: "12.5M", submissions: "15.8M", description: "Reverse a string array in-place with O(1) extra space.", constraints: ["1 <= s.length <= 10⁵", "s[i] is a printable ascii character"], examples: [{ input: '["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: "Reversed in-place" }] },
  { id: "str2", title: "Longest Substring Without Repeating", difficulty: "Medium", category: "String", likes: 4892, dislikes: 623, accepted: "9.2M", submissions: "18.5M", description: "Find the length of the longest substring without repeating characters.", constraints: ["0 <= s.length <= 5×10⁴", "s consists of English letters, digits, symbols and spaces"], examples: [{ input: '"abcabcbb"', output: "3", explanation: '"abc" is the longest' }] },
  { id: "str3", title: "Palindromic Substrings", difficulty: "Medium", category: "String", likes: 1876, dislikes: 278, accepted: "11.3M", submissions: "19.2M", description: "Find the longest palindromic substring in a string.", constraints: ["1 <= s.length <= 1000", "s consist of only digits and English letters"], examples: [{ input: '"babad"', output: '"bab" or "aba"', explanation: "Both are palindromes" }] },
  { id: "str4", title: "Group Anagrams", difficulty: "Medium", category: "String", likes: 2134, dislikes: 345, accepted: "13.8M", submissions: "22.1M", description: "Group an array of strings by anagrams together.", constraints: ["1 <= strs.length <= 10⁴", "0 <= strs[i].length <= 100", "strs[i] consists of lowercase English letters"], examples: [{ input: '["eat","tea","tan","ate","nat","bat"]', output: '[["eat","tea","ate"],["tan","nat"],["bat"]]', explanation: "Grouped by anagrams" }] },
  { id: "str5", title: "Valid Parentheses", difficulty: "Easy", category: "String", likes: 3456, dislikes: 289, accepted: "28.3M", submissions: "42.1M", description: "Determine if the string containing just parentheses is valid.", constraints: ["1 <= s.length <= 10⁴", "s consists of parentheses only"], examples: [{ input: '"()"', output: "true", explanation: "Valid sequence" }] },
  { id: "str6", title: "String to Integer (atoi)", difficulty: "Medium", category: "String", likes: 1234, dislikes: 456, accepted: "7.8M", submissions: "14.2M", description: "Implement atoi function to convert string to integer.", constraints: ["0 <= s.length <= 200", "s is a valid entry for aotoi() function"], examples: [{ input: '"42"', output: "42", explanation: "String to int conversion" }] },
  { id: "str7", title: "Zigzag Conversion", difficulty: "Medium", category: "String", likes: 987, dislikes: 198, accepted: "5.6M", submissions: "10.2M", description: "Write to zigzag pattern and then read row by row.", constraints: ["1 <= s.length <= 1000", "s consists of English letters and digits"], examples: [{ input: '"PAYPALISHIRING", numRows=3', output: '"PAHNAPLSIIGYIR"', explanation: "Zigzag pattern" }] },
  { id: "str8", title: "First Unique Character", difficulty: "Easy", category: "String", likes: 1645, dislikes: 234, accepted: "18.7M", submissions: "29.3M", description: "Find the first non-repeating character in a string.", constraints: ["1 <= s.length <= 2×10⁵", "s consists of only lowercase English letters"], examples: [{ input: '"leetcode"', output: "0", explanation: "First unique char at index 0" }] },
  { id: "str9", title: "Integer to Roman", difficulty: "Medium", category: "String", likes: 1234, dislikes: 189, accepted: "8.3M", submissions: "14.5M", description: "Convert an integer to its Roman numeral representation.", constraints: ["1 <= num <= 3999"], examples: [{ input: "3", output: '"III"', explanation: "Integer to Roman" }] },
  { id: "str10", title: "Roman to Integer", difficulty: "Easy", category: "String", likes: 1876, dislikes: 234, accepted: "19.8M", submissions: "31.2M", description: "Convert a Roman numeral string to an integer.", constraints: ["1 <= s.length <= 15", "s contains only the characters I, V, X, L, C, D, M"], examples: [{ input: '"III"', output: "3", explanation: "Roman to Integer" }] },
  { id: "str11", title: "Longest Common Prefix", difficulty: "Easy", category: "String", likes: 2134, dislikes: 278, accepted: "21.3M", submissions: "35.8M", description: "Find the longest common prefix string among strings.", constraints: ["1 <= strs.length <= 200", "0 <= strs[i].length <= 200"], examples: [{ input: '["flower","flow","flight"]', output: '"fl"', explanation: "Longest common prefix" }] },
  { id: "str12", title: "Multiply Strings", difficulty: "Medium", category: "String", likes: 1123, dislikes: 167, accepted: "5.9M", submissions: "10.8M", description: "Multiply two non-negative integers represented as strings.", constraints: ["1 <= num1.length, num2.length <= 200", "num1 and num2 consist of digits only"], examples: [{ input: '"123", "456"', output: '"56088"', explanation: "String multiplication" }] },
  { id: "str13", title: "Word Break", difficulty: "Medium", category: "String", likes: 2345, dislikes: 289, accepted: "11.2M", submissions: "19.3M", description: "Determine if a string can be segmented into dictionary words.", constraints: ["1 <= s.length <= 300", "1 <= wordDict.length <= 1000"], examples: [{ input: 's="leetcode", wordDict=["leet","code"]', output: "true", explanation: "Can be segmented" }] },
  { id: "str14", title: "Edit Distance", difficulty: "Hard", category: "String", likes: 1876, dislikes: 234, accepted: "6.7M", submissions: "12.3M", description: "Find the minimum number of edits to transform one string to another.", constraints: ["0 <= word1.length, word2.length <= 500"], examples: [{ input: '"horse", "ros"', output: "3", explanation: "3 edits required" }] },
  { id: "str15", title: "Implement strStr()", difficulty: "Easy", category: "String", likes: 1534, dislikes: 198, accepted: "14.8M", submissions: "24.2M", description: "Find the first occurrence of a substring in a string.", constraints: ["1 <= haystack.length, needle.length <= 10⁴"], examples: [{ input: '"hello", "ll"', output: "2", explanation: "Substring at index 2" }] },
  { id: "str16", title: "Valid Palindrome", difficulty: "Easy", category: "String", likes: 1234, dislikes: 156, accepted: "12.3M", submissions: "20.5M", description: "Check if a string is a valid palindrome (alphanumeric only).", constraints: ["1 <= s.length <= 2×10⁵", "s consists of printable ASCII characters"], examples: [{ input: '"A man, a plan, a canal: Panama"', output: "true", explanation: "Valid palindrome if alphanumeric only" }] },
  { id: "str17", title: "Regular Expression Matching", difficulty: "Hard", category: "String", likes: 987, dislikes: 234, accepted: "4.2M", submissions: "8.9M", description: "Match a string with '.' and '*' wildcards using regex.", constraints: ["1 <= s.length <= 20", "1 <= p.length <= 30"], examples: [{ input: '"aa", "a"', output: "false", explanation: "Pattern doesn't match" }] },
  { id: "str18", title: "Minimum Window Substring", difficulty: "Hard", category: "String", likes: 1645, dislikes: 289, accepted: "5.8M", submissions: "11.2M", description: "Find minimum window substring that contains all chars in t.", constraints: ["1 <= s.length, t.length <= 10⁵"], examples: [{ input: '"ADOBECODEBANC", "ABC"', output: '"BANC"', explanation: "Minimum window" }] },

  // ============ LINKED LIST (12 problems) ============
  { id: "ll1", title: "Reverse Linked List", difficulty: "Easy", category: "Linked List", likes: 2345, dislikes: 198, accepted: "28.3M", submissions: "42.1M", description: "Reverse a singly linked list iteratively or recursively.", constraints: ["0 <= Number of Nodes <= 5000", "-5000 <= Node.val <= 5000"], examples: [{ input: "[1,2,3,4,5]", output: "[5,4,3,2,1]", explanation: "Reversed list" }] },
  { id: "ll2", title: "Linked List Cycle", difficulty: "Easy", category: "Linked List", likes: 1876, dislikes: 234, accepted: "18.9M", submissions: "31.3M", description: "Detect if a linked list has a cycle using Floyd's algorithm.", constraints: ["Number of nodes: 0 to 10⁴", "-10⁵ <= Node.val <= 10⁵"], examples: [{ input: "head = [3,2,0,-4], pos = 1", output: "true", explanation: "Cycle detected at index 1" }] },
  { id: "ll3", title: "Merge Two Sorted Lists", difficulty: "Easy", category: "Linked List", likes: 2134, dislikes: 178, accepted: "24.5M", submissions: "38.2M", description: "Merge two sorted linked lists into one sorted list.", constraints: ["Number of nodes: 0 to 50", "-100 <= Node.val <= 100"], examples: [{ input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]", explanation: "Merged sorted lists" }] },
  { id: "ll4", title: "Remove Nth Node From End", difficulty: "Medium", category: "Linked List", likes: 1654, dislikes: 234, accepted: "12.8M", submissions: "21.3M", description: "Remove the nth node from the end of the list.", constraints: ["Number of nodes: 1 to 30", "1 <= n <= sz"], examples: [{ input: "[1,2,3,4,5], n=2", output: "[1,2,3,5]", explanation: "2nd node from end removed" }] },
  { id: "ll5", title: "Linked List Cycle II", difficulty: "Medium", category: "Linked List", likes: 1234, dislikes: 198, accepted: "9.3M", submissions: "16.2M", description: "Return the node where the cycle begins in the linked list.", constraints: ["Number of nodes: 1 to 10⁴", "-10⁵ <= Node.val <= 10⁵"], examples: [{ input: "[3,2,0,-4], pos=1", output: "1", explanation: "Cycle begins at node index 1" }] },
  { id: "ll6", title: "Intersection of Two Lists", difficulty: "Easy", category: "Linked List", likes: 987, dislikes: 156, accepted: "11.3M", submissions: "19.2M", description: "Find the node at which the intersection of two singly linked lists begins.", constraints: ["Number of nodes: 0 to 3×10⁴"], examples: [{ input: "intersectVal = 8", output: "Intersecting node at 8", explanation: "Lists intersect" }] },
  { id: "ll7", title: "Palindrome Linked List", difficulty: "Easy", category: "Linked List", likes: 1645, dislikes: 278, accepted: "8.7M", submissions: "15.3M", description: "Check if a linked list is a palindrome in O(n) time and O(1) space.", constraints: ["Number of nodes: 1 to 10⁵", "-10⁵ <= Node.val <= 10⁵"], examples: [{ input: "[1,2,2,1]", output: "true", explanation: "List is palindrome" }] },
  { id: "ll8", title: "Reorder List", difficulty: "Medium", category: "Linked List", likes: 1234, dislikes: 189, accepted: "6.8M", submissions: "12.1M", description: "Reorder list to place nodes in L0→Ln→L1→Ln-1 pattern.", constraints: ["1 <= Number of nodes <= 5×10⁴"], examples: [{ input: "[1,2,3,4]", output: "[1,4,2,3]", explanation: "List reordered" }] },
  { id: "ll9", title: "Add Two Numbers", difficulty: "Medium", category: "Linked List", likes: 2876, dislikes: 345, accepted: "15.3M", submissions: "26.2M", description: "Add two numbers represented by linked lists in reverse order.", constraints: ["Number of nodes: 1 to 100", "0 <= Node.val <= 9"], examples: [{ input: "l1 = [2,4,3], l2 = [5,6,4]", output: "[7,0,8]", explanation: "342 + 465 = 807" }] },
  { id: "ll10", title: "Copy List with Random Pointer", difficulty: "Medium", category: "Linked List", likes: 1456, dislikes: 234, accepted: "7.2M", submissions: "13.8M", description: "Create a deep copy of a linked list with random pointers.", constraints: ["0 <= N <= 1000", "-10000 <= Node.val <= 10000"], examples: [{ input: "List with random pointers", output: "Deep copy", explanation: "All connections preserved" }] },
  { id: "ll11", title: "Rotate List", difficulty: "Medium", category: "Linked List", likes: 987, dislikes: 198, accepted: "5.6M", submissions: "10.2M", description: "Rotate list to the right by k places.", constraints: ["Number of nodes: 0 to 500", "0 <= k <= 2×10⁹"], examples: [{ input: "[1,2,3,4,5], k=2", output: "[4,5,1,2,3]", explanation: "Rotated right by 2" }] },
  { id: "ll12", title: "Partition List", difficulty: "Medium", category: "Linked List", likes: 876, dislikes: 167, accepted: "4.9M", submissions: "9.1M", description: "Partition list such that nodes less than x come before nodes >= x.", constraints: ["Number of nodes: 0 to 200", "-100 <= Node.val <= 100"], examples: [{ input: "[1,4,3,2,5,2], x=3", output: "[1,2,2,4,3,5]", explanation: "Partitioned around x" }] },

  // ============ STACK & QUEUE (12 problems) ============
  { id: "stack1", title: "Valid Parentheses", difficulty: "Easy", category: "Stack & Queue", likes: 3456, dislikes: 289, accepted: "28.3M", submissions: "42.1M", description: "Determine if a string with parentheses is valid using a stack.", constraints: ["1 <= s.length <= 10⁴", "s consists of parentheses only"], examples: [{ input: '"()"', output: "true", explanation: "Valid matching pairs" }] },
  { id: "stack2", title: "Evaluate Reverse Polish Notation", difficulty: "Medium", category: "Stack & Queue", likes: 1234, dislikes: 198, accepted: "8.3M", submissions: "14.5M", description: "Evaluate an expression given in Reverse Polish Notation.", constraints: ["1 <= tokens.length <= 10⁴", "tokens[i] is either an operator or integer"], examples: [{ input: '["2","1","+","3","*"]', output: "9", explanation: "((2 + 1) * 3) = 9" }] },
  { id: "stack3", title: "Daily Temperatures", difficulty: "Medium", category: "Stack & Queue", likes: 1876, dislikes: 234, accepted: "11.2M", submissions: "19.3M", description: "For each temperature, find days until a warmer temperature appears.", constraints: ["1 <= temperatures.length <= 10⁵", "30 <= temperatures[i] <= 100"], examples: [{ input: "[73,74,75,71,69,72,76,73]", output: "[1,1,4,2,1,1,0,0]", explanation: "Days to warmer temp" }] },
  { id: "stack4", title: "Largest Rectangle in Histogram", difficulty: "Hard", category: "Stack & Queue", likes: 2134, dislikes: 345, accepted: "6.7M", submissions: "12.3M", description: "Find the largest rectangle area in a histogram using a stack.", constraints: ["1 <= heights.length <= 10⁵", "0 <= heights[i] <= 10⁴"], examples: [{ input: "[2,1,5,6,2,3]", output: "10", explanation: "Rectangle of height 2, width 5" }] },
  { id: "stack5", title: "Implement Queue using Stacks", difficulty: "Easy", category: "Stack & Queue", likes: 1234, dislikes: 178, accepted: "12.8M", submissions: "21.3M", description: "Implement a queue using two stacks.", constraints: ["1 <= q.length <= 100", "1 <= val <= 100"], examples: [{ input: "push(1), push(2), pop()", output: "1 (FIFO)", explanation: "Queue behavior" }] },
  { id: "stack6", title: "Implement Stack using Queues", difficulty: "Easy", category: "Stack & Queue", likes: 876, dislikes: 156, accepted: "9.2M", submissions: "15.8M", description: "Implement a stack using one or two queues.", constraints: ["1 <= x <= 100", "At most 100 push/pop/top calls"], examples: [{ input: "push(1), push(2), pop()", output: "2 (LIFO)", explanation: "Stack behavior" }] },
  { id: "stack7", title: "Min Stack", difficulty: "Easy", category: "Stack & Queue", likes: 1645, dislikes: 198, accepted: "14.3M", submissions: "23.8M", description: "Design a stack that supports push, pop, top, and getMin in O(1).", constraints: ["Methods called 1 to 30000 times", "-2³¹ <= val <= 2³¹-1"], examples: [{ input: "push(-2), push(0), push(-3)", output: "getMin() = -3", explanation: "Min tracked" }] },
  { id: "stack8", title: "Trapping Rain Water II", difficulty: "Hard", category: "Stack & Queue", likes: 987, dislikes: 234, accepted: "4.2M", submissions: "8.9M", description: "Calculate rain water trapped in 2D elevation map using priority queue.", constraints: ["m == heightMap.length", "n == heightMap[i].length"], examples: [{ input: "2D heightMap", output: "Trapped water volume", explanation: "2D trapping" }] },
  { id: "stack9", title: "Next Greater Element I", difficulty: "Easy", category: "Stack & Queue", likes: 1234, dislikes: 178, accepted: "10.3M", submissions: "17.2M", description: "Find next greater element for each element in nums1 from nums2.", constraints: ["1 <= nums1.length <= 10⁴", "1 <= nums2.length <= 10⁵"], examples: [{ input: "nums1 = [4,1,2], nums2 = [1,3,4,2]", output: "[-1,3,-1]", explanation: "Next greater elements" }] },
  { id: "stack10", title: "Simplify Path", difficulty: "Medium", category: "Stack & Queue", likes: 876, dislikes: 145, accepted: "6.8M", submissions: "12.5M", description: "Simplify Unix file path using a stack.", constraints: ["1 <= path.length <= 3000", "path consists of English letters, digits, period, slash"], examples: [{ input: '"/a/./b/../../c/"', output: '"/c"', explanation: "Simplified path" }] },
  { id: "stack11", title: "Number of Recent Calls", difficulty: "Easy", category: "Stack & Queue", likes: 1645, dislikes: 134, accepted: "7.8M", submissions: "13.2M", description: "Count recent API calls within specified time window using queue.", constraints: ["1 <= t <= 10⁹", "All t are different"], examples: [{ input: "call(1), call(100), call(3001)", output: "Count within window", explanation: "Recent calls count" }] },
  { id: "stack12", title: "Decode String", difficulty: "Medium", category: "Stack & Queue", likes: 1234, dislikes: 167, accepted: "8.9M", submissions: "15.3M", description: "Decode a string with integer multipliers using a stack.", constraints: ["1 <= s.length <= 30", "s consists of digits, letters and brackets"], examples: [{ input: '"3[a2[c]]"', output: '"acaccacca"', explanation: "Decoded string" }] },

  // ============ TREE (18 problems) ============
  { id: "tree1", title: "Binary Tree Inorder Traversal", difficulty: "Easy", category: "Tree", likes: 2345, dislikes: 198, accepted: "26.3M", submissions: "39.1M", description: "Traverse binary tree in inorder (left, root, right) iteratively or recursively.", constraints: ["Number of nodes: 0 to 100", "-100 <= Node.val <= 100"], examples: [{ input: "[1,null,2,3]", output: "[1,3,2]", explanation: "Inorder traversal" }] },
  { id: "tree2", title: "Binary Tree Level Order Traversal", difficulty: "Medium", category: "Tree", likes: 1876, dislikes: 234, accepted: "18.9M", submissions: "31.3M", description: "Traverse binary tree level by level using BFS.", constraints: ["Number of nodes: 0 to 2000", "-1000 <= Node.val <= 1000"], examples: [{ input: "[3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]", explanation: "Level order" }] },
  { id: "tree3", title: "Maximum Depth of Binary Tree", difficulty: "Easy", category: "Tree", likes: 2134, dislikes: 178, accepted: "24.5M", submissions: "38.2M", description: "Find the maximum depth of a binary tree recursively.", constraints: ["Number of nodes: 0 to 10⁴", "-100 <= Node.val <= 100"], examples: [{ input: "[3,9,20,null,null,15,7]", output: "3", explanation: "Height is 3" }] },
  { id: "tree4", title: "Validate Binary Search Tree", difficulty: "Medium", category: "Tree", likes: 1654, dislikes: 234, accepted: "12.8M", submissions: "21.3M", description: "Validate if a binary tree is a valid BST.", constraints: ["Number of nodes: 1 to 10⁴", "-2³¹ <= Node.val <= 2³¹-1"], examples: [{ input: "[2,1,3]", output: "true", explanation: "Valid BST" }] },
  { id: "tree5", title: "Symmetric Tree", difficulty: "Easy", category: "Tree", likes: 1234, dislikes: 198, accepted: "14.3M", submissions: "23.8M", description: "Check if a binary tree is symmetric (mirror image).", constraints: ["Number of nodes: 1 to 1000", "-100 <= Node.val <= 100"], examples: [{ input: "[1,2,2,3,4,4,3]", output: "true", explanation: "Tree is symmetric" }] },
  { id: "tree6", title: "Path Sum", difficulty: "Easy", category: "Tree", likes: 1876, dislikes: 245, accepted: "8.7M", submissions: "15.3M", description: "Find if there is a root-to-leaf path with a specified target sum.", constraints: ["Number of nodes: 0 to 5000", "-1000 <= Node.val <= 1000"], examples: [{ input: "[5,4,8,11,null,13,4,7,2,null,1], target=22", output: "true", explanation: "Path sum exists" }] },
  { id: "tree7", title: "Lowest Common Ancestor of BST", difficulty: "Easy", category: "Tree", likes: 1645, dislikes: 167, accepted: "11.3M", submissions: "19.2M", description: "Find the lowest common ancestor of two nodes in a BST.", constraints: ["2 <= Number of nodes <= 10⁵", "All Node.val are unique"], examples: [{ input: "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8", output: "6", explanation: "LCA is 6" }] },
  { id: "tree8", title: "Binary Tree Right Side View", difficulty: "Medium", category: "Tree", likes: 987, dislikes: 198, accepted: "6.8M", submissions: "12.1M", description: "Return the right side view of a binary tree using level order traversal.", constraints: ["0 <= Number of nodes <= 100", "-100 <= Node.val <= 100"], examples: [{ input: "[1,2,3,null,5,null,4]", output: "[1,3,4]", explanation: "Right side view" }] },
  { id: "tree9", title: "Diameter of Binary Tree", difficulty: "Easy", category: "Tree", likes: 2876, dislikes: 234, accepted: "9.3M", submissions: "16.2M", description: "Find the diameter of a binary tree (longest path between nodes).", constraints: ["Number of nodes: 1 to 10⁴", "-100 <= Node.val <= 100"], examples: [{ input: "[1,2,3,4,5]", output: "3", explanation: "Longest path is 4->2->1->3" }] },
  { id: "tree10", title: "Balanced Binary Tree", difficulty: "Easy", category: "Tree", likes: 1234, dislikes: 156, accepted: "12.3M", submissions: "20.5M", description: "Check if a binary tree is height balanced.", constraints: ["Number of nodes: 0 to 5000", "-10000 <= Node.val <= 10000"], examples: [{ input: "[3,9,20,null,null,15,7]", output: "true", explanation: "Tree is balanced" }] },
  { id: "tree11", title: "Flatten Binary Tree to Linked List", difficulty: "Medium", category: "Tree", likes: 1456, dislikes: 289, accepted: "7.2M", submissions: "13.8M", description: "Flatten binary tree to linked list in-place using preorder traversal.", constraints: ["Number of nodes: 0 to 2000", "-100 <= Node.val <= 100"], examples: [{ input: "[1,2,5,3,4,null,6]", output: "Flattened", explanation: "Preorder traversal linked" }] },
  { id: "tree12", title: "Construct Binary Tree from Preorder", difficulty: "Medium", category: "Tree", likes: 876, dislikes: 234, accepted: "5.6M", submissions: "10.2M", description: "Construct binary tree from preorder and inorder traversals.", constraints: ["1 <= inorder.length <= 3000", "inorder and preorder consist of unique values"], examples: [{ input: "preorder=[3,9,20,15,7], inorder=[9,3,15,20,7]", output: "Binary tree", explanation: "Reconstructed tree" }] },
  { id: "tree13", title: "Serialize and Deserialize BST", difficulty: "Hard", category: "Tree", likes: 987, dislikes: 198, accepted: "4.9M", submissions: "9.1M", description: "Serialize BST to string and deserialize back to tree.", constraints: ["1 <= Number of nodes <= 1000", "-1000 <= Node.val <= 1000"], examples: [{ input: "[2,1,3]", output: "Serialized and deserialized", explanation: "Tree preserved" }] },
  { id: "tree14", title: "Binary Search Tree Iterator", difficulty: "Medium", category: "Tree", likes: 1234, dislikes: 178, accepted: "6.8M", submissions: "12.5M", description: "Implement an iterator for BST with O(1) hasNext and next.", constraints: ["1 <= Number of nodes <= 10⁵", "0 <= Node.val <= 10⁶"], examples: [{ input: "[7,3,15,null,null,9,20]", output: "Next values in order", explanation: "InOrder iteration" }] },
  { id: "tree15", title: "Maximal Square in Matrix", difficulty: "Medium", category: "Tree", likes: 1645, dislikes: 234, accepted: "4.7M", submissions: "8.9M", description: "Find the largest square containing only 1s in a matrix.", constraints: ["m == matrix.length", "n == matrix[i].length"], examples: [{ input: '[["1","0","1"],["1","0","1"],["1","1","1"]]', output: "1", explanation: "Maximal square size" }] },
  { id: "tree16", title: "Binary Tree Maximum Path Sum", difficulty: "Hard", category: "Tree", likes: 1456, dislikes: 312, accepted: "5.8M", submissions: "11.2M", description: "Find the maximum path sum in a binary tree.", constraints: ["Number of nodes: 1 to 3×10⁴", "-1000 <= Node.val <= 1000"], examples: [{ input: "[1,2,3]", output: "6", explanation: "Path 2->1->3" }] },
  { id: "tree17", title: "Number of Islands", difficulty: "Medium", category: "Tree", likes: 2134, dislikes: 289, accepted: "13.8M", submissions: "22.1M", description: "Count the number of islands in a 2D grid using DFS/BFS.", constraints: ["m == grid.length", "n == grid[i].length"], examples: [{ input: '[["1","1","1"],["0","1","0"],["1","1","1"]]', output: "1", explanation: "One island" }] },
  { id: "tree18", title: "Course Schedule IV", difficulty: "Hard", category: "Tree", likes: 876, dislikes: 167, accepted: "3.5M", submissions: "7.2M", description: "Check if prerequisites can form valid course schedule.", constraints: ["1 <= numCourses <= 100", "0 <= prerequisites.length <= numCourses²"], examples: [{ input: "numCourses=2, prerequisites=[[1,0]]", output: "Valid schedule", explanation: "No cycle" }] },

  // ============ GRAPH (12 problems) ============
  { id: "graph1", title: "Number of Islands", difficulty: "Medium", category: "Graph", likes: 2134, dislikes: 289, accepted: "13.8M", submissions: "22.1M", description: "Count the number of islands in a 2D grid (DFS/BFS).", constraints: ["m == grid.length", "n == grid[i].length", "grid[i][j] is 0 or 1"], examples: [{ input: '[["1","1","1"],["0","1","0"],["1","1","1"]]', output: "1", explanation: "One island" }] },
  { id: "graph2", title: "Clone Graph", difficulty: "Medium", category: "Graph", likes: 1876, dislikes: 345, accepted: "6.8M", submissions: "12.3M", description: "Return a deep copy of an undirected graph using DFS/BFS.", constraints: ["1 <= Node.val <= 100", "1 <= edges.length <= 1000"], examples: [{ input: "adjacency list [[2,4],[1,3],[2,4],[1,3]]", output: "Deep copy", explanation: "Graph cloned" }] },
  { id: "graph3", title: "Course Schedule", difficulty: "Medium", category: "Graph", likes: 2345, dislikes: 234, accepted: "9.3M", submissions: "16.2M", description: "Determine if course schedule can be completed (topological sort).", constraints: ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= numCourses²"], examples: [{ input: "numCourses=2, prerequisites=[[1,0]]", output: "true", explanation: "Can finish all courses" }] },
  { id: "graph4", title: "Course Schedule II", difficulty: "Medium", category: "Graph", likes: 1654, dislikes: 198, accepted: "8.2M", submissions: "15.1M", description: "Return a topological sort order of courses.", constraints: ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= numCourses²"], examples: [{ input: "numCourses=4, prerequisites=[[1,0],[2,0],[3,1]]", output: "[0,1,2,3]", explanation: "Valid course order" }] },
  { id: "graph5", title: "Network Delay Time", difficulty: "Medium", category: "Graph", likes: 1234, dislikes: 178, accepted: "5.6M", submissions: "10.8M", description: "Find minimum time for signal to reach all nodes (Dijkstra).", constraints: ["1 <= N <= 100", "1 <= times.length <= 6000"], examples: [{ input: "times=[[2,1,1],[2,3,1],[3,4,1]], n=4, k=2", output: "2", explanation: "Time to reach all nodes" }] },
  { id: "graph6", title: "Alien Dictionary", difficulty: "Hard", category: "Graph", likes: 987, dislikes: 234, accepted: "4.2M", submissions: "8.9M", description: "Sort words using alien dictionary (topological sort).", constraints: ["1 <= words.length <= 100", "1 <= words[i].length <= 20"], examples: [{ input: '["wrt","wrf","er","ett","rftt"]', output: '"wertf"', explanation: "Alien dictionary order" }] },
  { id: "graph7", title: "Pacific Atlantic Water Flow", difficulty: "Medium", category: "Graph", likes: 876, dislikes: 167, accepted: "5.9M", submissions: "10.2M", description: "Find cells where water flows to both oceans using DFS.", constraints: ["m == heights.length", "n == heights[0].length"], examples: [{ input: "[[4,2,7,3,4],[5,4,6,9,5],[3,2,6,9,6],[2,6,7,6,7]]", output: "Cells on paths", explanation: "Pacific Atlantic flow" }] },
  { id: "graph8", title: "Number of Connected Components", difficulty: "Medium", category: "Graph", likes: 1234, dislikes: 145, accepted: "7.3M", submissions: "13.5M", description: "Count connected components in an undirected graph using Union-Find.", constraints: ["1 <= n <= 2000", "0 <= edges.length <= 5000"], examples: [{ input: "n=5, edges=[[0,1],[1,2],[3,4]]", output: "2", explanation: "Two components" }] },
  { id: "graph9", title: "Redundant Connection", difficulty: "Medium", category: "Graph", likes: 1456, dislikes: 189, accepted: "6.7M", submissions: "12.1M", description: "Find a redundant edge that creates a cycle using Union-Find.", constraints: ["n == edges.length", "1 <= n <= 1000"], examples: [{ input: "edges=[[1,2],[1,3],[2,3]]", output: "[2,3]", explanation: "Redundant edge" }] },
  { id: "graph10", title: "Graph Valid Tree", difficulty: "Medium", category: "Graph", likes: 876, dislikes: 156, accepted: "5.2M", submissions: "9.8M", description: "Determine if undirected graph is a valid tree (n-1 edges, no cycles).", constraints: ["1 <= n <= 2000", "0 <= edges.length <= 5000"], examples: [{ input: "n=5, edges=[[0,1],[0,2],[0,3],[1,4]]", output: "true", explanation: "Valid tree" }] },
  { id: "graph11", title: "Surrounded Regions", difficulty: "Medium", category: "Graph", likes: 1234, dislikes: 178, accepted: "6.8M", submissions: "12.5M", description: "Capture surrounded regions using DFS from borders.", constraints: ["m == board.length", "n == board[i].length"], examples: [{ input: '[["X","X","X"],["X","O","X"],["X","X","X"]]', output: "All Os surrounded", explanation: "Captured O's" }] },
  { id: "graph12", title: "All Paths From Source to Target", difficulty: "Medium", category: "Graph", likes: 987, dislikes: 134, accepted: "7.8M", submissions: "13.2M", description: "Find all paths from source to target in DAG using DFS.", constraints: ["2 <= n <= 15", "graph.length == n", "1 <= graph[i].length < n"], examples: [{ input: "graph=[[1,2],[3],[3],[]]", output: "[[0,1,3],[0,2,3]]", explanation: "All paths from 0 to 3" }] },

  // ============ DYNAMIC PROGRAMMING (20 problems) ============
  { id: "dp1", title: "Fibonacci Number", difficulty: "Easy", category: "Dynamic Programming", likes: 1456, dislikes: 245, accepted: "8.3M", submissions: "12.1M", description: "Calculate the nth Fibonacci number using DP or recursion with memoization.", constraints: ["0 <= n <= 30", "F(0) = 0, F(1) = 1"], examples: [{ input: "2", output: "1", explanation: "F(2) = 1" }] },
  { id: "dp2", title: "Climbing Stairs", difficulty: "Easy", category: "Dynamic Programming", likes: 2345, dislikes: 178, accepted: "18.3M", submissions: "29.4M", description: "Climb n stairs taking 1 or 2 steps at a time (how many ways).", constraints: ["1 <= n <= 45"], examples: [{ input: "3", output: "3", explanation: "Three ways: 1+1+1, 1+2, 2+1" }] },
  { id: "dp3", title: "House Robber", difficulty: "Medium", category: "Dynamic Programming", likes: 1876, dislikes: 234, accepted: "12.8M", submissions: "21.3M", description: "Rob houses to maximize money (cannot rob adjacent houses).", constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"], examples: [{ input: "[1,2,3,1]", output: "4", explanation: "Rob houses 1 and 3" }] },
  { id: "dp4", title: "House Robber II", difficulty: "Medium", category: "Dynamic Programming", likes: 1234, dislikes: 198, accepted: "8.7M", submissions: "15.3M", description: "Rob circular arranged houses (first and last are connected).", constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 1000"], examples: [{ input: "[3,4,5,11,5]", output: "16", explanation: "Rob non-adjacent houses" }] },
  { id: "dp5", title: "0-1 Knapsack Problem", difficulty: "Medium", category: "Dynamic Programming", likes: 2134, dislikes: 289, accepted: "9.2M", submissions: "16.8M", description: "Select items to maximize value within weight capacity.", constraints: ["1 <= items <= 300", "1 <= capacity <= 40000"], examples: [{ input: "weights=[2,3,4,5], values=[3,4,5,6], capacity=5", output: "10", explanation: "Max value with weight ≤ 5" }] },
  { id: "dp6", title: "Coin Change", difficulty: "Medium", category: "Dynamic Programming", likes: 1645, dislikes: 234, accepted: "11.3M", submissions: "19.2M", description: "Find minimum coins needed to make amount using DP.", constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 2³¹-1"], examples: [{ input: "coins=[1,2,5], amount=5", output: "2", explanation: "5 = 5 (min 1 coin or 2+2+1)" }] },
  { id: "dp7", title: "Coin Change II", difficulty: "Medium", category: "Dynamic Programming", likes: 1234, dislikes: 167, accepted: "8.9M", submissions: "15.3M", description: "Count number of combinations to make a specific amount.", constraints: ["1 <= coins.length <= 300", "1 <= amount <= 5000"], examples: [{ input: "amount=5, coins=[1,2,5]", output: "5", explanation: "5 different combinations" }] },
  { id: "dp8", title: "Edit Distance", difficulty: "Hard", category: "Dynamic Programming", likes: 1876, dislikes: 234, accepted: "6.7M", submissions: "12.3M", description: "Minimum edits to transform one string to another.", constraints: ["0 <= word1.length, word2.length <= 500"], examples: [{ input: '"horse", "ros"', output: "3", explanation: "3 edits required" }] },
  { id: "dp9", title: "Longest Common Subsequence", difficulty: "Medium", category: "Dynamic Programming", likes: 1456, dislikes: 198, accepted: "9.8M", submissions: "16.7M", description: "Find longest common subsequence between two strings.", constraints: ["1 <= text1.length, text2.length <= 1000"], examples: [{ input: '"abc", "abc"', output: "3", explanation: "LCS is abc" }] },
  { id: "dp10", title: "Longest Increasing Subsequence", difficulty: "Medium", category: "Dynamic Programming", likes: 2134, dislikes: 289, accepted: "10.2M", submissions: "17.3M", description: "Find length of longest increasing subsequence in O(n log n).", constraints: ["1 <= nums.length <= 2500", "-10⁴ <= nums[i] <= 10⁴"], examples: [{ input: "[10,9,2,5,3,7,101,18]", output: "4", explanation: "LIS: [2,3,7,101]" }] },
  { id: "dp11", title: "Paint House", difficulty: "Medium", category: "Dynamic Programming", likes: 987, dislikes: 156, accepted: "5.6M", submissions: "10.2M", description: "Paint houses to minimize cost (adjacent houses different colors).", constraints: ["n == costs.length", "costs[i].length == 3"], examples: [{ input: "costs=[[17,2,17],[16,16,5],[14,3,17]]", output: "10", explanation: "Min cost painting" }] },
  { id: "dp12", title: "Unique Paths", difficulty: "Medium", category: "Dynamic Programming", likes: 1645, dislikes: 234, accepted: "12.3M", submissions: "20.5M", description: "Count paths from top-left to bottom-right in m×n grid.", constraints: ["1 <= m, n <= 100"], examples: [{ input: "m=3, n=7", output: "28", explanation: "28 unique paths" }] },
  { id: "dp13", title: "Unique Paths II", difficulty: "Medium", category: "Dynamic Programming", likes: 1234, dislikes: 178, accepted: "8.3M", submissions: "14.5M", description: "Count paths avoiding obstacles in grid.", constraints: ["m == obstacleGrid.length", "n == obstacleGrid[0].length"], examples: [{ input: "[[0,0,0],[0,1,0],[0,0,0]]", output: "2", explanation: "2 paths avoiding [1,1]" }] },
  { id: "dp14", title: "Word Break", difficulty: "Medium", category: "Dynamic Programming", likes: 2345, dislikes: 289, accepted: "11.2M", submissions: "19.3M", description: "Determine if string can be segmented into dictionary words.", constraints: ["1 <= s.length <= 300", "1 <= wordDict.length <= 1000"], examples: [{ input: 's="leetcode", wordDict=["leet","code"]', output: "true", explanation: "Can be segmented" }] },
  { id: "dp15", title: "Word Break II", difficulty: "Hard", category: "Dynamic Programming", likes: 876, dislikes: 245, accepted: "4.2M", submissions: "8.9M", description: "Return all ways to segment string into dictionary words.", constraints: ["1 <= s.length <= 20", "1 <= wordDict.length <= 100"], examples: [{ input: 's="catsandcatsdog", wordDict=["cat","cats","and","sand","dog"]', output: '["catsandcat..."]', explanation: "All segmentations" }] },
  { id: "dp16", title: "Best Time to Buy and Sell Stock with Cooldown", difficulty: "Medium", category: "Dynamic Programming", likes: 1123, dislikes: 167, accepted: "5.9M", submissions: "10.8M", description: "Max profit with cooldown day after selling in stock prices.", constraints: ["1 <= prices.length <= 5000", "1 <= prices[i] <= 100"], examples: [{ input: "[1,2,3,0,2]", output: "3", explanation: "Buy at 1, sell at 3" }] },
  { id: "dp17", title: "Best Time to Buy and Sell Stock IV", difficulty: "Hard", category: "Dynamic Programming", likes: 876, dislikes: 198, accepted: "3.8M", submissions: "8.1M", description: "Max profit with at most k transactions in stock prices.", constraints: ["1 <= k <= 100", "0 <= prices.length <= 1000"], examples: [{ input: "[3,2,6,5,0,3], k=2", output: "7", explanation: "Buy at 2, sell at 6, buy at 5, sell at 3" }] },
  { id: "dp18", title: "Partition Equal Subset Sum", difficulty: "Medium", category: "Dynamic Programming", likes: 1234, dislikes: 198, accepted: "7.2M", submissions: "13.8M", description: "Partition array into two subsets with equal sum (subset DP).", constraints: ["1 <= nums.length <= 200", "1 <= nums[i] <= 100"], examples: [{ input: "[1,5,11,5]", output: "true", explanation: "Can partition into [11] and [5,5,1]" }] },
  { id: "dp19", title: "Distinct Subsequences", difficulty: "Hard", category: "Dynamic Programming", likes: 987, dislikes: 156, accepted: "4.1M", submissions: "8.7M", description: "Count distinct subsequences of s that equal t.", constraints: ["1 <= s.length, t.length <= 1000"], examples: [{ input: '"rabbbit", "rabbit"', output: "3", explanation: "3 distinct subsequences" }] },
  { id: "dp20", title: "Regular Expression Matching", difficulty: "Hard", category: "Dynamic Programming", likes: 987, dislikes: 234, accepted: "4.2M", submissions: "8.9M", description: "Match string with '.' and '*' wildcards using DP.", constraints: ["1 <= s.length <= 20", "1 <= p.length <= 30"], examples: [{ input: '"aa", "a"', output: "false", explanation: "Pattern doesn't match" }] },

  // ============ SEARCHING & SORTING (15 problems) ============
  { id: "search1", title: "Binary Search", difficulty: "Easy", category: "Searching & Sorting", likes: 1876, dislikes: 234, accepted: "28.3M", submissions: "42.1M", description: "Search for target value in sorted array in O(log n) time.", constraints: ["1 <= nums.length <= 10⁴", "-10⁴ <= nums[i] <= 10⁴"], examples: [{ input: "[5], -5", output: "-1", explanation: "Target not found" }] },
  { id: "search2", title: "First Bad Version", difficulty: "Easy", category: "Searching & Sorting", likes: 1234, dislikes: 198, accepted: "12.3M", submissions: "20.5M", description: "Find first bad version using binary search.", constraints: ["1 <= bad <= n <= 2³¹-1"], examples: [{ input: "n=5, bad=4", output: "4", explanation: "First bad version at 4" }] },
  { id: "search3", title: "Search Insert Position", difficulty: "Easy", category: "Searching & Sorting", likes: 1645, dislikes: 156, accepted: "14.8M", submissions: "24.2M", description: "Find position to insert target or index where found.", constraints: ["1 <= nums.length <= 10⁴", "-10⁴ <= nums[i] <= 10⁴"], examples: [{ input: "[1,3,5,6], 5", output: "2", explanation: "Target found at index 2" }] },
  { id: "search4", title: "Search Range in Sorted Array", difficulty: "Medium", category: "Searching & Sorting", likes: 1456, dislikes: 234, accepted: "9.8M", submissions: "16.7M", description: "Find first and last position of target in sorted array.", constraints: ["0 <= nums.length <= 10⁵", "-10⁹ <= nums[i] <= 10⁹"], examples: [{ input: "[5,7,7,8,8,10], 8", output: "[3,4]", explanation: "Range [3,4]" }] },
  { id: "search5", title: "Search in Rotated Sorted Array", difficulty: "Medium", category: "Searching & Sorting", likes: 2134, dislikes: 298, accepted: "9.8M", submissions: "16.7M", description: "Search in rotated sorted array in O(log n) time.", constraints: ["1 <= nums.length <= 5000", "-10⁴ <= nums[i] <= 10⁴"], examples: [{ input: "[4,5,6,7,0,1,2], 0", output: "4", explanation: "Found at index 4" }] },
  { id: "search6", title: "Merge Sorted Array", difficulty: "Easy", category: "Searching & Sorting", likes: 1234, dislikes: 178, accepted: "18.3M", submissions: "29.4M", description: "Merge two sorted arrays into first array in-place.", constraints: ["m == nums1.length", "n == nums2.length"], examples: [{ input: "nums1=[1,2,3,0,0,0], m=3, nums2=[2,5,6], n=3", output: "[1,2,2,3,5,6]", explanation: "Merged arrays" }] },
  { id: "search7", title: "Merge k Sorted Lists", difficulty: "Hard", category: "Searching & Sorting", likes: 1876, dislikes: 345, accepted: "6.7M", submissions: "12.3M", description: "Merge k sorted linked lists into one sorted list.", constraints: ["0 <= k <= 10⁴", "0 <= lists[i].length <= 500"], examples: [{ input: "[[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,1,3,4,4,5,6]", explanation: "All merged" }] },
  { id: "search8", title: "Majority Element", difficulty: "Easy", category: "Searching & Sorting", likes: 1654, dislikes: 178, accepted: "25.3M", submissions: "39.8M", description: "Find element appearing more than n/2 times.", constraints: ["1 <= nums.length <= 5×10⁴", "-10⁹ <= nums[i] <= 10⁹"], examples: [{ input: "[3,2,3]", output: "3", explanation: "Majority element" }] },
  { id: "search9", title: "K Closest Points", difficulty: "Medium", category: "Searching & Sorting", likes: 1123, dislikes: 167, accepted: "7.2M", submissions: "13.8M", description: "Find k closest points to origin using min-heap.", constraints: ["1 <= k <= points.length <= 10⁴"], examples: [{ input: "points=[[1,3],[-2,2]], k=1", output: "[[-2,2]]", explanation: "Closest point" }] },
  { id: "search10", title: "Top K Frequent Elements", difficulty: "Medium", category: "Searching & Sorting", likes: 1645, dislikes: 234, accepted: "10.2M", submissions: "17.3M", description: "Find k most frequent elements using bucket sort.", constraints: ["1 <= nums.length <= 10⁵", "1 <= k <= distinct elements in nums"], examples: [{ input: "[1,1,1,2,2,3], k=2", output: "[1,2]", explanation: "Top 2 frequent" }] },
  { id: "search11", title: "Quickselect Algorithm", difficulty: "Medium", category: "Searching & Sorting", likes: 987, dislikes: 156, accepted: "6.8M", submissions: "12.1M", description: "Find kth largest element using quickselect in O(n) average.", constraints: ["1 <= k <= nums.length <= 10⁵", "-10⁴ <= nums[i] <= 10⁴"], examples: [{ input: "[3,2,1,5,6,4], k=2", output: "5", explanation: "2nd largest" }] },
  { id: "search12", title: "Median of Two Sorted Arrays", difficulty: "Hard", category: "Searching & Sorting", likes: 1876, dislikes: 456, accepted: "5.2M", submissions: "9.8M", description: "Find median of two sorted arrays in O(log(min(m,n))).", constraints: ["nums1.length == m", "nums2.length == n"], examples: [{ input: "[1,3], [2]", output: "2", explanation: "Median is 2.0" }] },
  { id: "search13", title: "Merge Intervals", difficulty: "Medium", category: "Searching & Sorting", likes: 1867, dislikes: 289, accepted: "11.3M", submissions: "19.2M", description: "Merge overlapping intervals and return array.", constraints: ["1 <= intervals.length <= 10⁴", "0 <= start_i <= end_i <= 10⁴"], examples: [{ input: "[[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "Merged" }] },
  { id: "search14", title: "Intersection of Arrays", difficulty: "Easy", category: "Searching & Sorting", likes: 1456, dislikes: 234, accepted: "8.9M", submissions: "15.1M", description: "Find intersection of two sorted arrays.", constraints: ["1 <= nums1.length, nums2.length <= 1000"], examples: [{ input: "[1,2,2,1], [2,2]", output: "[2,2]", explanation: "Intersection" }] },
  { id: "search15", title: "Kth Smallest Element in BST", difficulty: "Easy", category: "Searching & Sorting", likes: 1234, dislikes: 145, accepted: "11.8M", submissions: "19.2M", description: "Find kth smallest element in binary search tree.", constraints: ["1 <= k <= n <= 10⁴"], examples: [{ input: "root = [3,1,4,null,2], k=1", output: "1", explanation: "1st smallest" }] },

  // ============ HASH MAP (13 problems) ============
  { id: "hash1", title: "Two Sum", difficulty: "Easy", category: "Hash Map", likes: 2847, dislikes: 342, accepted: "45.2M", submissions: "85.4M", description: "Find two numbers that add up to target using hash map.", constraints: ["2 <= nums.length <= 10⁴", "-10⁹ <= nums[i] <= 10⁹"], examples: [{ input: "[2,7,11,15], 9", output: "[0,1]", explanation: "Indices of nums that add up" }] },
  { id: "hash2", title: "Contains Duplicate", difficulty: "Easy", category: "Hash Map", likes: 2134, dislikes: 198, accepted: "52.3M", submissions: "78.9M", description: "Check if array contains duplicates using hash set.", constraints: ["1 <= nums.length <= 10⁵", "-10⁹ <= nums[i] <= 10⁹"], examples: [{ input: "[1,2,3,1]", output: "true", explanation: "Duplicate 1 found" }] },
  { id: "hash3", title: "Valid Anagram", difficulty: "Easy", category: "Hash Map", likes: 1645, dislikes: 156, accepted: "38.5M", submissions: "62.1M", description: "Check if two strings are anagrams using hash map.", constraints: ["1 <= s.length, t.length <= 5×10⁴"], examples: [{ input: '"anagram", "nagaram"', output: "true", explanation: "Same characters" }] },
  { id: "hash4", title: "Group Anagrams", difficulty: "Medium", category: "Hash Map", likes: 2134, dislikes: 345, accepted: "13.8M", submissions: "22.1M", description: "Group strings by anagrams using hash map.", constraints: ["1 <= strs.length <= 10⁴", "0 <= strs[i].length <= 100"], examples: [{ input: '["eat","tea","tan","ate","nat","bat"]', output: '[["eat","tea","ate"],["tan","nat"],["bat"]]', explanation: "Grouped by anagrams" }] },
  { id: "hash5", title: "Majority Element", difficulty: "Easy", category: "Hash Map", likes: 1654, dislikes: 178, accepted: "25.3M", submissions: "39.8M", description: "Find majority element appearing > n/2 times.", constraints: ["1 <= nums.length <= 5×10⁴", "-10⁹ <= nums[i] <= 10⁹"], examples: [{ input: "[3,2,3]", output: "3", explanation: "Majority element" }] },
  { id: "hash6", title: "Top K Frequent Elements", difficulty: "Medium", category: "Hash Map", likes: 1645, dislikes: 234, accepted: "10.2M", submissions: "17.3M", description: "Find k most frequent elements using hash map.", constraints: ["1 <= nums.length <= 10⁵", "1 <= k <= distinct elements"], examples: [{ input: "[1,1,1,2,2,3], k=2", output: "[1,2]", explanation: "Top 2 frequent" }] },
  { id: "hash7", title: "Isomorphic Strings", difficulty: "Easy", category: "Hash Map", likes: 1234, dislikes: 178, accepted: "9.3M", submissions: "15.8M", description: "Determine if two strings are isomorphic.", constraints: ["1 <= s.length, t.length <= 5×10⁴"], examples: [{ input: '"badc", "baba"', output: "false", explanation: "Not isomorphic" }] },
  { id: "hash8", title: "Word Pattern", difficulty: "Easy", category: "Hash Map", likes: 876, dislikes: 156, accepted: "7.2M", submissions: "12.5M", description: "Check if string follows a pattern using hash map.", constraints: ["1 <= pattern.length <= 300", "1 <= s.length <= 3000"], examples: [{ input: '"abba", "dog cat cat dog"', output: "true", explanation: "Pattern matched" }] },
  { id: "hash9", title: "Ransom Note", difficulty: "Easy", category: "Hash Map", likes: 1123, dislikes: 167, accepted: "8.9M", submissions: "14.2M", description: "Determine if ransom note can be constructed from magazine.", constraints: ["1 <= ransomNote.length, magazine.length <= 10⁵"], examples: [{ input: 'ransomNote="a", magazine="b"', output: "false", explanation: "Not possible" }] },
  { id: "hash10", title: "First Unique Character", difficulty: "Easy", category: "Hash Map", likes: 1645, dislikes: 234, accepted: "18.7M", submissions: "29.3M", description: "Find first non-repeating character using hash map.", constraints: ["1 <= s.length <= 2×10⁵", "s consists of lowercase English letters"], examples: [{ input: '"leetcode"', output: "0", explanation: "l at index 0" }] },
  { id: "hash11", title: "Longest Substring Without Repeating", difficulty: "Medium", category: "Hash Map", likes: 4892, dislikes: 623, accepted: "9.2M", submissions: "18.5M", description: "Find longest substring without repeating characters.", constraints: ["0 <= s.length <= 5×10⁴"], examples: [{ input: '"abcabcbb"', output: "3", explanation: "Longest is abc" }] },
  { id: "hash12", title: "Logger Rate Limiter", difficulty: "Easy", category: "Hash Map", likes: 1234, dislikes: 145, accepted: "6.7M", submissions: "12.3M", description: "Implement rate limiter with hash map to track timestamps.", constraints: ["timestamp is in ascending order", "1 <= number of calls <= 2000"], examples: [{ input: 'message="foo", timestamp=1', output: "true", explanation: "Message logged" }] },
  { id: "hash13", title: "Valid Sudoku", difficulty: "Easy", category: "Hash Map", likes: 1567, dislikes: 189, accepted: "11.2M", submissions: "18.9M", description: "Validate sudoku board using hash maps.", constraints: ["board.length == 9", "board[i].length == 9"], examples: [{ input: "Valid sudoku board", output: "true", explanation: "Valid sudoku" }] },

  // ============ BIT MANIPULATION (10 problems) ============
  { id: "bit1", title: "Single Number", difficulty: "Easy", category: "Bit Manipulation", likes: 2134, dislikes: 156, accepted: "32.8M", submissions: "48.5M", description: "Find single occurrence in array where others appear twice using XOR.", constraints: ["1 <= nums.length <= 3×10⁴", "-3×10⁴ <= nums[i] <= 3×10⁴"], examples: [{ input: "[2,2,1]", output: "1", explanation: "1 appears once" }] },
  { id: "bit2", title: "Number of 1 Bits", difficulty: "Easy", category: "Bit Manipulation", likes: 1876, dislikes: 234, accepted: "18.9M", submissions: "31.3M", description: "Count the number of 1s in the binary representation of integer.", constraints: ["0 <= n <= 2³¹-1"], examples: [{ input: "11", output: "3", explanation: "Binary 1011 has three 1s" }] },
  { id: "bit3", title: "Reverse Integer", difficulty: "Medium", category: "Bit Manipulation", likes: 1645, dislikes: 234, accepted: "12.8M", submissions: "21.3M", description: "Reverse integer bits or negative handling techniques.", constraints: ["-(2³¹) <= x <= 2³¹-1"], examples: [{ input: "123", output: "321", explanation: "Reversed without overflow" }] },
  { id: "bit4", title: "Majority Element III", difficulty: "Hard", category: "Bit Manipulation", likes: 987, dislikes: 198, accepted: "5.6M", submissions: "10.2M", description: "Find elements appearing > n/3 times using bit manipulation.", constraints: ["1 <= nums.length <= 5×10⁴", "-10⁹ <= nums[i] <= 10⁹"], examples: [{ input: "[3,2,3]", output: "[3]", explanation: "3 appears more than n/3 times" }] },
  { id: "bit5", title: "Hamming Distance", difficulty: "Easy", category: "Bit Manipulation", likes: 1234, dislikes: 145, accepted: "14.3M", submissions: "23.8M", description: "Count differing bits between two integers (Hamming distance).", constraints: ["0 <= x, y <= 2³¹-1"], examples: [{ input: "1, 4", output: "2", explanation: "Binary 001 and 100" }] },
  { id: "bit6", title: "Missing Number", difficulty: "Easy", category: "Bit Manipulation", likes: 1567, dislikes: 178, accepted: "16.7M", submissions: "28.1M", description: "Find missing number from 0 to n using XOR or sum.", constraints: ["n == nums.length", "1 <= n <= 100"], examples: [{ input: "[3,0,1]", output: "2", explanation: "2 is missing" }] },
  { id: "bit7", title: "Bitwise AND of Ranges", difficulty: "Medium", category: "Bit Manipulation", likes: 876, dislikes: 167, accepted: "6.8M", submissions: "12.5M", description: "Find bitwise AND of all numbers between m and n.", constraints: ["0 <= m <= n <= 2³¹-1"], examples: [{ input: "m=5, n=7", output: "4", explanation: "5&6&7 = 4" }] },
  { id: "bit8", title: "Power of Two", difficulty: "Easy", category: "Bit Manipulation", likes: 1456, dislikes: 198, accepted: "11.2M", submissions: "19.3M", description: "Check if number is power of 2 using bit manipulation.", constraints: ["-2³¹ <= n <= 2³¹-1"], examples: [{ input: "1", output: "true", explanation: "1 = 2⁰" }] },
  { id: "bit9", title: "UTF-8 Validation", difficulty: "Medium", category: "Bit Manipulation", likes: 734, dislikes: 156, accepted: "4.5M", submissions: "8.2M", description: "Validate UTF-8 encoding using bit manipulation.", constraints: ["0 <= data.length <= 32"], examples: [{ input: "[197,130,1]", output: "true", explanation: "Valid UTF-8" }] },
  { id: "bit10", title: "Gray Code", difficulty: "Medium", category: "Bit Manipulation", likes: 876, dislikes: 134, accepted: "5.8M", submissions: "10.1M", description: "Generate Gray code sequence for n-bit numbers.", constraints: ["0 <= n <= 20"], examples: [{ input: "2", output: "[0,1,3,2]", explanation: "2-bit Gray code" }] },
];

// Module categories for organization
const MODULE_CATEGORIES = [
  "Array",
  "String",
  "Linked List",
  "Stack & Queue",
  "Tree",
  "Graph",
  "Dynamic Programming",
  "Searching & Sorting",
  "Hash Map",
  "Bit Manipulation",
];


function Practice() {
  const [activeTab, setActiveTab] = useState("problems");
  const [selectedProblem, setSelectedProblem] = useState(CODING_PROBLEMS[0]);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(getCodeTemplate("javascript", CODING_PROBLEMS[0].id));
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showProblemList, setShowProblemList] = useState(false);
  const [selectedModule, setSelectedModule] = useState(MODULE_CATEGORIES[0]);
  const editorRef = useRef(null);

  // Get problems filtered by selected module
  const getModuleProblems = () => {
    return CODING_PROBLEMS.filter((p) => p.category === selectedModule);
  };

  const handleSelectProblem = (problem) => {
    setSelectedProblem(problem);
    const newCode = getCodeTemplate(language, problem.id);
    setCode(newCode);
    setTestResults(null);
    setShowProblemList(false);
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const newCode = getCodeTemplate(newLang, selectedProblem.id);
    setCode(newCode);
    setTestResults(null);
    setShowLanguageMenu(false);
  };

  const runCode = async () => {
    const validationErrors = validateCode(code, language);
    if (validationErrors.length > 0) {
      setTestResults([
        {
          id: 0,
          passed: false,
          test: "Validation",
          input: "",
          expected: "",
          actual: validationErrors[0],
          error: validationErrors[0],
        },
      ]);
      return;
    }

    setIsRunning(true);

    try {
      const judge0LanguageId = LANGUAGES[language].judge0Id;
      const testCases = TEST_CASES[selectedProblem.id] || [];
      const results = await executeWithJudge0(code, testCases, judge0LanguageId);
      const formatted = formatResults(results);
      setTestResults(
        formatted.results.map((result, idx) => ({
          id: idx,
          passed: result.passed,
          test: `Test Case ${idx + 1}`,
          input: result.input,
          expected: result.expected,
          actual: result.actual,
          error: result.error || null,
        }))
      );
    } catch (err) {
      setTestResults([
        {
          id: 0,
          passed: false,
          test: "Runtime Error",
          input: "",
          expected: "",
          actual: "",
          error: err.message,
        },
      ]);
    }

    setIsRunning(false);
  };

  const submitCode = async () => {
    // Mock submission - in real app would save to backend
    alert(`✅ Code submitted for "${selectedProblem.title}"!`);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const resetCode = () => {
    const template = getCodeTemplate(language, selectedProblem.id);
    setCode(template);
    setTestResults(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "#22c55e";
      case "Medium":
        return "#f59e0b";
      case "Hard":
        return "#ef4444";
      default:
        return "#94a3b8";
    }
  };

  const passedTests = testResults?.filter((r) => r.passed).length || 0;
  const totalTests = testResults?.length || 0;

  return (
    <StudentLayout>
      <div className="leetcode-container">
        {/* PROBLEM LIST DRAWER */}
        {showProblemList && (
          <div className="problem-list-overlay" onClick={() => setShowProblemList(false)}>
            <div className="problem-list-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="drawer-header">
                <h2 className="drawer-title">All Problems</h2>
                <button
                  className="drawer-close-btn"
                  onClick={() => setShowProblemList(false)}
                  title="Close"
                >
                  <XClose size={20} />
                </button>
              </div>

              {/* MODULE TABS */}
              <div className="module-tabs">
                {MODULE_CATEGORIES.map((category) => {
                  const count = CODING_PROBLEMS.filter((p) => p.category === category).length;
                  return (
                    <button
                      key={category}
                      className={`module-tab ${selectedModule === category ? "active" : ""}`}
                      onClick={() => setSelectedModule(category)}
                    >
                      {category}
                      <span className="tab-count">{count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="problems-grid">
                {getModuleProblems().map((problem, idx) => (
                  <div
                    key={problem.id}
                    className={`problem-card ${selectedProblem.id === problem.id ? "active" : ""}`}
                    onClick={() => handleSelectProblem(problem)}
                  >
                    <div className="problem-card-header">
                      <span className="problem-number">
                        {selectedModule}: {idx + 1}
                      </span>
                      <span
                        className="problem-difficulty"
                        style={{
                          backgroundColor: getDifficultyColor(problem.difficulty),
                        }}
                      >
                        {problem.difficulty}
                      </span>
                    </div>
                    <h3 className="problem-card-title">{problem.title}</h3>
                    <p className="problem-card-category">{problem.category}</p>
                    <div className="problem-card-stats">
                      <span className="stat">😊 {problem.accepted}</span>
                      <span className="stat">📊 {problem.submissions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TOP NAVBAR */}
        <div className="leetcode-navbar">
          <div className="navbar-left">
            <button
              className="problem-list-btn"
              onClick={() => setShowProblemList(true)}
              title="View all problems"
            >
              <Menu size={18} />
            </button>
            <h1 className="problem-title">{selectedProblem.title}</h1>
            <span
              className="difficulty-tag"
              style={{ backgroundColor: getDifficultyColor(selectedProblem.difficulty) }}
            >
              {selectedProblem.difficulty}
            </span>
          </div>

          <div className="navbar-right">
            <button className="navbar-btn like-btn" title="Like">
              👍 {selectedProblem.likes}
            </button>
            <button className="navbar-btn dislike-btn" title="Dislike">
              👎 {selectedProblem.dislikes}
            </button>
            <button className="navbar-btn share-btn" title="Share">
              <Share2 size={16} />
            </button>
            <button
              className="navbar-btn premium-badge"
              title="Premium Problem"
            >
              ⭐ Premium
            </button>
            <button
              className="navbar-btn theme-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="submit-btn"
              onClick={submitCode}
              disabled={isRunning}
            >
              Submit
            </button>
          </div>
        </div>

        {/* MAIN SPLIT LAYOUT */}
        <div className="leetcode-main">
          {/* LEFT PANEL - PROBLEM DESCRIPTION */}
          <div className="left-panel">
            <div className="description-content">
              {/* PROBLEM DESCRIPTION */}
              <div className="description-section">
                <h2 className="section-title">Description</h2>
                <p className="description-text">{selectedProblem.description}</p>
              </div>

              {/* CONSTRAINTS */}
              <div className="description-section">
                <h2 className="section-title">Constraints</h2>
                <ul className="constraints-list">
                  {selectedProblem.constraints.map((constraint, idx) => (
                    <li key={idx}>{constraint}</li>
                  ))}
                </ul>
              </div>

              {/* EXAMPLES */}
              <div className="description-section">
                <h2 className="section-title">Examples</h2>
                {selectedProblem.examples.map((example, idx) => (
                  <div key={idx} className="example-card">
                    <p className="example-header">Example {idx + 1}:</p>
                    <div className="example-content">
                      <div className="example-line">
                        <span className="example-key">Input:</span>
                        <code className="example-value">{example.input}</code>
                      </div>
                      <div className="example-line">
                        <span className="example-key">Output:</span>
                        <code className="example-value">{example.output}</code>
                      </div>
                      <div className="example-line">
                        <span className="example-key">Explanation:</span>
                        <p className="example-value">{example.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PROBLEM STATS */}
              <div className="description-section">
                <h2 className="section-title">Problem Stats</h2>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Accepted</span>
                    <span className="stat-value">{selectedProblem.accepted}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Submissions</span>
                    <span className="stat-value">{selectedProblem.submissions}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Acceptance Rate</span>
                    <span className="stat-value">52.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - CODE EDITOR & TESTS */}
          <div className="right-panel">
            {/* CODE EDITOR SECTION */}
            <div className="editor-section">
              {/* EDITOR TOOLBAR */}
              <div className="editor-toolbar">
                <div className="toolbar-left">
                  <div className="language-dropdown">
                    <button
                      className="lang-btn"
                      onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    >
                      {LANGUAGES[language].icon} {LANGUAGES[language].name}
                      <ChevronDown size={14} />
                    </button>
                    {showLanguageMenu && (
                      <div className="lang-menu">
                        {Object.entries(LANGUAGES).map(([key, lang]) => (
                          <button
                            key={key}
                            className={`lang-menu-item ${language === key ? "active" : ""}`}
                            onClick={() => handleLanguageChange(key)}
                          >
                            {lang.icon} {lang.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="toolbar-right">
                  <button className="editor-action-btn" onClick={copyCode} title="Copy">
                    <Copy size={14} /> {isCopied ? "Copied!" : "Copy"}
                  </button>
                  <button className="editor-action-btn" onClick={resetCode} title="Reset">
                    <RefreshCw size={14} /> Reset
                  </button>
                </div>
              </div>

              {/* CODE EDITOR */}
              <textarea
                ref={editorRef}
                className="code-editor"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck="false"
              />

              {/* TEST RESULTS SECTION */}
              {testResults && (
                <div className="test-results-panel">
                  <div className="test-header">
                    <h3 className="test-title">
                      {passedTests === totalTests ? "✅ All Tests Passed!" : `${passedTests}/${totalTests} Tests Passed`}
                    </h3>
                  </div>

                  <div className="test-cases">
                    {testResults.map((result) => (
                      <div
                        key={result.id}
                        className={`test-case-item ${result.passed ? "passed" : "failed"}`}
                      >
                        <div className="test-case-header">
                          <span className="test-case-icon">
                            {result.passed ? (
                              <Check size={14} className="icon-pass" />
                            ) : (
                              <X size={14} className="icon-fail" />
                            )}
                          </span>
                          <span className="test-case-name">{result.test}</span>
                        </div>

                        <div className="test-case-details">
                          {result.input && (
                            <div className="test-io">
                              <span className="io-label">Input:</span>
                              <code className="io-code">{result.input}</code>
                            </div>
                          )}
                          {result.expected && (
                            <div className="test-io">
                              <span className="io-label">Expected:</span>
                              <code className="io-code">{result.expected}</code>
                            </div>
                          )}
                          {result.actual && (
                            <div className="test-io">
                              <span className="io-label">Got:</span>
                              <code className={`io-code ${result.passed ? "success" : "error"}`}>
                                {result.actual}
                              </code>
                            </div>
                          )}
                          {result.error && (
                            <div className="test-io error">
                              <span className="io-label">Error:</span>
                              <code className="io-code">{result.error}</code>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RUN TESTS BUTTON */}
            <button className="run-tests-btn" onClick={runCode} disabled={isRunning}>
              <Play size={16} />
              {isRunning ? "Running..." : "Run Tests"}
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

export default Practice;
