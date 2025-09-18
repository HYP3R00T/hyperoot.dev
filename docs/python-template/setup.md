> [!important] Important Links
> 💻GitHub: [HYP3R00T/devcontainer-python-template](https://github.com/HYP3R00T/devcontainer-python-template)

# Python Template

A modern Python development container template with best practices, automated tooling, and VS Code integration.

## Features

- 🐍 **Python 3.13** with modern tooling
- 📦 **UV** for fast package management
- 🔧 **Mise** for tool version management
- 🎨 **Ruff** for linting and formatting
- 🪝 **Pre-commit hooks** for code quality
- 🔄 **Conventional commits** with Commitizen
- 🐳 **Dev containers** for consistent development environment
- ⚙️ **VS Code** optimized settings and extensions

## Quick Start

### Method 1: VS Code Dev Containers (Traditional)

1. Click "Use this template" on GitHub or clone the repository
2. Open in VS Code with the Dev Containers extension
3. When prompted, click "Reopen in Container"
4. Wait for the container to build and setup to complete

### Method 2: DevPod (Recommended for Clean Host)

If you prefer to keep your host machine clean and avoid installing anything except the essentials:

1. **Install Prerequisites:**
   - [Docker](https://docs.docker.com/get-docker/) (or any container runtime)
   - [DevPod](https://devpod.sh/docs/getting-started/install)
   - [VS Code](https://code.visualstudio.com/) (optional - DevPod supports multiple editors)

2. **Create Development Environment:**

   ```bash
   # Create a new workspace from this template
   devpod up https://github.com/YOUR_USERNAME/devcontainer-python-template.git
   ```

3. **Choose your development experience:**
   - **VS Code**: DevPod will automatically open VS Code with the project
   - **SSH**: Use any editor with SSH support (`devpod ssh devcontainer-python-template`)
   - **Web IDE**: Access via browser using DevPod's web interface
   - **Terminal**: Direct terminal access (`devpod ssh devcontainer-python-template`)

4. **Benefits of DevPod approach:**
   - ✅ Zero configuration on host machine
   - ✅ Complete isolation from host environment
   - ✅ Consistent development environment across team members
   - ✅ Easy cleanup when project is done
   - ✅ Works with any container runtime (Docker, Podman, etc.)
   - ✅ Multiple editor/IDE options

### Method 3: Manual Setup

```bash
git clone https://github.com/YOUR_USERNAME/devcontainer-python-template.git
cd devcontainer-python-template
code .
# VS Code will prompt to reopen in container
```

## Customization Required

After creating your project from this template, you'll need to update the following files with your own information:

### 📝 Files to Update

| File | What to Change | Current Value | Update To |
|------|----------------|---------------|-----------|
| `LICENSE` | Copyright holder | `hyperoot.dev` | Your name/organization |
| `.github/FUNDING.yml` | GitHub sponsor | `HYP3R00T` | Your GitHub username |
| `.github/CODEOWNERS` | Code owners | `@HYP3R00T` | Your GitHub username/team |
| `.github/CODE_OF_CONDUCT.md` | Contact email | `rajesh@hyperoot.dev` | Your email address |
| `.devcontainer/devcontainer.json` | Container name | `devcontainer-python-template` | Your project name |

### 🔍 Search and Replace

You can quickly update all references by searching for these patterns in your editor:

- `hyperoot.dev` → Your domain/organization
- `HYP3R00T` → Your GitHub username
- `rajesh@hyperoot.dev` → Your email
- `devcontainer-devcontainer-python-template` → Your project name

**💡 Tip**: Use VS Code's "Find and Replace" (Ctrl/Cmd + H) to quickly update all instances across your project.

## Initial Setup After Customization

Once you've updated all the references above, you need to initialize your Python project:

### 1. Initialize UV Project

Choose one based on your project type:

```bash
# For a simple script/application project
uv init

# For a Python package that you plan to distribute
uv init --package
```

### 2. Install Essential Development Dependencies

Based on the project configuration, install these required packages:

```bash
# Core development tools (already configured in the template)
uv add --dev pytest pytest-cov    # Testing framework and coverage
uv add --dev mypy                  # Static type checking
uv add --dev commitizen           # Conventional commits (if not installed via pipx)

# Optional: Add common project dependencies based on your needs
uv add --dev types-requests        # Type stubs for requests (if using requests)
```

**Note**: `ruff`, `pre-commit`, and `uv` are managed by Mise (see `mise.toml`), so you don't need to install them separately.

## Project Structure

```text
.
├── .devcontainer/           # Development container configuration
│   ├── devcontainer.json   # VS Code dev container settings
│   └── Dockerfile          # Container definition
├── .github/                # GitHub templates and workflows
│   ├── ISSUE_TEMPLATE/     # Issue templates
│   ├── instructions/       # Copilot instructions
│   ├── workflows/          # GitHub Actions
│   ├── CODE_OF_CONDUCT.md  # Community guidelines
│   ├── CODEOWNERS          # Code ownership
│   ├── FUNDING.yml         # Sponsorship info
│   └── PULL_REQUEST_TEMPLATE.md
├── .vscode/                # VS Code workspace settings
├── scripts/                # Setup and utility scripts
├── mise.toml              # Tool version management
├── ruff.toml              # Linting and formatting config
├── .pre-commit-config.yaml # Pre-commit hooks
├── .editorconfig          # Editor configuration
└── .gitignore             # Git ignore patterns
```

## Development Tools

### Mise (Tool Management)

This project uses [Mise](https://mise.jdx.dev/) to manage Python and other tool versions:

```bash
# Install tools defined in mise.toml
mise install

# Check installed versions
mise list

# Update tools
mise upgrade
```

### UV (Package Management)

[UV](https://docs.astral.sh/uv/) is used for fast Python package management:

```bash
# Create a new project
uv init

# Add dependencies
uv add requests pandas

# Add development dependencies
uv add --dev pytest ruff

# Install dependencies
uv sync

# Run Python
uv run python

# Run scripts
uv run pytest
```

### Ruff (Linting & Formatting)

Code quality is maintained with [Ruff](https://docs.astral.sh/ruff/):

```bash
# Check code
uv run ruff check

# Format code
uv run ruff format

# Fix auto-fixable issues
uv run ruff check --fix
```

### Pre-commit Hooks

Automated code quality checks run before each commit:

```bash
# Install hooks (done automatically in dev container)
pre-commit install

# Run hooks manually
pre-commit run --all-files

# Update hook versions
pre-commit autoupdate
```

## VS Code Integration

The template includes optimized VS Code settings and extensions:

### Pre-installed Extensions

- **Python** - Python language support
- **Pylance** - Advanced Python language server
- **Ruff** - Linting and formatting
- **Even Better TOML** - TOML file support
- **Path Intellisense** - Autocomplete for file paths
- **YAML** - YAML language support
- **Mise** - Tool version management integration

### Configured Settings

- Auto-format on save with Ruff
- Organized imports on save
- Consistent indentation (4 spaces for Python)
- 120 character line length
- GitHub Copilot integration with custom instructions

## GitHub Actions

The template includes a basic CI pipeline (`.github/workflows/ci.yaml`) that:

- Installs dependencies with UV
- Runs Ruff linting and formatting checks
- Can be extended with testing, security scans, etc.

## Contributing

1. Follow the coding standards defined in `.github/copilot-instructions.md`
2. Use conventional commits (enforced by Commitizen)
3. Ensure all pre-commit hooks pass
4. Add tests for new features
5. Update documentation as needed

## Coding Standards

This project follows strict coding standards:

- **Naming**: `snake_case` for functions/variables, `PascalCase` for classes
- **Type Safety**: Type hints required for all functions and methods
- **Data Validation**: Use Pydantic for data models
- **Error Handling**: Specific exceptions with clear messages
- **Documentation**: Google-style docstrings
- **Testing**: Comprehensive test coverage with pytest

See `.github/copilot-instructions.md` for detailed guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📚 **Documentation**: Check the files in `.github/instructions/`
- 🐛 **Issues**: Use the issue templates in `.github/ISSUE_TEMPLATE/`
- 💡 **Features**: Submit feature requests via GitHub issues
- 🤝 **Contributing**: Follow the pull request template

---

Happy coding! 🚀
