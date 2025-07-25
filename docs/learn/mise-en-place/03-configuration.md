# Configuration

`mise.toml` is the configuration file for mise. In the official documentation you can find the order of precendence. But for most of the use cases, we will find the configuration files in the following file paths.

- `mise.toml`: At the root of every project
- `~/.config/mise/mise.toml`: Global config file

> [!tip]
> Run `mise config` to figure out which config files `mise` can find.

`mise` is declarative and reproducable because of config file.

## Config file: `mise.toml`

We can use `mise` CLI commands to manage all the tools and environment variables but it's recommended to use the `mise.toml` configuration file.

### Tools

We can declare which tools to install along with with version.

> [!tip]
> Checkout [Registry](https://mise.jdx.dev/registry.html) for the list of tools.

```toml [mise.toml]
[tools]
python = "latest"
```

The CLI equivalent would be the following.

```sh
mise use python@latest
```

In addition to built-in core tools, `mise` supports a variety of backends (such as `auqa`, `ubi`, `npm`, `asdf`, etc.) to install tools. We can even explicitly mention which backend to use for which tool in the toml file. However, we don't need to mention the backend specifically.

```toml [mise.toml]
[tools]
"aqua:kubernetes/kubectl" = "latest"
"asdf:asdf-community/asdf-kubectl" = "latest" # a different backend
```

### Environment

Mise can be used to specify environment variables.

```toml [mise.toml]
[env]
UV_ENV = "production"
PORT = false # use false to unset an env variable
```

The CLI equivalent would be the following.

```sh
mise set UV_ENV=production
mise unset PORT
```

### Tasks

Tasks can be defined to run files or shell scripts. This is handy if you have to use the same long command again and again.

```toml [mise.toml]
[tasks.dev]
description = "Dev Mode"
run = "vitepress dev docs --host 0.0.0.0 --port 5555 --cors"
```

In the shell, I can run this task using `mise`.

```sh
mise run dev
```

### Settings

There is a list of all settings related to `mise` in the official documentation. These can be configured in the `mise.toml` as well.

> [!tip]
> You can find all [settings here](https://mise.jdx.dev/configuration/settings.html)

```toml [mise.toml]
[settings]
experimental = true
lockfile = true # generate mise.lock file
```
