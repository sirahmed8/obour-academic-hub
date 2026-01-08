# Contributing to Obour Academic Hub

Thank you for your interest in contributing! 🎉

## 🛠️ Development Setup

```bash
# Clone the repository
git clone https://github.com/sirahmed8/obour-academic-hub.git
cd obour-academic-hub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Firebase and Cloudinary credentials

# Run the development server
npm run dev
```

---

## 📋 Code Standards

### Linting & Formatting

| Tool           | Purpose         |
| -------------- | --------------- |
| **ESLint**     | Linting         |
| **Prettier**   | Code formatting |
| **TypeScript** | Type checking   |

```bash
# Run all checks
npm run lint        # ESLint
npx tsc --noEmit    # TypeScript
npx prettier --check .  # Prettier
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix      | Purpose                 |
| ----------- | ----------------------- |
| `feat:`     | New feature             |
| `fix:`      | Bug fix                 |
| `docs:`     | Documentation           |
| `style:`    | Code style (no logic)   |
| `refactor:` | Code refactoring        |
| `perf:`     | Performance improvement |
| `chore:`    | Maintenance             |

**Examples:**

```
feat: add todo task management
fix: resolve login redirect loop
perf: GPU-optimize blur animations
```

---

## 🔄 Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make your changes**
   - Write clean, documented code
   - Maintain TypeScript strict mode
   - Follow existing patterns

3. **Test your changes**

   ```bash
   npm run lint
   npm run build
   ```

4. **Commit and push**

   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   git push origin feat/your-feature
   ```

5. **Open a Pull Request**
   - Clear description
   - Reference related issues
   - Ensure CI passes

---

## 📁 Key Directories

| Path                       | Purpose                |
| -------------------------- | ---------------------- |
| `src/app/`                 | Next.js pages & routes |
| `src/components/features/` | Feature components     |
| `src/components/ui/`       | Reusable UI            |
| `src/lib/`                 | Utilities & config     |
| `src/hooks/`               | Custom React hooks     |

---

## ❓ Questions?

- Open an issue on GitHub
- Contact: [linktr.ee/sir.ahmed](https://linktr.ee/sir.ahmed)

Thank you for contributing! 🚀
