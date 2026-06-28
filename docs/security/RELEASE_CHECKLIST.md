# Release security checklist

S.I.N.v7 has no release artifact yet. Use this checklist before publishing the
first one and every release thereafter.

## Repository state

- [ ] Release commit is reviewed, immutable, and reachable from protected `main`.
- [ ] Working tree is clean; build inputs come from the reviewed commit.
- [ ] Repository guard passes with current and history scanning enabled.
- [ ] Required tests, type checks, linters, and security checks pass.
- [ ] No absolute workstation paths, private metadata, secrets, or temporary
      artifacts are present.
- [ ] A project license has been selected and all included material is compatible.

## Dependencies and automation

- [ ] Direct and transitive dependencies are locked and reviewed.
- [ ] GitHub Actions are pinned to full commit SHAs with minimal permissions.
- [ ] Dependency and secret-scanning alerts are resolved or explicitly blocked
      from release with a documented reason.
- [ ] Build jobs do not receive unnecessary secrets or use untrusted runners.
- [ ] Software bill of materials and dependency provenance are captured when a
      package ecosystem exists.

## Models, data, and learning

- [ ] Every external model and dataset has a source, license, version, hash, and
      validation record.
- [ ] No untrusted executable serialization is loaded during build or runtime.
- [ ] Training and evaluation data are separated; held-out answers are not
      present in training or prompts.
- [ ] Persistent state changes have evaluation, restart, and rollback evidence.
- [ ] Model and dataset cards describe intended use, limitations, and known
      failure modes when applicable.

## Artifact integrity

- [ ] Artifacts are generated reproducibly from the release commit.
- [ ] Cryptographic checksums are published.
- [ ] Signing or keyless provenance is enabled before distributing executable
      packages, containers, models, or installers.
- [ ] A clean environment verifies the artifact and its documented commands.
- [ ] Rollback and revocation procedures are written and tested.

## Communication

- [ ] Security-impacting changes and unresolved limitations are disclosed.
- [ ] Claims match measured evidence and name their baseline.
- [ ] `SECURITY.md`, threat model, and support status remain accurate.
- [ ] Private vulnerability reporting is available.
