# Enterprise UI qualification — 2026-10-15

The Enterprise lessons now reveal a conversation on a naturally scrolling page.
Earlier messages, illustrations, practice notes and question feedback stay available.
The action bar remains at the bottom of the viewport while reading. Completion still
waits for server acknowledgement; re-reading does not submit completion again.

Team panels have 28 px separation on desktop and 24 px on mobile. Mobile navigation
links have a minimum height of 44 px. Mémo appearances use brief animations and
respect `prefers-reduced-motion`.

## Verification

- `npm run build`: passed.
- `npm test`: 246 passed.
- Browser: Enterprise lesson at 1280 × 900 and 390 × 844, with fictional organization
  data. Message, image, practice draft, incorrect answer, retry and correct answer
  verified. Conversation history remains present and Continue is unavailable after
  an incorrect answer. No real learning actions, invitations or billing changes.
- Mobile team: 24 px between panels, six navigation links each 44 px high, no
  horizontal overflow.
- Developer lesson: actual `LessonView` with an illustration served after 1.8 seconds.
  The conversation height grew from 1082 to 1245 px; after loading, its scroll
  position reached the bottom (less than 1 px difference). The image, caption and
  enlarge action were visible. The temporary local fixture is not part of the build.

The shared scroll hook observes message size changes and image load events. Wheel,
touch or scrolling keys suspend following until the next conversation turn, so a
late image does not pull readers away from their manual navigation.

## Editorial inspection — image captions and AI terminology

Reviewed the three photographs against their alternative text and captions. The
alternative text now describes visible people and objects; each caption explains
the link to the Aster exercise in plain language and identifies the image as
AI-generated and the situation as fictional. Removed the vague expression
« assistant de brouillons ».

The 22 lessons, retrieval cards, situations and correction explanations now use
« assistant IA ». The introduction explicitly distinguishes this tool used by
Aster employees from Mémo, the learning companion. The offer and pilot brief use
the same terminology. A support employee is named explicitly where « agent » could
have been confused with a software agent. IDs, sources, ordering, assessment keys
and learning outcomes are unchanged. Build and all 246 tests pass after this review.

## In-context definitions and exercise documents

Enterprise lesson prose and situation dossiers offer short definitions for eleven
notions, including context, prompt, RAG and permissions. Dotted underlines open a
definition on mouse hover, focus or tap. Escape and outside interaction dismiss it;
its placement stays inside the screen and follows scrolling. Code and answer labels
remain plain text. Verified keyboard focus, Escape, and a 390 × 844 mobile view
(330 px tooltip entirely within the 375 px available page width).

The first mission and the prompt-writing mission now show the referenced fictional
return policy at the relevant message, with a downloadable text file. The first
mission explicitly states that RET-2026-14 is not supplied as evidence, rather than
implying a missing attachment exists elsewhere. Inspected the other references:
quoted client messages are inline, and challenge dossier files are already rendered.
Stable learning IDs and answers are retained. Tests verify document/step references,
downloaded content equality, word boundaries and preservation of the original text.
Build and 249 tests pass.
