# Contributing to RecipeGram

Thank you for considering contributing to RecipeGram! We welcome contributions from the community.

## How to Contribute

### Reporting Issues

If you find a bug or have a feature request, please create an issue on GitHub with the following information:

- **Bug Reports**: Include steps to reproduce, expected behavior, actual behavior, and screenshots if applicable
- **Feature Requests**: Describe the feature, why it would be useful, and how it should work

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/recipegramapp.git`
3. Install dependencies: `npm run install-all`
4. Create a `.env` file in both `client` and `server` directories (see `.env.example`)
5. Start MongoDB locally or use MongoDB Atlas
6. Run the development servers: `npm run dev`

### Making Changes

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes following our code style
3. Test your changes thoroughly
4. Commit your changes: `git commit -m "Add: brief description of changes"`
5. Push to your fork: `git push origin feature/your-feature-name`
6. Create a Pull Request

### Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Comment complex logic
- Keep functions small and focused
- Write clean, readable code

### Commit Message Guidelines

Use clear and descriptive commit messages:

- `Add:` for new features
- `Fix:` for bug fixes
- `Update:` for changes to existing features
- `Remove:` for removed features
- `Refactor:` for code refactoring
- `Docs:` for documentation changes

### Pull Request Process

1. Update the README.md if needed
2. Ensure all tests pass
3. Update documentation as necessary
4. Link any related issues in the PR description
5. Wait for review and address any feedback

### Testing

Before submitting a PR:

1. Test the application locally
2. Ensure no console errors
3. Test on different screen sizes
4. Verify backend API responses

## Code of Conduct

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Questions?

Feel free to create an issue labeled `question` if you need help or clarification.

Thank you for contributing! 🎉
