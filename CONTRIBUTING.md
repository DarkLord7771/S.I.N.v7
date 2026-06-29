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

## Licensing contributions

The [license](LICENSE) permits copying, running, testing, modifying, and sharing
repository materials to prepare and validate contributions for noncommercial
research. It does not authorize production, internal business use, commercial
AI training, or another commercial use.

By submitting a contribution, you represent that you have the right to submit
it and grant the repository owner a worldwide, perpetual, irrevocable,
non-exclusive, royalty-free, transferable, and sublicensable license under
applicable copyright and patent rights to use, reproduce, modify, distribute,
make, have made, sell, offer for sale, import, and otherwise exploit the
contribution for any purpose, including commercial licensing. You agree that
the contribution may be distributed publicly under the repository's license.
Do not submit a contribution if you cannot grant these rights.
