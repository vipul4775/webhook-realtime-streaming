# Contributing to Real-Time Event Pipeline

Thank you for considering contributing! This project aims to be a clear, practical reference for webhook and real-time communication patterns.

## How to Contribute

### Reporting Issues

- Check existing issues first
- Provide clear reproduction steps
- Include environment details (OS, Java/Node version)
- Add relevant logs or screenshots

### Suggesting Features

- Open an issue with the `enhancement` label
- Explain the use case
- Keep it aligned with the project's educational goals

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow existing code style
   - Keep comments concise and natural
   - Add tests for new features
4. **Test your changes**
   ```bash
   # Backend
   cd backend && mvn test
   
   # Frontend
   cd frontend && npm test
   ```
5. **Commit with clear messages**
   ```bash
   git commit -m "Add feature: description"
   ```
6. **Push and create a Pull Request**

## Code Style

### Java (Backend)
- Follow standard Java conventions
- Use meaningful variable names
- Keep methods focused and small
- Add comments only when necessary (explain "why", not "what")

### JavaScript (Frontend/Generator)
- Use ES6+ features
- Follow React best practices
- Use functional components and hooks
- Keep components small and reusable

### Logging
- Keep log messages concise
- Use appropriate log levels (debug, info, warn, error)
- Avoid verbose or AI-generated style logs

## Testing

- Add tests for new features
- Ensure all tests pass before submitting PR
- Test both happy path and error cases

## Documentation

- Update README if adding features
- Keep documentation concise
- Include code examples for complex features
- Update API documentation if endpoints change

## Pull Request Process

1. Update README.md with details of changes if needed
2. Ensure all tests pass
3. Request review from maintainers
4. Address review feedback
5. Squash commits if requested

## Questions?

Open an issue with the `question` label or reach out to maintainers.

Thank you for contributing! 🎉
