/**
 * Speakers' Circle practice topics.
 *
 * Eighty topics in eight groups, each with four supporting prompts, from
 * Barry's "80 Speakers Circle Topics with 4 prompts by level" (23 August
 * 2026). A member picks one, frames a two-to-three-minute presentation with
 * the Presentation Pyramid, turns it into Masterful Notes, practises the
 * delivery, and brings it to Katya for coaching and a rubric score.
 *
 * Generated from Barry's document; edit the document and regenerate rather
 * than hand-editing here, so the two never drift.
 */

export type Topic = {
  /** Stable id: section letter + number, e.g. "a-3". */
  id: string;
  title: string;
  /** Some topics carry a one-line framing under the title. */
  brief: string | null;
  prompts: readonly string[];
};

export type TopicSection = {
  key: string;
  name: string;
  topics: readonly Topic[];
};

/** The six steps every topic goes through, from Barry's learner instructions. */
export const PRACTICE_STEPS = [
  {
    title: "Choose a topic",
    body: "Any topic that gives you something interesting to think about, organize, and communicate. There is no required order.",
  },
  {
    title: "Frame your presentation",
    body: "Two to three minutes, built with the Presentation Pyramid: a Headline your audience should remember, two or three Main Points that support it, only the Evidence needed to bring them to life, and a Close that makes clear what you want them to think, feel, or do next.",
  },
  {
    title: "Create your Masterful Notes",
    body: "One naturally spoken idea per line, concise wording rather than paragraphs, supporting details indented beneath the ideas they support, and enough space to see where to pause. Notes are a pathway through your ideas, not a script.",
  },
  {
    title: "Practise your delivery",
    body: "Stand up and deliver it aloud, ideally recording yourself. Look at your audience before you begin, deliver one idea at a time, pause between ideas, return to your notes only for the next thought, and finish important ideas with eye contact.",
  },
  {
    title: "Review and repeat",
    body: "Watch the recording. Was the Headline clear? Were the ideas easy to follow? Did the notes help you speak naturally? Did you pause? Did you hold eye contact? Pick one thing to improve and go again.",
  },
  {
    title: "Get coached by Katya",
    body: "Bring it to Katya, your Speak with Impact Practice Coach. Choose Coach My Frame, Review My Masterful Notes or Coach My Delivery; she names one strength, one priority improvement, and has you try it again.",
  },
] as const;

