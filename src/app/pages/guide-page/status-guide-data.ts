import { GuidePage } from './guide.model';

// Colony cluster #1 — "Trademark status meaning" pages.
// Searchers paste the exact registry status string into Google. Competition is
// weak (small niche blogs), intent is high, and we have a unique asset: the live
// /trademark-status-check tool. Money-page colony links point to
// /trademark-objection-reply and /trademark by default (re-point later).

const STATUS_RELATED = [
  { title: 'Trademark Objection Reply', route: '/trademark-objection-reply', icon: 'fas fa-reply', desc: 'Expert examination-report replies from ₹2,999' },
  { title: 'Trademark Registration', route: '/trademark', icon: 'fas fa-trademark', desc: 'File a new trademark from ₹1,499' },
  { title: 'Check Your Live Status', route: '/trademark-status-check', icon: 'fas fa-magnifying-glass-chart', desc: 'Track your application by number' },
  { title: 'Search by Company Name', route: '/trademark-search-by-company', icon: 'fas fa-building', desc: "See every mark a company has filed" },
  { title: 'All Status Meanings', route: '/trademark-status', icon: 'fas fa-list-check', desc: 'Every registry status explained' },
];

export const STATUS_GUIDES: Record<string, GuidePage> = {

  'formalities-chk-pass': {
    slug: 'formalities-chk-pass',
    title: '"Formalities Chk Pass" — Trademark Status Meaning',
    category: 'Filing & Formalities',
    metaTitle: '"Formalities Chk Pass" Trademark Status — Meaning & Next Step | Trademarx',
    metaDesc: 'Formalities Chk Pass means your trademark application cleared the basic document and fee check. No action is needed — it now moves to examination. Full explanation here.',
    quickAnswer: 'The trademark status "Formalities Chk Pass" means your application has cleared the Registry\'s initial check of documents, forms, and fees. It is a positive administrative milestone — not final approval. No action is required from you; the application now waits to be assigned to an examiner.',
    highlights: [
      { label: 'Action Required', value: 'None — just wait', icon: 'fas fa-circle-check' },
      { label: 'Typical Duration', value: '4–8 weeks at this stage', icon: 'fas fa-clock' },
      { label: 'Next Stage', value: 'Marked for Exam', icon: 'fas fa-arrow-right' },
      { label: 'Is it good news?', value: 'Yes — a positive step', icon: 'fas fa-thumbs-up' },
    ],
    intro: 'If your trademark application on the IP India portal shows "Formalities Chk Pass", you have reached one of the earliest positive checkpoints in the registration journey. Many first-time applicants panic at the unfamiliar wording — but this status is genuinely good news. Here is exactly what it means, why your application is here, and what happens next.',
    sections: [
      {
        heading: 'What does "Formalities Chk Pass" mean?',
        body: 'When you file a trademark, the Registry first runs a "formality check" — a purely administrative verification that your application is complete and correctly filed. "Formalities Chk Pass" confirms that this check succeeded: your form (TM-A), the applicant details, the class, the goods/services description, the power of attorney (Form TM-48 where an agent files), and the government fee were all found to be in order. Crucially, this is not an assessment of whether your brand name is registrable — no examiner has yet compared it against existing marks. It simply means your paperwork passed the front-desk check and your application is validly on record, ready to enter the examination queue.',
      },
      {
        heading: 'What you should do now',
        body: 'Nothing is required from you at the "Formalities Chk Pass" stage. Your application is in the queue and will move forward automatically. This is, however, the ideal time to make sure your contact email and mobile number on the application are correct, because the next major communication — the Examination Report — is delivered electronically and time-sensitive. You should also start using the ™ symbol on your brand (you are entitled to it the moment you file) and keep dated evidence of use, which strengthens your position if any objection is raised later.',
      },
      {
        heading: 'What happens next',
        body: 'After "Formalities Chk Pass", the application is "Marked for Exam" and assigned to a trademark examiner. The examiner reviews it on absolute grounds (is the mark distinctive?) and relative grounds (does it conflict with existing marks?) and issues an Examination Report. From there your status will change to either "Objected" (the examiner raised concerns you must reply to) or move toward "Accepted & Advertised" (published in the Trade Marks Journal). Timelines vary with Registry workload, but examination typically follows within a few weeks to a few months.',
      },
    ],
    verdict: '"Formalities Chk Pass" is a green light on the administrative side of your filing. There is nothing to fix and nothing to pay — your application is validly on record and heading into examination. Simply monitor your status and be ready to act quickly if an Examination Report is issued.',
    faqs: [
      { question: 'How long does "Formalities Chk Pass" status last in India?', answer: 'Typically 4 to 8 weeks, though it can be longer depending on the Registry\'s current backlog. During this period the application waits to be assigned to an examiner. There is no fixed statutory timeline for how long it sits at this stage.' },
      { question: 'Is "Formalities Chk Pass" the same as trademark registration?', answer: 'No. It only means the basic filing formalities were verified. Your trademark is not yet examined, published, or registered. Full registration comes much later — after examination, a 4-month journal publication window, and (if no opposition) issuance of the registration certificate, usually 12–24 months from filing.' },
      { question: 'Do I need to do anything when my status is "Formalities Chk Pass"?', answer: 'No action is required. The application moves forward automatically. Just ensure your registered email and mobile are correct so you receive the Examination Report promptly, and start using the ™ symbol on your brand.' },
      { question: 'Can my trademark still be rejected after "Formalities Chk Pass"?', answer: 'Yes. The formality check only verifies paperwork — it does not assess whether your mark is registrable. The examiner can still raise objections at the examination stage, and third parties can oppose it after publication. This is why the stages after "Formalities Chk Pass" are the ones that decide your outcome.' },
    ],
    relatedLinks: STATUS_RELATED,
    ctaHeading: 'Want an Expert to Track Your Application?',
    ctaText: 'Our IP team monitors your trademark end-to-end and responds to any objection within the deadline — so a clean "Formalities Chk Pass" turns into a granted registration.',
    leadComment: 'Status page inquiry - Formalities Chk Pass',
  },

  'formalities-chk-fail': {
    slug: 'formalities-chk-fail',
    title: '"Formalities Chk Fail" — Trademark Status Meaning',
    category: 'Filing & Formalities',
    metaTitle: '"Formalities Chk Fail" Trademark Status — What It Means & How to Fix It | Trademarx',
    metaDesc: 'Formalities Chk Fail means your trademark application has a paperwork defect — usually a missing Form TM-48, wrong fee, or unsigned document. It is fixable. Learn how to respond.',
    quickAnswer: 'The status "Formalities Chk Fail" means the Registry found a defect in your trademark application during the initial paperwork check — commonly a missing power of attorney (Form TM-48), an unsigned form, an incorrect fee, or a bad logo image. It is fixable: you must correct the defect, usually within 30 days of the notice.',
    highlights: [
      { label: 'Action Required', value: 'Yes — fix the defect', icon: 'fas fa-triangle-exclamation' },
      { label: 'Deadline', value: 'Usually 30 days', icon: 'fas fa-hourglass-half' },
      { label: 'Common Cause', value: 'Missing Form TM-48', icon: 'fas fa-file-circle-xmark' },
      { label: 'Fixable?', value: 'Yes, in most cases', icon: 'fas fa-screwdriver-wrench' },
    ],
    intro: 'Seeing "Formalities Chk Fail" on your trademark application is unsettling, but it is one of the most fixable statuses in the whole process. It signals a technical or documentary defect at the very first check — not a rejection of your brand. Acting quickly is important, because ignoring it can cause your application to be treated as abandoned.',
    sections: [
      {
        heading: 'What does "Formalities Chk Fail" mean?',
        body: 'The formality check is the Registry\'s first review of whether an application is administratively complete. "Formalities Chk Fail" means one or more requirements were not met. The most common reasons are: a missing or defective Power of Attorney (Form TM-48) when a trademark agent or attorney files on your behalf; an unsigned application; the wrong government fee for the applicant type or number of classes; a poor-quality or oversized logo image; a missing user affidavit where prior use is claimed; or an incomplete goods/services specification. None of these relate to whether your brand is distinctive — they are procedural gaps that can almost always be cured.',
      },
      {
        heading: 'How to fix a "Formalities Chk Fail"',
        body: 'First, read the Registry\'s objection or the notice on the portal to identify the exact defect. Then file the correct document — most often uploading a properly executed Form TM-48, a signed form, the balance fee, or a compliant logo. Corrections are made through the IP India portal, and a written response addressing the Registry\'s note is filed against the application. Because there is usually a 30-day window, do not delay. If you filed through an agent, contact them immediately; if you filed yourself and are unsure exactly what is wrong, a professional can diagnose the defect from the application file within minutes.',
      },
      {
        heading: 'What happens if you ignore it',
        body: 'If the defect is not cured within the prescribed time, the Registry can treat the application as abandoned, and you lose your filing date (your priority). You would then have to file afresh — and in the meantime, someone else could file a similar mark and gain priority over you, since India follows a "first to file" system. That is why "Formalities Chk Fail" should be treated as urgent even though the fix itself is often simple.',
      },
    ],
    verdict: '"Formalities Chk Fail" is a procedural hiccup, not a rejection — but it is time-sensitive. Identify the exact defect, file the correction (most often a Form TM-48 or the balance fee) within the deadline, and your application returns to the normal track toward examination.',
    faqs: [
      { question: 'Why did my trademark get "Formalities Chk Fail"?', answer: 'The most frequent causes are a missing or defective Power of Attorney (Form TM-48), an unsigned application, an incorrect government fee, a low-quality logo image, or a missing user affidavit where use is claimed. The specific reason is noted by the Registry against your application on the IP India portal.' },
      { question: 'How do I fix "Formalities Chk Fail" status?', answer: 'Identify the defect from the Registry note, then file the correct document or fee through the IP India portal — for example, upload a properly executed Form TM-48, pay the balance fee, or submit a compliant logo. This must generally be done within 30 days of the notice.' },
      { question: 'Will I lose my trademark if I do not respond?', answer: 'You can. If the defect is not cured within the prescribed period, the Registry may treat the application as abandoned and you lose your original filing date. You would have to re-file, risking that another party files a similar mark in the meantime.' },
      { question: 'Does "Formalities Chk Fail" mean my brand name was rejected?', answer: 'No. It relates only to paperwork and procedure, not to the registrability of your brand. The examiner has not yet assessed whether your mark is distinctive or conflicts with existing marks — that happens later, at the examination stage.' },
    ],
    relatedLinks: STATUS_RELATED,
    ctaHeading: 'Got a "Formalities Chk Fail"? We Can Fix It Fast',
    ctaText: 'Send us your application number and our IP team will diagnose the exact defect and file the correction within the deadline — protecting your filing date.',
    leadComment: 'Status page inquiry - Formalities Chk Fail',
  },

  'send-to-vienna-codification': {
    slug: 'send-to-vienna-codification',
    title: '"Send to Vienna Codification" — Trademark Status Meaning',
    category: 'Filing & Formalities',
    metaTitle: '"Send to Vienna Codification" Trademark Status Meaning in India | Trademarx',
    metaDesc: 'Send to Vienna Codification means your logo trademark is being assigned international figurative-element codes. It is a routine step for logo marks — no action needed.',
    quickAnswer: 'The status "Send to Vienna Codification" means your trademark contains a logo or figurative element and has been forwarded to the Registry\'s Vienna Codification unit to be assigned international classification codes for its visual elements. It is a normal, positive step for logo marks — no action is required from you.',
    highlights: [
      { label: 'Action Required', value: 'None — just wait', icon: 'fas fa-circle-check' },
      { label: 'Typical Duration', value: '2–3 weeks', icon: 'fas fa-clock' },
      { label: 'Applies To', value: 'Logo / device marks', icon: 'fas fa-image' },
      { label: 'Is it good news?', value: 'Yes — routine step', icon: 'fas fa-thumbs-up' },
    ],
    intro: 'If your application status reads "Send to Vienna Codification", it almost always means you filed a logo (device) trademark rather than a plain word. This is a routine, behind-the-scenes classification step — not an objection or a problem. Here is what the Vienna Codification actually does and why your application is here.',
    sections: [
      {
        heading: 'What does "Send to Vienna Codification" mean?',
        body: 'The Vienna Classification is an international system (established by the Vienna Agreement, 1973) for categorising the figurative — that is, visual or graphic — elements of trademarks. When your mark includes a logo, symbol, image, or stylised design, the Registry sends it to its Vienna Codification unit, which analyses the artwork and assigns standardised codes describing its elements (for example, a code for a "star", an "animal", or a "geometric shape"). These codes make the mark searchable by visual content, so examiners and the public can find similar logos. This status therefore only appears for marks with a figurative element; pure word marks skip it entirely.',
      },
      {
        heading: 'What you should do now',
        body: 'No action is needed. "Send to Vienna Codification" is an internal administrative step handled entirely by the Registry. You do not file anything, pay anything, or respond to anything. It is simply useful confirmation that your logo application is progressing normally. Continue using the ™ symbol on your logo and keep records of use. If you also want the broadest protection for the name itself, this is a good moment to consider filing the wordmark separately, since a logo (device) filing protects mainly the specific design.',
      },
      {
        heading: 'What happens next',
        body: 'Once codification is complete, the application returns to the main queue and proceeds to the formality check and then examination — the same path any application follows. Your status will move on to "Formalities Chk Pass", then "Marked for Exam", and ultimately toward acceptance and publication. Vienna Codification itself does not decide your outcome; it is purely a classification of your logo\'s visual elements.',
      },
    ],
    verdict: '"Send to Vienna Codification" is a routine step that only logo trademarks go through, where the Registry assigns standard codes to your artwork\'s visual elements. It requires nothing from you and is not a sign of any problem — your logo application is simply being processed normally.',
    faqs: [
      { question: 'Is "Send to Vienna Codification" a good or bad sign?', answer: 'It is neutral-to-good — a normal processing step for logo trademarks, not an objection. It simply means your mark contains a figurative element that is being assigned international classification codes. No action is required.' },
      { question: 'How long does "Send to Vienna Codification" take?', answer: 'Usually about 2 to 3 weeks, though it depends on the Registry\'s backlog. After codification, the application returns to the normal queue for the formality check and examination.' },
      { question: 'Why is my trademark in Vienna Codification but my friend\'s is not?', answer: 'Because your application includes a logo or design element and theirs is likely a plain word mark. Vienna Codification only applies to figurative (visual) marks — it classifies the graphic elements. Word-only marks skip this stage.' },
      { question: 'Do I need to reply to "Send to Vienna Codification"?', answer: 'No. It is an internal Registry step. You do not file, pay, or respond to anything. Simply wait for your status to advance to the formality check and examination stages.' },
    ],
    relatedLinks: STATUS_RELATED,
    ctaHeading: 'Filing a Logo? Protect the Name Too',
    ctaText: 'A logo filing mainly protects the design. Talk to our IP team about also registering your brand name as a wordmark for the broadest protection — from ₹1,499.',
    leadComment: 'Status page inquiry - Send to Vienna Codification',
  },

  'marked-for-exam': {
    slug: 'marked-for-exam',
    title: '"Marked for Exam" — Trademark Status Meaning',
    category: 'Examination',
    metaTitle: '"Marked for Exam" Trademark Status Meaning in India | Trademarx',
    metaDesc: 'Marked for Exam means your trademark has been assigned to an examiner who will review it and issue an Examination Report. No action is needed yet — but be ready to reply.',
    quickAnswer: 'The status "Marked for Exam" means your trademark application has been assigned to a Registry examiner who will review it on absolute and relative grounds and issue an Examination Report. No action is required at this exact moment, but the next step — the Examination Report — may need a time-bound reply.',
    highlights: [
      { label: 'Action Required', value: 'None yet — stay alert', icon: 'fas fa-bell' },
      { label: 'Typical Duration', value: 'A few weeks to months', icon: 'fas fa-clock' },
      { label: 'Next Stage', value: 'Examination Report', icon: 'fas fa-arrow-right' },
      { label: 'Is it good news?', value: 'Yes — moving forward', icon: 'fas fa-thumbs-up' },
    ],
    intro: '"Marked for Exam" is the moment your trademark application reaches a real human examiner. It is a normal forward step, but it is also the calm before the most important checkpoint in the process — the Examination Report. Understanding what the examiner is looking for helps you prepare.',
    sections: [
      {
        heading: 'What does "Marked for Exam" mean?',
        body: 'After clearing the formality check, every application is queued to be examined. "Marked for Exam" confirms your application has now been allotted to a specific examiner at the Trade Marks Registry. The examiner assesses two things. First, absolute grounds: is the mark distinctive, or is it descriptive, generic, or deceptive? Second, relative grounds: does it conflict with earlier identical or deceptively similar marks already on the register or pending? Based on this review, the examiner prepares an Examination Report. This stage is where the substantive fate of your application begins to take shape.',
      },
      {
        heading: 'What you should do now',
        body: 'You do not file anything while the status is simply "Marked for Exam" — but this is the time to prepare. Make sure the email and mobile number on your application are correct and monitored, because the Examination Report is issued electronically and starts a strict deadline (generally one month to reply). It is also worth doing a quick self-check: if your brand name is descriptive of your goods, or similar to a well-known mark, an objection is more likely, and lining up a strong reply strategy in advance saves precious days.',
      },
      {
        heading: 'What happens next',
        body: 'The examiner issues an Examination Report, and your status changes accordingly. If the examiner has concerns, the status becomes "Objected", and you must file a reply (and possibly attend a hearing). If the examiner is satisfied, the application proceeds toward "Accepted & Advertised" and is published in the Trade Marks Journal for opposition. In short, "Marked for Exam" is the gateway to the decisive examination stage — a good sign that your application is actively progressing.',
      },
    ],
    verdict: '"Marked for Exam" means a real examiner now has your file and will issue an Examination Report. Nothing is due from you yet, but treat it as a signal to get ready: keep your contact details current and be prepared to reply quickly if an objection is raised.',
    faqs: [
      { question: 'How long does a trademark stay "Marked for Exam"?', answer: 'It varies widely with Registry workload — from a few weeks to a few months. The status ends when the examiner issues the Examination Report, after which your status changes to "Objected" or moves toward acceptance.' },
      { question: 'Do I need to do anything at the "Marked for Exam" stage?', answer: 'No immediate filing is needed. But you should ensure your registered email and mobile are correct and monitored, because the Examination Report triggers a strict reply deadline (usually one month).' },
      { question: 'Does "Marked for Exam" mean my trademark is approved?', answer: 'No. It only means an examiner has been assigned. The examiner still has to review your mark and may raise objections. Approval only comes after examination is cleared and the opposition period passes.' },
      { question: 'What happens after "Marked for Exam"?', answer: 'The examiner issues an Examination Report. Your status then becomes either "Objected" (you must reply) or advances toward "Accepted & Advertised" and publication in the Trade Marks Journal.' },
    ],
    relatedLinks: STATUS_RELATED,
    ctaHeading: 'Be Ready Before the Examination Report Lands',
    ctaText: 'The Examination Report starts a one-month clock. Our IP experts pre-assess your mark and draft a winning reply the moment it is issued — from ₹2,999.',
    leadComment: 'Status page inquiry - Marked for Exam',
  },

  'objected': {
    slug: 'objected',
    title: '"Objected" — Trademark Status Meaning',
    category: 'Examination',
    metaTitle: '"Objected" Trademark Status — Meaning, Reasons & How to Reply | Trademarx',
    metaDesc: 'Objected means the examiner raised objections in the Examination Report. Your trademark is NOT rejected — you must file a reply, usually within one month. Here is how.',
    quickAnswer: 'The status "Objected" means the trademark examiner raised one or more objections in the Examination Report — commonly under Section 9 (not distinctive) or Section 11 (similar to an existing mark). Your application is not rejected. You must file a written reply, usually within one month, to keep it alive.',
    highlights: [
      { label: 'Action Required', value: 'Yes — file a reply', icon: 'fas fa-triangle-exclamation' },
      { label: 'Deadline', value: 'Usually 1 month', icon: 'fas fa-hourglass-half' },
      { label: 'Common Grounds', value: 'Section 9 / Section 11', icon: 'fas fa-gavel' },
      { label: 'Still winnable?', value: 'Yes, with a strong reply', icon: 'fas fa-scale-balanced' },
    ],
    intro: 'An "Objected" status worries every applicant — but it is one of the most common and most recoverable stages in trademark registration. It does not mean your brand is refused; it means the examiner wants you to answer specific concerns. A well-argued reply resolves a large share of objections.',
    sections: [
      {
        heading: 'What does "Objected" mean?',
        body: 'After examination, if the examiner finds issues, the application is marked "Objected" and an Examination Report is issued setting out the grounds. The two most common are: Section 9 (absolute grounds) — the mark is considered non-distinctive, descriptive, or generic for the goods/services; and Section 11 (relative grounds) — the mark is identical or deceptively similar to an earlier registered or pending mark, which the examiner will cite. Objections can also relate to an incorrect goods description or classification. Importantly, "Objected" is an invitation to respond, not a final refusal — your application remains pending and can still proceed to registration if you overcome the objection.',
      },
      {
        heading: 'How to reply to an "Objected" trademark',
        body: 'You must file a Reply to the Examination Report through the IP India portal, generally within one month of the report being issued. A strong reply addresses each ground head-on: for Section 9, you argue distinctiveness or evidence acquired distinctiveness through use (sales, advertising, dated usage proof); for Section 11, you distinguish your mark from the cited marks on visual, phonetic, and conceptual grounds, and may point to differences in goods or coexisting marks. After the reply, the Registrar may accept the mark, or call a Show Cause Hearing. Because the arguments are legal and the deadline is strict, most applicants use a trademark professional to draft the reply.',
      },
      {
        heading: 'What happens if you do not reply',
        body: 'If no reply is filed within the prescribed time, the application is liable to be treated as abandoned — you lose the mark and your filing date. Given India\'s "first to file" system, delay is risky. So while "Objected" is very recoverable, it is also time-critical: the single most important thing is to file a considered reply before the deadline.',
      },
    ],
    verdict: '"Objected" is not a rejection — it is a checkpoint. The examiner has raised concerns (usually distinctiveness under Section 9 or similarity under Section 11) and you have roughly one month to answer them. File a strong, evidence-backed reply on time and your application can still march on to registration.',
    faqs: [
      { question: 'Does "Objected" mean my trademark is rejected?', answer: 'No. "Objected" means the examiner raised concerns you can answer. The application stays pending. Only if you fail to reply, or the Registrar refuses the mark after a hearing, does it end. Many objected applications proceed to registration after a good reply.' },
      { question: 'How long do I have to reply to an objection?', answer: 'Generally one month from the date the Examination Report is issued. Missing this deadline can cause the application to be treated as abandoned, so it is important to act quickly.' },
      { question: 'What are the most common reasons for a trademark objection?', answer: 'The two leading grounds are Section 9 (the mark is descriptive, generic, or non-distinctive) and Section 11 (the mark is identical or deceptively similar to an earlier mark). Objections about the goods/services description or wrong class are also common.' },
      { question: 'Can I reply to a trademark objection myself?', answer: 'Yes, technically you can file the reply yourself through the IP India portal. However, the reply requires legal arguments on distinctiveness and similarity, often with supporting evidence and case law. A weak reply reduces your chances, so most applicants use a trademark professional.' },
    ],
    relatedLinks: STATUS_RELATED,
    ctaHeading: 'Got a Trademark Objection? We Reply for You',
    ctaText: 'Our IP experts draft evidence-backed Examination Report replies that overcome Section 9 and Section 11 objections — filed within your deadline, from ₹2,999.',
    leadComment: 'Status page inquiry - Objected (needs objection reply)',
  },

  'ready-for-show-cause-hearing': {
    slug: 'ready-for-show-cause-hearing',
    title: '"Ready for Show Cause Hearing" — Trademark Status Meaning',
    category: 'Examination',
    metaTitle: '"Ready for Show Cause Hearing" Trademark Status Meaning in India | Trademarx',
    metaDesc: 'Ready for Show Cause Hearing means the Registrar was not satisfied with your objection reply and has scheduled a hearing. Attendance is critical — here is how to prepare.',
    quickAnswer: 'The status "Ready for Show Cause Hearing" means that after your objection reply (or lack of one), the Registrar has scheduled a hearing where you must appear and argue why your trademark should be registered. Attending — in person or via video — is critical; missing it usually leads to abandonment or refusal.',
    highlights: [
      { label: 'Action Required', value: 'Yes — attend hearing', icon: 'fas fa-triangle-exclamation' },
      { label: 'Format', value: 'In person or video call', icon: 'fas fa-video' },
      { label: 'Miss it?', value: 'Risk of refusal / abandonment', icon: 'fas fa-ban' },
      { label: 'Still winnable?', value: 'Yes, with good arguments', icon: 'fas fa-scale-balanced' },
    ],
    intro: '"Ready for Show Cause Hearing" is a serious but survivable stage. It means the objection to your mark was not resolved on paper, and the Registrar now wants to hear you out in person. How you handle the hearing often determines whether your trademark is accepted or refused.',
    sections: [
      {
        heading: 'What does "Ready for Show Cause Hearing" mean?',
        body: 'When an application is "Objected" and the applicant\'s written reply does not fully satisfy the examiner — or no reply was filed — the Registrar can fix a "show cause hearing". The name means exactly what it says: you are asked to show cause (give reasons) why the mark should be registered despite the objection. A hearing officer will be assigned and a date scheduled, notified through the IP India portal and your registered email. Hearings today are frequently conducted by video conference. This status confirms your application is queued for, or listed for, that hearing.',
      },
      {
        heading: 'How to prepare for the hearing',
        body: 'Preparation is everything. Review the original Examination Report and your reply, and build clear oral arguments on each surviving objection — distinctiveness for Section 9 grounds, and detailed distinctions from the cited marks for Section 11. Bring supporting evidence: proof of use, sales figures, advertising, and any consent or coexistence with cited proprietors. You (or your authorised agent/attorney) must attend on the scheduled date; adjournments are possible but not guaranteed. Because these hearings involve legal argument before a hearing officer, applicants very commonly send an experienced trademark attorney to appear on their behalf.',
      },
      {
        heading: 'What happens after the hearing',
        body: 'If the hearing officer is persuaded, the objection is waived and the application proceeds to "Accepted & Advertised" and publication in the Journal. If not, the mark may be "Refused" (a decision you can appeal). If neither party attends and no adjournment is sought, the application is typically treated as abandoned. So the outcome hinges heavily on showing up prepared.',
      },
    ],
    verdict: '"Ready for Show Cause Hearing" means your objection is being decided face-to-face rather than on paper. It is winnable — but only if you attend and argue well. Do not miss the date, prepare your distinctiveness and similarity arguments with evidence, and consider having a trademark attorney appear for you.',
    faqs: [
      { question: 'What happens if I miss my trademark show cause hearing?', answer: 'If neither you nor your agent attends and no adjournment is granted, the application is usually treated as abandoned or refused. Attendance is critical — always appear or have your authorised representative appear on the scheduled date.' },
      { question: 'Can I attend a trademark hearing online?', answer: 'Yes. Show cause hearings at the Trade Marks Registry are frequently conducted via video conference. Details of the hearing, including the mode and date, are notified on the IP India portal and by email.' },
      { question: 'Can a lawyer attend the trademark hearing for me?', answer: 'Yes. An authorised trademark agent or attorney can appear on your behalf and present the arguments. Given the legal nature of a show cause hearing, many applicants prefer professional representation to maximise their chances.' },
      { question: 'What happens if the trademark is refused after the hearing?', answer: 'If the Registrar refuses the mark, your status becomes "Refused". You can request a written copy of the grounds and file an appeal before the appropriate authority within the prescribed period. Refusal at the hearing is not necessarily the end of the road.' },
    ],
    relatedLinks: STATUS_RELATED,
    ctaHeading: 'Hearing Scheduled? Let an Expert Represent You',
    ctaText: 'Our trademark attorneys prepare your arguments and appear at the show cause hearing on your behalf — giving your mark the strongest chance of acceptance.',
    leadComment: 'Status page inquiry - Ready for Show Cause Hearing',
  },

  'refused': {
    slug: 'refused',
    title: '"Refused" — Trademark Status Meaning',
    category: 'Examination',
    metaTitle: '"Refused" Trademark Status — Meaning & What You Can Do Next | Trademarx',
    metaDesc: 'Refused means the Registrar rejected your trademark after examination or hearing. It is not always final — you may be able to appeal or re-file. Here are your options.',
    quickAnswer: 'The status "Refused" means the Registrar has declined to register your trademark — usually after an objection was not overcome at reply or hearing stage. It is a formal rejection, but not always the end: you can request the grounds, file an appeal within the prescribed time, or re-file a revised application.',
    highlights: [
      { label: 'Action Required', value: 'Yes — decide quickly', icon: 'fas fa-triangle-exclamation' },
      { label: 'Options', value: 'Appeal or re-file', icon: 'fas fa-code-branch' },
      { label: 'Appeal Window', value: 'Time-bound — act fast', icon: 'fas fa-hourglass-half' },
      { label: 'Is it final?', value: 'Not necessarily', icon: 'fas fa-scale-balanced' },
    ],
    intro: '"Refused" is the status no applicant wants to see, but it is not always final. It means the Registrar decided the objection against your mark stands. Depending on the grounds, you may still have viable routes — an appeal, a review, or a smarter re-filing. What matters most is understanding why it was refused and acting within the deadlines.',
    sections: [
      {
        heading: 'What does "Refused" mean?',
        body: 'A trademark is marked "Refused" when the Registrar, after examination and (usually) a show cause hearing, concludes that the mark cannot be registered. The refusal is grounded in the objections raised earlier — most often that the mark lacks distinctiveness (Section 9) or is deceptively similar to an existing mark (Section 11). You are entitled to request a copy of the order setting out the reasons for refusal. Understanding those exact grounds is essential, because they determine whether an appeal is worthwhile or whether a modified fresh application is the better path.',
      },
      {
        heading: 'What you can do after a refusal',
        body: 'You typically have three options. First, appeal: a refusal can be challenged before the appropriate appellate authority (following the abolition of the IPAB, such appeals now lie before the High Court) within the prescribed period — this is worth it when you have strong arguments the hearing officer overlooked. Second, review/restoration in limited procedural situations. Third, re-file: if the refusal was on distinctiveness, you might re-file with a more distinctive version of the mark, a narrower specification, or after building evidence of use. The right choice depends entirely on the grounds of refusal, so obtaining and analysing the written order is the crucial first step.',
      },
      {
        heading: 'Acting within the deadline',
        body: 'Appeals against refusal are time-bound. If you intend to challenge the decision, you must move promptly — waiting can forfeit the right to appeal and leave re-filing (with a fresh, later priority date) as the only option. If you are unsure whether to appeal or re-file, have a trademark professional review the refusal order quickly so no deadline is missed.',
      },
    ],
    verdict: '"Refused" is a rejection, but rarely a dead end. Get the written grounds, assess whether the refusal is beatable on appeal, or whether a stronger re-filing is smarter. Either way, the deadlines are strict — review the order and decide your route without delay.',
    faqs: [
      { question: 'Is a "Refused" trademark final?', answer: 'Not necessarily. You can appeal the refusal before the appropriate authority within the prescribed time, or in some cases re-file a modified application. Whether appeal or re-filing is best depends on the specific grounds of refusal stated in the Registrar\'s order.' },
      { question: 'Can I appeal a trademark refusal in India?', answer: 'Yes. Following the abolition of the IPAB, appeals against a Registrar\'s refusal are filed before the relevant High Court within the prescribed limitation period. A strong appeal focuses on legal errors or overlooked evidence in the refusal.' },
      { question: 'Why was my trademark refused?', answer: 'Most refusals rest on the objections raised earlier — the mark being non-distinctive or descriptive (Section 9), or deceptively similar to an existing mark (Section 11). You can request the written order to see the exact reasons.' },
      { question: 'Can I re-file a refused trademark?', answer: 'Yes, you can file a fresh application — ideally with changes that address the reason for refusal, such as a more distinctive mark, a narrower goods specification, or added evidence of use. Note that a fresh filing gets a new, later priority date.' },
    ],
    relatedLinks: STATUS_RELATED,
    ctaHeading: 'Trademark Refused? Explore Your Options',
    ctaText: 'Send us the refusal order and our IP experts will advise whether to appeal or re-file — and handle it for you so no deadline is missed.',
    leadComment: 'Status page inquiry - Refused',
  },

  'accepted-and-advertised': {
    slug: 'accepted-and-advertised',
    title: '"Accepted & Advertised" — Trademark Status Meaning',
    category: 'Publication & Opposition',
    metaTitle: '"Accepted & Advertised" Trademark Status Meaning in India | Trademarx',
    metaDesc: 'Accepted & Advertised means your trademark cleared examination and is published in the Trade Marks Journal for a 4-month opposition window. You are close to registration.',
    quickAnswer: 'The status "Accepted & Advertised" means your trademark passed examination and has been published in the Trade Marks Journal. A four-month window now opens for third parties to oppose it. If no valid opposition is filed, your mark proceeds to registration. This is a strongly positive, late-stage status.',
    highlights: [
      { label: 'Action Required', value: 'None — monitor only', icon: 'fas fa-circle-check' },
      { label: 'Opposition Window', value: '4 months from publication', icon: 'fas fa-calendar-day' },
      { label: 'Next Stage', value: 'Registered (if unopposed)', icon: 'fas fa-arrow-right' },
      { label: 'Is it good news?', value: 'Yes — nearly there', icon: 'fas fa-thumbs-up' },
    ],
    intro: '"Accepted & Advertised" is one of the best statuses you can see. It means your trademark has cleared the examiner and is now published for the public to see. Only one hurdle remains — the opposition window — before registration. Here is what it means and what to watch for.',
    sections: [
      {
        heading: 'What does "Accepted & Advertised" mean?',
        body: 'Once an examiner is satisfied that a mark is registrable (either at first examination or after your objection reply/hearing succeeded), the application is accepted and advertised — published in the Trade Marks Journal, the Registry\'s official weekly gazette. Publication serves a public-notice purpose: it gives anyone who believes your mark conflicts with theirs a chance to formally object before it is registered. Reaching this stage means the substantive examination is behind you. The mark is now in a four-month public-review period, after which, absent opposition, it moves to registration.',
      },
      {
        heading: 'What you should do now',
        body: 'No filing is required, but you should stay alert during the opposition window. Monitor your status for any opposition notice, and keep your evidence of use organised in case you need to defend the mark. This is also a good time to prepare for the ™-to-® switch you will be entitled to make once registered. If you receive a Notice of Opposition, you must respond with a counter-statement within the prescribed time (generally two months) — missing that deadline can cause the application to be deemed abandoned, so treat any opposition as urgent.',
      },
      {
        heading: 'What happens next',
        body: 'If the four-month window passes with no opposition, your status advances to "Registered" and the Registry issues your registration certificate — at which point you can use the ® symbol and enforce the mark fully. If someone files an opposition, the status becomes "Opposed" and a quasi-judicial proceeding begins (evidence, arguments, and a decision). Most advertised marks are not opposed and proceed smoothly to registration.',
      },
    ],
    verdict: '"Accepted & Advertised" means the hard part — examination — is done, and your trademark is published for a four-month opposition window. Nothing is required unless someone opposes it. Watch your status closely during this period, and get ready to move from ™ to ® once the mark registers.',
    faqs: [
      { question: 'How long after "Accepted & Advertised" does a trademark get registered?', answer: 'After publication in the Trade Marks Journal, there is a four-month opposition window. If no opposition is filed, the mark typically proceeds to registration and the certificate is issued in the following weeks to a few months, depending on Registry processing.' },
      { question: 'Can a trademark be opposed after it is advertised?', answer: 'Yes — that is the purpose of advertisement. For four months from the date of publication in the Journal, any third party can file a Notice of Opposition. If they do, your status changes to "Opposed" and you must file a counter-statement within the prescribed time.' },
      { question: 'Do I need to do anything when my status is "Accepted & Advertised"?', answer: 'No filing is required. Just monitor your status through the opposition window and be ready to respond quickly if a Notice of Opposition is filed. Keep your evidence of use organised as a precaution.' },
      { question: 'Can I use the ® symbol after "Accepted & Advertised"?', answer: 'Not yet. The ® symbol may only be used after the mark is actually registered and the certificate is issued. Until then you continue to use ™. Using ® before registration is an offence under the Trade Marks Act.' },
    ],
    relatedLinks: STATUS_RELATED,
    ctaHeading: 'Almost Registered — Protect Your Position',
    ctaText: 'If your mark is opposed during the journal window, our IP team files your counter-statement and defends the mark. Talk to an expert to stay protected.',
    leadComment: 'Status page inquiry - Accepted and Advertised',
  },

  'opposed': {
    slug: 'opposed',
    title: '"Opposed" — Trademark Status Meaning',
    category: 'Publication & Opposition',
    metaTitle: '"Opposed" Trademark Status — Meaning & How to Defend Your Mark | Trademarx',
    metaDesc: 'Opposed means a third party filed a Notice of Opposition against your published trademark. You must file a counter-statement, usually within two months, or lose the mark.',
    quickAnswer: 'The status "Opposed" means a third party has filed a Notice of Opposition against your trademark during the journal publication window. To keep your application alive you must file a counter-statement, generally within two months, and then contest the opposition with evidence. Ignoring it leads to abandonment.',
    highlights: [
      { label: 'Action Required', value: 'Yes — file counter-statement', icon: 'fas fa-triangle-exclamation' },
      { label: 'Deadline', value: 'Usually 2 months', icon: 'fas fa-hourglass-half' },
      { label: 'Next Steps', value: 'Evidence & hearing', icon: 'fas fa-scale-balanced' },
      { label: 'Still winnable?', value: 'Yes — actively defend', icon: 'fas fa-shield-halved' },
    ],
    intro: '"Opposed" means someone has formally challenged your trademark after it was advertised. It is an adversarial proceeding, but a very defensible one — many oppositions are settled or decided in the applicant\'s favour. The key is to respond within the deadline and defend the mark properly.',
    sections: [
      {
        heading: 'What does "Opposed" mean?',
        body: 'After a mark is advertised in the Trade Marks Journal, any person may file a Notice of Opposition within four months, arguing that the mark should not be registered — typically because it is similar to their earlier mark, is non-distinctive, or was filed in bad faith. When that happens, your status changes to "Opposed", and the matter becomes an inter-partes (two-party) proceeding before the Registry. It is essentially a mini-trial on paper: notice, counter-statement, evidence from both sides, and a hearing, ending in a decision on whether your mark can register.',
      },
      {
        heading: 'How to defend an opposed trademark',
        body: 'Your first and most urgent step is to file a counter-statement in response to the Notice of Opposition, generally within two months. Failing to file it on time causes the application to be treated as abandoned — so this deadline is critical. After the counter-statement, both sides file evidence by way of affidavit (the opponent supports its grounds; you support your right to the mark with proof of use, distinctiveness, and distinctions from the opponent\'s mark). The Registry then holds a hearing and decides. Many oppositions also settle — through coexistence agreements, amended specifications, or withdrawal — so defending vigorously often creates room for a negotiated outcome.',
      },
      {
        heading: 'What happens next',
        body: 'If you successfully defend the opposition, the mark proceeds to registration. If the opposition succeeds, the application is refused (a decision you may appeal). If you do not file the counter-statement in time, the application is deemed abandoned. Because opposition is a legal proceeding with strict timelines and evidentiary rules, applicants almost always defend it with a trademark attorney.',
      },
    ],
    verdict: '"Opposed" means your trademark is being formally challenged — but it is far from lost. File your counter-statement within the deadline (usually two months), marshal your evidence of use and distinctiveness, and defend the mark. Many oppositions are won or settled; the fatal mistake is missing the counter-statement deadline.',
    faqs: [
      { question: 'What happens if my trademark is opposed?', answer: 'You must file a counter-statement responding to the Notice of Opposition, generally within two months. The matter then proceeds through evidence affidavits from both parties and a hearing, after which the Registry decides whether your mark can be registered.' },
      { question: 'How long do I have to respond to a trademark opposition?', answer: 'The counter-statement must be filed within the prescribed period — generally two months from receipt of the Notice of Opposition. Missing this deadline causes the application to be treated as abandoned, so it is critical to respond on time.' },
      { question: 'Can I win a trademark opposition?', answer: 'Yes. Many oppositions are decided in the applicant\'s favour or settled through coexistence agreements or amended specifications. Success depends on filing the counter-statement on time and presenting strong evidence of use and distinctiveness.' },
      { question: 'What is the difference between an objection and an opposition?', answer: 'An objection is raised by the Registry\'s examiner during examination (before publication). An opposition is raised by a third party after the mark is advertised in the Journal. Both must be answered within deadlines, but they occur at different stages and involve different procedures.' },
    ],
    relatedLinks: STATUS_RELATED,
    ctaHeading: 'Your Trademark Is Opposed — Defend It Now',
    ctaText: 'Our IP attorneys file your counter-statement within the deadline and build the evidence to defend your mark through to a hearing. Talk to an expert today.',
    leadComment: 'Status page inquiry - Opposed',
  },

  'registered': {
    slug: 'registered',
    title: '"Registered" — Trademark Status Meaning',
    category: 'Outcome',
    metaTitle: '"Registered" Trademark Status — Meaning, ® Symbol & Renewal | Trademarx',
    metaDesc: 'Registered means your trademark is fully protected for 10 years. You can now use the ® symbol and enforce your rights. Learn what to do after registration and when to renew.',
    quickAnswer: 'The status "Registered" means your trademark is fully granted and legally protected in India for 10 years from the date of application. You may now use the ® symbol, enforce your rights against infringers, and license or assign the mark. Remember to renew it before the 10-year term ends.',
    highlights: [
      { label: 'Action Required', value: 'None — but renew in 10 yrs', icon: 'fas fa-circle-check' },
      { label: 'Validity', value: '10 years, renewable', icon: 'fas fa-calendar-check' },
      { label: 'You Can Now', value: 'Use the ® symbol', icon: 'fas fa-registered' },
      { label: 'Is it good news?', value: 'Yes — fully protected', icon: 'fas fa-trophy' },
    ],
    intro: 'Congratulations — "Registered" is the finish line of the trademark journey. Your mark is now a legally enforceable asset. But registration also unlocks new rights and responsibilities. Here is what "Registered" means and what you should do next to make the most of your protection.',
    sections: [
      {
        heading: 'What does "Registered" mean?',
        body: 'A "Registered" status means the Registry has granted your trademark and issued a Registration Certificate. Your mark is now protected for 10 years from the date of application (not the date of registration), and that protection is renewable indefinitely in 10-year blocks. Registration gives you the exclusive right to use the mark for your registered goods/services across India, the right to sue for infringement, and the ability to license, franchise, or sell the mark as an asset. It is also required for programmes such as Amazon Brand Registry and is strong proof of ownership in any dispute.',
      },
      {
        heading: 'What you should do after registration',
        body: 'Start using the ® symbol on your brand — you are now legally entitled to it, and it warns off potential infringers. Keep your Registration Certificate safe and note your renewal date (10 years from the application date). Consider registering in additional classes if your product range has grown, and in other countries if you export. It is also wise to set up trademark watch — monitoring new filings for marks similar to yours — so you can oppose copycats early. Continue keeping records of use, which support both renewal and enforcement.',
      },
      {
        heading: 'Renewal and keeping your mark alive',
        body: 'A registered trademark must be renewed before the end of each 10-year term to stay in force. The Registry can be renewed within the last year of the term, and there is a six-month grace period (with a surcharge) after expiry. If you miss renewal entirely, the mark can be removed from the register — so calendar your renewal date well in advance. Renewal is far cheaper and faster than losing and re-filing the mark.',
      },
    ],
    verdict: '"Registered" means your trademark is a fully protected, enforceable asset for the next 10 years. Switch from ™ to ®, calendar your renewal date, and consider watch services and additional-class or international filings as your brand grows. Just don\'t let the 10-year renewal lapse.',
    faqs: [
      { question: 'How long is a registered trademark valid in India?', answer: 'A registered trademark is valid for 10 years from the date of application. It can be renewed indefinitely for successive 10-year periods, so your mark can remain protected forever as long as you renew it on time.' },
      { question: 'Can I use the ® symbol now that my trademark is registered?', answer: 'Yes. Once your status is "Registered" and the certificate is issued, you are legally entitled to use the ® symbol. It signals that the mark is officially registered and helps deter infringers.' },
      { question: 'When should I renew my registered trademark?', answer: 'Renew before the end of the 10-year term (renewal can be filed within the last year). There is a six-month grace period after expiry with a surcharge, but if you miss that, the mark can be removed from the register. Calendar the renewal date in advance.' },
      { question: 'What rights does a registered trademark give me?', answer: 'It gives you the exclusive right to use the mark for your registered goods/services across India, the right to sue for infringement and claim damages, and the ability to license, franchise, or assign the mark. It is also required for programmes like Amazon Brand Registry.' },
    ],
    relatedLinks: STATUS_RELATED,
    ctaHeading: 'Registered? Keep Your Mark Protected',
    ctaText: 'From renewals to trademark watch and multi-class filings, our IP team helps you protect and grow your registered brand. Talk to an expert.',
    leadComment: 'Status page inquiry - Registered',
  },

  'abandoned': {
    slug: 'abandoned',
    title: '"Abandoned" — Trademark Status Meaning',
    category: 'Outcome',
    metaTitle: '"Abandoned" Trademark Status — Why It Happens & How to Recover | Trademarx',
    metaDesc: 'Abandoned means your trademark application lapsed — usually because a deadline was missed (objection reply, counter-statement, or hearing). Learn if it can be restored or re-filed.',
    quickAnswer: 'The status "Abandoned" means your trademark application has lapsed because a required action was not taken in time — most often a missed Examination Report reply, counter-statement, or hearing. In limited cases it can be restored if the delay is explained; otherwise you must file a fresh application.',
    highlights: [
      { label: 'Action Required', value: 'Yes — act fast', icon: 'fas fa-triangle-exclamation' },
      { label: 'Usual Cause', value: 'A missed deadline', icon: 'fas fa-hourglass-end' },
      { label: 'Options', value: 'Restore or re-file', icon: 'fas fa-rotate-left' },
      { label: 'Is it final?', value: 'Sometimes recoverable', icon: 'fas fa-scale-balanced' },
    ],
    intro: '"Abandoned" is a frustrating status because it usually results from a missed deadline rather than a decision on the merits of your brand. The good news is that, depending on why and when it happened, you may be able to restore the application — and if not, re-filing is straightforward. Time is critical.',
    sections: [
      {
        heading: 'What does "Abandoned" mean?',
        body: 'A trademark application is marked "Abandoned" when the applicant fails to take a required step within the prescribed time. The most common triggers are: not replying to an Examination Report within one month of an objection; not filing a counter-statement within the deadline after an opposition; not attending a scheduled hearing; or not curing a formalities defect. In each case, the law treats silence as giving up the application. Importantly, "Abandoned" reflects a procedural lapse, not a ruling that your brand is unregistrable — which is why recovery is often possible.',
      },
      {
        heading: 'Can an abandoned trademark be restored?',
        body: 'Sometimes. If the application was deemed abandoned for failure to respond in time, you may be able to seek restoration by explaining the delay and showing it was not intentional — for instance, if the Examination Report never reached you, or there was a genuine, justifiable reason. Such requests are considered on their facts and are more likely to succeed if raised promptly. Where restoration is not available, the practical route is to file a fresh application for the same mark. Note that a fresh filing carries a new priority date, so any intervening applications by others may now rank ahead of yours.',
      },
      {
        heading: 'What you should do now',
        body: 'Act immediately. First, find out exactly why the application was abandoned by reviewing the file — often it is a missed objection reply. Then decide between restoration (if the deadline lapse can be justified and is recent) and re-filing. Because both paths are time-sensitive and the earlier priority date is valuable, get a trademark professional to review the file quickly so you choose the strongest available option before more time passes.',
      },
    ],
    verdict: '"Abandoned" almost always means a deadline was missed, not that your brand was rejected. Move fast: determine the cause, and either seek restoration (if the lapse is recent and justifiable) or re-file promptly. The sooner you act, the better your chance of preserving your brand and, ideally, your priority.',
    faqs: [
      { question: 'Why did my trademark become "Abandoned"?', answer: 'The usual cause is a missed deadline — not replying to an Examination Report within one month, not filing a counter-statement after an opposition, not attending a hearing, or not curing a formalities defect. It is a procedural lapse, not a decision that your brand is unregistrable.' },
      { question: 'Can I recover an abandoned trademark application?', answer: 'Possibly. If the application was abandoned for failure to respond in time, you may seek restoration by explaining that the delay was unintentional or that the notice never reached you. Success depends on the facts and on acting promptly. Otherwise, you can file a fresh application.' },
      { question: 'What is the difference between "Abandoned" and "Refused"?', answer: '"Abandoned" means the application lapsed because a required action was not taken in time — a procedural failure. "Refused" means the Registrar considered the matter and decided the mark cannot be registered — a decision on the merits. Refusal can be appealed; abandonment may sometimes be restored.' },
      { question: 'Should I restore or re-file an abandoned trademark?', answer: 'It depends on how recently and why it lapsed. If the deadline miss was recent and justifiable, restoration preserves your original priority date. If restoration is not viable, re-filing is straightforward but gets a new, later priority date. A quick professional review of the file helps you decide.' },
    ],
    relatedLinks: STATUS_RELATED,
    ctaHeading: 'Trademark Abandoned? Don\'t Lose Your Brand',
    ctaText: 'Send us your application number and our IP team will check whether it can be restored — or re-file it correctly so your brand is protected again.',
    leadComment: 'Status page inquiry - Abandoned',
  },

  'withdrawn': {
    slug: 'withdrawn',
    title: '"Withdrawn" — Trademark Status Meaning',
    category: 'Outcome',
    metaTitle: '"Withdrawn" Trademark Status Meaning in India — What It Means | Trademarx',
    metaDesc: 'Withdrawn means the trademark application was voluntarily cancelled by the applicant, or treated as withdrawn. It ends the application. Learn your options and how to re-file.',
    quickAnswer: 'The status "Withdrawn" means the trademark application has been taken back — usually voluntarily by the applicant, or treated as withdrawn following a request or failure to proceed. The application no longer continues toward registration. If you still want the mark, you generally need to file a fresh application.',
    highlights: [
      { label: 'Action Required', value: 'Re-file if still needed', icon: 'fas fa-rotate-left' },
      { label: 'Usual Cause', value: 'Voluntary withdrawal', icon: 'fas fa-hand' },
      { label: 'Effect', value: 'Application ends', icon: 'fas fa-circle-stop' },
      { label: 'Can I re-apply?', value: 'Yes — fresh filing', icon: 'fas fa-file-circle-plus' },
    ],
    intro: '"Withdrawn" is a less common status and usually reflects a deliberate choice — the applicant decided not to pursue the mark. Occasionally it results from a procedural request. Either way, it closes the application. Here is what it means and what to do if you have changed your mind.',
    sections: [
      {
        heading: 'What does "Withdrawn" mean?',
        body: 'A trademark application shows "Withdrawn" when it has been removed from active prosecution — most commonly because the applicant chose to withdraw it. Applicants withdraw for various reasons: they decided to rebrand, the mark clashed with a cited earlier mark and they preferred not to fight it, they consolidated multiple filings, or a settlement with another party required withdrawal. In some situations an application can also be treated as withdrawn following the applicant\'s request or failure to proceed. The result is the same: the application no longer moves toward registration.',
      },
      {
        heading: 'What you can do next',
        body: 'If the withdrawal was intentional and you no longer need the mark, no action is required. If you have changed your mind, or the withdrawal was not what you wanted, you will generally need to file a fresh application for the mark, subject to the register\'s current state — an earlier conflicting mark that prompted the withdrawal may still be an obstacle. Because a new filing gets a new priority date, and because the reasons behind the original withdrawal matter, it is worth having a professional run a fresh search and advise on the best filing strategy before you re-apply.',
      },
    ],
    verdict: '"Withdrawn" means the application has been pulled and will not proceed to registration — usually a deliberate applicant decision. If you still want the brand protected, a fresh application is the way forward. Get a quick clearance search first, especially if the original mark faced a conflict.',
    faqs: [
      { question: 'What does "Withdrawn" mean in trademark status?', answer: 'It means the application has been taken back and will not continue toward registration — most often because the applicant voluntarily withdrew it, sometimes as part of a rebrand or a settlement with another party.' },
      { question: 'Can I re-apply for a withdrawn trademark?', answer: 'Yes. You can file a fresh application for the mark, but it will receive a new priority date and remains subject to the current register — including any earlier conflicting mark that may have prompted the original withdrawal. A fresh search is advisable before re-filing.' },
      { question: 'Is "Withdrawn" the same as "Abandoned"?', answer: 'Not exactly. "Withdrawn" typically reflects a voluntary decision by the applicant to stop the application, whereas "Abandoned" usually results from a missed deadline or failure to respond. Both end the application, but the cause differs.' },
      { question: 'Does a withdrawn trademark affect future filings?', answer: 'The withdrawn application itself no longer blocks anyone, but the underlying reason may still matter — for example, if it was withdrawn because of an earlier similar mark, that earlier mark can still obstruct a fresh filing. A clearance search helps you plan.' },
    ],
    relatedLinks: STATUS_RELATED,
    ctaHeading: 'Want to Re-File Your Trademark?',
    ctaText: 'Our IP team runs a free clearance search and files a fresh application with the right strategy — so your brand gets protected properly this time.',
    leadComment: 'Status page inquiry - Withdrawn',
  },

};
