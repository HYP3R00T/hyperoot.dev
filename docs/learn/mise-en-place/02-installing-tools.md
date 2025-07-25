# Installing tools

The main command for working with tools in mise is `mise use`. This does 2 main things:

- Installs tools if not already installed
- Adds the tool to the `mise.toml` configuration file

Consider the following example.

```sh
mkdir sample-project && cd sample-project
mise use python@3.12
python --version
# Python 3.12.9
```

This will create a `mise.toml` file with the following content.

```toml [mise.toml]
[tools]
python = "3.12"
```

If this file is in the root of the project, all the tools will be installed when someone runs `mise install`. This is the command you want to run after you clone a project with `mise.toml` file.

## Install tools system-wide

To install a tool which is available across the system, we can use `--global` flag. This will add the tool to the global config file.

```sh
mise use --global kubectl@latest
```