export const TOPIC_SECTIONS: readonly TopicSection[] = [
  {
    key: "A",
    name: "Self-reflection & Development",
    topics: [
      {
        id: "a-1",
        title: "What helps you regain perspective during a difficult period?",
        brief: null,
        prompts: [
          "What usually causes you to lose perspective?",
          "Is there a person, place, or activity that helps you reset?",
          "What do you remind yourself when circumstances feel overwhelming?",
          "Describe a time this approach helped you move forward",
        ],
      },
      {
        id: "a-2",
        title: "When have you surprised yourself in a positive way?",
        brief: null,
        prompts: [
          "What situation were you facing?",
          "What did you do that surprised you?",
          "What strength or ability did the experience reveal?",
          "How has it changed what you believe you can do?",
        ],
      },
      {
        id: "a-3",
        title: "Describe an accomplishment you did not fully appreciate at the time.",
        brief: null,
        prompts: [
          "What did you accomplish?",
          "Why did it seem less significant at the time?",
          "What later helped you recognize its importance?",
          "What does the accomplishment mean to you now?",
        ],
      },
      {
        id: "a-4",
        title: "What one word would you choose for the next chapter of your life—and why?",
        brief: null,
        prompts: [
          "What word best represents what you want next?",
          "Why is that word personally meaningful?",
          "What would living according to that word look like?",
          "What first step would move you in that direction?",
        ],
      },
      {
        id: "a-5",
        title: "Describe a risk you are glad you took.",
        brief: null,
        prompts: [
          "What made the decision feel risky?",
          "What encouraged you to move forward?",
          "What happened as a result?",
          "What did the experience teach you about taking risks?",
        ],
      },
      {
        id: "a-6",
        title: "What experience revealed a strength you did not know you had?",
        brief: null,
        prompts: [
          "What challenge or opportunity were you facing?",
          "How did you respond?",
          "What strength became apparent?",
          "How have you used that strength since then?",
        ],
      },
      {
        id: "a-7",
        title: "What is one lesson you learned later than you wish you had?",
        brief: null,
        prompts: [
          "What is the lesson?",
          "Why did it take time to understand?",
          "What experience finally made the lesson clear?",
          "How would knowing it earlier have helped you?",
        ],
      },
      {
        id: "a-8",
        title: "What is one belief you have outgrown?",
        brief: null,
        prompts: [
          "What did you once believe?",
          "Where did that belief come from?",
          "What caused you to reconsider it?",
          "How has your new perspective changed your choices?",
        ],
      },
      {
        id: "a-9",
        title: "Describe a decision that required you to trust yourself.",
        brief: null,
        prompts: [
          "What decision did you need to make?",
          "What uncertainty or conflicting advice did you face?",
          "Why did you ultimately trust your own judgment?",
          "What did the outcome teach you about yourself?",
        ],
      },
      {
        id: "a-10",
        title: "What unfinished goal continues to matter to you?",
        brief: null,
        prompts: [
          "What is the goal?",
          "Why does it remain important?",
          "What has prevented you from completing it?",
          "What could you do to begin pursuing it again?",
        ],
      },
    ],
  },
  {
    key: "B",
    name: "Leadership in Action",
    topics: [
      {
        id: "b-1",
        title: "Describe a leader who brought out the best in you.",
        brief: null,
        prompts: [
          "Who was the leader?",
          "What did this person consistently do?",
          "How did the leader affect your confidence or performance?",
          "What part of their approach would you like to emulate?",
        ],
      },
      {
        id: "b-2",
        title: "What is one thing leaders can do to make meetings more productive?",
        brief: null,
        prompts: [
          "What commonly causes meetings to become unproductive?",
          "What specific leadership behaviour would improve them?",
          "How would this change affect participants?",
          "What responsibility do participants also have?",
        ],
      },
      {
        id: "b-3",
        title: "What workplace practice would you eliminate—and why?",
        brief: null,
        prompts: [
          "What practice would you remove?",
          "Why is it ineffective or outdated?",
          "What impact does it have on employees or performance?",
          "What would you introduce in its place?",
        ],
      },
      {
        id: "b-4",
        title: "What leadership capability will become increasingly important in the future?",
        brief: null,
        prompts: [
          "What capability do you believe will matter most?",
          "What workplace changes are making it more important?",
          "What could happen when leaders lack this capability?",
          "How can emerging leaders begin developing it?",
        ],
      },
      {
        id: "b-5",
        title: "How do you decide when to speak up and when to listen?",
        brief: null,
        prompts: [
          "What signals tell you that your contribution is needed?",
          "When might listening create more value than speaking?",
          "How do you avoid speaking simply to fill silence?",
          "Describe a situation in which you made the right choice",
        ],
      },
      {
        id: "b-6",
        title: "How can someone establish credibility when entering a new role?",
        brief: null,
        prompts: [
          "What should the person do during the first few weeks?",
          "How important is listening before proposing changes?",
          "What behaviours build trust and confidence?",
          "What early mistake could damage credibility?",
        ],
      },
      {
        id: "b-7",
        title: "What have you learned about leading under pressure?",
        brief: null,
        prompts: [
          "What changes when pressure increases?",
          "What do people need most from a leader at that moment?",
          "How should a leader communicate when information is incomplete?",
          "What personal lesson have you learned from a pressured situation?",
        ],
      },
      {
        id: "b-8",
        title: "Describe a time you had to make an unpopular decision.",
        brief: null,
        prompts: [
          "What decision had to be made?",
          "Why did others oppose it?",
          "How did you communicate your reasoning?",
          "What would you do differently in a similar situation?",
        ],
      },
      {
        id: "b-9",
        title: "How would you gain support for a necessary workplace change?",
        brief: null,
        prompts: [
          "Why might employees resist the change?",
          "Whose support would you seek first?",
          "How would you explain the reason for the change?",
          "How would you involve others in putting it into practice?",
        ],
      },
      {
        id: "b-10",
        title: "How should a leader create accountability without creating blame?",
        brief: null,
        prompts: [
          "What is the difference between accountability and blame?",
          "How should a leader address a missed commitment?",
          "What questions could encourage ownership?",
          "How can the team learn from the situation while maintaining standards?",
        ],
      },
    ],
  },
  {
    key: "C",
    name: "Character & Conviction",
    topics: [
      {
        id: "c-1",
        title: "What does quiet courage look like?",
        brief: null,
        prompts: [
          "How is quiet courage different from a dramatic act of bravery?",
          "What everyday situation might require it?",
          "Who have you seen demonstrate quiet courage?",
          "Why might this form of courage go unnoticed?",
        ],
      },
      {
        id: "c-2",
        title: "How is character demonstrated through everyday choices?",
        brief: null,
        prompts: [
          "What small choices reveal a person’s character?",
          "How do people behave when no one is watching?",
          "Why are consistent actions more revealing than stated intentions?",
          "Describe an everyday choice that earned your respect",
        ],
      },
      {
        id: "c-3",
        title: "When should you defend someone who is not present?",
        brief: null,
        prompts: [
          "What circumstances require someone to speak up?",
          "Why might remaining silent be easier?",
          "How can you defend the person respectfully?",
          "What does your response communicate to everyone present?",
        ],
      },
      {
        id: "c-4",
        title: "If your character could be summarized in one sentence, what would you want it to say?",
        brief: null,
        prompts: [
          "What quality would you most like the sentence to capture?",
          "Why is that quality important to you?",
          "What behaviours would support this description?",
          "How closely do your current actions match it?",
        ],
      },
      {
        id: "c-5",
        title: "When have you kept a commitment even though it became difficult?",
        brief: null,
        prompts: [
          "What commitment did you make?",
          "Why did it become difficult to honour?",
          "What motivated you to follow through?",
          "What did the experience teach you about reliability?",
        ],
      },
      {
        id: "c-6",
        title: "What principle has caused you to change your mind?",
        brief: null,
        prompts: [
          "What was your original position?",
          "What principle or new information challenged it?",
          "Why was changing your mind difficult?",
          "How did your revised view affect your actions?",
        ],
      },
      {
        id: "c-7",
        title: "How do you respond when someone else receives credit for your contribution?",
        brief: null,
        prompts: [
          "What factors would determine your response?",
          "When is it important to correct the record?",
          "How can you raise the issue professionally?",
          "When might you choose to let the matter go?",
        ],
      },
      {
        id: "c-8",
        title: "Describe a time when one of your values was tested.",
        brief: null,
        prompts: [
          "What value was involved?",
          "What pressure made it difficult to uphold?",
          "What decision did you make?",
          "What did the experience reveal about your priorities?",
        ],
      },
      {
        id: "c-9",
        title: "Which matters more: being loyal or being fair?",
        brief: null,
        prompts: [
          "How would you define loyalty and fairness?",
          "When might the two principles conflict?",
          "What risks come from placing loyalty first?",
          "What principle should guide the final decision?",
        ],
      },
      {
        id: "c-10",
        title: "What role should forgiveness play in rebuilding a relationship?",
        brief: null,
        prompts: [
          "What does forgiveness mean in this context?",
          "Does forgiveness require trust to be restored immediately?",
          "What actions should accompany an apology?",
          "When might moving forward separately be the healthier decision?",
        ],
      },
    ],
  },
  {
    key: "D",
    name: "Creativity & Possibility",
    topics: [
      {
        id: "d-1",
        title: "If you could create a new holiday, what would it celebrate?",
        brief: null,
        prompts: [
          "What person, value, or event would the holiday recognize?",
          "Why does it deserve greater attention?",
          "What traditions would people follow?",
          "How would the holiday bring people together?",
        ],
      },
      {
        id: "d-2",
        title: "What would the title of the current chapter of your life be?",
        brief: null,
        prompts: [
          "What is the title?",
          "Why does it capture your current circumstances?",
          "What central challenge or opportunity defines this chapter?",
          "How would you like the chapter to end?",
        ],
      },
      {
        id: "d-3",
        title: "What everyday inconvenience would you invent a solution for?",
        brief: null,
        prompts: [
          "What inconvenience would you eliminate?",
          "Who experiences the problem most often?",
          "How would your invention work?",
          "Why would people choose to use it?",
        ],
      },
      {
        id: "d-4",
        title: "What object from today should appear in a museum 100 years from now?",
        brief: null,
        prompts: [
          "What object would you select?",
          "What does it reveal about life today?",
          "How might future generations interpret it?",
          "What story should accompany the exhibit?",
        ],
      },
      {
        id: "d-5",
        title: "If you were invisible for one day, what would you choose to observe?",
        brief: null,
        prompts: [
          "Where would you go?",
          "What would you hope to learn?",
          "What ethical responsibilities would come with being unseen?",
          "How might the experience change your understanding of people?",
        ],
      },
      {
        id: "d-6",
        title: "Invent a new word for a feeling that is difficult to describe.",
        brief: null,
        prompts: [
          "What feeling or experience needs a word?",
          "What would your new word be?",
          "How would you define it?",
          "Use the word in a sentence or situation",
        ],
      },
      {
        id: "d-7",
        title: "If visitors from another planet arrived tomorrow, what should we show them first?",
        brief: null,
        prompts: [
          "What place, achievement, or experience would you choose?",
          "Why would it represent humanity well?",
          "What part of human life might be difficult to explain?",
          "What message should we give our visitors?",
        ],
      },
      {
        id: "d-8",
        title: "If you could introduce one new rule for the world, what would it be?",
        brief: null,
        prompts: [
          "What problem would your rule address?",
          "How would it improve people’s lives?",
          "What unintended consequences could result?",
          "How would you persuade people to accept it?",
        ],
      },
      {
        id: "d-9",
        title: "What will the workplace of the future look like?",
        brief: null,
        prompts: [
          "How will technology change where and how people work?",
          "What current workplace practice might disappear?",
          "What new challenge could employees face?",
          "What human capability will remain essential?",
        ],
      },
      {
        id: "d-10",
        title: "How would you design a city that encouraged people to connect?",
        brief: null,
        prompts: [
          "What physical spaces would encourage interaction?",
          "How would transportation and neighbourhood design contribute?",
          "What role should technology play?",
          "How would you ensure that different groups feel included?",
        ],
      },
    ],
  },
  {
    key: "E",
    name: "Stronger Together",
    topics: [
      {
        id: "e-1",
        title: "What makes people feel genuinely welcome?",
        brief: null,
        prompts: [
          "What behaviours create a welcoming atmosphere?",
          "How do words, body language, and tone contribute?",
          "Describe a time someone made you feel welcome",
          "How can a workplace or community improve its welcome?",
        ],
      },
      {
        id: "e-2",
        title: "What tradition has helped bring people together?",
        brief: null,
        prompts: [
          "What is the tradition?",
          "Who participates in it?",
          "Why is it meaningful?",
          "How has it strengthened relationships over time?",
        ],
      },
      {
        id: "e-3",
        title: "Describe a conversation that strengthened an important relationship.",
        brief: null,
        prompts: [
          "Who was involved?",
          "What made the conversation necessary?",
          "What was said or understood differently?",
          "How did the relationship change afterward?",
        ],
      },
      {
        id: "e-4",
        title: "What is one way to recognize someone whose contribution is often overlooked?",
        brief: null,
        prompts: [
          "Whose contribution tends to go unnoticed?",
          "Why is the person’s work easy to overlook?",
          "How could you recognize them meaningfully?",
          "What effect might that recognition have?",
        ],
      },
      {
        id: "e-5",
        title: "What question could help you understand almost anyone better?",
        brief: null,
        prompts: [
          "What question would you ask?",
          "Why would it encourage a meaningful response?",
          "What could the answer reveal?",
          "How would you demonstrate that you were genuinely listening?",
        ],
      },
      {
        id: "e-6",
        title: "How can different generations learn more effectively from one another?",
        brief: null,
        prompts: [
          "What can younger people teach older generations?",
          "What can older people teach younger generations?",
          "What assumptions can prevent mutual learning?",
          "What activity or practice could bring the generations together?",
        ],
      },
      {
        id: "e-7",
        title: "What local problem could be improved through one simple action?",
        brief: null,
        prompts: [
          "What problem have you noticed?",
          "What simple action could improve it?",
          "Who would need to participate?",
          "How would you encourage people to become involved?",
        ],
      },
      {
        id: "e-8",
        title: "Describe a time you repaired a misunderstanding.",
        brief: null,
        prompts: [
          "What caused the misunderstanding?",
          "How did it affect the relationship or situation?",
          "What did you do to address it?",
          "What did you learn about communicating more clearly?",
        ],
      },
      {
        id: "e-9",
        title: "How can people disagree without becoming divided?",
        brief: null,
        prompts: [
          "Why do some disagreements become personal?",
          "What behaviours keep a discussion respectful?",
          "How can people identify common ground?",
          "What should someone do when the conversation becomes heated?",
        ],
      },
      {
        id: "e-10",
        title: "What creates a genuine sense of belonging?",
        brief: null,
        prompts: [
          "What is the difference between being included and belonging?",
          "What behaviours help people feel accepted?",
          "What can unintentionally cause people to feel excluded?",
          "What responsibility does each individual have for creating belonging?",
        ],
      },
    ],
  },
  {
    key: "F",
    name: "Business Updates",
    topics: [
      {
        id: "f-1",
        title: "Project Progress Update",
        brief: "You are updating your leadership team on a project that is currently on track. What is the headline, what are the most important developments, and what should happen next?",
        prompts: [
          "What has been accomplished so far",
          "What is working well and creating momentum",
          "What still needs attention",
          "What should happen next to keep progress on track",
        ],
      },
      {
        id: "f-2",
        title: "Team Achievement",
        brief: "Your team has delivered a strong result. Explain what was accomplished, why it matters, and what should happen next.",
        prompts: [
          "What the team accomplished",
          "Why the result matters",
          "What made the achievement possible",
          "How the team should build on the success",
        ],
      },
      {
        id: "f-3",
        title: "Process Improvement",
        brief: "You have identified a way to improve an existing process. Explain the issue, your proposed change, and the benefit.",
        prompts: [
          "What process is not working as well as it should",
          "Where time, effort, or quality is being lost",
          "What change you recommend",
          "How the improvement would benefit the team or organization",
        ],
      },
      {
        id: "f-4",
        title: "End-of-Week Executive Summary",
        brief: "You have 60 seconds to brief a senior leader on the most important developments from this week. What do they need to know?",
        prompts: [
          "The most important development from the week",
          "What senior leaders need to know",
          "What risks, decisions, or opportunities are emerging",
          "What should happen next week",
        ],
      },
      {
        id: "f-5",
        title: "Quarterly Results Snapshot",
        brief: "Give a short update on business performance this quarter. What is the most important takeaway, what is driving it, and what action is required?",
        prompts: [
          "The most important performance takeaway from the quarter",
          "What is driving the result",
          "What should concern or encourage the audience",
          "What action should follow from the results",
        ],
      },
      {
        id: "f-6",
        title: "Customer Issue Update",
        brief: "A customer problem has emerged, and leadership wants a quick update. Explain what happened, what it means, and what is being done.",
        prompts: [
          "What happened from the customer’s point of view",
          "What impact the issue has had",
          "What is being done to resolve it",
          "What should be learned or changed going forward",
        ],
      },
      {
        id: "f-7",
        title: "New Opportunity",
        brief: "You see an opportunity the organization should pursue. Present the opportunity, explain why it matters, and suggest the next step.",
        prompts: [
          "What opportunity you see",
          "Why the opportunity matters now",
          "What value it could create",
          "What first step should be taken to explore it",
        ],
      },
      {
        id: "f-8",
        title: "Project at Risk",
        brief: "One part of an important project is behind schedule. Explain the issue, its impact, and what you recommend doing next.",
        prompts: [
          "What part of the project is at risk",
          "Why the issue matters now",
          "What impact it could have if not addressed",
          "What action or decision is needed next",
        ],
      },
      {
        id: "f-9",
        title: "Resource Request",
        brief: "You need more time, budget, or people to complete an important initiative successfully. Explain the need clearly and persuasively.",
        prompts: [
          "What resource is needed",
          "Why the current resources are not sufficient",
          "What benefit or risk is connected to the request",
          "What specific approval or support is required",
        ],
      },
      {
        id: "f-10",
        title: "Priority Reset",
        brief: "Your team cannot do everything at once. Explain which priority should come first, why, and what may need to wait.",
        prompts: [
          "Which priority should come first",
          "Why that priority matters most right now",
          "What may need to pause, shift, or wait",
          "How to communicate the reset clearly to others",
        ],
      },
    ],
  },
  {
    key: "G",
    name: "Senior Leadership Presentations",
    topics: [
      {
        id: "g-1",
        title: "Recommendation to Proceed",
        brief: "You are recommending that the organization move forward with an initiative. State your recommendation clearly, support it with key reasons, and end with the decision needed.",
        prompts: [
          "What you recommend",
          "Why the recommendation is timely",
          "What evidence supports moving forward",
          "What decision or approval you need",
        ],
      },
      {
        id: "g-2",
        title: "Market Shift",
        brief: "You are briefing senior leaders on an important market change. What is happening, why it matters, and what should the organization do?",
        prompts: [
          "What is changing in the market",
          "Why the change matters now",
          "How it could affect the organization",
          "What response or adjustment is needed",
        ],
      },
      {
        id: "g-3",
        title: "Investment Case",
        brief: "You are making the case for investing in a program, tool, or capability. Explain the return, the need, and the action required.",
        prompts: [
          "What investment you are recommending",
          "What problem or opportunity it addresses",
          "What return or benefit it could create",
          "What decision or next step is required",
        ],
      },
      {
        id: "g-4",
        title: "Change Message",
        brief: "You are explaining an important organizational change. State what is changing, why it matters, and how people should respond.",
        prompts: [
          "What is changing",
          "Why the change is necessary",
          "How people will be affected",
          "What you want people to understand, feel, or do next",
        ],
      },
      {
        id: "g-5",
        title: "Recommendation to Pause",
        brief: "You believe the organization should pause or delay a current initiative. Explain why, what risk you see, and what you recommend instead.",
        prompts: [
          "What initiative or action should be paused",
          "What risk or concern makes the pause necessary",
          "What should be clarified before proceeding",
          "What alternative next step you recommend",
        ],
      },
      {
        id: "g-6",
        title: "Lessons Learned",
        brief: "A recent initiative did not go as planned. Present the lesson clearly, without defensiveness, and explain the path forward.",
        prompts: [
          "What did not go as planned",
          "What caused the issue or result",
          "What lesson should be taken forward",
          "What should change next time",
        ],
      },
      {
        id: "g-7",
        title: "Cross-Functional Alignment",
        brief: "You need support from several departments to move an initiative forward. Explain the shared goal, what is needed, and why now.",
        prompts: [
          "What shared goal requires alignment",
          "Which groups need to work together",
          "Where priorities or expectations may differ",
          "What agreement or commitment is needed now",
        ],
      },
      {
        id: "g-8",
        title: "Strategic Concern",
        brief: "You need to raise a concern that leadership should not ignore. Explain the issue clearly and constructively.",
        prompts: [
          "What concern leadership should not ignore",
          "Why it matters to the business",
          "What could happen if it is not addressed",
          "What action would reduce the risk",
        ],
      },
      {
        id: "g-9",
        title: "One-Minute Board-Style Summary",
        brief: "You have one minute to brief a board or executive committee. What is the headline, what matters most, and what is required?",
        prompts: [
          "The headline the board needs to hear first",
          "The two or three facts that matter most",
          "The implication for the organization",
          "The decision, action, or attention required",
        ],
      },
      {
        id: "g-10",
        title: "Decision Brief",
        brief: "Senior leaders need a decision quickly. Present the issue, your recommendation, and the rationale in a concise way.",
        prompts: [
          "What decision needs to be made",
          "What options or trade-offs are involved",
          "Why you recommend one path over another",
          "What must happen after the decision is made",
        ],
      },
    ],
  },
  {
    key: "H",
    name: "Professional Perspectives",
    topics: [
      {
        id: "h-1",
        title: "What Makes a Strong Leader?",
        brief: "Give a short response to the question: What makes a strong leader?",
        prompts: [
          "One quality that defines strong leadership",
          "A moment when you saw that quality in action",
          "Why that quality matters to a team",
          "How others can practise it",
        ],
      },
      {
        id: "h-2",
        title: "One Change That Improved Your Work",
        brief: "Explain one change that made you or your team more effective.",
        prompts: [
          "What change you made",
          "What problem or frustration it addressed",
          "What improved as a result",
          "How others could apply the same idea",
        ],
      },
      {
        id: "h-3",
        title: "What Good Communication Looks Like",
        brief: "Explain what good communication looks like in a workplace.",
        prompts: [
          "What good communication means to you",
          "What it looks like in everyday work",
          "What happens when communication is poor",
          "One habit that improves communication quickly",
        ],
      },
      {
        id: "h-4",
        title: "A Habit That Makes a Difference",
        brief: "Describe one small habit that has had a big impact on your performance.",
        prompts: [
          "What habit has helped you most",
          "Why the habit is useful",
          "How it affects your performance or relationships",
          "How someone else could start using it",
        ],
      },
      {
        id: "h-5",
        title: "A Lesson You Learned the Hard Way",
        brief: "Describe one professional lesson you learned the hard way and why it matters.",
        prompts: [
          "What happened",
          "What made the lesson difficult",
          "What changed in your thinking or behaviour",
          "What others can learn from your experience",
        ],
      },
      {
        id: "h-6",
        title: "A Challenge You Are Proud You Worked Through",
        brief: "Describe a challenge you faced and what you learned from it.",
        prompts: [
          "What made the challenge difficult",
          "What helped you keep going",
          "What you learned about yourself",
          "Why the experience still matters",
        ],
      },
      {
        id: "h-7",
        title: "Why Preparation Matters",
        brief: "Give a short talk on why preparation matters, especially when the pressure is on.",
        prompts: [
          "A time when preparation helped you succeed",
          "What preparation gave you that talent alone could not",
          "How preparation affects confidence",
          "What others should prepare before an important moment",
        ],
      },
      {
        id: "h-8",
        title: "What Builds Trust on a Team?",
        brief: "Share your view on what helps people build trust at work.",
        prompts: [
          "What behaviour builds trust most quickly",
          "What weakens trust on a team",
          "How trust changes performance",
          "One practical way to strengthen trust",
        ],
      },
      {
        id: "h-9",
        title: "How to Stay Calm Under Pressure",
        brief: "Explain how someone can stay more composed during a difficult moment.",
        prompts: [
          "What usually creates pressure for people",
          "What helps you slow down and think clearly",
          "How composure affects others",
          "One practical technique others can use",
        ],
      },
      {
        id: "h-10",
        title: "What You Want to Be Known For",
        brief: "Describe the professional reputation you most want to build.",
        prompts: [
          "The reputation you want to build",
          "Why that reputation matters to you",
          "What behaviours support it",
          "What you want people to experience when working with you",
        ],
      },
    ],
  },
]

