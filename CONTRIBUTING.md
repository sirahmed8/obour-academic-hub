# Contributing to Obour Academic Hub

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/obour-academic-hub.git
   cd obour-academic-hub
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase and Cloudinary credentials

4. **Run the development server**
   ```bash
   npm run dev
   ```

## Code Standards

### Linting and Formatting

- We use **ESLint** for linting and **Prettier** for code formatting
- Run `npm run lint` to check for linting errors
- Run `npm run format` to auto-format your code
- Pre-commit hooks will automatically run linting and formatting

### Testing

- Write tests for new features and bug fixes
- Run tests with `npm test`
- Maintain or improve code coverage
- Test files should be colocated with source files (e.g., `Component.tsx` → `Component.test.tsx`)

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` code style changes (formatting, etc.)
- `refactor:` code refactoring
- `test:` adding or updating tests
- `chore:` maintenance tasks

Examples:

```
feat: add client-side search with keyboard shortcuts
fix: resolve accessibility issues in search modal
docs: update README with deployment instructions
```

## Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**

   ```bash
   npm run lint
   npm test
   npm run build
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your fork**

   ```bash
   git push origin feat/your-feature-name
   ```

6. **Open a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Ensure all CI checks pass

## Code Review

- All submissions require review before merging
- Reviewers may request changes or improvements
- Address feedback promptly and professionally

## Questions?

If you have questions, feel free to:

- Open an issue on GitHub
- Contact the maintainer via [Linktree](https://linktr.ee/sir.ahmed)

Thank you for contributing! 🎉
