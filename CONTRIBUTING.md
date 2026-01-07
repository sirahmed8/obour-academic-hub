# Contributing to Obour Academic Hub

Thank you for your interest in contributing! 🎉

## Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/sirahmed8/obour-academic-hub.git
cd obour-academic-hub

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your Firebase and Cloudinary credentials

# 4. Run the development server
npm run dev
```

## Code Standards

### Linting and Formatting

- **ESLint** for linting
- **Prettier** for formatting
- Run `npm run lint` to check for errors
- Pre-commit hooks auto-format code

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix      | Purpose               |
| ----------- | --------------------- |
| `feat:`     | New feature           |
| `fix:`      | Bug fix               |
| `docs:`     | Documentation changes |
| `style:`    | Code style (no logic) |
| `refactor:` | Code refactoring      |
| `test:`     | Adding/updating tests |
| `chore:`    | Maintenance tasks     |

**Examples:**

```
feat: add bilingual chatbot responses
fix: resolve login issue on Vercel
docs: update README with deployment steps
```

## Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Update documentation as needed

3. **Test your changes**

   ```bash
   npm run lint
   npm run build
   ```

4. **Commit and push**

   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   git push origin feat/your-feature-name
   ```

5. **Open a Pull Request**
   - Clear description of changes
   - Reference related issues
   - Ensure CI checks pass

## Project Structure

```
src/
├── app/          # Next.js pages & routes
├── components/   # React components
├── contexts/     # React Context providers
├── lib/          # Utilities & config
│   └── bot/      # Chatbot engine
├── services/     # Firebase services
└── types/        # TypeScript types
```

## Questions?

- Open an issue on GitHub
- Contact: [linktr.ee/sir.ahmed](https://linktr.ee/sir.ahmed)

Thank you for contributing! 🚀
