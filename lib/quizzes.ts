/**
 * Lesson quizzes, extracted from Barry's Word documents in the course
 * materials. Learners must reach QUIZ_PASS_MARK to unlock the next lesson.
 *
 * ⚠️ One correction applied: the answer key in
 * "2. Impact Defined Quiz 070126.docx" is rotated — the Q5 answer
 * ("All of the above") appears at the end of the key rather than in
 * position 5. Corrected below; worth confirming with Barry.
 */

export type QuizQuestion = {
  q: string;
  multi: boolean;
  options: { key: string; text: string }[];
  answers: string[];
};

/** Percentage needed to pass and unlock the next lesson. */
export const QUIZ_PASS_MARK = 80;

export const QUIZZES: Record<string, QuizQuestion[]> = {
  "be-remarkable": [
    {
      q: "What pressure often makes public speaking feel daunting?",
      multi: false,
      options: [
        { key: "A", text: "I have to entertain everyone" },
        { key: "B", text: "I have to be perfect" },
        { key: "C", text: "I have to speak longer" },
        { key: "D", text: "I have to use more slides" },
      ],
      answers: ["B"],
    },
    {
      q: "According to the lesson, what is the audience looking for?",
      multi: false,
      options: [
        { key: "A", text: "Someone flawless" },
        { key: "B", text: "Someone louder" },
        { key: "C", text: "Someone remarkable" },
        { key: "D", text: "Someone dramatic" },
      ],
      answers: ["C"],
    },
    {
      q: "In this lesson, being remarkable means:",
      multi: false,
      options: [
        { key: "A", text: "Performing in a way that impresses people" },
        { key: "B", text: "Expressing something real in a way that truly lands" },
        { key: "C", text: "Speaking without any pauses" },
        { key: "D", text: "Using sophisticated language" },
      ],
      answers: ["B"],
    },
    {
      q: "The best kind of remarkable is rooted in:",
      multi: false,
      options: [
        { key: "A", text: "Energy" },
        { key: "B", text: "Experience" },
        { key: "C", text: "Authenticity" },
        { key: "D", text: "Humour" },
      ],
      answers: ["C"],
    },
    {
      q: "From an audience’s point of view, authenticity means:",
      multi: false,
      options: [
        { key: "A", text: "Your words and delivery match" },
        { key: "B", text: "You use formal language" },
        { key: "C", text: "You never show nerves" },
        { key: "D", text: "You speak more quickly" },
      ],
      answers: ["A"],
    },
    {
      q: "Where do speakers often get into trouble?",
      multi: false,
      options: [
        { key: "A", text: "When they prepare too carefully" },
        { key: "B", text: "When they try too hard to sound impressive" },
        { key: "C", text: "When they use a clear message" },
        { key: "D", text: "When they speak naturally" },
      ],
      answers: ["B"],
    },
    {
      q: "Speaking skill helps you:",
      multi: false,
      options: [
        { key: "A", text: "Become a different person" },
        { key: "B", text: "Impress every audience" },
        { key: "C", text: "Express your authenticity clearly" },
        { key: "D", text: "Avoid all mistakes" },
      ],
      answers: ["C"],
    },
    {
      q: "Which qualities help an audience experience you as authentic?",
      multi: true,
      options: [
        { key: "A", text: "Your words and delivery match" },
        { key: "B", text: "Your message is clear" },
        { key: "C", text: "You are being yourself rather than acting" },
        { key: "D", text: "You use more dramatic gestures" },
      ],
      answers: ["A", "B", "C"],
    },
    {
      q: "According to the lesson, what do you not need to be remarkable?",
      multi: true,
      options: [
        { key: "A", text: "To be louder" },
        { key: "B", text: "To be flashier" },
        { key: "C", text: "To be more dramatic" },
        { key: "D", text: "To be more fully yourself with skill" },
      ],
      answers: ["A", "B", "C"],
    },
    {
      q: "When authenticity, skill and memorability come together, what can happen?",
      multi: false,
      options: [
        { key: "A", text: "You move people" },
        { key: "B", text: "You do more than simply deliver a presentation" },
        { key: "C", text: "Your message is more likely to land" },
        { key: "D", text: "All of the above" },
      ],
      answers: ["D"],
    },
  ],
  "compelling-delivery": [
    {
      q: "Why is everyday conversational speaking often our most effective speaking style?",
      multi: false,
      options: [
        { key: "A", text: "It is more formal" },
        { key: "B", text: "It is authentic" },
        { key: "C", text: "It uses longer sentences" },
        { key: "D", text: "It avoids eye contact" },
      ],
      answers: ["B"],
    },
    {
      q: "When presenters feel nervous, what do they often start trying to do?",
      multi: false,
      options: [
        { key: "A", text: "Speak in polished, complete sentences" },
        { key: "B", text: "Pause more naturally" },
        { key: "C", text: "Focus on one idea at a time" },
        { key: "D", text: "Make stronger eye contact" },
      ],
      answers: ["A"],
    },
    {
      q: "What can happen when adrenaline rises and a speaker begins to rush?",
      multi: true,
      options: [
        { key: "A", text: "Fillers and bridge words may increase" },
        { key: "B", text: "It becomes harder to sound relaxed and natural" },
        { key: "C", text: "The speaker may lose control of their delivery" },
        { key: "D", text: "The audience automatically understands more" },
      ],
      answers: ["A", "B", "C"],
    },
    {
      q: "Why are pauses important in a presentation?",
      multi: false,
      options: [
        { key: "A", text: "They give the audience time to think" },
        { key: "B", text: "They help the audience process an idea" },
        { key: "C", text: "They can increase the impact of a message" },
        { key: "D", text: "All of the above" },
      ],
      answers: ["B"],
    },
    {
      q: "Great speakers manage their:",
      multi: false,
      options: [
        { key: "A", text: "Rate of words only" },
        { key: "B", text: "Rate of ideas" },
        { key: "C", text: "Number of slides" },
        { key: "D", text: "Volume at all times" },
      ],
      answers: ["A"],
    },
    {
      q: "What is the purpose of the first silent pause?",
      multi: false,
      options: [
        { key: "A", text: "To set up the idea" },
        { key: "B", text: "To end the presentation" },
        { key: "C", text: "To replace eye contact" },
        { key: "D", text: "To slow every word down" },
      ],
      answers: ["D"],
    },
    {
      q: "According to the lesson, what should a speaker do with their Rate of Words?",
      multi: false,
      options: [
        { key: "A", text: "Artificially slow it down" },
        { key: "B", text: "Keep it brisk" },
        { key: "C", text: "Eliminate it completely" },
        { key: "D", text: "Match it to the number of slides" },
      ],
      answers: ["B"],
    },
    {
      q: "What does the second silent pause do?",
      multi: false,
      options: [
        { key: "A", text: "Introduces a new topic" },
        { key: "B", text: "Lets the idea land" },
        { key: "C", text: "Signals the end of the meeting" },
        { key: "D", text: "Gives the speaker time to read notes" },
      ],
      answers: ["B"],
    },
    {
      q: "How should eye contact be used in the Pause Delivery Technique?",
      multi: true,
      options: [
        { key: "A", text: "Make eye contact and pause before delivering an idea" },
        { key: "B", text: "Maintain or reconnect with eye contact as the thought ends" },
        { key: "C", text: "Use eye contact to ensure the audience is with you" },
        { key: "D", text: "Avoid eye contact while delivering an important idea" },
      ],
      answers: ["A", "B", "C"],
    },
    {
      q: "What combination creates the Pause Delivery Technique?",
      multi: false,
      options: [
        { key: "A", text: "Proper pace and purposeful eye contact" },
        { key: "B", text: "Fast speech and formal language" },
        { key: "C", text: "More slides and stronger volume" },
        { key: "D", text: "Longer sentences and fewer pauses" },
      ],
      answers: ["A"],
    },
  ],
  "flexing-your-style-with-acts": [
    {
      q: "What is the primary purpose of the ACTS model?",
      multi: false,
      options: [
        { key: "A", text: "To label people by personality type" },
        { key: "B", text: "To identify the strongest speaker in a group" },
        { key: "C", text: "To understand what others may value and how they may prefer to receive information" },
        { key: "D", text: "To replace preparation before a key conversation" },
      ],
      answers: ["C"],
    },
    {
      q: "Which qualities are commonly associated with Activators?",
      multi: true,
      options: [
        { key: "A", text: "Directness" },
        { key: "B", text: "Decisiveness" },
        { key: "C", text: "Focus on results" },
        { key: "D", text: "Preference for lengthy background explanations" },
      ],
      answers: ["A", "B", "C"],
    },
    {
      q: "When influencing an Activator, what is usually the best approach?",
      multi: false,
      options: [
        { key: "A", text: "Lead with the outcome and make the next step clear" },
        { key: "B", text: "Begin with a long history of the issue" },
        { key: "C", text: "Focus first on how everyone feels" },
        { key: "D", text: "Avoid making a recommendation" },
      ],
      answers: ["A"],
    },
    {
      q: "What do Creators typically value most in a conversation?",
      multi: false,
      options: [
        { key: "A", text: "Possibility, momentum, and energy" },
        { key: "B", text: "Detailed process controls" },
        { key: "C", text: "Stability and predictability" },
        { key: "D", text: "Private reflection before discussion" },
      ],
      answers: ["A"],
    },
    {
      q: "What is one risk of presenting too much detail too early to a Creator?",
      multi: false,
      options: [
        { key: "A", text: "They may feel the opportunity is less engaging" },
        { key: "B", text: "They may make a decision too quickly" },
        { key: "C", text: "They may become more focused on the facts" },
        { key: "D", text: "They may feel more supported" },
      ],
      answers: ["A"],
    },
    {
      q: "When influencing a Team Player, what should you do first?",
      multi: false,
      options: [
        { key: "A", text: "Push quickly for action" },
        { key: "B", text: "Build trust and invite their input" },
        { key: "C", text: "Focus only on business results" },
        { key: "D", text: "Present a detailed risk analysis" },
      ],
      answers: ["B"],
    },
    {
      q: "What do Specialists tend to value most?",
      multi: false,
      options: [
        { key: "A", text: "Accuracy, logic, and quality" },
        { key: "B", text: "Speed, visibility, and spontaneity" },
        { key: "C", text: "Relationship-building over evidence" },
        { key: "D", text: "Creative possibilities without detail" },
      ],
      answers: ["A"],
    },
    {
      q: "Why should you adapt your approach using ACTS?",
      multi: false,
      options: [
        { key: "A", text: "To make the message easier for the other person to receive" },
        { key: "B", text: "To better understand what they may value or question" },
        { key: "C", text: "To improve the likelihood that your message will be heard" },
        { key: "D", text: "All of the above" },
      ],
      answers: ["D"],
    },
    {
      q: "Which statement is most likely to resonate with a Specialist?",
      multi: false,
      options: [
        { key: "A", text: "“I have a good feeling this will work.”" },
        { key: "B", text: "“This idea could create real momentum.”" },
        { key: "C", text: "“Here is the data, the assumptions, the risks, and how we will manage them.”" },
        { key: "D", text: "“Let’s decide quickly and move on.”" },
      ],
      answers: ["C"],
    },
    {
      q: "When ACTS is combined with CALE, it can help you:",
      multi: true,
      options: [
        { key: "A", text: "Connect with greater awareness" },
        { key: "B", text: "Ask better questions" },
        { key: "C", text: "Listen for what matters" },
        { key: "D", text: "Explain in a way that is easier to hear" },
      ],
      answers: ["A", "B", "C", "D"],
    },
  ],
  "impact-defined": [
    {
      q: "Before deciding what to say, what should you define first?",
      multi: false,
      options: [
        { key: "A", text: "Your slides" },
        { key: "B", text: "Your delivery style" },
        { key: "C", text: "The impact you need" },
        { key: "D", text: "Your opening line" },
      ],
      answers: ["C"],
    },
    {
      q: "What question should you ask before planning your message?",
      multi: false,
      options: [
        { key: "A", text: "How can I sound more impressive?" },
        { key: "B", text: "What do I need this communication to accomplish?" },
        { key: "C", text: "How long should I speak?" },
        { key: "D", text: "Which examples should I use?" },
      ],
      answers: ["B"],
    },
    {
      q: "What is the first level of the Communication Ladder?",
      multi: false,
      options: [
        { key: "A", text: "Understanding" },
        { key: "B", text: "Awareness" },
        { key: "C", text: "Acceptance" },
        { key: "D", text: "Action" },
      ],
      answers: ["B"],
    },
    {
      q: "At which level do people grasp what the information means?",
      multi: false,
      options: [
        { key: "A", text: "Awareness" },
        { key: "B", text: "Understanding" },
        { key: "C", text: "Advocacy" },
        { key: "D", text: "Acceptance" },
      ],
      answers: ["B"],
    },
    {
      q: "Why should you define the impact before communicating?",
      multi: false,
      options: [
        { key: "A", text: "It helps you communicate with more precision" },
        { key: "B", text: "It strengthens credibility" },
        { key: "C", text: "It supports better results" },
        { key: "D", text: "All of the above" },
      ],
      answers: ["D"],
    },
    {
      q: "If people need to believe in your interpretation of a message, what level of impact are you seeking?",
      multi: false,
      options: [
        { key: "A", text: "Action" },
        { key: "B", text: "Advocacy" },
        { key: "C", text: "Acceptance" },
        { key: "D", text: "Awareness" },
      ],
      answers: ["C"],
    },
    {
      q: "If your audience needs to know what to do next, what level are you aiming for?",
      multi: false,
      options: [
        { key: "A", text: "Understanding" },
        { key: "B", text: "Action" },
        { key: "C", text: "Acceptance" },
        { key: "D", text: "Awareness" },
      ],
      answers: ["B"],
    },
    {
      q: "What is the highest level of the Communication Ladder?",
      multi: false,
      options: [
        { key: "A", text: "Awareness" },
        { key: "B", text: "Action" },
        { key: "C", text: "Advocacy" },
        { key: "D", text: "Understanding" },
      ],
      answers: ["C"],
    },
    {
      q: "Which are the five levels of the Communication Ladder?",
      multi: true,
      options: [
        { key: "A", text: "Awareness" },
        { key: "B", text: "Understanding" },
        { key: "C", text: "Acceptance" },
        { key: "D", text: "Action" },
        { key: "E", text: "Advocacy" },
        { key: "F", text: "Perfection" },
      ],
      answers: ["A", "B", "C", "D", "E"],
    },
    {
      q: "What becomes easier once the impact goal is clear?",
      multi: true,
      options: [
        { key: "A", text: "Choosing the right message" },
        { key: "B", text: "Selecting the appropriate level of detail" },
        { key: "C", text: "Shaping communication to match the goal" },
        { key: "D", text: "Deciding whether the audience needs to act or carry the message forward" },
      ],
      answers: ["A", "B", "C", "D"],
    },
  ],
  "impactful-structure-explained": [
    {
      q: "According to the lesson, what is the most common challenge presenters face?",
      multi: false,
      options: [
        { key: "A", text: "They lack subject-matter knowledge" },
        { key: "B", text: "They struggle with structure" },
        { key: "C", text: "They do not have enough slides" },
        { key: "D", text: "They speak too briefly" },
      ],
      answers: ["B"],
    },
    {
      q: "What principle should guide the beginning of a strong presentation?",
      multi: false,
      options: [
        { key: "A", text: "Detail before direction" },
        { key: "B", text: "Content before clarity" },
        { key: "C", text: "Clarity before content" },
        { key: "D", text: "Evidence before conclusion" },
      ],
      answers: ["C"],
    },
    {
      q: "Which opening approaches can cause presenters to lose their audience?",
      multi: true,
      options: [
        { key: "A", text: "Starting with an agenda" },
        { key: "B", text: "Giving too much background information" },
        { key: "C", text: "Beginning with too much context" },
        { key: "D", text: "Stating a clear headline" },
      ],
      answers: ["A", "B", "C"],
    },
    {
      q: "What should a speaker begin with in the Presentation Pyramid?",
      multi: false,
      options: [
        { key: "A", text: "Evidence" },
        { key: "B", text: "Main Points" },
        { key: "C", text: "A Conclusion framed as a headline" },
        { key: "D", text: "A call to action" },
      ],
      answers: ["C"],
    },
    {
      q: "In the example presentation, what was the central conclusion?",
      multi: false,
      options: [
        { key: "A", text: "Employees have lost their ability" },
        { key: "B", text: "The company is losing momentum, but not because employees lack ability" },
        { key: "C", text: "Leadership should immediately reduce staff" },
        { key: "D", text: "Financial performance is the only issue" },
      ],
      answers: ["B"],
    },
    {
      q: "Why does a clear headline help an audience?",
      multi: false,
      options: [
        { key: "A", text: "It gives the audience direction" },
        { key: "B", text: "It tells them why they should pay attention" },
        { key: "C", text: "It provides a clear destination for the presentation" },
        { key: "D", text: "All of the above" },
      ],
      answers: ["D"],
    },
    {
      q: "Which three questions are often the best place to begin when developing Main Points for a business presentation?",
      multi: false,
      options: [
        { key: "A", text: "Where, When and Who" },
        { key: "B", text: "What, Why and How" },
        { key: "C", text: "Who, What and When" },
        { key: "D", text: "Why, Where and Who" },
      ],
      answers: ["B"],
    },
    {
      q: "What should Evidence do in a Presentation Pyramid?",
      multi: true,
      options: [
        { key: "A", text: "Strengthen the case" },
        { key: "B", text: "Support the Main Points" },
        { key: "C", text: "Include every detail the speaker knows" },
        { key: "D", text: "Help keep the presentation concise and clear" },
      ],
      answers: ["A", "B", "D"],
    },
    {
      q: "When should a presenter include Where, When and Who?",
      multi: false,
      options: [
        { key: "A", text: "In every presentation, no matter what" },
        { key: "B", text: "Only when those questions matter to the audience" },
        { key: "C", text: "Before stating the conclusion" },
        { key: "D", text: "Instead of explaining What, Why and How" },
      ],
      answers: ["B"],
    },
    {
      q: "What should the Close do?",
      multi: false,
      options: [
        { key: "A", text: "Introduce entirely new information" },
        { key: "B", text: "Return the audience to the heart of the message" },
        { key: "C", text: "Add more evidence" },
        { key: "D", text: "Repeat every Main Point word for word" },
      ],
      answers: ["B"],
    },
  ],
  "key-conversations-managed": [
    {
      q: "What can a well-placed question help you do in a key conversation?",
      multi: true,
      options: [
        { key: "A", text: "Lower defensiveness" },
        { key: "B", text: "Gather useful information" },
        { key: "C", text: "Show that you want to help solve the problem" },
        { key: "D", text: "Create a runway to say what you planned regardless of the answer" },
      ],
      answers: ["A", "B", "C"],
    },
    {
      q: "According to the lesson, influence begins:",
      multi: false,
      options: [
        { key: "A", text: "When you present strong evidence" },
        { key: "B", text: "When you explain your point of view" },
        { key: "C", text: "With how you enter the conversation" },
        { key: "D", text: "When the other person agrees with you" },
      ],
      answers: ["C"],
    },
    {
      q: "What does CALE stand for?",
      multi: false,
      options: [
        { key: "A", text: "Clarify, Align, Listen, Engage" },
        { key: "B", text: "Connect, Ask, Listen, Explain" },
        { key: "C", text: "Consider, Ask, Lead, Evaluate" },
        { key: "D", text: "Communicate, Act, Lead, Explain" },
      ],
      answers: ["B"],
    },
    {
      q: "Which approach is most likely to resonate with an Activator?",
      multi: false,
      options: [
        { key: "A", text: "A direct, concise, action-oriented message" },
        { key: "B", text: "A highly detailed explanation with extensive background" },
        { key: "C", text: "A message focused mainly on relationships" },
        { key: "D", text: "An imaginative message full of possibilities" },
      ],
      answers: ["A"],
    },
    {
      q: "Before a key conversation, what should you consider as part of the Connect step?",
      multi: false,
      options: [
        { key: "A", text: "Who is involved, what matters to them, and how they are likely to receive information" },
        { key: "B", text: "How many slides you should prepare" },
        { key: "C", text: "How long you should speak without pausing" },
        { key: "D", text: "Which part of the conversation you can dominate" },
      ],
      answers: ["A"],
    },
    {
      q: "Effective listening in a key conversation can help you:",
      multi: true,
      options: [
        { key: "A", text: "Confirm what matters to the other person" },
        { key: "B", text: "Understand concerns they may already have" },
        { key: "C", text: "Notice where resistance may be coming from" },
        { key: "D", text: "Hear the language they are using" },
        { key: "E", text: "Prepare an immediate counterargument before they finish speaking" },
      ],
      answers: ["A", "B", "C", "D"],
    },
    {
      q: "When you reach the Explain step, what should you generally do?",
      multi: false,
      options: [
        { key: "A", text: "Deliver a long, detailed speech" },
        { key: "B", text: "Frame a clear headline, add supporting points, and close with a next step" },
        { key: "C", text: "Begin the conversation again from the start" },
        { key: "D", text: "Avoid using evidence altogether" },
      ],
      answers: ["B"],
    },
    {
      q: "Why does pausing help during a key conversation?",
      multi: false,
      options: [
        { key: "A", text: "It helps you stay composed" },
        { key: "B", text: "It prepares people to hear an important idea" },
        { key: "C", text: "It gives people time to absorb what you have said" },
        { key: "D", text: "All of the above" },
      ],
      answers: ["D"],
    },
    {
      q: "What is the purpose of the ACTS Communication Model?",
      multi: false,
      options: [
        { key: "A", text: "To label people permanently by personality type" },
        { key: "B", text: "To understand the person, room, and moment so the message is more likely to be heard" },
        { key: "C", text: "To determine who should speak first in a meeting" },
        { key: "D", text: "To replace the need for preparation" },
      ],
      answers: ["B"],
    },
    {
      q: "What is the overall goal of influencing a key conversation?",
      multi: false,
      options: [
        { key: "A", text: "To dominate the discussion" },
        { key: "B", text: "To win every disagreement" },
        { key: "C", text: "To influence the conversation in a clear, respectful, and useful way" },
        { key: "D", text: "To avoid raising concerns altogether" },
      ],
      answers: ["C"],
    },
  ],
  "managing-difficult-conversations": [
    {
      q: "What three conditions commonly make a conversation difficult?",
      multi: false,
      options: [
        { key: "A", text: "Stakes are low, emotions are calm, and opinions agree" },
        { key: "B", text: "Stakes are high, emotions are strong, and opinions vary" },
        { key: "C", text: "The meeting is long, the room is crowded, and people are tired" },
        { key: "D", text: "The speaker lacks slides, notes, and evidence" },
      ],
      answers: ["B"],
    },
    {
      q: "Under pressure, people commonly respond by:",
      multi: false,
      options: [
        { key: "A", text: "Pausing, reflecting, and agreeing" },
        { key: "B", text: "Explaining, persuading, and concluding" },
        { key: "C", text: "Fighting, fleeing, or freezing" },
        { key: "D", text: "Listening, paraphrasing, and acting" },
      ],
      answers: ["C"],
    },
    {
      q: "What is the first goal in a difficult conversation?",
      multi: false,
      options: [
        { key: "A", text: "To win the point" },
        { key: "B", text: "To regain the ability to think clearly" },
        { key: "C", text: "To prove the other person wrong" },
        { key: "D", text: "To immediately solve every issue" },
      ],
      answers: ["B"],
    },
    {
      q: "What can “Look Out” help you notice during a difficult conversation?",
      multi: true,
      options: [
        { key: "A", text: "Changes in tone" },
        { key: "B", text: "Body language" },
        { key: "C", text: "Withdrawal or tension" },
        { key: "D", text: "Defensiveness" },
      ],
      answers: ["A", "B", "C", "D"],
    },
    {
      q: "What does the “We not Me” skill encourage you to do?",
      multi: false,
      options: [
        { key: "A", text: "Focus on proving that you are right" },
        { key: "B", text: "Shift from blame toward a better shared outcome" },
        { key: "C", text: "Avoid discussing the issue" },
        { key: "D", text: "Let the other person make every decision" },
      ],
      answers: ["B"],
    },
    {
      q: "Why is it helpful to stick to facts?",
      multi: false,
      options: [
        { key: "A", text: "Facts help cool the conversation down" },
        { key: "B", text: "Facts make every conversation shorter" },
        { key: "C", text: "Facts eliminate the need for empathy" },
        { key: "D", text: "Facts prove that one person is right" },
      ],
      answers: ["A"],
    },
    {
      q: "Why is mutual purpose and mutual respect important?",
      multi: false,
      options: [
        { key: "A", text: "It makes it safer for both people to speak honestly" },
        { key: "B", text: "It helps lower defensiveness" },
        { key: "C", text: "It helps people look for a shared goal" },
        { key: "D", text: "All of the above" },
      ],
      answers: ["D"],
    },
    {
      q: "What does it mean to be humbly confident?",
      multi: false,
      options: [
        { key: "A", text: "Avoid taking a position" },
        { key: "B", text: "Speak clearly and directly while remaining open to other perspectives" },
        { key: "C", text: "Agree with every objection" },
        { key: "D", text: "Focus only on the other person’s opinion" },
      ],
      answers: ["B"],
    },
    {
      q: "What are effective ways to show sincere curiosity?",
      multi: true,
      options: [
        { key: "A", text: "Ask supportive questions" },
        { key: "B", text: "Listen to understand rather than simply respond" },
        { key: "C", text: "Paraphrase what you are hearing" },
        { key: "D", text: "Show empathy" },
      ],
      answers: ["A", "B", "C", "D"],
    },
    {
      q: "What should “Move to Action” include?",
      multi: false,
      options: [
        { key: "A", text: "Leaving the next steps open-ended" },
        { key: "B", text: "Agreeing on who does what, and by when" },
        { key: "C", text: "Waiting to see what happens" },
        { key: "D", text: "Ending the conversation without a decision" },
      ],
      answers: ["B"],
    },
  ],
  "masterful-notes-delivered": [
    {
      q: "What do Masterful Notes enable in addition to helping you stay on message?",
      multi: false,
      options: [
        { key: "A", text: "Longer presentations" },
        { key: "B", text: "The Pause Delivery technique" },
        { key: "C", text: "More detailed slides" },
        { key: "D", text: "Faster memorization" },
      ],
      answers: ["B"],
    },
    {
      q: "What are the three elements of the Pause Delivery technique?",
      multi: true,
      options: [
        { key: "A", text: "Brisk Rate of Words" },
        { key: "B", text: "Clear bursts of ideas separated by silent pauses" },
        { key: "C", text: "Purposeful eye contact with the audience" },
        { key: "D", text: "Complete memorization of every sentence" },
      ],
      answers: ["A", "B", "C"],
    },
    {
      q: "When beginning the Masterful Notes process, what should you take in from your notes?",
      multi: false,
      options: [
        { key: "A", text: "One paragraph" },
        { key: "B", text: "One idea or line of information" },
        { key: "C", text: "The entire presentation" },
        { key: "D", text: "Only the opening headline" },
      ],
      answers: ["B"],
    },
    {
      q: "What should you do after looking up at your audience and before delivering an idea?",
      multi: false,
      options: [
        { key: "A", text: "Read the next line" },
        { key: "B", text: "Pause for a second or two" },
        { key: "C", text: "Look back down at your notes" },
        { key: "D", text: "Speed up your Rate of Words" },
      ],
      answers: ["B"],
    },
    {
      q: "What is the purpose of the first pause?",
      multi: false,
      options: [
        { key: "A", text: "To create anticipation and focus the audience" },
        { key: "B", text: "To signal that the presentation is ending" },
        { key: "C", text: "To allow the speaker to change slides" },
        { key: "D", text: "To memorize the next paragraph" },
      ],
      answers: ["A"],
    },
    {
      q: "After delivering an idea, what should you do?",
      multi: false,
      options: [
        { key: "A", text: "Immediately look down at your notes" },
        { key: "B", text: "Move to the next sentence without stopping" },
        { key: "C", text: "Pause again while maintaining eye contact" },
        { key: "D", text: "Repeat the idea more loudly" },
      ],
      answers: ["C"],
    },
    {
      q: "What happens when you use Masterful Notes and the Pause Delivery technique well?",
      multi: true,
      options: [
        { key: "A", text: "You provide the audience with substantial eye contact" },
        { key: "B", text: "You give eye contact at meaningful moments before and after ideas" },
        { key: "C", text: "You sound as though you are thinking clearly in real time" },
        { key: "D", text: "You appear as though you are reading a script" },
      ],
      answers: ["A", "B", "C"],
    },
    {
      q: "As speakers become more experienced, what may they be able to do?",
      multi: false,
      options: [
        { key: "A", text: "Deliver without pausing" },
        { key: "B", text: "Pick up two or three lines at a time" },
        { key: "C", text: "Stop using eye contact" },
        { key: "D", text: "Return to reading full sentences" },
      ],
      answers: ["B"],
    },
    {
      q: "Why might a speaker vary the length of the first and second pauses?",
      multi: false,
      options: [
        { key: "A", text: "To emphasize different ideas" },
        { key: "B", text: "To create the right rhythm" },
        { key: "C", text: "To make the technique their own" },
        { key: "D", text: "All of the above" },
      ],
      answers: ["D"],
    },
    {
      q: "What is the ultimate goal of the Pause Delivery technique?",
      multi: false,
      options: [
        { key: "A", text: "To imitate a famous speaker exactly" },
        { key: "B", text: "To sound mechanical and rehearsed" },
        { key: "C", text: "To make the technique authentic to your own style" },
        { key: "D", text: "To eliminate all nervousness immediately" },
      ],
      answers: ["C"],
    },
  ],
  "masterful-notes-designed": [
    {
      q: "Once a Presentation Pyramid is complete, what is the next step?",
      multi: false,
      options: [
        { key: "A", text: "Add more evidence" },
        { key: "B", text: "Turn the structure into notes you can deliver with confidence" },
        { key: "C", text: "Write a full script" },
        { key: "D", text: "Choose a delivery style" },
      ],
      answers: ["B"],
    },
    {
      q: "What does the Presentation Pyramid provide as the thinking structure behind a message?",
      multi: false,
      options: [
        { key: "A", text: "A headline" },
        { key: "B", text: "Main points and supporting evidence" },
        { key: "C", text: "A clear close" },
        { key: "D", text: "All of the above" },
      ],
      answers: ["D"],
    },
    {
      q: "Masterful Notes are built primarily from:",
      multi: false,
      options: [
        { key: "A", text: "Full paragraphs" },
        { key: "B", text: "Complete sentences" },
        { key: "C", text: "The ideas you want to say" },
        { key: "D", text: "Detailed slide content" },
      ],
      answers: ["C"],
    },
    {
      q: "Why are full sentences often harder to use under pressure?",
      multi: false,
      options: [
        { key: "A", text: "They are too short" },
        { key: "B", text: "They can be harder to deliver cleanly" },
        { key: "C", text: "They eliminate the need for practice" },
        { key: "D", text: "They automatically create pauses" },
      ],
      answers: ["B"],
    },
    {
      q: "What are practical guidelines for preparing Masterful Notes?",
      multi: true,
      options: [
        { key: "A", text: "List the ideas you want to deliver" },
        { key: "B", text: "Use an Arial-style font" },
        { key: "C", text: "Indent freely to show which ideas belong together" },
        { key: "D", text: "Write every point as a polished sentence" },
      ],
      answers: ["A", "B", "C"],
    },
    {
      q: "In this lesson, what does it mean to “parse” a sentence?",
      multi: false,
      options: [
        { key: "A", text: "Memorize it word for word" },
        { key: "B", text: "Break it into short idea units" },
        { key: "C", text: "Add more supporting evidence" },
        { key: "D", text: "Place it into a paragraph" },
      ],
      answers: ["B"],
    },
    {
      q: "What is the recommended progression for creating Masterful Notes?",
      multi: false,
      options: [
        { key: "A", text: "Sentences → slides → script" },
        { key: "B", text: "Presentation Pyramid → spoken ideas → Masterful Notes" },
        { key: "C", text: "Headline → memorization → delivery" },
        { key: "D", text: "Evidence → paragraphs → notes" },
      ],
      answers: ["B"],
    },
    {
      q: "How does indentation help a speaker?",
      multi: false,
      options: [
        { key: "A", text: "It adds more detail" },
        { key: "B", text: "It makes the message longer" },
        { key: "C", text: "It helps show which ideas belong together" },
        { key: "D", text: "It replaces the need for a clear structure" },
      ],
      answers: ["C"],
    },
    {
      q: "What is one benefit of working from clear, visible ideas rather than long sentences?",
      multi: false,
      options: [
        { key: "A", text: "It becomes easier to stay on message" },
        { key: "B", text: "It eliminates the need for audience awareness" },
        { key: "C", text: "It guarantees a perfect presentation" },
        { key: "D", text: "It allows you to include every detail you know" },
      ],
      answers: ["A"],
    },
    {
      q: "Why can Masterful Notes make delivery easier?",
      multi: true,
      options: [
        { key: "A", text: "They are easier to see" },
        { key: "B", text: "They are easier to follow" },
        { key: "C", text: "They are easier to speak from naturally" },
        { key: "D", text: "They help make the message feel cleaner and more manageable" },
      ],
      answers: ["A", "B", "C", "D"],
    },
  ],
  "pesky-nerves-managed": [
    {
      q: "What is the surge of energy many speakers feel just before presenting?",
      multi: false,
      options: [
        { key: "A", text: "Fatigue" },
        { key: "B", text: "Adrenaline" },
        { key: "C", text: "Distraction" },
        { key: "D", text: "Frustration" },
      ],
      answers: ["B"],
    },
    {
      q: "Which techniques are recommended for calming nerves before speaking?",
      multi: true,
      options: [
        { key: "A", text: "Box Breathing" },
        { key: "B", text: "4-7-8 Breathing" },
        { key: "C", text: "Power Posing" },
        { key: "D", text: "Reading your presentation word for word" },
      ],
      answers: ["A", "B", "C"],
    },
    {
      q: "What is the goal when you feel nervous energy before speaking?",
      multi: false,
      options: [
        { key: "A", text: "Eliminate it completely" },
        { key: "B", text: "Ignore it" },
        { key: "C", text: "Work with it and channel it productively" },
        { key: "D", text: "Hide it from the audience" },
      ],
      answers: ["C"],
    },
    {
      q: "Why can adrenaline begin to work for you rather than against you?",
      multi: false,
      options: [
        { key: "A", text: "You know your message is impactful" },
        { key: "B", text: "You know how you are going to deliver it" },
        { key: "C", text: "You channel the energy into excitement" },
        { key: "D", text: "All of the above" },
      ],
      answers: ["D"],
    },
    {
      q: "What is the breathing pattern for 4-7-8 Breathing?",
      multi: false,
      options: [
        { key: "A", text: "Inhale for four, hold for four, exhale for four" },
        { key: "B", text: "Inhale for four, hold for seven, exhale for eight" },
        { key: "C", text: "Inhale for seven, hold for four, exhale for eight" },
        { key: "D", text: "Inhale for eight, hold for seven, exhale for four" },
      ],
      answers: ["B"],
    },
    {
      q: "How does Box Breathing work?",
      multi: false,
      options: [
        { key: "A", text: "Inhale for four, hold for four, exhale for four, hold for four" },
        { key: "B", text: "Inhale for four, hold for seven, exhale for eight" },
        { key: "C", text: "Take one deep breath, then hold it as long as possible" },
        { key: "D", text: "Breathe quickly for thirty seconds" },
      ],
      answers: ["A"],
    },
    {
      q: "What are useful elements of Power Posing?",
      multi: true,
      options: [
        { key: "A", text: "Stand tall" },
        { key: "B", text: "Roll your shoulders back" },
        { key: "C", text: "Take a few deep breaths" },
        { key: "D", text: "Picture yourself delivering a successful presentation" },
      ],
      answers: ["A", "B", "C", "D"],
    },
    {
      q: "What can a small shift in posture create?",
      multi: false,
      options: [
        { key: "A", text: "A longer presentation" },
        { key: "B", text: "A meaningful shift in mindset" },
        { key: "C", text: "A need for more slides" },
        { key: "D", text: "Less need for preparation" },
      ],
      answers: ["B"],
    },
    {
      q: "When properly channelled, adrenaline can help you:",
      multi: false,
      options: [
        { key: "A", text: "Perform at a higher level" },
        { key: "B", text: "Avoid every possible mistake" },
        { key: "C", text: "Speak without preparation" },
        { key: "D", text: "Eliminate the need for practice" },
      ],
      answers: ["A"],
    },
    {
      q: "Over time, regular practice of these techniques can help the surge of energy feel more like:",
      multi: false,
      options: [
        { key: "A", text: "Fear" },
        { key: "B", text: "Readiness" },
        { key: "C", text: "Confusion" },
        { key: "D", text: "Pressure" },
      ],
      answers: ["B"],
    },
  ],
};
