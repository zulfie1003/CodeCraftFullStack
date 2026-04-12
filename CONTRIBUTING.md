# Contributing to CodeCraft

Thank you for your interest in contributing to CodeCraft! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help each other learn and grow

## How to Contribute

### Reporting Bugs

1. Check if the issue already exists
2. Provide a clear description of the bug
3. Include steps to reproduce
4. Provide expected vs actual behavior
5. Add screenshots/videos if applicable

### Suggesting Features

1. Check existing issues/discussions
2. Provide clear use cases
3. Explain the benefits
4. Include mockups/examples if relevant

### Submitting Code

1. **Fork** the repository
2. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** with clear messages:
   ```bash
   git commit -m "Add: description of changes"
   ```
4. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Create a Pull Request** with:
   - Clear title and description
   - Link to related issues
   - Screenshots for UI changes
   - Test cases for bug fixes

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/CodeCraft.git
cd CodeCraft

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup environment variables
# Follow README.md for .env setup

# Start development
cd backend && npm run dev
# In another terminal
cd frontend && npm run dev
```

## Code Style Guidelines

### JavaScript/React
- Use ES6+ syntax
- Follow consistent naming conventions
- Write meaningful variable and function names
- Add comments for complex logic
- Use proper indentation (2 spaces)

### File Organization
- Keep related files together
- Use meaningful folder structures
- Separate concerns (controllers, models, components)

### Commit Messages
```
feat: Add new feature description
fix: Fix bug description
docs: Update documentation
style: Format code
refactor: Restructure code
test: Add tests
chore: Update dependencies
```

## Testing

Before submitting:
1. Test your changes locally
2. Test in both development and production modes
3. Check for console errors/warnings
4. Test with different browsers (if frontend)

## Pull Request Process

1. Update README.md if needed
2. Add tests for new features
3. Ensure no breaking changes
4. Respond to review comments
5. Keep commits clean and meaningful

## Questions?

- Open a discussion on GitHub
- Check existing issues for similar questions
- Contact maintainers

## Recognition

Contributors will be recognized in:
- README.md contributors section
- GitHub insights

---

Thank you for making CodeCraft better! 🎉