export const TOPIC_COUNT = TOPIC_SECTIONS.reduce((n, s) => n + s.topics.length, 0);

/**
 * Not one of Barry's eighty. The self-introduction is the piece a member
 * builds in Lesson 1 and delivers from Masterful Notes in Lesson 5B, where
 * they first meet Katya; giving it a workspace is what keeps that promise.
 * The prompts are the platform's, shaped on the Presentation Pyramid, not
 * Barry's — replace them if he supplies his own.
 */
export const SELF_INTRODUCTION: Topic = {
  id: "self-introduction",
  title: "Your 60-second self-introduction",
  brief:
    "Who you are and what you do, in a way people remember afterwards. Built in Lesson 1, delivered from Masterful Notes in Lesson 5B.",
  prompts: [
    "What is the one thing you want people to remember about you?",
    "What do you do, in a sentence an intelligent person outside your field would understand?",
    "Why does it matter to the people you do it for?",
    "What would you like the listener to think, or do, next?",
  ],
};

export const findTopic = (id: string): Topic | null =>
  id === SELF_INTRODUCTION.id
    ? SELF_INTRODUCTION
    : (TOPIC_SECTIONS.flatMap((s) => s.topics).find((t) => t.id === id) ?? null);

/** The theme a topic belongs to; null for the self-introduction. */
export const sectionOf = (id: string): TopicSection | null =>
  TOPIC_SECTIONS.find((s) => s.topics.some((t) => t.id === id)) ?? null;
