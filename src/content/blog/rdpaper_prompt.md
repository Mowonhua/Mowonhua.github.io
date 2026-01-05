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

In this stage, the agent must analyze and internalize the method or theory or architecture proposed in the given academic paper.
The goal of this stage is comprehension and structural clarity, not polished writing.

The agent must produce a structured internal representation of the method or theory or architecture that includes:

- The overall objective and problem setting of the method or theory or architecture.
- The core idea and underlying principles.
- A logically ordered breakdown of the method or theory or architecture into major components or phases.
- The role and purpose of each mathematical formula, including:
  - What the formula is used for.
  - The meaning of all variables and parameters.
- The logical dependencies between steps or components.

The output of Stage 1 must be written in Chinese and presented as a clearly structured outline or analysis. Clarity and correctness are required; stylistic polish is not.

No Markdown article formatting is required in this stage. The agent must not attempt to write the final article in this stage.

## Stage 2: Academic Writing

In this stage, the agent must transform the structured understanding from Stage 1 into a complete academic-style explanation.

The agent must strictly base the writing on the content established in Stage 1 and must not introduce new technical interpretations or assumptions.

The output must be a complete and well-structured Markdown article written in Chinese, explaining the method or theory or architecture’s underlying principles and procedural steps.

The agent must adapt the section structure of the output Markdown article according to the type of academic paper, following discipline-appropriate conventions.

- For architecture-oriented papers (e.g., system architecture, framework design, network architecture, security architecture):

  - The section structure must follow this logical order:
    - Overview: a concise, objective description of the overall problem setting, design goals, and high-level idea of the proposed architecture.
    - Principles of Subcomponents: detailed explanations of the underlying principles, mechanisms, or algorithms of each major component or module in the architecture.
    - Implementation of the Proposed Architecture: a systematic and concrete description of how the architecture is implemented, including component interactions, data/control flow, and design decisions.
  - Sections must reflect a top-down progression from conceptual design to concrete realization.

- For algorithm-oriented papers: 

  For papers whose core contribution is a novel algorithm, optimization method, or computational procedure, the output must be organized to emphasize formal reasoning and operational clarity, and must include the following section logic in order:

  - Problem Formulation and Assumptions
    - Precisely define the problem being solved, including inputs, outputs, constraints, and assumptions.
    - Introduce relevant notation and formally describe the objective or optimization target.
  - Theoretical Foundations or Design Rationale
    - Explain the principles, theoretical insights, or motivations that lead to the algorithm design.
    - Clearly state why the chosen approach is appropriate for the formulated problem.
  - Algorithm Design
    - Describe the algorithm in a logically ordered manner, from initialization to termination.
    - If algorithmic steps are listed, the list may only outline the global workflow; each step must be explained in full descriptive prose.
    - Mathematical operations, update rules, or decision conditions must be explicitly derived or justified.
  - Algorithm Execution and Properties
    - Explain how the algorithm operates during execution, including intermediate states and control flow.
    - Discuss key properties such as correctness, convergence behavior, computational complexity, or stability when applicable.

  The exposition must progress from formal definition → conceptual justification → procedural construction → operational behavior.

- For protocol- or mechanism-oriented papers: 

  For papers whose core contribution is a protocol, system mechanism, or interaction process (e.g., security protocols, communication mechanisms, coordination schemes), the output must be organized to emphasize interaction logic, state evolution, and correctness guarantees, and must include the following section logic in order:

  - Design Goals and Threat or System Model
    - Clearly state the design objectives, operational environment, and assumed system or adversary model.
    - Explicitly define entities, roles, and trust assumptions.
  - Design Rationale and Core Mechanisms
    - Explain the fundamental ideas and mechanisms that enable the protocol or system to achieve its goals.
    - Justify key design choices in relation to the stated model and objectives.
  - Protocol or Mechanism Workflow
    - Describe the protocol or mechanism as an ordered sequence of interactions, phases, or state transitions.
    - Lists may be used only to outline the global workflow; each phase or step must be explained in detailed descriptive prose.
    - Message formats, control signals, and state changes must be explicitly explained.
  - Correctness, Security, or Performance Properties
    - Explain how and why the protocol or mechanism satisfies its intended properties.
    - The explanation must be logically grounded in the previously described workflow and mechanisms.

  The exposition must progress from design intent → enabling mechanisms → interaction process → property justification.

- For survey- or review-oriented papers: 

  For papers whose primary contribution is a systematic review, survey, or taxonomy of existing research, the output must be organized to emphasize coverage completeness, classification logic, and comparative analysis, and must include the following section logic in order:

  - Scope Definition and Review Methodology
    - Clearly define the scope of the survey, including the research domain, time span, and inclusion or exclusion criteria.
    - Explain the methodology used to collect, select, and categorize the reviewed literature.
  - Classification Framework or Taxonomy
    - Present the organizing framework used to structure the survey, such as conceptual dimensions, functional categories, or methodological paradigms.
    - Clearly define each category and explain the rationale behind the classification.
  - Category-wise Technical Analysis
    - For each category, systematically explain representative approaches, core ideas, and technical characteristics.
  - Comparative Discussion and Synthesis
    - Compare different categories or representative works along clearly defined technical dimensions.
    - Highlight common patterns, fundamental trade-offs, and key limitations in an objective and evidence-based manner.
  - Open Challenges and Research Directions
    - Summarize unresolved issues, gaps in existing work, and promising directions for future research.
    - The discussion must be grounded in the preceding analysis and avoid speculative or rhetorical language.

  The exposition must progress from scope definition → structural classification → detailed analysis → cross-category synthesis → forward-looking assessment

The agent must select the appropriate structural pattern automatically based on the paper type and organize sections accordingly. 

The agent must strictly adhere to the selected structural pattern and must not mix organizational logics from different paper types unless explicitly required by the paper itself.

Section ordering must be logical, non-redundant, and aligned with standard academic exposition practices.

After determining and applying the appropriate section structure as specified above, the agent must ensure that the explanation must adhere to the following constraints:

- Use formal, objective, precise, descriptive, and explanatory academic language.
- Avoid subjective opinions, metaphors, or rhetorical expressions.
- The article must not include an overall title.
- The output must not contain any level-1 Markdown headers (`#`). 
  All section headers must start from level-2 (`##`) and below.
  Level-2 headers (`##`) must be used as the highest-level section titles.
- The article must begin with a concise introductory paragraph written in plain text (not a header).
  This opening paragraph must briefly and objectively summarize the paper in the form:
  “《title of paper》XXX(选择合适的动词)……”.
- When mathematical formulas are involved, the explanation must be tightly integrated with the formulas, clearly defining all variables and parameters.
- All display equations must follow strict LaTeX formatting rules:
  - The delimiter `$$` must appear on a line by itself.
  - The equation content must be written on a separate line.
- Ordered or unordered lists may be used exclusively to outline the high-level or overall workflow.
  Lists must not be used to describe or enumerate individual steps in place of explanatory paragraphs.
  The use of ordered or unordered lists must not be excessive and must not replace continuous prose.
  Each individual step requires a full paragraph of complete, coherent, and detailed descriptive explanation; bullet-point-only or bullet-dominated descriptions are prohibited.
- Section titles must be concise, objective statements summarizing the section content.
  The use of colons, metaphors, or rhetorical expressions in titles is prohibited.

The agent must strictly follow all requirements above.
