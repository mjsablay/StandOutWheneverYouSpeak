# Barry's unread-email requests — 26 October 2026

Reviewed all four unread messages from barry.cleardev@gmail.com, including Spam/Trash search. No emails sent or labels changed.

## Implemented in this change

- **8 October, “From our conversation yesterday”:** add the three attached original PDFs (User Instructions, Presentation Pyramid Prompt 1, Masterful Notes Prompt 2) unchanged. Link from Leadership Voice, lessons 3/5A/5B downloads and topic preparation. The new `/preparation` guide teaches the six context inputs and both prompt stages; it does not replace Barry's files or Katya's September coaching persona.
- **8 October:** replace the ten lesson recording references using the archive “New Leadership Voice Lesson Videos 0926.zip”, Drive ID `1P9PCH6NRwheNeHGHel8ex0QL4ERXihkX`. Upload with `-2026-09.mp4` suffixes to the existing lesson-videos bucket, retaining all old objects. No re-encoding. Refresh the visitor homepage poster from the new first lesson. Existing lesson slugs/progress keys stay the same.

## Katya: recommendation, not an activated vendor change

Barry asks us to assess an option, not sign a vendor contract. Current Katya supports text Frame/Notes sessions; there is no working delivery/voice assessment to score yet.

**Recommendation:** evaluate a short, private Synthesia/LiveKit pilot against the same HeyGen LiveAvatar pilot before committing the public product. Both can keep the coaching logic under platform control; a face does not supply coaching or scoring by itself. Synthesia is technically viable but is not an embed-only switch. Keep the existing text coach available during this evaluation.

Official documentation checked 26 October 2026:

- [Synthesia Interactive Avatars](https://docs.synthesia.io/reference/interactive-avatars): bring the conversation model and speech recognition; Synthesia supplies the rendered avatar and optional speech synthesis.
- [Synthesia sessions](https://docs.synthesia.io/reference/createinteractiveavatarsession): runs in a LiveKit room supplied by the application. Requires an avatar and a scoped API key.
- [Synthesia operational guidance](https://docs.synthesia.io/reference/ia-operational-trust): no no-code embed; LiveKit-only transport; no built-in transcript/recording system; mobile not a primary target. Verify account access, full stack cost and target-device behavior before selecting it.
- [LiveAvatar LITE](https://docs.liveavatar.com/docs/lite-mode/overview): supplies audio-driven video while the application controls the conversation stack.
- [LiveAvatar push-to-talk](https://docs.liveavatar.com/docs/full-mode/push-to-talk): FULL mode documents explicit speech start/stop. Verify equivalent manual turn control for whichever integration we pilot.

Pilot acceptance: Barry's prompt and saved preparation are supplied; the learner can pause without interruption; exactly one useful coaching priority and retry; no fabricated delivery/eye-contact scores; session stops and disconnects reliably; usable desktop/mobile playback; recorded latency and total cost per session. Eye contact remains unassessed, per the user's instruction. Do not advertise voice or avatar features before this passes. Needs provider selection, account access/credentials and a test budget; no subscription was purchased.

## Points and recognition: decisions before implementation

**23 September, “An Update & Next Steps”**, with two Word documents and a journey diagram. The calculation is feasible, but the attachments disagree:

| Rule | Points guide (15 September filename) | Sales document (16 September filename) |
| --- | --- | --- |
| Current performance | Mean of latest 3 presentations | Mean of best 3 from latest 5 |
| Award timing | Finalized monthly, at least one new scored presentation that month | Example adds 70 points; monthly close not explicitly specified |
| Baseline | First 3 scored presentations, no points | Same baseline, outside monthly coaching allowance |

Both use equal Frame/Staying on Message/Delivery weights, scores 1–5, points = current performance / 5 × 100, and advancement requiring BOTH cumulative points and current performance: Intermediate 100/2.8, Expert 225/3.5, Distinguished 350/4.0, Rock Star 500/4.4. Neither authorizes replacing missing delivery evidence with zero or guessing from text.

Recommended decision: best 3 of latest 5, as in the newer sales document, with one finalized award per eligible calendar month, preserving the guide's monthly rule. Confirm how fewer than five post-baseline presentations behave, month timezone, rounding, corrections and whether earned levels persist after performance falls. Do not silently choose these semantics.

Implementation after confirmation: separate performance presentations from coaching chats; server-validated evidence and rubric version; immutable 3-presentation baseline; deterministic rolling calculation; unique member/month award ledger; replay-safe month close; admin corrections with audit trail; learner baseline/current performance/points/level display. Existing activity points for watching/quizzes must be distinguished from performance points and must not automatically become Stand Out performance credit. Preserve existing ledger history.

## Membership and learner journey: proposals needing confirmation

Barry's September email recommends Embrace, Practice (email spells Practise), Master and asks to discuss options. Sales draft proposes USD 10 / 20 / 30, Master founding price USD 25, 3 / 12 / 16 approximately five-minute coaching sessions monthly; baseline outside the allowance; Embrace 12 starter topics; Practice/Master 80 topics; own presentations in Master. The diagram instead says Practice adds 60 topics (72 total). Confirm the final tier matrix, exact starter topics, currency, founding eligibility, timing and existing-member migration before modifying Stripe or access controls. The existing coaching modes have 7/6/10-minute caps, another decision to reconcile.

The map also lists self-assessment and a welcome video; no assessment questionnaire or welcome recording is supplied in these messages. Do not invent a diagnostic instrument or present a lesson recording as the welcome video.

## Exploratory videos

- **16 September, “Interesting Post from Synthesia”:** requests exploration, covered by the avatar feasibility review above.
- **21 October, “Syren Videos”:** two cinematic alternatives for lessons 3 and 5B, Drive ID `15HUh1OCq8p89giBbIwcHpKUMzUxurKmt`. Barry asks for thoughts rather than publication. These are not part of the requested ten-video replacement. Do not substitute them without a content/teaching-quality review and a decision to adopt the style.
