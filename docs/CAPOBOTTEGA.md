# CAPOBOTTEGA runtime evidence

CAPOBOTTEGA is the GPT-5.6 decision boundary inside VERROCCHIO. It does not
execute work. It decides what material the proposed work is made of and what
the workshop may do next.

## Input

- the proposed stroke;
- the CONTRATTO objective and irreversible-work rule;
- current MANCA;
- the missing submission gates.

## Output contract

The server requests strict Structured Output from `gpt-5.6-sol`:

- `classification`: `AFFRESCO`, `SECCO`, or `GESSO`;
- `reason`: one concise, evidence-based reason;
- `nextStroke`: the smallest action toward submission;
- `humanAction`: `FIRMA_REQUIRED`, `REVIEW_LATER`, or `NONE`;
- `scopeEffect`: `SHRINKS`, `PRESERVES`, or `EXPANDS`;
- `submissionGate`: one of the six MANCA gates or `NONE`;
- `evidenceNote`: a ledger-ready proof sentence.

The request uses the Responses API, `reasoning.effort: "medium"`, strict JSON
Schema, low text verbosity, no tools, and `store: false`.

## Verified self-reference

On 2026-07-18, the product used CAPOBOTTEGA to classify the act of publishing
its own verified runtime integration.

| Field | Result |
| --- | --- |
| Material | `AFFRESCO` |
| Human action | `FIRMA_REQUIRED` |
| Scope | `PRESERVES` |
| Gate | `working-product` |
| Model | `gpt-5.6-sol` |
| Response | `[public-response-id-removed]` |

The classification correctly stopped at the publication boundary. VERROCCHIO
then updated its own GIORNATA, spent four minutes of OLTREMARE, activated
FERMO, closed the GPT-5.6 evidence gate, and recorded the response in its own
ledger. This is the self-reference claim expressed as observable product
behavior rather than narration.

## Official API references

- [GPT-5.6 Sol](https://developers.openai.com/api/docs/models/gpt-5.6-sol)
- [GPT-5.6 model guidance](https://developers.openai.com/api/docs/guides/model-guidance?model=gpt-5.6)
- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Responses API create reference](https://developers.openai.com/api/reference/resources/responses/methods/create)
