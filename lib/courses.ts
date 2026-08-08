/**
 * Course and lesson structure for Stand Out.
 *
 * VIDEO HOSTING
 * -------------
 * `video` is a bare filename, not a path. It is resolved at render time by
 * `videoUrl()` below against NEXT_PUBLIC_VIDEO_BASE_URL.
 *
 *   Local dev  → unset  → /videos/<file>       (public/videos, git-ignored)
 *   Production → set    → https://.../<file>   (Supabase Storage, Mux, etc.)
 *
 * Videos are never committed to git: GitHub hard-rejects files over 100MB
 * and most of these are larger.
 */

export type Material = {
  label: string;
  file: string;
  kind: "exercise" | "quiz" | "workbook" | "guide";
};

export type Lesson = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  video?: string;
  materials?: Material[];
  /** Scenario the AI coach runs for this lesson. */
  practice?: {
    brief: string;
    prompt: string;
  };
};

export type Course = {
  slug: string;
  name: string;
  audience: string;
  blurb: string;
  level: string;
  comingSoon: boolean;
  lessons: Lesson[];
};

/** Resolve a lesson video filename to a playable URL. */
export function videoUrl(file?: string): string | null {
  if (!file) return null;
  const base = process.env.NEXT_PUBLIC_VIDEO_BASE_URL?.replace(/\/$/, "");
  return base ? `${base}/${file}` : `/videos/${file}`;
}

