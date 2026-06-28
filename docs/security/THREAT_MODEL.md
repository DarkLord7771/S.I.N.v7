# S.I.N.v7 threat model

**Status:** initial repository boundary, before runtime implementation.

**Last reviewed:** 2026-06-28.

## Security objective

S.I.N.v7 must remain a safe place to develop and publish reproducible research
without allowing repository content, untrusted data, model artifacts, prompts,
tools, or automation to acquire authority merely by being present.

## Assets

- source code and mathematical implementations;
- evaluation datasets, expected answers, and held-out results;
- model, optimizer, and memory state;
- credentials, signing identities, and release permissions;
- experiment provenance, hashes, logs, and audit records;
- contributor and operator privacy; and
- the integrity of public releases and scientific claims.

## Trust boundaries

1. **Public contribution boundary:** forks, pull requests, issues, patches, and
   generated text are untrusted input.
2. **Dependency boundary:** packages, actions, containers, models, datasets,
   and downloaded assets are external supply-chain inputs.
3. **Execution boundary:** code gains no filesystem, process, network, GPU,
   secret, or tool access unless the experiment explicitly grants it.
4. **Learning boundary:** observation and candidate updates are separate from
   persistent promotion.
5. **Release boundary:** local results are not public artifacts until review,
   reproduction, provenance, and integrity checks pass.
6. **Donor boundary:** v6 and older S.I.N. projects are evidence sources, not
   automatically trusted dependencies.

## Threats and required controls

| Threat | Example consequence | Required control before exposure |
|---|---|---|
| Secret leakage | API token committed or printed by CI | No repository secrets in pull-request jobs; GitHub secret scanning and push protection; local/history guard; immediate rotation on exposure |
| Malicious pull request | Exfiltration through a workflow or test | Read-only token permissions; no `pull_request_target`; no secrets; pinned actions; review before authority changes |
| Dependency compromise | Install script or action runs attacker code | Lockfiles, hashes where supported, minimal dependencies, pinned action SHAs, Dependabot review, provenance check |
| Unsafe model loading | Pickle-based checkpoint executes code | Reject executable serialization from untrusted sources; prefer data-only formats; verify hashes and schema in isolation |
| Dataset poisoning | Backdoor or biased evaluation result | Provenance, immutable hashes, schema checks, holdout separation, anomaly review, repeat runs |
| Prompt or tool injection | Untrusted content triggers network/filesystem action | Treat model output as data; typed allowlisted tools; argument validation; least privilege; human approval at authority boundaries |
| Artifact tampering | Published weights or results differ from reviewed inputs | Reproducible build, checksums, signed provenance when releases begin, immutable release record |
| Unauthorized persistence | Candidate state silently becomes durable behavior | Shadow-only updates, explicit promotion record, checkpoint diff, restart proof, rollback test |
| Privacy leakage | Local paths, prompts, logs, or metadata expose a person | Repository-neutral references, metadata inspection, data minimization, redaction review |
| Resource exhaustion | Crafted input consumes unbounded compute or storage | Size, time, memory, queue, and recursion limits; cancellation and cleanup paths |
| Authority drift | Descriptive evidence becomes runtime permission | Explicit default-false authority fields; separate observation, recommendation, approval, and execution stages |

## Initial invariants

- GitHub Actions use read-only permissions unless a narrowly reviewed workflow
  requires more.
- Third-party actions are pinned to a full commit SHA.
- Pull-request workflows receive no repository secrets.
- Untrusted serialized models and checkpoints are never loaded directly.
- External models, data, and assets require provenance and hashes.
- Network, filesystem, process, tool, persistence, and learning capabilities
  are denied by default.
- Generated output cannot grant itself authority.
- Every persistent update has an origin, evaluation, restart check, and rollback
  path.
- Releases are built from reviewed commits, not an uncommitted workstation.

## Deferred decisions

The implementation language, package ecosystem, model providers, dataset, and
runtime topology are not yet selected. Each selection must extend this threat
model before its code is merged.

## Review triggers

Review this document whenever a change adds or widens:

- a dependency or build system;
- CI permissions or secrets;
- network, filesystem, process, GPU, or tool access;
- external data, model, checkpoint, or plugin loading;
- persistence, memory, training, or learning promotion; or
- packaging, signing, deployment, or public release behavior.
