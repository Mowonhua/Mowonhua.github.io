---
title: "文献阅读与学术化总结 Prompt"
description: ""
pubDate: 2026-01-01 16:25
tags:
  - "prompt"
---

The agent must complete the task in two strictly separated stages:  
Stage 1 (Structured Understanding and Structural Mapping) followed by Stage 2 (Academic Writing).

The two-stage structure is an internal execution requirement only.  
The agent must not mention, label, or expose the stages in the final output.

The final output must consist exclusively of the completed Markdown article.  
Any meta-information, reasoning process, stage markers, analytical notes, or execution details are strictly prohibited in the output.

The output must begin directly with the first Markdown section title.  
No introductory or transitional text is allowed before the article content.


## Stage 1: Structured Understanding and Structural Mapping

In this stage, the agent must analyze and internalize the core contribution of the given academic paper.

The goal of this stage is **conceptual comprehension, logical decomposition, and structural alignment**, not polished writing.

### 1. Identify the Paper Type

The agent must first determine the primary contribution type of the paper, choosing **exactly one** of the following categories:

- Architecture-oriented paper  
- Algorithm-oriented paper  
- Protocol- or mechanism-oriented paper  
- Survey- or review-oriented paper  

This classification is for internal use only and must not appear explicitly in the final output.

### 2. Structured Technical Understanding

Based on the identified paper type, the agent must construct a structured internal representation that includes:

- The overall research objective and problem setting.
- The core idea and fundamental principles underlying the contribution.
- A logically ordered decomposition of the contribution into major components, phases, or conceptual blocks.
- For all mathematical formulas:
  - The purpose of each formula within the overall method, protocol, or framework.
  - The precise meaning of every variable, parameter, and symbol.
- The logical dependencies and information flow between components, steps, or phases.

### 3. Structural Mapping to Academic Exposition

The agent must internally map the structured understanding above to a **discipline-appropriate exposition structure** corresponding to the identified paper type.

This mapping must ensure that:
- Each major conceptual component identified above can be placed naturally into a specific section or subsection.
- The exposition follows a clear progression (e.g., from problem definition to design rationale, or from high-level architecture to concrete implementation).
- No section in the final article will require introducing new technical content not already covered in this stage.

No Markdown article formatting is required in this stage.  
The agent must not attempt to write the final article in this stage.


## Stage 2: Academic Writing

In this stage, the agent must transform the structured understanding and structural mapping from Stage 1 into a complete academic-style explanation.

The agent must strictly base the writing on the content established in Stage 1 and must not introduce new technical interpretations or assumptions.

The output must be a complete and well-structured Markdown article written in Chinese, explaining the paper’s core contribution, underlying principles, and procedural or structural details.

### Section Structure Adaptation by Paper Type

The agent must automatically select and apply the appropriate section structure based on the paper type identified in Stage 1, following the conventions below.

### Architecture-oriented papers 

For papers whose core contribution is a system architecture, framework design, network architecture, or security architecture, the output must be organized to emphasize hierarchical structure, component roles, and the transition from conceptual design to concrete realization, and must follow the section logic below:

- **Overview**  
  A concise, objective description of the overall problem setting, design goals, and high-level architectural idea.

- **Overall Architecture Design**
  A systematic description of the overall system structure, including major components, their responsibilities, and the interactions or data/control flow among them.

- **Principles of Subcomponents**  
  Detailed explanations of the underlying principles, mechanisms, or algorithms of each major architectural component or module.

- **Implementation of the Proposed Architecture**  
  A systematic and concrete description of how the architecture is realized, including implementation choices, module integration, and execution flow.

Sections must reflect a top-down progression from conceptual design to concrete realization.


### Algorithm-oriented papers  

For papers whose core contribution is a novel algorithm, optimization method, or computational procedure, the exposition must emphasize formal reasoning and operational clarity and follow this order:

- **Problem Formulation and Assumptions**  
  Precisely define the problem, including inputs, outputs, constraints, assumptions, and notation.

- **Theoretical Foundations or Design Rationale**  
  Explain the principles, theoretical insights, or motivations that justify the algorithmic design.

- **Algorithm Design**  
  Describe the algorithm from initialization to termination in a logically ordered manner.  
  Lists may only outline the global workflow; each step must be explained in full descriptive prose.  
  Mathematical operations, update rules, or decision conditions must be explicitly derived or justified.

- **Algorithm Execution and Properties**  
  Explain runtime behavior, intermediate states, and control flow, and discuss properties such as correctness, convergence, complexity, or stability when applicable.

The exposition must progress from formal definition → conceptual justification → procedural construction → operational behavior.


### Protocol- or mechanism-oriented papers  

For papers whose core contribution is a protocol, system mechanism, or interaction process, the exposition must emphasize interaction logic, state evolution, and correctness guarantees:

- **Design Goals and Threat or System Model**  
  Clearly state objectives, operational environment, entities, roles, and trust assumptions.

- **Design Rationale and Core Mechanisms**  
  Explain the fundamental ideas and mechanisms enabling the protocol or system to achieve its goals, with justification of key design choices.

- **Protocol or Mechanism Workflow**  
  Describe the protocol as an ordered sequence of interactions, phases, or state transitions.  
  Lists may only outline the global workflow; each phase must be explained in detailed prose, including messages, signals, and state changes.

- **Correctness, Security, or Performance Properties**  
  Explain how and why the protocol satisfies its intended properties, grounded in the described workflow and mechanisms.

The exposition must progress from design intent → enabling mechanisms → interaction process → property justification.


### Survey- or review-oriented papers  

For papers whose primary contribution is a survey, review, or taxonomy, the exposition must emphasize coverage, classification logic, and comparison:

- **Scope Definition and Review Methodology**  
  Define the scope, time span, inclusion/exclusion criteria, and literature collection methodology.

- **Classification Framework or Taxonomy**  
  Present and justify the organizing framework used to structure the survey.

- **Category-wise Technical Analysis**  
  Systematically explain representative approaches and technical characteristics within each category.

- **Comparative Discussion and Synthesis**  
  Compare categories or representative works along well-defined technical dimensions and identify common patterns and trade-offs.

- **Open Challenges and Research Directions**  
  Summarize unresolved issues, gaps, and future research directions grounded in the preceding analysis.

The exposition must progress from scope definition → structural classification → detailed analysis → cross-category synthesis → forward-looking assessment.

### Global Writing Constraints

After determining and applying the appropriate section structure, the agent must ensure that the explanation adheres to all of the following constraints:

- Use formal, objective, precise, descriptive, and explanatory academic language.
- Avoid subjective opinions, metaphors, or rhetorical expressions.
- The article must not include an overall title.
- The output must not contain any level-1 Markdown headers (`#`).  
  All section headers must start from level-2 (`##`) and below.
- Section titles must be concise, objective summaries of content.
  Colons, metaphors, or rhetorical expressions in titles are prohibited.
- The article must begin with a concise introductory paragraph written in plain text (not a header), in the form:  
  “《title of paper》XXX（选择合适的动词）……”.
- When mathematical formulas are involved, explanations must be tightly integrated with the formulas, clearly defining all variables and parameters.
- All display equations must follow strict LaTeX formatting rules:
  - The delimiter `$$` must appear on a line by itself.
  - The equation content must be written on a separate line.
- Ordered or unordered lists may be used **only** to outline the high-level workflow.
  Lists must not replace explanatory prose.
  Each step requires a complete, coherent paragraph of detailed explanation.

The agent must strictly follow all requirements above.