export const COURSES: Course[] = [
  {
    slug: "leadership-voice",
    name: "Leadership Voice",
    audience: "For professionals",
    blurb:
      "Influence clients, colleagues, and management. Structure presentations for impact and deliver them with compelling style.",
    level: "All levels",
    comingSoon: false,
    lessons: [
      {
        slug: "be-remarkable",
        number: "01",
        title: "Be Remarkable",
        summary:
          "What separates speakers people remember from speakers people forget — and why it is a learnable skill, not a personality trait.",
        video: "be-remarkable.mp4",
        materials: [
          {
            label: "Exercise",
            file: "be-remarkable-exercise.docx",
            kind: "exercise",
          },
          {
            label: "Learner workbook",
            file: "be-remarkable-workbook.docx",
            kind: "workbook",
          },
          { label: "Quiz", file: "be-remarkable-quiz.docx", kind: "quiz" },
        ],
        practice: {
          brief:
            "Introduce yourself and what you do in 60 seconds, in a way the coach will actually remember afterwards.",
          prompt:
            "Ask the learner to introduce themselves and what they do in about 60 seconds, aiming to be remembered. Afterwards, tell them specifically what you still recall and what slipped away.",
        },
      },
      {
        slug: "impact-defined",
        number: "02",
        title: "Impact Defined",
        summary:
          "A working definition of impact: being remembered, and moving people to think or act differently after you have finished speaking.",
        video: "impact-defined.mp4",
        materials: [
          {
            label: "Exercise",
            file: "impact-defined-exercise.docx",
            kind: "exercise",
          },
          { label: "Quiz", file: "impact-defined-quiz.docx", kind: "quiz" },
        ],
        practice: {
          brief:
            "State the one thing you want your audience to think or do differently — then make the case for it.",
          prompt:
            "Ask the learner to name a real upcoming talk or meeting, state the single change they want in their audience, then make the case in two minutes. Challenge any drift away from that stated change.",
        },
      },
      {
        slug: "impactful-structure-explained",
        number: "03",
        title: "Impactful Structure Explained",
        summary:
          "The structure behind presentations that land — how to order your thinking so an audience can follow and retain it.",
        video: "impactful-structure-explained.mp4",
        materials: [
          {
            label: "Exercise",
            file: "impactful-structure-explained-exercise.docx",
            kind: "exercise",
          },
          {
            label: "Quiz",
            file: "impactful-structure-explained-quiz.docx",
            kind: "quiz",
          },
        ],
        practice: {
          brief:
            "Deliver a headline, three supporting points, and a clear close — in under three minutes.",
          prompt:
            "Ask the learner to present any topic using headline → main points → evidence → close. Interrupt if they bury the headline or trail off without a call to action.",
        },
      },
      {
        slug: "compelling-delivery",
        number: "04",
        title: "Compelling Delivery",
        summary:
          "Voice, pace, pause, and presence. How delivery either carries your message or quietly undermines it.",
        video: "compelling-delivery.mp4",
        materials: [
          {
            label: "Exercise",
            file: "compelling-delivery-exercise.docx",
            kind: "exercise",
          },
          {
            label: "Quiz",
            file: "compelling-delivery-quiz.docx",
            kind: "quiz",
          },
        ],
        practice: {
          brief:
            "Deliver a short piece in clear bursts with purposeful pauses. The coach listens for pace and filler.",
          prompt:
            "Ask the learner to deliver a two-minute piece focusing on bursts and silent pauses. Call out filler words, rushed sections, and places a pause would have landed better.",
        },
      },
      {
        slug: "masterful-notes-designed",
        number: "05A",
        title: "Masterful Notes — Designed",
        summary:
          "How to build notes that support you instead of trapping you into reading a script.",
        video: "masterful-notes-designed.mp4",
        materials: [
          {
            label: "Exercise",
            file: "masterful-notes-designed-exercise.docx",
            kind: "exercise",
          },
          {
            label: "Quiz",
            file: "masterful-notes-designed-quiz.docx",
            kind: "quiz",
          },
        ],
        practice: {
          brief:
            "Talk the coach through the notes you have built, and why each cue is there.",
          prompt:
            "Ask the learner to describe the notes they have prepared for a real talk. Probe whether each note is a cue or a sentence, and push them toward cues.",
        },
      },
      {
        slug: "masterful-notes-delivered",
        number: "05B",
        title: "Masterful Notes — Delivered",
        summary:
          "Using your notes live: staying connected to the room while staying on message.",
        video: "masterful-notes-delivered.mp4",
        materials: [
          {
            label: "Exercise",
            file: "masterful-notes-delivered-exercise.docx",
            kind: "exercise",
          },
          {
            label: "Quiz",
            file: "masterful-notes-delivered-quiz.docx",
            kind: "quiz",
          },
        ],
        practice: {
          brief:
            "Deliver from cues, not sentences. The coach listens for reading rather than speaking.",
          prompt:
            "Ask the learner to deliver a piece from their notes. Flag any stretch that sounds read aloud rather than spoken from ideas.",
        },
      },
      {
        slug: "pesky-nerves-managed",
        number: "06",
        title: "Pesky Nerves Managed",
        summary:
          "Eight out of ten people feel nervous presenting. Practical ways to manage nerves rather than pretend they are not there.",
        video: "pesky-nerves-managed.mp4",
        materials: [
          {
            label: "Exercise",
            file: "pesky-nerves-managed-exercise.docx",
            kind: "exercise",
          },
          {
            label: "Quiz",
            file: "pesky-nerves-managed-quiz.docx",
            kind: "quiz",
          },
        ],
        practice: {
          brief:
            "Open a high-stakes talk cold. The coach helps you steady the first thirty seconds.",
          prompt:
            "Ask the learner to deliver the opening of a talk that makes them nervous, with no warm-up. Focus feedback on the first thirty seconds and on what steadied or destabilised them.",
        },
      },
      {
        slug: "key-conversations-managed",
        number: "07A",
        title: "Key Conversations Managed",
        summary:
          "The conversations that decide outcomes — how to prepare for and steer them.",
        video: "key-conversations-managed.mp4",
        materials: [
          {
            label: "Exercise",
            file: "key-conversations-managed-exercise.docx",
            kind: "exercise",
          },
          {
            label: "Quiz",
            file: "key-conversations-managed-quiz.docx",
            kind: "quiz",
          },
        ],
        practice: {
          brief:
            "Role-play a conversation that matters. The coach plays the other party.",
          prompt:
            "Ask the learner to describe a real high-stakes conversation, then play the other party realistically — including resistance — while they practise steering it.",
        },
      },
      {
        slug: "flexing-your-style-with-acts",
        number: "07B",
        title: "Flexing Your Style with ACTS",
        summary:
          "The ACTS framework for reading the person in front of you and adapting how you communicate.",
        video: "flexing-your-style-with-acts.mp4",
        materials: [
          {
            label: "Exercise",
            file: "flexing-your-style-with-acts-exercise.docx",
            kind: "exercise",
          },
          {
            label: "Quiz",
            file: "flexing-your-style-with-acts-quiz.docx",
            kind: "quiz",
          },
        ],
        practice: {
          brief:
            "The coach adopts a communication style. Read it and flex to match.",
          prompt:
            "Adopt a distinct communication style without naming it. Have the learner identify it and adapt their approach, then reveal the style and assess how well they flexed.",
        },
      },
      {
        slug: "managing-difficult-conversations",
        number: "08",
        title: "Managing Difficult Conversations",
        summary:
          "Staying clear and composed when the subject is uncomfortable and the stakes are high.",
        video: "managing-difficult-conversations.mp4",
        materials: [
          {
            label: "Exercise",
            file: "managing-difficult-conversations-exercise.docx",
            kind: "exercise",
          },
          {
            label: "Quiz",
            file: "managing-difficult-conversations-quiz.docx",
            kind: "quiz",
          },
          {
            label: "Field guide",
            file: "managing-difficult-conversations-field-guide.pdf",
            kind: "guide",
          },
        ],
        practice: {
          brief:
            "Deliver difficult news to the coach, who will not make it easy.",
          prompt:
            "Play someone receiving difficult news — defensive, then emotional. Have the learner stay clear and composed without becoming cold.",
        },
      },
      {
        slug: "handling-curveballs",
        number: "09",
        title: "Handling Curveballs",
        summary:
          "Recovering when the unexpected question, interruption, or objection arrives mid-point.",
        practice: {
          brief:
            "Present while the coach interrupts with the questions you least want.",
          prompt:
            "Let the learner begin a presentation, then interrupt with hard, unexpected questions at the worst moments. Assess how well they acknowledge, recover, and return to their message.",
        },
      },
      {
        slug: "interjecting",
        number: "10",
        title: "Interjecting",
        summary:
          "How to enter a conversation that is already moving — without apologising for taking the floor.",
      },
      {
        slug: "meeting-recovery",
        number: "11",
        title: "Meeting Recovery",
        summary:
          "Bringing a meeting back on track once it has drifted, stalled, or turned tense.",
      },
      {
        slug: "spontaneous-speaking",
        number: "12",
        title: "Spontaneous Speaking",
        summary:
          "Structure you can reach for when you are asked to speak with no time to prepare.",
      },
      {
        slug: "making-strong-connections",
        number: "13",
        title: "Making Strong Connections",
        summary:
          "Building the rapport that makes everything else you say land more easily.",
        materials: [
          {
            label: "Field guide",
            file: "making-strong-connections-field-guide.pdf",
            kind: "guide",
          },
        ],
      },
    ],
  },
  {
    slug: "campus-voice",
    name: "Campus Voice",
    audience: "For students",
    blurb:
      "From speaking up in class to landing your first job — the conversations that shape your next four years and beyond.",
    level: "Beginner-friendly",
    comingSoon: true,
    lessons: [
      {
        slug: "speaking-up-in-class",
        number: "01",
        title: "Speaking Up in Class",
        summary: "Finding your voice in a room where everyone else seems surer.",
      },
      {
        slug: "career-conversations-and-interviews",
        number: "02",
        title: "Career Conversations & Interviews",
        summary: "Talking about yourself without shrinking or overselling.",
      },
      {
        slug: "leading-group-projects",
        number: "03",
        title: "Leading Group Projects",
        summary: "Direction without authority, in teams you did not pick.",
      },
      {
        slug: "presenting-as-a-team",
        number: "04",
        title: "Presenting as a Team",
        summary: "Handovers, shared structure, and looking like one unit.",
      },
      {
        slug: "advocating-for-yourself",
        number: "05",
        title: "Advocating for Yourself",
        summary: "Asking for what you need — clearly and without apology.",
      },
      {
        slug: "answering-questions-with-confidence",
        number: "06",
        title: "Answering Questions with Confidence",
        summary: "Handling the question you did not see coming.",
      },
      {
        slug: "connecting-with-professors",
        number: "07",
        title: "Connecting with Professors & Instructors",
        summary: "Office hours, email, and building useful relationships.",
      },
      {
        slug: "communicating-across-cultures",
        number: "08",
        title: "Communicating Across Cultures & Styles",
        summary: "Adapting when the room does not share your defaults.",
      },
      {
        slug: "storytelling-for-impact",
        number: "09",
        title: "Storytelling for Impact",
        summary: "Turning experience into something people remember.",
      },
      {
        slug: "making-strong-connections",
        number: "10",
        title: "Making Strong Connections",
        summary: "Rapport that outlasts the conversation.",
      },
    ],
  },
];

