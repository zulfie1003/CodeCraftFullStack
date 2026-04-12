# Judge0 Cloud Integration Setup Guide

## Overview
The Practice section now uses **Judge0 Cloud** - a professional online judge API that supports 60+ programming languages with proper compilation and execution.

## Setup Steps

### 1. Get RapidAPI Key
1. Go to [RapidAPI](https://rapidapi.com/)
2. Sign up (free account)
3. Search for "Judge0 CE" API
4. Click on "Judge0 CE"
5. Click "Subscribe" (Free tier available)
6. Copy your **X-RapidAPI-Key**

### 2. Update Configuration
Open `frontend/src/utils/codeExecutor.js` and replace:

```javascript
const JUDGE0_API_KEY = "your-api-key-here"; // Add your RapidAPI key here
```

With your actual API key:

```javascript
const JUDGE0_API_KEY = "your-actual-key-from-rapidapi";
```

### 3. Features

✅ **Supported Languages:**
- JavaScript (Node.js)
- Python 3
- Java
- C++

✅ **Capabilities:**
- Proper code compilation
- Execution with timeout protection
- Memory usage tracking
- Multiple test case validation
- Edge case handling
- Real-time output comparison

### 4. How It Works

When you click "Run Code":

1. **Validation** - Checks code syntax
2. **Submission** - Sends code to Judge0
3. **Compilation** - Judge0 compiles code
4. **Execution** - Runs with each test case input
5. **Comparison** - Compares output with expected
6. **Results** - Shows pass/fail with details

### 5. Test Output Includes

- ✅ Pass/Fail status
- 📊 Expected vs Actual output
- ⏱️ Execution time
- 💾 Memory usage
- 🔍 Compilation/Runtime errors

### 6. API Limits

**Free Tier:**
- 100 requests per day
- 1 request per second

Increase with paid plan if needed.

### 7. Language IDs Used

```
JavaScript (Node.js): 63
Python 3: 71
Java: 62
C++: 54
```

## How to Use

1. Select your preferred language
2. Write your solution
3. Click "Run Code"
4. See test cases pass/fail with details
5. Debug and improve code

## Troubleshooting

**Error: "Judge0 API error"**
- Check if API key is correct
- Verify RapidAPI subscription is active
- Check rate limits (100/day max)

**Error: "Execution timeout"**
- Code might have infinite loop
- Increase timeout in codeExecutor.js
- Optimize algorithm

**No output shown**
- Make sure code has proper output/print statements
- Check stdin handling for test inputs

## Support

For Judge0 API documentation: https://judge0.com/
For RapidAPI support: https://rapidapi.com/support
