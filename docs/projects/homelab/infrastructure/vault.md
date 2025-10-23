# HashiCorp Vault

> [!tip] Important Links
> 󰈙 Official Documentation: [Vault Documentation](https://developer.hashicorp.com/vault)
>
>  Helm Chart: [hashicorp/vault-helm](https://artifacthub.io/packages/helm/hashicorp/vault)

The intention behind introducing HashiCorp Vault into the homelab is to consolidate the management of secrets such as API tokens, SSH keys, cloud credentials, and Kubernetes secrets. Vault acts as a single system of record with enforced security controls.

Key reasons for using Vault include:

- Centralized secret storage rather than scattered configuration files.
- Policy-based access control to restrict what can be read or written.
- Support for dynamic secrets, reducing reliance on static long-lived credentials.
- Tight integration with Kubernetes, allowing workloads to securely consume secrets at runtime.

## Choice of Storage Backend

HashiCorp Vault requires a [storage backend](https://developer.hashicorp.com/vault/docs/configuration/storage) for persisting secrets and metadata. Several options exist:

- **File storage**: simplest to configure but fragile; not ideal for consistency or backup workflows.
- **Consul storage**: powerful and battle-tested, but requires running and maintaining Consul alongside Vault, which is heavy for a homelab.
- **Integrated Raft storage**: built into Vault, production-ready, supports snapshots, and avoids external dependencies.

**Decision**: [Raft](https://developer.hashicorp.com/vault/docs/configuration/storage/raft) storage was chosen. The trade-off is reduced flexibility compared to Consul, but the simplicity and snapshot support make it better suited for this environment.

## Backup and Restore

Vault data is critical; losing it means losing access to all stored secrets. Raft storage simplifies this by supporting snapshot-based backup and restore.

- Manual backups are taken using snapshots and copied off the cluster to the Proxmox host or external media.
- Restoration can be tested by bringing up a new Vault instance and applying the snapshot.

The trade-off is that this is not automated, so it requires discipline to take backups regularly. For a homelab, manual control is sufficient and easier to reason about. Later, I will look into automated solutions.

## Why Not Use Native Kubernetes Secrets

Kubernetes Secrets are stored in etcd, base64-encoded by default, and lack lifecycle management features. Vault provides capabilities such as:

- Encryption at rest.
- Revocation and rotation of secrets.
- Dynamic credential issuance.

The trade-off has added complexity by introducing another system, but the gain in realism and best-practice learning outweighs it.

## Understanding Manifests

The structure of how manifests are distributed into 2 layers is as following.

```shell
 ./infrastructure/base/vault
├──  clusterrole.yaml
├──  clusterrolebinding.yaml
├──  kustomization.yaml
├──  namespace.yaml
├──  release.yaml
├──  repository.yaml
├──  secret.yaml
└──  serviceaccount.yaml
 ./infrastructure/lab/vault
├──  kustomization.yaml
├──  persistentVolume.yaml
├──  persistentVolumeClaim.yaml
└──  values.yaml
```

This structure allows me to seprate common manifests from cluster specific manifests.

### Understanding `values.yaml`

This is, perhaps, the only file worth paying attention to. All other files are easy to understand on its own if you are familiar with Kubernetes.

#### `global`

```yaml
global:
  enabled: true
  tlsDisable: true
```

- What it does
  - `enabled: true` chart global toggles (standard).
  - `tlsDisable: true` disables Vault TLS in the listener(s) (so Vault speaks HTTP internally).

- Why used
  - Convenience in homelab: avoids cert management, lets Traefik/ingress handle TLS or you can run plain HTTP internally.

- Alternatives
  - `tlsDisable: false` and configure TLS (server cert/key) which is recommended for production.
    - Use a valid cert with `api_addr` set accordingly.
    - Or terminate TLS at ingress (TLS at Traefik) while enabling `tls_disable = 1` in Vault but that means trust boundaries differ.

- Trade-offs
  - `tlsDisable=true` simplifies setup but exposes Vault traffic in plaintext inside your network. Fine for an isolated lab; risky in multi-tenant or public networks.

#### `server.resources`

```yaml
resources:
  requests: { cpu: 100m, memory: 256Mi }
  limits:   { cpu: 500m, memory: 512Mi }
```

- What it does
  - K8s resource requests/limits for the Vault container.

- Alternatives
  - Increase for production (Vault + Raft with load will need more memory/CPU).
  - Use vertical autoscaling or node sizing strategy.

- Trade-offs
  - Too small → OOMs (out of memory), slow leader election. Too large → wasted resources. Tune based on load.

#### `server.readinessProbe` & `server.livenessProbe`

```yaml
server:
  readinessProbe:
    enabled: true
    path: /v1/sys/health?standbyok=true&sealedcode=204&uninitcode=204
    failureThreshold: 10

  livenessProbe:
    enabled: true
    path: /v1/sys/health?standbyok=true
    initialDelaySeconds: 60
    periodSeconds: 10
    failureThreshold: 6
```

- What it does
  - Kubernetes calls Vault’s health endpoint to decide pod **readiness** (should it receive traffic?) and **liveness** (is it healthy or should kubelet restart it?).
  - Query params alter the meaning of HTTP status codes Vault returns:
    - `standbyok=true` lets `429` (standby) be considered OK for some checks.
    - `sealedcode`/`uninitcode` convert certain responses into numeric codes that make sense for Kubernetes to treat as success/failure.

- Why used
  - Avoid routing traffic to nodes that are not ready, and let Kube restart a misbehaving Vault.

- Alternatives
  - Disable liveness/readiness during bootstrap (temporary) to avoid restarts (but then Kube won’t auto-restart failing processes).
  - Use different health endpoints or custom sidecar health checks.
  - Increase `initialDelaySeconds`, `failureThreshold` for slow-start environments.

- Trade-offs
  - Strict probes → safer production behavior (detect and restart bad processes).
  - Overly strict probes during init/unseal → CrashLoopBackOff and ingress with no endpoints. You mitigated that by `publishNotReadyAddresses` or by routing to the API service.

#### `securityContext`

```yaml
securityContext:
  runAsUser: 100
  fsGroup: 100
```

- What it does
  - Runs Vault process as UID 100 and sets `fsGroup` so mounted PV directories are accessible by that group; helps file ownership/permissions for raft DB.

- Alternatives
  - Use an initContainer to `chown` host path.
  - Leave it out and fix host filesystem permissions manually (e.g., `chown -R 100:100 /data/vault` on node).
  - Use Pod Security Policies or SCCs to enforce.

- Trade-offs
  - Using `fsGroup` is Kubernetes-friendly (automatically sets group ownership on volumes) — recommended. Not doing this is brittle and causes permission warnings/errors.
