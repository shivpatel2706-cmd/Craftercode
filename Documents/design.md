# METROVERIFY 360 

## Mission
Create implementation-ready, token-driven UI guidance for METROVERIFY 360 ithat is optimized for consistency, accessibility, and fast delivery across marketing site.

## Brand
- Product/brand: METROVERIFY 360 i
- URL: localhost:5000
- Audience: buyers, teams, and decision-makers
- Product surface: marketing site

## Style Foundations
- Visual style: clean, functional, implementation-oriented
- Main font style: `font.family.primary=Inter`, `font.family.stack=Inter, METROVERIFY 360 i Unicode Support Noto, sans-serif`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=24px`
- Typography scale: `font.size.xs=12px`, `font.size.sm=14px`, `font.size.md=16px`, `font.size.lg=18px`, `font.size.xl=20px`, `font.size.2xl=24px`, `font.size.3xl=64px`, `font.size.4xl=76px`
- Color palette: `color.text.primary=#E2E2DA`, `color.surface.muted=#2A2A35`, `color.text.tertiary=#B98391`, `color.text.inverse=#E2E2DA`, `color.surface.base=#2A2A35`, `color.surface.raised=#B98391`, `color.surface.strong=#E2E2DA`
- Spacing scale: `space.1=4px`, `space.2=6px`, `space.3=8px`, `space.4=12px`, `space.5=16px`, `space.6=18px`, `space.7=20px`, `space.8=24px`
- Radius/shadow/motion tokens: `radius.xs=4.8px`, `radius.sm=6.4px`, `radius.md=8px`, `radius.lg=11px`, `radius.xl=12px` | `motion.duration.instant=100ms`, `motion.duration.fast=150ms`, `motion.duration.normal=200ms`, `motion.duration.slow=400ms`


## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (141), cards (49), lists (15), buttons (10), navigation (1).

- Extraction diagnostics: Audience and product surface inference confidence is low; verify generated brand context.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
