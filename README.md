# S.I.N.v7

S.I.N.v7 is a public research laboratory for testing whether a heterogeneous
bilateral system—language/rule reasoning on one side and abstract
visual/spatial reasoning on the other—benefits from an explicit
quaternion-valued fusion seam.

The repository exists. The architecture has not yet earned validation.

## Current status

- **Phase:** exploratory research and deterministic harness design
- **Runtime:** none yet
- **Validated successor to S.I.N.v6:** no
- **Central hypothesis:** quaternion callosal fusion may provide measurable
  value over individual streams and conventional fusion baselines

The working evidence, donor audit, representation contract, and graduation
rules live in [v7.md](v7.md).

## Research contract

1. Task performance comes before ontology or identity language.
2. Quaternion mechanisms must compete against simpler real-valued baselines
   under comparable data, parameter, and compute budgets.
3. Mathematical primitives, runtime integration, persistence, and learning are
   separate claims and require separate evidence.
4. Deterministic tests and inspectable CLI results come before presentation,
   personality, or lore.
5. A compelling trace is an observation, not a graduation result.

## First decisive experiment

The first experiment will ask whether a bilateral language-plus-abstract-
visual-reasoning system outperforms:

- the language/rule stream alone;
- the visual/spatial stream alone;
- concatenation plus an MLP; and
- a strong conventional learned gate or cross-attention baseline.

Quaternion callosum variants advance only if repeated held-out and
out-of-distribution evaluations show a meaningful advantage while preserving
calibration, reproducibility, and bounded failure behavior.

## First implementation milestone

Before model construction, the repository needs a deterministic quaternion
property-test suite covering normalization, Hamilton products, log/exp maps,
shortest-path SLERP, antipodal equivalence where applicable, batched/scalar
parity, finite gradients, and checkpoint/restart equivalence.

## Repository map

- [v7.md](v7.md) — evidence ledger and provisional research thesis
- [SOURCES.md](SOURCES.md) — provenance for external inspiration and references

An original project image is being prepared separately.

## Relationship to S.I.N.v6

S.I.N.v6 remains an active donor and evidence source. v7 does not rewrite v6's
observations or inherit its claims automatically. Components survive only when
their mathematics or behavior can be reproduced under v7's narrower research
contract.

## Security posture

S.I.N.v7 treats every contribution, dataset, model, checkpoint, prompt, tool
response, and generated artifact as untrusted until validated. The repository
starts with a default-deny security boundary before it gains runtime
capabilities.

- Read [SECURITY.md](SECURITY.md) before reporting a vulnerability.
- Read the [threat model](docs/security/THREAT_MODEL.md) before adding code,
  models, tools, network access, persistence, or learning behavior.
- Run `python scripts/security/repository_guard.py --root . --history` before
  proposing a release.
- Use the [release security checklist](docs/security/RELEASE_CHECKLIST.md) for
  every published artifact.

## License

S.I.N.v7 is source-available for noncommercial research; it is not open source.
The license permits research, teaching, personal experimentation, independent
validation, reproducibility work, and security review—including running,
testing, benchmarking, modifying, and sharing the materials under the same
terms. Production, internal business use, monetized or competitive offerings,
and commercial AI training require a separate written commercial license,
ordinarily with a minimum payment and negotiated gross-revenue share. See
[LICENSE](LICENSE) and contact the repository owner to discuss commercial terms.
