---
prev: false
---
# Getting Started

> [!tip] External Resources
>
> - Mise-en-place Documentation: [mise.jdx.dev](https://mise.jdx.dev)
> - Mise-en-place Source Code: [github.com/jdx/mise](https://github.com/jdx/mise)

`mise` (short for *mise-en-place*, a French culinary term meaning "everything in its place") is a modern, fast, and user-friendly version manager and tool installer for developers.

You can use it to manage multiple versions of programming languages, CLIs, and other developer tools, keeping different projects isolated and reproducible.

## Key Features

- **Fast and Lightweight**: Built in Rust.
- **Cross-Platform**: Works on Linux, macOS, and Windows.
- **Per-Project & Global Versions**: Automatically selects the right tool versions based on config files.
- **Declarative Setup**: Define tools and versions in a `mise.toml` file.
- **Built-in Task Runner**: Automate project-specific commands with `mise run`.

## Setup

### Installation

::: code-group

```sh [Linux/MacOS]
curl https://mise.run | sh
```

```sh [Windows]
winget install jdx.mise
```

:::

> [!note]
> There are other ways to install `mise` as well. Refer to the official documentation.

To verify if `mise` is installed properly run the following.

```sh
mise version
```

### Activation

It's important to activate `mise` to automatically load the `mise` contexts i.e. `tools` and `environment variables` in the current shell session.

If you navigate to a directory that has the `mise.toml` configuration file, you would want your shell session to detect that. This way `mise` will be aware of the contexts. There are 2 ways to activate `mise`.

- `PATH` (for interactive shells): This method updates your environment variables and `PATH` every time your prompt is run.
- `Shims` (for non-interactive shells): This method will create symlinks to the `mise` binary that intercepts commands and load the appropriate environment. This doesn't support all the features as the other method.

::: code-group

```sh [Bash]
echo 'eval "$(mise activate bash --shims)"' >> ~/.bash_profile  # this sets up non-interactive sessions
echo 'eval "$(mise activate bash)"' >> ~/.bashrc                # this sets up interactive sessions
```

```sh [Zsh]
echo 'eval "$(mise activate zsh --shims)"' >> ~/.zprofile   # this sets up non-interactive sessions
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc              # this sets up interactive sessions
```

```sh [PowerShell (Windows)]
$shimPath = "$env:USERPROFILE\AppData\Local\mise\shims"
$currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$newPath = $currentPath + ";" + $shimPath
[Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
```

:::

> [!note]
> `mise` activation depends on your shell and the installation method. Refer to the official documentation for more details.

To verify if the installation and activation is done properly, run the following.

```sh
mise doctor
```
