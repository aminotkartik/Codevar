/* ==========================================================================
   projects.js — the seeded RE archive
   12 fictional, deterministically-authored projects. Everything the UI shows
   originates from this single source. These are demo fixtures, not real
   repositories or real people.
   ========================================================================== */

export const SEED_PROJECTS = [
  {
    id: 'RE-001',
    slug: 'open-orchard',
    title: 'Open Orchard',
    category: 'sustainability',
    stage: 'Working Prototype',
    description:
      'A lightweight neighbourhood garden planner. The planting calendar and plot layout are working; collaborative planning never got started.',
    summary:
      'Open Orchard started as a way to stop neighbours repeating the same planting mistakes. A calendar, a plot grid and a small seed library are already built and genuinely usable — what stopped it was the part where gardens are shared, which is the part that matters most.',
    story: [
      'Mara Whitfield began Open Orchard after her second attempt at a community plot ended in overgrown rows and a spreadsheet nobody updated. The idea was never another gardening app with photographs of tomatoes. It was a small, boring, dependable tool that answers two questions: what should be in the ground this month, and what did we agree to plant last time?',
      'The prototype runs entirely in the browser against a bundled fixture of planting data. A plot grid lets you lay out beds, drag a plant onto a square, and watch the calendar tell you when it needs water or when it has bolted. Everything works on one screen. Nothing syncs, because nobody built the sync yet.',
      'The half that is missing is the half that turns a useful calculator into something a street actually uses: several neighbours editing the same plot, a way to hand a bed over when someone moves, and a mobile layout that works while your hands are dirty.',
    ],
    reasonPaused:
      'The creator took a secondment abroad in March and could not continue. She left a working prototype, a data fixture and a short note asking for someone to pick up the collaborative planning rather than rewrite the app.',
    existingWork: [
      {
        title: 'Planting calendar with a fixture dataset',
        detail: 'Four seasons, thirty-two crops, frost-date presets for three climate bands.',
        status: 'Working',
        kind: 'prototype',
      },
      {
        title: 'Interactive plot grid',
        detail: 'Drag-and-drop bed layout with soil-type and rotation warnings.',
        status: 'Working',
        kind: 'prototype',
      },
      {
        title: 'Seed library and crop rotation rules',
        detail: 'Companion-planting flags and a three-year rotation checker.',
        status: 'Partial',
        kind: 'model',
      },
      {
        title: 'Design tokens and component sketches',
        detail: 'A documented set of spacing, colour and type tokens for the app shell.',
        status: 'Complete',
        kind: 'design',
      },
    ],
    missingWork: [
      {
        title: 'Replace the single-user fixture with a shared data layer',
        detail:
          'The current prototype reads a bundled JSON file. Before anything can be collaborative, the data access needs to sit behind a small interface that a real store can implement later.',
        skill: 'Development',
        difficulty: 'Medium',
        status: 'Not started',
      },
      {
        title: 'Design shared plot editing for two or more neighbours',
        detail:
          'Decide how conflicts are resolved when two people edit the same bed. A conflict list is a reasonable starting point; realtime editing is probably overkill for a garden.',
        skill: 'Product Thinking',
        difficulty: 'Hard',
        status: 'Not started',
      },
      {
        title: 'Audit the mobile layout for one-handed bed planning',
        detail:
          'The plot grid assumes a mouse. On a phone the bed toolbar needs to collapse and the drag target needs to be thumb-reachable.',
        skill: 'Accessibility review',
        difficulty: 'Medium',
        status: 'Not started',
      },
    ],
    nextSteps: [
      'Write a short note describing the intended data interface so a new contributor does not have to guess at it.',
      'Reproduce the build locally and confirm the fixture still loads without edits.',
      'Add one deliberately shared-plot interaction and test it with two people at the same table.',
    ],
    techStack: ['React', 'JavaScript', 'CSS'],
    skillsNeeded: ['Frontend development', 'Mobile layout', 'Accessibility review'],
    helpNeeded: ['Development', 'Product Thinking'],
    collaborationTypes: ['contributors', 'coBuilder'],
    openToStewardship: true,
    creator: {
      name: 'Mara Whitfield',
      role: 'Independent developer',
      note: 'Left a working prototype and a note asking for a second pair of hands.',
    },
    updatedAt: '2026-09-04',
    completion: 66,
    handoffChecklist: [
      { label: 'Project purpose documented', met: true },
      { label: 'Current state described', met: true },
      { label: 'Next steps identified', met: true },
      { label: 'Technical context available', met: true },
      { label: 'Known blockers recorded', met: false },
    ],
    fieldNotes: [
      {
        date: '14 MAY 2026',
        text: 'The planting calendar was completed and checked against three regional frost tables.',
      },
      {
        date: '02 JUN 2026',
        text: 'Plot grid rewritten to use a constraint model instead of free dragging.',
      },
      {
        date: '04 SEP 2026',
        text: 'Development paused. Fixture and component notes left in place for the next person.',
      },
    ],
    materials: [
      { label: 'Fixture dataset', detail: '32 crops across four seasons, bundled with the prototype.' },
      { label: 'Component notes', detail: 'Token list and the reasoning behind the plot grid.' },
      { label: 'Frost tables', detail: 'Three climate bands, recorded as demo reference data.' },
    ],
    featured: true,
    priority: 8,
    helpFocus: 'Frontend development',
  },

  {
    id: 'RE-002',
    slug: 'patchwork-atlas',
    title: 'Patchwork Atlas',
    category: 'civic',
    stage: 'Early Prototype',
    description:
      'A community memory map meant to hold oral histories and local stories. Interviews are documented; the map itself is unfinished.',
    summary:
      'Patchwork Atlas tries to make a place hold the stories told about it. Twenty-one interviews have been recorded and transcribed, but the map that was supposed to carry them was never finished, so the recordings sit in a folder waiting for a surface.',
    story: [
      'Patchwork Atlas began with a series of Tuesday evening recording sessions in a library basement. The intent was simple: collect stories from people who had lived in the same streets for forty years, and put them back onto a map anyone could walk with.',
      'What exists today is twenty-one recorded interviews, their transcripts, and a rough sketch of a map interface. The transcripts are the valuable part. They are specific, warm and meticulously indexed by street, year and topic.',
      'What does not exist is the part a map is for. There is no working way to pin a story to a street and hear it while you stand there. That gap is what stopped the project — the research outran the interface, and the people who could build the interface ran out of time.',
    ],
    reasonPaused:
      'The founding team completed the interview phase and ran out of capacity before the map interface could be built. They left the transcripts indexed and ready, which is most of the work.',
    existingWork: [
      {
        title: '21 recorded oral histories with transcripts',
        detail: 'Indexed by street, decade and theme. Transcripts are complete and corrected.',
        status: 'Complete',
        kind: 'research',
      },
      {
        title: 'Story taxonomy',
        detail: 'A four-level classification scheme for indexing place-based stories.',
        status: 'Complete',
        kind: 'research',
      },
      {
        title: 'Map interaction sketch',
        detail: 'Paper mockups of a pin, a transcript overlay and a walking mode.',
        status: 'Partial',
        kind: 'design',
      },
      {
        title: 'Static prototype of the story panel',
        detail: 'A single-screen reader that shows how a transcript might be presented.',
        status: 'Partial',
        kind: 'prototype',
      },
    ],
    missingWork: [
      {
        title: 'Design the map interaction for stories, not for pins',
        detail:
          'A list of pins with labels does not carry a forty-year story. The interaction needs to be built around reading, listening and moving between related stories.',
        skill: 'Research',
        difficulty: 'Hard',
        status: 'Not started',
      },
      {
        title: 'Synthesise the interview findings into a short report',
        detail:
          'Twenty-one interviews contain patterns nobody has written down yet. A two-page synthesis would give a new contributor the context without re-reading everything.',
        skill: 'Research',
        difficulty: 'Medium',
        status: 'In progress',
      },
      {
        title: 'Build the SVG map layer for the pilot area',
        detail:
          'The pilot area is already chosen. The map data is in the prototype folder and needs to be wired to the story store.',
        skill: 'Development',
        difficulty: 'Medium',
        status: 'Not started',
      },
    ],
    nextSteps: [
      'Read the interview synthesis draft that is already half written and finish the last section.',
      'Sketch the walking mode: what happens when you stop moving.',
      'Decide what the pilot area will contain so the map has a real scope.',
    ],
    techStack: ['JavaScript', 'SVG', 'Mapping concepts'],
    skillsNeeded: ['Research', 'Information architecture', 'Map interaction design'],
    helpNeeded: ['Research', 'Design'],
    collaborationTypes: ['contributors', 'coBuilder'],
    openToStewardship: false,
    creator: {
      name: 'The Patchwork Collective',
      role: 'Community research group',
      note: 'A small collective; contact details were never part of the handoff.',
    },
    updatedAt: '2026-08-18',
    completion: 31,
    handoffChecklist: [
      { label: 'Project purpose documented', met: true },
      { label: 'Current state described', met: true },
      { label: 'Next steps identified', met: true },
      { label: 'Technical context available', met: false },
      { label: 'Known blockers recorded', met: false },
    ],
    fieldNotes: [
      {
        date: '09 MAR 2026',
        text: 'First twelve interviews completed and transcribed by volunteers.',
      },
      {
        date: '27 MAY 2026',
        text: 'Story taxonomy settled after three rounds of reorganisation.',
      },
      {
        date: '18 AUG 2026',
        text: 'Project paused before the map layer began. Transcripts left indexed and searchable.',
      },
    ],
    materials: [
      { label: 'Transcript archive', detail: '21 interviews, complete and indexed by street and decade.' },
      { label: 'Taxonomy document', detail: 'The classification scheme used to index every story.' },
      { label: 'Paper mockups', detail: 'Nine sketches of the pin, overlay and walking-mode flows.' },
    ],
    featured: false,
    priority: 7,
    helpFocus: 'Research',
  },

  {
    id: 'RE-003',
    slug: 'loopline',
    title: 'Loopline',
    category: 'design',
    stage: 'Partially Complete',
    description:
      'An accessibility-first transit routing concept exploring low-cognitive-load journey information. Most flows are built; inclusive testing has not happened.',
    summary:
      'Loopline asks a question that sounds small: why is a bus route harder to read than a sentence? Several journey flows are complete and thoughtfully built. What the project has never had is a single person using it who was not already designing it.',
    story: [
      'Loopline began when its creator missed a bus, twice, in the same week, on a route she had taken for years. The stop had two names. The timetable was accurate and completely unhelpful. She started sketching what a route explanation would look like if it were written for a tired person reading it on a phone in the rain.',
      'Several flows are built and are genuinely pleasant to use: a single-page journey view, a way to save a route as a card, and a simplified mode that strips the interface down to the next three decisions.',
      'The part that is missing is the part that would have made it real. Nothing has been tested with a person who navigates a city differently. Nothing has been checked against assistive technology. The flows may be good; nobody knows yet, and the project stopped before anyone found out.',
    ],
    reasonPaused:
      'The creator ran out of capacity to run inclusive usability testing, which they considered essential rather than optional. The interface was left built and untested rather than shipped half-verified.',
    existingWork: [
      {
        title: 'Single-page journey view',
        detail: 'A complete prototype showing every step of a two-transfer journey in one screen.',
        status: 'Complete',
        kind: 'prototype',
      },
      {
        title: 'Simplified decision mode',
        detail: 'Reduces the interface to the next three decisions only. Built and working.',
        status: 'Complete',
        kind: 'prototype',
      },
      {
        title: 'Route card export',
        detail: 'Turns a journey into a shareable card with a large-type variant.',
        status: 'Partial',
        kind: 'prototype',
      },
      {
        title: 'Accessibility audit draft',
        detail: 'A partial list of what needs to be checked, written before testing began.',
        status: 'In progress',
        kind: 'research',
      },
    ],
    missingWork: [
      {
        title: 'Run inclusive usability testing with at least five participants',
        detail:
          'Recruit people who navigate transit with a disability, a cognitive difference, or a language barrier. Record, take notes, and write down what breaks.',
        skill: 'Research',
        difficulty: 'Hard',
        status: 'Not started',
      },
      {
        title: 'Audit keyboard and screen-reader behaviour across all flows',
        detail:
          'Every flow needs to be traversed with a keyboard and with a screen reader before it can be called usable. The draft audit lists the starting points.',
        skill: 'Testing',
        difficulty: 'Medium',
        status: 'Not started',
      },
      {
        title: 'Rework the colour-dependent state indicators',
        detail:
          'Several status changes are conveyed by colour alone. They need redundant text or shape so they survive without sight.',
        skill: 'Design',
        difficulty: 'Medium',
        status: 'Not started',
      },
    ],
    nextSteps: [
      'Finish the accessibility audit draft so a tester knows exactly what to check first.',
      'Recruit five participants and schedule the first three sessions.',
      'Fix the three colour-only indicators identified in the draft audit.',
    ],
    techStack: ['React', 'CSS', 'Design prototypes'],
    skillsNeeded: ['Accessibility', 'Usability research', 'Interaction refinement'],
    helpNeeded: ['Design', 'Testing'],
    collaborationTypes: ['contributors'],
    openToStewardship: true,
    creator: {
      name: 'Idris Kaine',
      role: 'Service designer',
      note: 'Stepped away to focus on a contract that took over completely.',
    },
    updatedAt: '2026-09-11',
    completion: 74,
    handoffChecklist: [
      { label: 'Project purpose documented', met: true },
      { label: 'Current state described', met: true },
      { label: 'Next steps identified', met: true },
      { label: 'Technical context available', met: true },
      { label: 'Known blockers recorded', met: false },
    ],
    fieldNotes: [
      {
        date: '02 JUN 2026',
        text: 'Simplified decision mode completed after the third round of simplification.',
      },
      {
        date: '19 JUL 2026',
        text: 'Audit draft started; colour-only indicators flagged as the first category.',
      },
      {
        date: '11 SEP 2026',
        text: 'Testing phase could not be staffed. Interface left complete and untested.',
      },
    ],
    materials: [
      { label: 'Flow prototypes', detail: 'All three journey flows, interactive and self-contained.' },
      { label: 'Audit draft', detail: 'Partial checklist of accessibility findings to verify.' },
      { label: 'Recruitment note', detail: 'A short note on who the project wanted to test with.' },
    ],
    featured: true,
    priority: 6,
    helpFocus: 'Accessibility design',
  },

  {
    id: 'RE-004',
    slug: 'soft-signal',
    title: 'Soft Signal',
    category: 'design',
    stage: 'Working Prototype',
    description:
      'A calm routine planner built around irregular work schedules. The prototype works; its behavioural design and notification thinking need a rewrite.',
    summary:
      'Soft Signal is a planner that assumes you do not have a normal week. A working prototype handles the mechanics of a routine, but the behaviour around it — what it asks for, when it speaks, what it remembers — was never finished, and that is the part that decides whether a planner is useful or merely loud.',
    story: [
      'Soft Signal began with a complaint rather than an idea: most planners assume a week has five weekdays and a evening that belongs to you. Freelance schedules, shift work and caring responsibilities do not fit that shape, so the planners get abandoned within a month.',
      'The prototype that exists does the mechanical work well. You can define a routine that repeats irregularly, combine two routines into one day, and get a single consolidated view of what is actually expected of you.',
      'What was never designed is the behaviour. When does it notify? What happens when you miss something — does it nag, or does it quietly reschedule? Those decisions were left open because they are hard, and the project stopped in the middle of them.',
    ],
    reasonPaused:
      'The creator reached the part of the project that was mostly judgement rather than code, and did not have the schedule to make those calls carefully. The prototype was left working rather than half-designed.',
    existingWork: [
      {
        title: 'Irregular routine model',
        detail: 'Routines with variable intervals, overlap rules and consolidation into a single day.',
        status: 'Complete',
        kind: 'prototype',
      },
      {
        title: 'Local-only persistence',
        detail: 'Everything is stored in the browser. No account, no server, no data leaving the device.',
        status: 'Complete',
        kind: 'prototype',
      },
      {
        title: 'Notification concept sketches',
        detail: 'Three hand-drawn approaches to interruption that were never built.',
        status: 'Partial',
        kind: 'design',
      },
      {
        title: 'Behavioural design notes',
        detail: 'A notebook of the open questions about tone, timing and failure.',
        status: 'In progress',
        kind: 'research',
      },
    ],
    missingWork: [
      {
        title: 'Rewrite the notification behaviour from first principles',
        detail:
          'Decide what Soft Signal is allowed to interrupt you for, and what it must never interrupt you for. Write the rule down before building it.',
        skill: 'Product Thinking',
        difficulty: 'Hard',
        status: 'Not started',
      },
      {
        title: 'Design the missed-item flow',
        detail:
          'A missed routine needs three possible responses: acknowledge, reschedule, or forget. Designing the difference is the whole job here.',
        skill: 'UX design',
        difficulty: 'Hard',
        status: 'Not started',
      },
      {
        title: 'Prototype a calm notification system and test it',
        detail:
          'Build the smallest version of the rule and put it in front of someone who has already quit three planners.',
        skill: 'User testing',
        difficulty: 'Medium',
        status: 'Not started',
      },
    ],
    nextSteps: [
      'Read the behavioural notes and write down the one rule that governs interruptions.',
      'Pick the missed-item flow before writing any code for it.',
      'Reproduce the prototype locally so a new contributor can experiment without fear of breaking it.',
    ],
    techStack: ['React', 'CSS', 'localStorage'],
    skillsNeeded: ['Product thinking', 'UX design', 'User testing'],
    helpNeeded: ['Product Thinking', 'Design'],
    collaborationTypes: ['contributors', 'coBuilder'],
    openToStewardship: true,
    creator: {
      name: 'Nina Okafor',
      role: 'Interaction designer',
      note: 'Left the behavioural questions open rather than guess at them.',
    },
    updatedAt: '2026-08-27',
    completion: 61,
    handoffChecklist: [
      { label: 'Project purpose documented', met: true },
      { label: 'Current state described', met: true },
      { label: 'Next steps identified', met: false },
      { label: 'Technical context available', met: true },
      { label: 'Known blockers recorded', met: false },
    ],
    fieldNotes: [
      {
        date: '11 APR 2026',
        text: 'Irregular routine model finished and tested against three real shift patterns.',
      },
      {
        date: '30 MAY 2026',
        text: 'Three notification concepts sketched; none of them felt right.',
      },
      {
        date: '27 AUG 2026',
        text: 'Behavioural design paused. Prototype and notes left in place.',
      },
    ],
    materials: [
      { label: 'Working prototype', detail: 'Self-contained, runs locally, no build step required.' },
      { label: 'Behavioural notebook', detail: 'Open questions about tone, timing and failure.' },
      { label: 'Notification sketches', detail: 'Three hand-drawn interruption concepts.' },
    ],
    featured: false,
    priority: 6,
    helpFocus: 'Product design',
  },

  {
    id: 'RE-005',
    slug: 'civic-lens',
    title: 'Civic Lens',
    category: 'civic',
    stage: 'Early Prototype',
    description:
      'A prototype for reporting and tracking neighbourhood maintenance issues. The reporting flow works; the data side is barely started.',
    summary:
      'Civic Lens is a small reporting flow for neighbourhood maintenance problems, built by someone who wanted to stop seeing the same pothole reported three times. The reporting side is finished. The side that would make it worth doing — organising, categorising and showing that an issue was actually handled — is mostly empty.',
    story: [
      'Civic Lens was built by a former council counter clerk who watched people describe the same broken drain three different ways and get sent to three different forms. The reporting flow that exists now replaces all of that with one screen and a photograph.',
      'The prototype captures a report, attaches an image, sends it to a queue, and shows a receipt. That is the whole of what is finished, and it is genuinely well made — the receipt design alone took a month.',
      'What is missing is everything downstream. Issues are not categorised consistently, there is no way to see whether a report was acted on, and the queue is a flat list that grows without shape. The creator stopped at the moment the hard part began.',
    ],
    reasonPaused:
      'The creator moved to a role with no spare capacity and handed over a working prototype plus a list of the remaining work that was deliberately left honest rather than optimistic.',
    existingWork: [
      {
        title: 'Single-screen reporting flow',
        detail: 'One page captures location, category, description and a photograph.',
        status: 'Complete',
        kind: 'prototype',
      },
      {
        title: 'Issue receipt design',
        detail: 'A printable and shareable confirmation with a reference number.',
        status: 'Complete',
        kind: 'prototype',
      },
      {
        title: 'Flat queue prototype',
        detail: 'Reports appear in a list with status and time. No grouping or filtering yet.',
        status: 'Partial',
        kind: 'prototype',
      },
      {
        title: 'Category list draft',
        detail: 'A first attempt at an issue taxonomy, unreviewed and partly overlapping.',
        status: 'In progress',
        kind: 'model',
      },
    ],
    missingWork: [
      {
        title: 'Design a consistent issue taxonomy',
        detail:
          'The current categories overlap and confuse. Settle on a scheme where one problem has one home before anything else is built on top of it.',
        skill: 'UI engineering',
        difficulty: 'Medium',
        status: 'Not started',
      },
      {
        title: 'Build issue categorisation into the reporting flow',
        detail:
          'The taxonomy needs to be offered at capture time, not applied afterwards by whoever happens to be looking at the queue.',
        skill: 'Interaction design',
        difficulty: 'Medium',
        status: 'Not started',
      },
      {
        title: 'Prototype a closed-loop status view',
        detail:
          'A report that has been acted on should be visible as acted on. Even a simple three-state model would change how the tool is used.',
        skill: 'Frontend architecture',
        difficulty: 'Hard',
        status: 'Not started',
      },
    ],
    nextSteps: [
      'Finish the taxonomy draft and get one non-developer to sort a set of sample reports with it.',
      'Add the closed-loop status to the prototype, even as a static model.',
      'Write down the local setup steps so a new contributor can run it in ten minutes.',
    ],
    techStack: ['React', 'JavaScript', 'CSS'],
    skillsNeeded: ['UI engineering', 'Interaction design', 'Frontend architecture'],
    helpNeeded: ['Development', 'Design'],
    collaborationTypes: ['contributors', 'coBuilder'],
    openToStewardship: true,
    creator: {
      name: 'Daniel Ferreira',
      role: 'Former council counter clerk',
      note: 'Still happy to be asked questions about the reporting flow.',
    },
    updatedAt: '2026-09-02',
    completion: 37,
    handoffChecklist: [
      { label: 'Project purpose documented', met: true },
      { label: 'Current state described', met: true },
      { label: 'Next steps identified', met: true },
      { label: 'Technical context available', met: true },
      { label: 'Known blockers recorded', met: true },
    ],
    fieldNotes: [
      {
        date: '18 FEB 2026',
        text: 'Reporting flow completed after four iterations on the same single screen.',
      },
      {
        date: '22 JUN 2026',
        text: 'Receipt design settled; reference numbers made readable rather than hash-like.',
      },
      {
        date: '02 SEP 2026',
        text: 'Paused at the taxonomy step. Prototype and honest work list left behind.',
      },
    ],
    materials: [
      { label: 'Reporting prototype', detail: 'Self-contained single-screen flow.' },
      { label: 'Taxonomy draft', detail: 'First-attempt issue categories, unreviewed.' },
      { label: 'Handover list', detail: 'The remaining work, written without optimism.' },
    ],
    featured: false,
    priority: 8,
    helpFocus: 'UI engineering',
  },

  {
    id: 'RE-006',
    slug: 'reframe',
    title: 'ReFrame',
    category: 'dev',
    stage: 'Partially Complete',
    description:
      'A browser-based caption editing tool for short-form video. The editor is largely complete; accessibility and playback synchronisation need work.',
    summary:
      'ReFrame puts captions on short video by letting you edit text against the playback directly in the browser. The editor is mostly built and feels good to use. What remains is the part where captions have to line up with the audio exactly, and the part where someone who cannot hear the video can still use the tool.',
    story: [
      'ReFrame began as a personal necessity. Its creator makes short videos and found that every caption tool assumed a desktop, a timeline and a long form. Short vertical video needed something smaller: text you can nudge against the audio without a sequencer.',
      'The editor is largely complete. You can load a video, type captions against the audio, adjust the timing of a caption inline, and export a subtitle file. The interaction model is the work — dragging a caption boundary to where the word is actually spoken.',
      'Two things were never finished. The playback synchronisation drifts on longer clips, and the editor has never been checked with a screen reader or a keyboard alone. Both are quiet problems that nobody notices until someone depends on them.',
    ],
    reasonPaused:
      'The creator ran out of time to finish the synchronisation work and could not justify shipping an accessibility-untested editor. The code was left in a usable state with the remaining work listed.',
    existingWork: [
      {
        title: 'Caption editor against video playback',
        detail: 'Inline text editing synced to the current playback position.',
        status: 'Complete',
        kind: 'prototype',
      },
      {
        title: 'Inline timing adjustment',
        detail: 'Dragging a caption boundary changes its in and out point.',
        status: 'Complete',
        kind: 'prototype',
      },
      {
        title: 'Subtitle export',
        detail: 'Produces a standard subtitle file from the edited captions.',
        status: 'Complete',
        kind: 'prototype',
      },
      {
        title: 'Accessibility pass',
        detail: 'Started and abandoned. The keyboard map exists in a comment.',
        status: 'In progress',
        kind: 'code',
      },
    ],
    missingWork: [
      {
        title: 'Fix playback synchronisation drift on longer clips',
        detail:
          'Timing drifts on clips over two minutes. The cause is likely the frame-stepping approach; it needs measurement before it needs rewriting.',
        skill: 'Testing and integration',
        difficulty: 'Hard',
        status: 'Not started',
      },
      {
        title: 'Implement the keyboard map for caption editing',
        detail:
          'The keyboard map is already sketched in a comment. It needs to be written properly and tested against the editor flow.',
        skill: 'Accessibility',
        difficulty: 'Medium',
        status: 'Not started',
      },
      {
        title: 'Make the editor usable with a screen reader',
        detail:
          'The timeline is currently a canvas with no semantics. It needs a live region describing the caption under the cursor.',
        skill: 'Testing',
        difficulty: 'Hard',
        status: 'Not started',
      },
    ],
    nextSteps: [
      'Reproduce the drift with a three-minute clip and note the error at each minute mark.',
      'Turn the keyboard map comment into working code and walk through it once.',
      'Write a short guide explaining how to run the editor from the existing folder.',
    ],
    techStack: ['JavaScript', 'HTML', 'CSS'],
    skillsNeeded: ['Testing', 'Accessibility', 'Editor interaction improvements'],
    helpNeeded: ['Testing', 'Development'],
    collaborationTypes: ['contributors', 'coBuilder'],
    openToStewardship: true,
    creator: {
      name: 'Yuki Tanaka',
      role: 'Video maker and tinkerer',
      note: 'Left the editor in a state a stranger can pick up.',
    },
    updatedAt: '2026-09-15',
    completion: 77,
    handoffChecklist: [
      { label: 'Project purpose documented', met: true },
      { label: 'Current state described', met: true },
      { label: 'Next steps identified', met: true },
      { label: 'Technical context available', met: true },
      { label: 'Known blockers recorded', met: true },
    ],
    fieldNotes: [
      {
        date: '20 MAY 2026',
        text: 'Editor interaction model settled after testing with three other video makers.',
      },
      {
        date: '08 JUL 2026',
        text: 'Subtitle export written; verified against three clips of different lengths.',
      },
      {
        date: '15 SEP 2026',
        text: 'Synchronisation drift confirmed but not diagnosed. Editor left usable.',
      },
    ],
    materials: [
      { label: 'Editor build', detail: 'Self-contained, runs by opening the folder.' },
      { label: 'Keyboard map note', detail: 'A comment in the source describing the intended key bindings.' },
      { label: 'Drift notes', detail: 'Observations of the timing error on longer clips.' },
    ],
    featured: true,
    priority: 5,
    helpFocus: 'Testing and integration',
  },

  {
    id: 'RE-007',
    slug: 'spare-parts',
    title: 'Spare Parts',
    category: 'sustainability',
    stage: 'Idea / Research',
    description:
      'A community repair guide directory for consumer electronics. Research and content sketches exist; implementation has barely begun.',
    summary:
      'Spare Parts wants to make repair knowledge findable the way spare parts themselves once were — by community, by hand, by the person who happens to know. There is real research and a folder of content sketches. There is not yet a single working page, and that is exactly the honest state of an idea that is still finding its shape.',
    story: [
      'Spare Parts began as a frustrated search. Its creator wanted to repair a small appliance and discovered that the knowledge to do it exists, scattered across forums, video transcripts and manuals that were never indexed. The repair was possible; finding out how was not.',
      'What exists is research: a survey of where repair knowledge currently lives, a set of interviews with people who repair things, and a folder of content sketches describing how a guide should read. The sketches are the most useful thing in the project — they describe a repair guide as a sequence of decisions rather than a list of steps.',
      'What does not exist is anything a person could use. There is no interface, no data model and no build. The project is at the stage where the idea has been thought through and the first real implementation is still to be made.',
    ],
    reasonPaused:
      'The research phase ran longer than expected and the implementation never started. The creator left the research indexed and the sketches intact so the next person could build rather than re-research.',
    existingWork: [
      {
        title: 'Repair knowledge landscape survey',
        detail: 'Where the knowledge lives today, and why it is hard to find.',
        status: 'Complete',
        kind: 'research',
      },
      {
        title: 'Nine interviews with repairers',
        detail: 'Transcripts and notes on how guides are actually followed.',
        status: 'Complete',
        kind: 'research',
      },
      {
        title: 'Guide structure sketches',
        detail: 'A guide as a sequence of decisions, with the parts that need to be verified marked.',
        status: 'Partial',
        kind: 'design',
      },
      {
        title: 'First data model draft',
        detail: 'A rough shape for a guide, a step and a verified step.',
        status: 'Not started',
        kind: 'model',
      },
    ],
    missingWork: [
      {
        title: 'Write the structured content model for a repair guide',
        detail:
          'The sketches describe a guide as decisions, not steps. Turn that into a data shape that can hold a guide and still be searched.',
        skill: 'Documentation',
        difficulty: 'Medium',
        status: 'Not started',
      },
      {
        title: 'Author one complete guide as the reference example',
        detail:
          'A single finished guide, written to the standard the sketches describe. It will be the template for everything else.',
        skill: 'Structured content',
        difficulty: 'Medium',
        status: 'Not started',
      },
      {
        title: 'Design the interface architecture for browsing by device',
        detail:
          'People search repair knowledge by object, not by topic. The interface needs to reflect that.',
        skill: 'Interface architecture',
        difficulty: 'Hard',
        status: 'Not started',
      },
    ],
    nextSteps: [
      'Turn the guide structure sketches into a written content model.',
      'Write one complete guide end to end and learn what is missing from the model.',
      'Sketch the browse-by-device flow before any code is written.',
    ],
    techStack: ['HTML', 'CSS', 'JavaScript'],
    skillsNeeded: ['Documentation', 'Structured content', 'Interface architecture'],
    helpNeeded: ['Documentation', 'Design'],
    collaborationTypes: ['contributors', 'coBuilder'],
    openToStewardship: true,
    creator: {
      name: 'Priya Raman',
      role: 'Community organiser',
      note: 'Still around, and happy to talk through the research with a builder.',
    },
    updatedAt: '2026-07-21',
    completion: 13,
    handoffChecklist: [
      { label: 'Project purpose documented', met: true },
      { label: 'Current state described', met: true },
      { label: 'Next steps identified', met: false },
      { label: 'Technical context available', met: false },
      { label: 'Known blockers recorded', met: false },
    ],
    fieldNotes: [
      {
        date: '03 MAR 2026',
        text: 'Survey completed: twelve sources of repair knowledge, none of them indexed.',
      },
      {
        date: '28 MAY 2026',
        text: 'Guide structure sketches written; the decision-first approach settled.',
      },
      {
        date: '21 JUL 2026',
        text: 'Research phase closed. Implementation not started.',
      },
    ],
    materials: [
      { label: 'Research survey', detail: 'The landscape of repair knowledge and why it is fragmented.' },
      { label: 'Interview transcripts', detail: 'Nine conversations with people who repair things.' },
      { label: 'Content sketches', detail: 'The decision-first guide structure, with open questions marked.' },
    ],
    featured: false,
    priority: 4,
    helpFocus: 'Documentation',
  },

  {
    id: 'RE-008',
    slug: 'small-hours',
    title: 'Small Hours',
    category: 'research',
    stage: 'Early Prototype',
    description:
      'A collaborative night-sky observation journal. Data models and visual explorations exist; the observation dashboard is unfinished.',
    summary:
      'Small Hours is a journal for people who watch the sky between midnight and dawn. The data model is settled and there are early visual explorations, but the dashboard that would let a contributor actually record and compare an observation was never built.',
    story: [
      'Small Hours began when its creator realised that the night sky is watched by many people who never talk to each other, and that their observations would be valuable if they could be compared. The idea was a journal with a strong data model and a calm interface.',
      'What exists is the model: what an observation is, what conditions matter, what you might have seen, and how to record uncertainty honestly. There are also early visual explorations of what a dashboard of observations might look like — small prototypes of a sky map, a conditions plot and a comparison view.',
      'What does not exist is the dashboard itself. The model is there, the sketches are there, and the interface that would join them was never built. It is a project that stopped at the seam between design and implementation.',
    ],
    reasonPaused:
      'The visual explorations took longer than planned and the dashboard implementation never started. The model and sketches were left in good shape for a new contributor.',
    existingWork: [
      {
        title: 'Observation data model',
        detail: 'Fields for time, conditions, location, target, and an honest uncertainty note.',
        status: 'Complete',
        kind: 'model',
      },
      {
        title: 'Sky map exploration',
        detail: 'An SVG prototype showing observations plotted against the horizon.',
        status: 'Partial',
        kind: 'prototype',
      },
      {
        title: 'Conditions plot prototype',
        detail: 'A small chart sketching transparency, turbulence and humidity over a night.',
        status: 'Partial',
        kind: 'prototype',
      },
      {
        title: 'Comparison view sketch',
        detail: 'A hand-drawn idea for comparing two nights side by side.',
        status: 'Partial',
        kind: 'design',
      },
    ],
    missingWork: [
      {
        title: 'Build the observation dashboard from the existing model',
        detail:
          'The model is settled; the interface is not. A working dashboard is the single largest piece of missing work in the project.',
        skill: 'Data visualisation',
        difficulty: 'Hard',
        status: 'Not started',
      },
      {
        title: 'Design the observation entry flow for phone use in the dark',
        detail:
          'Observations are recorded outside, at night, often cold. The entry flow has to work one-handed with poor light and no reason to look at the screen.',
        skill: 'Interface design',
        difficulty: 'Medium',
        status: 'Not started',
      },
      {
        title: 'Write documentation for the data model',
        detail:
          'The model is understandable to its creator. A written explanation would make it usable by someone who was not there for the decisions.',
        skill: 'Documentation',
        difficulty: 'Easy',
        status: 'Not started',
      },
    ],
    nextSteps: [
      'Write the data model documentation before building anything on top of it.',
      'Prototype the observation entry flow on a phone in low light.',
      'Build the smallest version of the dashboard that shows one observation and one comparison.',
    ],
    techStack: ['JavaScript', 'SVG', 'CSS'],
    skillsNeeded: ['Data visualisation', 'Interface design', 'Documentation'],
    helpNeeded: ['Development', 'Design'],
    collaborationTypes: ['contributors'],
    openToStewardship: false,
    creator: {
      name: 'Eleanor Voss',
      role: 'Amateur astronomer and researcher',
      note: 'Would welcome help most of all from someone who builds things quickly.',
    },
    updatedAt: '2026-08-05',
    completion: 29,
    handoffChecklist: [
      { label: 'Project purpose documented', met: true },
      { label: 'Current state described', met: true },
      { label: 'Next steps identified', met: false },
      { label: 'Technical context available', met: false },
      { label: 'Known blockers recorded', met: false },
    ],
    fieldNotes: [
      {
        date: '19 JAN 2026',
        text: 'Observation data model settled after rejecting the first two attempts.',
      },
      {
        date: '04 MAY 2026',
        text: 'Sky map and conditions plot prototypes completed.',
      },
      {
        date: '05 AUG 2026',
        text: 'Dashboard implementation not started. Model and sketches left indexed.',
      },
    ],
    materials: [
      { label: 'Data model', detail: 'The settled field set for a recorded observation.' },
      { label: 'Visual explorations', detail: 'Three small prototypes of the dashboard views.' },
      { label: 'Comparison sketch', detail: 'A hand-drawn two-night comparison layout.' },
    ],
    featured: false,
    priority: 5,
    helpFocus: 'Data visualization',
  },

  {
    id: 'RE-009',
    slug: 'pantry-relay',
    title: 'Pantry Relay',
    category: 'civic',
    stage: 'Working Prototype',
    description:
      'A lightweight concept for coordinating surplus food distribution within a neighbourhood. Basic scheduling works; edge cases around real sharing have not been tested.',
    summary:
      'Pantry Relay is a small scheduling tool for sharing surplus food between neighbours. The scheduling works and has been used for real, small-scale exchanges. What has never been addressed is the operational reality — what happens when the person who offered is not home, or when a pickup goes unclaimed.',
    story: [
      'Pantry Relay started when its creator realised that the neighbours with surplus and the neighbours who could use it were usually on the same street and simply had no way of knowing. The idea was a relay: a surplus is offered, a slot is reserved, and the food moves between two doorsteps.',
      'The scheduling is complete and has actually been used — several rounds of real exchanges between a handful of households. It handles offering, reserving and confirming a pickup, and it does so with a deliberately small interface.',
      'What the prototype has never dealt with is the part that goes wrong. A reserved slot nobody collects. An offer withdrawn late. A neighbour who is not on the messaging platform everyone else uses. The flows handle the happy path well and the awkward path not at all.',
    ],
    reasonPaused:
      'The creator could not continue without running real operational tests, and had no capacity to run them. The prototype was left working for the happy path with the awkward cases written down.',
    existingWork: [
      {
        title: 'Offering and reserving flow',
        detail: 'A surplus is offered, a slot is reserved, and the exchange is confirmed.',
        status: 'Complete',
        kind: 'prototype',
      },
      {
        title: 'Neighbourhood slot calendar',
        detail: 'A weekly grid showing what is offered and what is reserved.',
        status: 'Complete',
        kind: 'prototype',
      },
      {
        title: 'Real exchange records',
        detail: 'Several documented rounds of exchange between households, used to shape the flows.',
        status: 'Complete',
        kind: 'research',
      },
      {
        title: 'Edge case notes',
        detail: 'A list of what goes wrong, written from the exchange records.',
        status: 'Partial',
        kind: 'research',
      },
    ],
    missingWork: [
      {
        title: 'Run UX research on unclaimed pickups',
        detail:
          'Interview the people who offered and the people who reserved to find out what actually happens when a pickup fails.',
        skill: 'UX research',
        difficulty: 'Medium',
        status: 'Not started',
      },
      {
        title: 'Design the handling for an unclaimed pickup',
        detail:
          'What happens to the food, to the offerer and to the relationship? This needs a decision, not a feature.',
        skill: 'UX design',
        difficulty: 'Hard',
        status: 'Not started',
      },
      {
        title: 'Improve the mobile interaction for one-handed use',
        detail:
          'Most reservations happen at a doorstep with one hand free. The current targets are too small and too far apart.',
        skill: 'Mobile interaction improvements',
        difficulty: 'Medium',
        status: 'Not started',
      },
    ],
    nextSteps: [
      'Interview three people from the recorded exchanges about what went wrong.',
      'Sketch the unclaimed pickup flow before touching the code.',
      'Increase the touch targets on the reserve screen and test the change.',
    ],
    techStack: ['React', 'JavaScript', 'CSS'],
    skillsNeeded: ['UX research', 'Mobile interaction improvements', 'Workflow refinement'],
    helpNeeded: ['Research', 'Product Thinking'],
    collaborationTypes: ['contributors', 'coBuilder'],
    openToStewardship: true,
    creator: {
      name: 'Asha Bello',
      role: 'Neighbourhood coordinator',
      note: 'Stayed on as the person who knows which households were involved.',
    },
    updatedAt: '2026-09-08',
    completion: 57,
    handoffChecklist: [
      { label: 'Project purpose documented', met: true },
      { label: 'Current state described', met: true },
      { label: 'Next steps identified', met: true },
      { label: 'Technical context available', met: true },
      { label: 'Known blockers recorded', met: false },
    ],
    fieldNotes: [
      {
        date: '06 APR 2026',
        text: 'First real exchange completed between three households on one street.',
      },
      {
        date: '14 JUL 2026',
        text: 'Edge case notes started after two unclaimed pickups in one week.',
      },
      {
        date: '08 SEP 2026',
        text: 'Operational testing could not continue. Prototype left working for the happy path.',
      },
    ],
    materials: [
      { label: 'Scheduling prototype', detail: 'Self-contained, runs locally with sample neighbourhood data.' },
      { label: 'Exchange records', detail: 'Several documented rounds of real sharing.' },
      { label: 'Edge case notes', detail: 'The awkward cases, written down from experience.' },
    ],
    featured: false,
    priority: 6,
    helpFocus: 'UX research',
  },

  {
    id: 'RE-010',
    slug: 'type-trail',
    title: 'Type Trail',
    category: 'education',
    stage: 'Partially Complete',
    description:
      'An interactive learning kit exploring regional scripts and typography. Several lessons work; the visual system is unfinished.',
    summary:
      'Type Trail is a learning kit about the scripts written in a single region, built to be explored rather than taught. Lessons and a working interaction model exist, but the visual system that would make it feel like one thing rather than five separate pages has never been completed.',
    story: [
      'Type Trail began as an answer to a specific frustration: typography is taught as a set of rules, and the people who care about it most usually started by copying letters as children. The kit tries to start from the hand and work back to the rules.',
      'Several lessons are complete and the interaction model works — a learner traces a letter, gets immediate feedback on the shape, and moves through a sequence at their own pace. The lesson content was reviewed by two people who teach the subject.',
      'What is missing is the visual system. The lessons were built one at a time by different people at different times, and they do not look like they belong together. The typefaces were chosen independently for each lesson and the layout has no shared rhythm.',
    ],
    reasonPaused:
      'The content phase completed but the visual consolidation never happened. The creator left the lessons working and listed the visual work that remained.',
    existingWork: [
      {
        title: 'Four complete lessons',
        detail: 'Written, reviewed and working in the prototype.',
        status: 'Complete',
        kind: 'prototype',
      },
      {
        title: 'Tracing interaction model',
        detail: 'Letter-by-letter tracing with immediate shape feedback.',
        status: 'Complete',
        kind: 'prototype',
      },
      {
        title: 'Lesson content review notes',
        detail: 'Corrections and suggestions from two reviewers in the field.',
        status: 'Complete',
        kind: 'research',
      },
      {
        title: 'Visual system',
        detail: 'Started and incomplete. No shared type or layout rules yet.',
        status: 'In progress',
        kind: 'design',
      },
    ],
    missingWork: [
      {
        title: 'Define a shared visual system across all lessons',
        detail:
          'Type, spacing, colour and layout rules need to be written down once and applied everywhere. The lessons currently look like separate projects.',
        skill: 'Visual design',
        difficulty: 'Medium',
        status: 'Not started',
      },
      {
        title: 'Reorganise the lesson content into a clear sequence',
        detail:
          'The lessons are complete but not ordered for a learner. A progression from simple to complex needs to be written out.',
        skill: 'Content organisation',
        difficulty: 'Easy',
        status: 'Not started',
      },
      {
        title: 'Polish the tracing interaction for tablet input',
        detail:
          'The tracing model works with a mouse. It needs to be evaluated for touch and for a stylus, where stroke pressure matters.',
        skill: 'Interaction polish',
        difficulty: 'Medium',
        status: 'Not started',
      },
    ],
    nextSteps: [
      'Write the visual system rules before redesigning anything.',
      'Order the four existing lessons into a single progression.',
      'Test the tracing interaction on a tablet and note where it breaks.',
    ],
    techStack: ['React', 'SVG', 'CSS'],
    skillsNeeded: ['Visual design', 'Content organisation', 'Interaction polish'],
    helpNeeded: ['Design', 'Documentation'],
    collaborationTypes: ['contributors', 'coBuilder'],
    openToStewardship: true,
    creator: {
      name: 'Lina Sørensen',
      role: 'Typography educator',
      note: 'Reviewers are still contactable and would welcome a follow-up.',
    },
    updatedAt: '2026-08-24',
    completion: 69,
    handoffChecklist: [
      { label: 'Project purpose documented', met: true },
      { label: 'Current state described', met: true },
      { label: 'Next steps identified', met: true },
      { label: 'Technical context available', met: true },
      { label: 'Known blockers recorded', met: false },
    ],
    fieldNotes: [
      {
        date: '09 FEB 2026',
        text: 'Tracing interaction model completed and tested with a stylus.',
      },
      {
        date: '26 JUN 2026',
        text: 'Fourth lesson written; content review finished.',
      },
      {
        date: '24 AUG 2026',
        text: 'Visual consolidation paused. Lessons left working, style unfinished.',
      },
    ],
    materials: [
      { label: 'Lesson prototypes', detail: 'Four complete lessons, self-contained and runnable.' },
      { label: 'Review notes', detail: 'Corrections from two reviewers in the field.' },
      { label: 'Visual system draft', detail: 'A folder of type and colour experiments, unconsolidated.' },
    ],
    featured: false,
    priority: 5,
    helpFocus: 'Visual design',
  },

  {
    id: 'RE-011',
    slug: 'carbon-counter',
    title: 'Carbon Counter',
    category: 'dev',
    stage: 'Ready for Handoff',
    description:
      'A small browser experiment that estimates and presents website energy use. The implementation is coherent; it needs maintenance and honest framing of the limits.',
    summary:
      'Carbon Counter estimates how much energy a webpage probably uses and shows that number in a way that makes its own uncertainty visible. It is the most finished thing in the archive, and it needs the kind of care that keeps a small, honest tool from quietly becoming wrong.',
    story: [
      'Carbon Counter began as a skeptical experiment. Its creator was annoyed by tools that printed a confident energy figure for a page and hoped the number would make people think about what a website costs. The whole project is built around not pretending to be more certain than it is.',
      'The implementation is complete and readable. It walks the page, makes a set of estimates from the content it finds, and presents the result with the range and the assumptions alongside the number. The code is deliberately small and the comments are unusually good.',
      'What it needs now is maintenance rather than building. The estimation model was written against a set of assumptions that have aged, the documentation describes behaviour that has since changed, and there is no test coverage to catch either.',
    ],
    reasonPaused:
      'The creator handed the project over deliberately, at the point where it needed a maintainer rather than a developer. The code and the honest list of what needs updating were left together.',
    existingWork: [
      {
        title: 'Working estimation engine',
        detail: 'Walks the page and produces an estimate with a stated range and assumptions.',
        status: 'Complete',
        kind: 'prototype',
      },
      {
        title: 'Uncertainty-aware presentation',
        detail: 'The range and the assumptions are shown alongside the number by default.',
        status: 'Complete',
        kind: 'prototype',
      },
      {
        title: 'Partial documentation',
        detail: 'Explains the model and its limits, but describes some behaviour that has changed.',
        status: 'Partial',
        kind: 'docs',
      },
      {
        title: 'No test coverage',
        detail: 'There are no automated tests. This is recorded as the main maintenance risk.',
        status: 'Not started',
        kind: 'code',
      },
    ],
    missingWork: [
      {
        title: 'Audit the estimation model against current page structures',
        detail:
          'The assumptions were written for pages built four years ago. Modern pages use different structures, and the model should be checked against them.',
        skill: 'Maintenance',
        difficulty: 'Medium',
        status: 'Not started',
      },
      {
        title: 'Correct the documentation where behaviour has changed',
        detail:
          'Several sections describe how the tool behaved before it was last updated. The docs and the code should agree.',
        skill: 'Documentation',
        difficulty: 'Easy',
        status: 'Not started',
      },
      {
        title: 'Add tests for the estimation core',
        detail:
          'A small set of fixtures would catch regressions in the model. No tests exist today, which is the main risk to the project.',
        skill: 'Testing',
        difficulty: 'Medium',
        status: 'Not started',
      },
    ],
    nextSteps: [
      'Read the model and write down which assumptions are now questionable.',
      'Fix the documentation sections that describe changed behaviour.',
      'Add a handful of fixture-based tests around the estimation core.',
    ],
    techStack: ['JavaScript', 'HTML', 'CSS'],
    skillsNeeded: ['Maintenance', 'Documentation', 'Testing'],
    helpNeeded: ['Documentation', 'Testing'],
    collaborationTypes: ['contributors', 'stewardship'],
    openToStewardship: true,
    creator: {
      name: 'Tomás Reig',
      role: 'Developer, now moved on',
      note: 'Handed over deliberately; left the honest maintenance list behind.',
    },
    updatedAt: '2026-09-19',
    completion: 86,
    handoffChecklist: [
      { label: 'Project purpose documented', met: true },
      { label: 'Current state described', met: true },
      { label: 'Next steps identified', met: true },
      { label: 'Technical context available', met: true },
      { label: 'Known blockers recorded', met: true },
    ],
    fieldNotes: [
      {
        date: '22 JAN 2026',
        text: 'Estimation engine completed with the range shown by default.',
      },
      {
        date: '30 JUN 2026',
        text: 'Documentation written; sections describing later behaviour left in place.',
      },
      {
        date: '19 SEP 2026',
        text: 'Handed over for maintenance. No tests exist — recorded as the main risk.',
      },
    ],
    materials: [
      { label: 'Estimation engine', detail: 'Small and readable, with unusually good comments.' },
      { label: 'Documentation', detail: 'Explains the model and its limits, partly outdated.' },
      { label: 'Maintenance list', detail: 'The honest list of what needs attention next.' },
    ],
    featured: true,
    priority: 3,
    helpFocus: 'Maintenance',
  },

  {
    id: 'RE-012',
    slug: 'folioflow',
    title: 'FolioFlow',
    category: 'dev',
    stage: 'Working Prototype',
    description:
      'A portfolio builder focused on project storytelling. The editor and previews work; keyboard accessibility and responsive editing controls need work.',
    summary:
      'FolioFlow is a portfolio builder that treats a project description as the thing you are actually designing. The editor works and the previews look right, but it has never been used by anyone who does not build software for a living, and it cannot currently be used without a mouse.',
    story: [
      'FolioFlow began when its creator tried to build a portfolio for someone who was not a designer and found that every tool assumed the portfolio was the output of a design process. Here, the writing was the design process.',
      'The editor is functional. You write a project description as a sequence of blocks, reorder them, and see the portfolio update live. The preview is good enough that people have used it to produce real portfolios.',
      'What has not been done is the work that makes a tool usable by the people it was built for. The editor has no keyboard support, the reordering controls are too small, and the layout breaks in ways that are obvious the moment you open it on a phone.',
    ],
    reasonPaused:
      'The creator took on a full-time role and stopped at a point where the editor worked but was not yet accessible. The prototype and a clear list of the remaining work were left behind.',
    existingWork: [
      {
        title: 'Block-based project editor',
        detail: 'A project is a sequence of blocks that can be reordered and previewed live.',
        status: 'Complete',
        kind: 'prototype',
      },
      {
        title: 'Live portfolio preview',
        detail: 'Updates as the blocks are edited, with a printable and a web variant.',
        status: 'Complete',
        kind: 'prototype',
      },
      {
        title: 'Writing guidance notes',
        detail: 'Short notes on how to structure a project description. Partly folded into the editor.',
        status: 'Partial',
        kind: 'docs',
      },
      {
        title: 'Keyboard support',
        detail: 'Not implemented. Reordering and editing currently require a pointer.',
        status: 'Not started',
        kind: 'code',
      },
    ],
    missingWork: [
      {
        title: 'Implement keyboard operation for block reordering',
        detail:
          'Reordering is currently drag-only. It needs keyboard move controls with visible focus, and it needs to be tested.',
        skill: 'Accessibility testing',
        difficulty: 'Medium',
        status: 'Not started',
      },
      {
        title: 'Redesign the editing controls for touch',
        detail:
          'The reorder handles and the block toolbar are too small and too close together on a phone.',
        skill: 'UI refinement',
        difficulty: 'Medium',
        status: 'Not started',
      },
      {
        title: 'Fix the responsive breakage in the live preview',
        detail:
          'The preview holds together on desktop and breaks on narrow widths. The blocks need a mobile layout of their own.',
        skill: 'Documentation',
        difficulty: 'Easy',
        status: 'Not started',
      },
    ],
    nextSteps: [
      'Add keyboard move controls to block reordering and test them with a keyboard only.',
      'Increase the touch targets on the block toolbar and re-test on a phone.',
      'Write the mobile block layouts for the preview before touching the editor.',
    ],
    techStack: ['React', 'JavaScript', 'CSS'],
    skillsNeeded: ['Accessibility testing', 'UI refinement', 'Documentation'],
    helpNeeded: ['Testing', 'Development'],
    collaborationTypes: ['contributors', 'coBuilder'],
    openToStewardship: true,
    creator: {
      name: 'Hannah Oke',
      role: 'Developer and portfolio maker',
      note: 'Left a working editor and a blunt list of what is missing.',
    },
    updatedAt: '2026-09-14',
    completion: 52,
    handoffChecklist: [
      { label: 'Project purpose documented', met: true },
      { label: 'Current state described', met: true },
      { label: 'Next steps identified', met: true },
      { label: 'Technical context available', met: true },
      { label: 'Known blockers recorded', met: false },
    ],
    fieldNotes: [
      {
        date: '27 MAR 2026',
        text: 'Block editor completed after three rounds of simplifying the block set.',
      },
      {
        date: '12 JUN 2026',
        text: 'Live preview finished; used to produce two real portfolios.',
      },
      {
        date: '14 SEP 2026',
        text: 'Keyboard and touch work not started. Editor left working.',
      },
    ],
    materials: [
      { label: 'Editor prototype', detail: 'Self-contained, runs locally with sample projects.' },
      { label: 'Sample portfolios', detail: 'Two real portfolios produced with the tool.' },
      { label: 'Remaining work list', detail: 'Keyboard, touch and responsive fixes.' },
    ],
    featured: false,
    priority: 7,
    helpFocus: 'Accessibility testing',
  },
]

/** Stable ordering for the archive. */
export function byArchiveNumber(a, b) {
  return a.id.localeCompare(b.id)
}
