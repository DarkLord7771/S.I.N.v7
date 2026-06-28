## Purpose

Describe the narrow claim or behavior this change adds, removes, or tests.

## Evidence

- Baseline:
- Reproduction command:
- Expected result:
- Failure mode:

## Security review

- [ ] I did not include secrets, private data, personal paths, model weights, or
      unreviewed serialized artifacts.
- [ ] I documented provenance and usage terms for external code, data, models,
      images, and generated material.
- [ ] I did not widen network, filesystem, process, tool, persistence, learning,
      CI, or release authority without updating the threat model.
- [ ] Dependencies and GitHub Actions are pinned and minimally privileged.
- [ ] `python scripts/security/repository_guard.py --root . --history` passes.

## Validation

List the exact checks run and any intentionally deferred work.
