# Contributing to S.I.N.v7

S.I.N.v7 is an evidence-first research repository. Contributions should make a
claim easier to test, falsify, reproduce, or secure.

## Before contributing

1. Read [v7.md](v7.md), [SECURITY.md](SECURITY.md), and the
   [threat model](docs/security/THREAT_MODEL.md).
2. Do not submit secrets, private datasets, private prompts, personal paths,
   proprietary model weights, or unreviewed serialized objects.
3. Treat copied code, datasets, model outputs, images, and papers as external
   material requiring provenance and compatible usage terms.
4. Keep experimental claims separate from established behavior.

## Change workflow

- Work on a branch and propose changes through a pull request.
- Keep pull requests small enough to review their security and evidence impact.
- Add or update deterministic tests for behavior changes.
- Pin dependencies and GitHub Actions; do not introduce floating action tags.
- Do not add network access, tool execution, persistence, learning promotion,
  or release credentials without updating the threat model.
- Never use `pull_request_target` or run untrusted pull-request code with
  repository secrets.

Run the repository guard before requesting review:

```powershell
python scripts/security/repository_guard.py --root . --history
```

## Models and data

- Do not commit model weights, checkpoints, datasets, or generated artifact
  bundles directly to Git.
- Do not load pickle-based or otherwise executable serialization from an
  untrusted source.
- Record source, license, hash, expected format, and validation procedure for
  every external model or dataset.
- Candidate learning remains shadow-only until evaluation, restart,
  reproducibility, and rollback gates pass.

## Security reports

Do not open a public issue for a vulnerability. Follow [SECURITY.md](SECURITY.md).
