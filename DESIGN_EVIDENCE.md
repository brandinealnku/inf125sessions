# ShowRunner Design Evidence Registry

## V0.10.2 Design Foundations

This registry separates standards-backed decisions from ShowRunner-specific hypotheses that require user testing.

| Decision | Rule | Confidence | Validation |
| --- | --- | --- | --- |
| Normal text contrast | >= 4.5:1 | Very high | WCAG 2.2 |
| Large display text contrast | >= 3:1; target higher for projection | Very high | WCAG 2.2 + classroom conditions |
| Interactive/non-text contrast | >= 3:1 | Very high | WCAG 2.2 |
| Text resizing | Support 200% | Very high | WCAG 2.2 |
| Student touch targets | >=44px floor; 52–64px preferred core-action hypothesis | High | Platform guidance + student test |
| Student body/instruction | 17–19px starting range | High | Platform guidance |
| Sustained prose | <=70ch provisional | High | Readability research |
| Color-only meaning | Prohibited | Very high | Accessibility standards |
| Reduced motion | Mandatory alternative | Very high | Accessibility standards |
| Room sizing | Use semantic projected-viewing scale; validate in real classrooms | Very high principle / provisional values | AVIXA + distance test |
| Room density | One essential idea/state at a time | High | Multimedia learning/coherence |
| Reveal emphasis | Signal the changed/essential information | High | Multimedia learning/signaling |
| Tiny uppercase | Short state labels only | Medium-high | UI typography/readability evidence |
| Exact animation durations | Not determined | Pending | Classroom testing |
| Exact serif/sans choice | Not determined | Pending | Comparative testing |
| Dark vs light Builder | Not determined | Pending | Instructor testing |
| Exact Room type scale | Not determined | Pending | Room Distance Test |

## Semantic typography

Tokens describe the human task rather than arbitrary size: Student (prompt, instruction, choice, support), Showrunner (now, cue, support, status), Room (hero, support, result, label), and Builder (title, section, body, label).

## Research gate

Do not convert an aesthetic preference into a permanent design primitive without recording evidence. Each meaningful design PR should state: Decision, Evidence, Confidence, and whether user testing is required.

## Phase 2 studies

1. Room Distance Test: 20–30 students in real classroom seats; measure comprehension accuracy and response time across projected typography, contrast, density, and emphasis variants.
2. Showrunner 5-Second Test: 5–8 instructors; measure recall of what to do now, what students are doing, what to watch for, and what happens next.
3. Student Thumb Test: 10–15 students with divided attention; measure completion time, mis-taps, and eyes-down time.
4. Builder First-Use Test: 5 unfamiliar instructors; ask them to create a 20-minute experience without coaching; measure completion, hesitation, terminology confusion, backtracking, rehearsal, and launch success.

## Product metrics to establish

- Eyes-down time for basic student interactions (measure baseline before setting target).
- Showrunner glance comprehension.
- Back-row Room comprehension accuracy.
- Time to first coherent teaching experience in Builder.