export const getCourse = (slug: string) =>
  COURSES.find((c) => c.slug === slug);

export function getLesson(courseSlug: string, lessonSlug: string) {
  const course = getCourse(courseSlug);
  if (!course) return null;
  const index = course.lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) return null;
  return {
    course,
    lesson: course.lessons[index],
    prev: index > 0 ? course.lessons[index - 1] : null,
    next:
      index < course.lessons.length - 1 ? course.lessons[index + 1] : null,
    index,
  };
}

/**
 * Lessons available to free (Front Row) members.
 * 7 = Lesson 01 through Lesson 06 inclusive (05A and 05B count separately).
 * Lesson 07A onward requires Speakers' Circle.
 */
export const FREE_PREVIEW_COUNT = 7;

/**
 * Barry's "Speak with Impact" coaching rubric — the four categories the AI
 * scores against, 1–5 each, 20 total. Source: the rubric PDF in the
 * Leadership Voice course materials.
 */
export const RUBRIC = [
  {
    id: "structure",
    name: "Impactful Structure",
    looksFor: [
      "Clear headline or conclusion",
      "Relevant main points",
      "Supporting evidence or explanation",
      "Clear close, takeaway, question, or call to action",
    ],
  },
  {
    id: "delivery",
    name: "Compelling Delivery",
    looksFor: [
      "Ideas delivered in clear bursts",
      "Purposeful silent pauses",
      "Brisk but controlled pace",
      "Thoughtful, not rushed",
    ],
  },
  {
    id: "eye-contact",
    name: "Commanding Eye Contact",
    looksFor: [
      "Steady audience connection",
      "Eye contact at the start of ideas",
      "Eye contact after delivering ideas",
      "Relaxed, conversational presence",
    ],
  },
  {
    id: "on-message",
    name: "Staying on Message",
    looksFor: [
      "Focus on the core message",
      "Limited drifting or unnecessary detail",
      "Ideas aligned to the intended structure",
      "Speaking from ideas, not reading sentences",
    ],
  },
] as const;

export const SCORE_BANDS = [
  { min: 17, label: "Excellent" },
  { min: 13, label: "Very Good" },
  { min: 9, label: "Good" },
  { min: 5, label: "Fair" },
  { min: 1, label: "Poor" },
] as const;

export const scoreBand = (total: number) =>
  SCORE_BANDS.find((b) => total >= b.min)?.label ?? "Poor";

/**
 * The coaching rule from Barry's rubric, used as the system instruction
 * for the AI coach: one strength first, then one priority improvement in
 * structure/focus and one in delivery.
 */
export const COACHING_RULE =
  "Start with one strength, then identify one priority improvement in structure or focus and one priority improvement in delivery.";
