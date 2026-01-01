---
title: "文献阅读prompt"
description: ""
pubDate: 2026-01-01 16:25
tags:
  - "prompt"
# heroImage: "../assets/your-hero.png"
---

The agent must complete the task in two strictly separated stages: Stage 1 (Structured Understanding) followed by Stage 2 (Academic Writing).

The two-stage structure is an internal execution requirement only. The agent must not mention, label, or expose the stages in the final output.

The final output must consist exclusively of the completed Markdown article. Any meta-information, reasoning process, stage markers, analytical notes, or execution details are strictly prohibited in the output.

The output must begin directly with the first Markdown section title. No introductory or transitional text is allowed before the article content.


## Stage 1: Structured Understanding

In this stage, the agent must analyze and internalize the method or theory proposed in the given academic paper.
The goal of this stage is comprehension and structural clarity, not polished writing.

The agent must produce a structured internal representation of the method or theory that includes:

- The overall objective and problem setting of the method or theory.
- The core idea and underlying principles.
- A logically ordered breakdown of the method or theory into major components or phases.
- The role and purpose of each mathematical formula, including:
  - What the formula is used for.
  - The meaning of all variables and parameters.
- The logical dependencies between steps or components.

The output of Stage 1 must be written in Chinese and presented as a clearly structured outline or analysis. Clarity and correctness are required; stylistic polish is not.

No Markdown article formatting is required in this stage. The agent must not attempt to write the final article in this stage.

## Stage 2: Academic Writing

In this stage, the agent must transform the structured understanding from Stage 1 into a complete academic-style explanation.

The agent must strictly base the writing on the content established in Stage 1 and must not introduce new technical interpretations or assumptions.

The output must be a complete and well-structured Markdown article written in Chinese, explaining the method or theory’s underlying principles and procedural steps.

The explanation must adhere to the following constraints:

- Use formal, objective, precise, descriptive, and explanatory academic language.
- Avoid subjective opinions, metaphors, or rhetorical expressions.
- The article must not include an overall title.
- The output must not contain any level-1 Markdown headers (`#`). 
  All section headers must start from level-2 (`##`) and below.
  Level-2 headers (`##`) must be used as the highest-level section titles.
- The article must begin with a concise introductory paragraph written in plain text (not a header).
  This opening paragraph must briefly and objectively summarize the paper in the form:
  “《title of paper》提出了一种……”.
- When mathematical formulas are involved, the explanation must be tightly integrated with the formulas, clearly defining all variables and parameters.
- All display equations must follow strict LaTeX formatting rules:
  - The delimiter `$$` must appear on a line by itself.
  - The equation content must be written on a separate line.
- Ordered or unordered lists may be used exclusively to outline the high-level or overall workflow.
  Lists must not be used to describe or enumerate individual steps in place of explanatory paragraphs.
  The use of unordered lists must not be excessive and must not replace continuous prose.
  Each individual step requires a full paragraph of complete, coherent, and detailed descriptive explanation; bullet-point-only or bullet-dominated descriptions are prohibited.
- Section titles must be concise, objective statements summarizing the section content.
  The use of colons, metaphors, or rhetorical expressions in titles is prohibited.

The agent must strictly follow all requirements above.
