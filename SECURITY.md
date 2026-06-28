# Security policy

## Supported versions

S.I.N.v7 has no released runtime. Only the current `main` branch receives
security updates during the research phase.

## Reporting a vulnerability

Do not disclose a suspected vulnerability, secret, exploit, or private data in
a public issue, discussion, pull request, commit message, or repository file.

Use GitHub's private vulnerability-reporting flow:

<https://github.com/DarkLord7771/S.I.N.v7/security/advisories/new>

Include only what is necessary to reproduce and assess the problem:

- affected revision or artifact;
- impact and trust boundary crossed;
- minimal reproduction steps;
- whether credentials or private data may be involved; and
- any known containment or rollback action.

If private reporting is temporarily unavailable, withhold sensitive details
until a private channel is established. A public issue may say only that a
private security contact is needed.

## Scope

Security reports may include:

- credential or private-data exposure;
- unsafe model or checkpoint deserialization;
- dependency or GitHub Actions supply-chain compromise;
- prompt, tool, or artifact injection that crosses an authority boundary;
- unauthorized filesystem, process, network, or persistence access;
- poisoned training/evaluation data or unreviewed learning promotion;
- provenance, integrity, rollback, or restart failures; and
- release artifact tampering.

General research disagreement, unsupported claims, and ordinary bugs without a
security impact belong in normal review rather than private reporting.

## Response posture

Reports are handled on a best-effort basis while the project is experimental.
The maintainer will first contain the issue, preserve evidence, rotate any
affected credentials, and suspend unsafe releases before attempting a fix.

No contributor is authorized to test against systems, accounts, data, or
infrastructure they do not own or have explicit permission to assess.
