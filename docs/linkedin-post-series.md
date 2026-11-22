# LinkedIn post series: one build per post

Ten short posts, one per case study, in the "Built X using n8n" format.
Every fact comes from the case study file in `src/content/case-studies/`.

**Ground rules (keep these if you edit):**

- These are portfolio builds for fictional sample clients. Never say "for a client". If asked, say "portfolio build".
- No hours-saved or revenue numbers. None are measured.
- The finance background is perspective only, never "I automated this at my old job".
- Sell services, not yourself as a hire: freelance, project-based work. No "open to work", "looking for opportunities", "still learning" or #OpenToWork. Never mention part-time.
- Every post ends with a call to action for buyers ("send me a message", "let's talk").

**Suggested cadence:** post #0 first (and #0b if you use it), then two build posts a week (Tue and Thu morning) for five weeks. The order mixes platforms and topics.

**Media for each post:** a clean screenshot of the canvas, readable when zoomed, or the explainer film in `public/films/<slug>.mp4` (native video usually reaches more people). Use clean images, not watermarked ones.

**Links:** every post ends with two links above the hashtags: `🌐 See my work and book a call` (the homepage, so readers see the landing page before the booking section) and `▶️ See it work` (that build's case study and demo). Ramon asked for the homepage instead of /contact on 2026-11-09. No first comment needed.

---

## 0. Open for AI automation projects (post this first)

Image: a clean graphic or a screenshot of the homepage hero. No video.

Now taking on new AI automation projects 🚀

What would your team do with the hours it spends on data entry, chasing leads and follow-ups?

Here's what my automations do for a business:
✅ Every new lead gets a reply in under a second, so none go cold in an inbox
✅ Invoices are checked against the PO and delivery record before anyone approves them, so nothing gets paid twice
✅ Calls are answered and appointments booked 24/7, even after hours
✅ Unpaid invoices are chased on schedule, and reminders stop the moment a customer disputes
✅ Client documents are named, filed and logged without anyone downloading a thing
✅ New hires are set up and followed up to day 30 without HR chasing anyone

All on the tools you already use, connected with n8n, Zapier or Make.

With 10+ years in finance and accounting behind me, every build has approvals where they matter, a record of every step, and an alert when something fails. It runs in your own account, with documentation and a handover, so you're never tied to me.

Have a repetitive process you'd like off your team's plate? Send me a message and tell me what it is. I'll tell you honestly whether it's worth automating, and how I'd build it.

🌐 See 10 builds, each with a runnable demo, and book a call: https://ramonvallejera.com

#AIAutomation #n8n #Zapier #MakeCom #WorkflowAutomation #BusinessAutomation #SmallBusiness #Productivity #NoCode #ArtificialIntelligence


---

## 0b. Website launch (alternative, or the post after #0)

Image: a screenshot of the homepage hero. On this post the link is the point, so keep it
in the body even though LinkedIn shows link posts to fewer people.

My website is live 🚀

👉 ramonvallejera.com

It shows what automation can do for your business, with a runnable demo of each build so you can watch it work:

⚡ Leads answered in under a second, with none forgotten
🧾 Invoices checked and approved before they're paid, never paid twice
📞 Calls answered and appointments booked, even after hours
📁 Documents filed and logged without anyone touching them
📅 And a calendar to book a call about your own process

Every build shows what it does and how it handles things going wrong, because that's the part that decides whether you can trust an automation with real work.

If there's a process eating up your team's week, book a call or send me a message.

What's the first thing you'd automate in your business? 👀

#AIAutomation #n8n #Zapier #MakeCom #WorkflowAutomation #BusinessAutomation #SmallBusiness #Productivity #NoCode #ArtificialIntelligence

---

## 1. AI Invoice Processing & Approval (n8n)

Slug: `ai-invoice-processing-approval`

Built an AI Invoice Processing & Approval workflow using n8n 🧾

This workflow picks up invoices from Gmail, skips duplicates, and uses AI to pull out every billing figure. It then checks each invoice against the purchase order and the delivery record before anyone approves it.

Clean invoices go to the budget owner in Slack. Invoices with problems go to accounts payable with the issues already flagged. Only approved bills are added to QuickBooks, and every invoice is logged with what happened to it.

A few safety checks I built in:
✅ If the AI is less than 80% sure it read the invoice correctly, a person confirms the details first
✅ Duplicates are checked twice, so the same bill is never paid twice
✅ Nothing reaches QuickBooks without a person approving it in Slack

After 10 years in finance, I know manual invoice matching is where mistakes slip through. The goal is simple: less checking by hand, fewer payment errors, and a clear record of every decision.

If your team still matches invoices by hand, send me a message and I'll show you how this would work with your tools. 📩

🌐 See my work and book a call: https://ramonvallejera.com
▶️ See it work: https://ramonvallejera.com/case-study/ai-invoice-processing-approval

#n8n #AIAutomation #InvoiceProcessing #FinanceAutomation #AccountsPayable #WorkflowAutomation #QuickBooks #Accounting #SmallBusiness #NoCode

---

## 2. Gmail Attachment Filing (Make)

Slug: `gmail-attachment-filing`

Built a Gmail Attachment Filing scenario using Make 📎

Clients email receipts, statements and scans every day, and they usually end up saved as "scan001.pdf" in someone's Downloads folder.

With this scenario, you just label an email "To File". Every 15 minutes, Make picks it up, keeps only the real attachments, and has Gemini read each file and give it a clear, descriptive name. The file is saved to the client's Google Drive folder, logged in Google Sheets with a link, and the sender gets one receipt listing everything that was saved.

Built-in checks:
✅ Signature logos and tiny images are skipped, so only real documents are filed
✅ If Gemini or Drive fails, the step is retried up to 3 times
✅ No receipt goes out unless at least one file was actually saved

Small automation, but it fixes three problems at once: filing by hand, file names that say nothing, and clients never knowing if their documents arrived.

Tested end to end on real attachments.

If client documents still pile up in an inbox, I can set this up for your team. 📩

🌐 See my work and book a call: https://ramonvallejera.com
▶️ See it work: https://ramonvallejera.com/case-study/gmail-attachment-filing

#MakeCom #AIAutomation #Bookkeeping #WorkflowAutomation #Gmail #GoogleDrive #DocumentManagement #Accounting #SmallBusiness #NoCode

---

## 3. Lead Scoring & Follow-Up (n8n)

Slug: `solar-lead-scoring-follow-up`

Built an AI Lead Scoring & Follow-Up workflow using n8n ⚡

Website leads go cold fast. This workflow makes sure none of them sit in an inbox.

The moment someone submits the form, they get a reply in under a second. Then AI reads the enquiry, fixed rules score the lead, the next sales rep in line is assigned and alerted in Slack, and the lead gets a personal reply. It also checks whether the person is an existing customer or has enquired before.

How it keeps leads from slipping through:
✅ If the rep hasn't followed up within 15 working minutes, the lead goes to the sales manager
✅ The AI only reads the message. Fixed rules set the score, so every score lists its reasons
✅ The AI reply never mentions prices or savings, and a standard reply goes out if the AI fails

Overnight and weekend leads are due at 08:15 the next working morning, so the clock is fair to the team too.

Losing leads to slow replies? Send me a message and let's look at your follow-up. 📩

🌐 See my work and book a call: https://ramonvallejera.com
▶️ See it work: https://ramonvallejera.com/case-study/solar-lead-scoring-follow-up

#n8n #AIAutomation #LeadGeneration #LeadScoring #SalesAutomation #SalesOps #WorkflowAutomation #CRM #SmallBusiness #NoCode

---

## 4. Client Pipeline Emails (Zapier)

Slug: `airtable-crm-lead-engagement`

Built a Client Pipeline automation using Zapier 📋

Most teams have a pipeline board, but moving a card doesn't actually do anything. The next step still depends on someone remembering it.

With this Zap, moving a client card to a new stage in Airtable triggers the next step automatically:
→ Ready to Start: a Google Drive folder and a content task are created
→ No Response or Quoted: a follow-up email, plus a nudge two days later
→ Approved: an AI-written welcome email
→ Paid and Closed: an AI-written thank-you

Built-in checks:
✅ Each stage runs once, so moving a card back and forth never sends the same email twice
✅ The 2-day nudge only goes out if the client still hasn't replied
✅ If a step fails, it retries after 15 minutes, then sends an alert naming the client and stage

Built with Paths, Delay and error handlers, and tested live.

Want your pipeline to move on its own? Send me a message. 📩

🌐 See my work and book a call: https://ramonvallejera.com
▶️ See it work: https://ramonvallejera.com/case-study/airtable-crm-lead-engagement

#Zapier #AIAutomation #Airtable #CRM #WorkflowAutomation #ClientOnboarding #AgencyLife #BusinessAutomation #SmallBusiness #NoCode

---

## 5. AI Appointment Setter (n8n + VAPI)

Slug: `ai-appointment-setter`

Built an AI Appointment Setter using n8n and VAPI 📞

Most callers who reach a busy or after-hours line hang up without leaving a voicemail. Every one of those is a lost booking.

What it does for a business:
✅ Every call is answered 24/7, including nights and weekends
✅ Callers book, move or cancel an appointment while they're still on the line, with no staff involved
✅ No double bookings: the calendar is checked again right before every booking
✅ The calendar and the customer records always match, because every change updates both

How it works: a VAPI voice agent talks to the caller, and five n8n workflows do the work behind it, checking availability, booking, rescheduling, cancelling and logging every call.

If missed calls are costing you bookings, let's talk. 👇

🌐 See my work and book a call: https://ramonvallejera.com
▶️ See it work: https://ramonvallejera.com/case-study/ai-appointment-setter

#n8n #VoiceAI #AIAgents #AIAutomation #VAPI #AppointmentScheduling #CustomerService #WorkflowAutomation #SmallBusiness #NoCode

---

## 6. Order Stock Check (Make)

Slug: `order-stock-check`

Built an Order Stock Check scenario using Make 📦

The worst time to find out an item is out of stock is after you've confirmed the order.

Every 15 minutes, this scenario picks up new orders, looks up each product in the inventory sheet, and a Router sends the order down one of three paths:
→ Enough stock: the order is confirmed, stock is reserved, and the customer gets an email
→ Stock drops below its reorder level: the order is confirmed and operations gets a Slack alert to reorder
→ Not enough stock: the order goes on hold, the customer is told why, and operations is alerted

Built-in checks:
✅ Each order is handled once, so a second run never repeats it
✅ Stock never goes negative. Orders are never partly filled
✅ A person owns every exception, with the product, quantity and stock left in Slack

Tested end to end on sample orders covering all three outcomes.

Selling online and tracking stock in a spreadsheet? I can build this for your store. 📩

🌐 See my work and book a call: https://ramonvallejera.com
▶️ See it work: https://ramonvallejera.com/case-study/order-stock-check

#MakeCom #Ecommerce #InventoryManagement #OrderManagement #AIAutomation #WorkflowAutomation #Operations #OnlineStore #SmallBusiness #NoCode

---

## 7. AI Unpaid Invoice Reminders (n8n)

Slug: `ai-unpaid-invoice-reminders`

Built an AI Unpaid Invoice Reminder workflow using n8n 💸

Chasing payments by hand usually goes wrong in one of two ways: nobody follows up, or a customer who already disputed the bill keeps getting reminders.

Every morning, this workflow pulls unpaid invoices from QuickBooks, client context from Pipedrive and reminder history from the database. Company policy rules decide who gets a reminder and how firm it is. AI writes the email within those rules.

When customers reply, AI reads the reply and sorts it: dispute, promise to pay, already paid, copy request, wrong contact, or payment question. Each one sets its own next step.

Built-in checks:
✅ A dispute stops all reminders until a person clears it. No timer restarts them
✅ Rules decide who gets reminded. AI only writes the wording
✅ The database allows one record per invoice, so a reminder can never go out twice

Collections is a relationship, not just a schedule.

If chasing unpaid invoices is eating your team's week, send me a message. 📩

🌐 See my work and book a call: https://ramonvallejera.com
▶️ See it work: https://ramonvallejera.com/case-study/ai-unpaid-invoice-reminders

#n8n #AIAutomation #AccountsReceivable #Collections #FinanceAutomation #CashFlow #QuickBooks #WorkflowAutomation #SmallBusiness #NoCode

---

## 8. HR Evaluation and Job Posting Assistant (n8n)

Slug: `hr-evaluation-assistant`

Built an AI Hiring Assistant using n8n 🧑‍💼

Good applicants don't wait days for a reply. They accept other offers.

This workflow takes every application, saves the CV to Google Drive, and has AI read it against the actual job posting it was sent for. Each applicant is shortlisted or declined, and both decisions are recorded in Airtable.

Shortlisted applicants then:
→ Answer questions written for that specific role
→ Get a personal interview invite written by AI
→ Get an interview booked in Google Calendar

The interviewer gets screening questions based on that applicant's CV and answers.

Built-in checks:
✅ CVs are scored against the real job posting, not a generic idea of a "good candidate"
✅ Every AI step must return a fixed format, so a broken reply can't reach an email
✅ The AI only suggests an interview time. The workflow checks the calendar and picks a free slot itself

Five AI steps, and every decision is on record.

Hiring and buried in CVs? Let's talk about automating your screening. 👇

🌐 See my work and book a call: https://ramonvallejera.com
▶️ See it work: https://ramonvallejera.com/case-study/hr-evaluation-assistant

#n8n #HRTech #Recruitment #Hiring #TalentAcquisition #AIinHR #AIAutomation #WorkflowAutomation #SmallBusiness #NoCode

---

## 9. AI Prospecting with Apollo (n8n)

Slug: `ai-prospecting-apollo`

Built an AI Prospecting workflow using n8n and Apollo 🎯

AI-written cold emails get a bad reputation, mostly because nobody reads them before they're sent. This one is built the other way around.

The sales team fills in one form. Apollo finds matching decision-makers, and anyone already contacted is skipped before any credits are used. Prospects are scored out of 100 by fixed rules, and only strong ones with a verified email move on. AI reads each company's website and drafts a first email based on what it finds.

Then everything waits in a Google Sheet for a person to review.

Built-in checks:
✅ Zero emails are sent automatically. A person approves every prospect
✅ The AI can only use facts from the company website. No made-up news, prices or promises
✅ Approved prospects become a Pipedrive deal within 15 minutes, with the research attached

AI does the research. People decide who gets contacted.

Want a prospecting pipeline like this for your sales team? Send me a message. 📩

🌐 See my work and book a call: https://ramonvallejera.com
▶️ See it work: https://ramonvallejera.com/case-study/ai-prospecting-apollo

#n8n #SalesAutomation #Prospecting #LeadGeneration #B2BSales #Apollo #Pipedrive #AIAutomation #WorkflowAutomation #NoCode

---

## 10. New Employee Onboarding (n8n)

Slug: `hotel-employee-onboarding`

Built an AI Employee Onboarding workflow using n8n 🏨

Every new hire usually means the same setup by hand, plus a week of chasing documents one email at a time.

With this workflow, HR fills in one form. It builds the onboarding plan for that role and then:
→ Creates a Google Drive folder and an employee record
→ Schedules orientation
→ Sends the IT access request
→ Sends the welcome email

Every task and document is tracked in Airtable. A daily check sends check-ins a week before the start date, on day 1, and on days 3, 7 and 30. It chases IT for access and key cards, and closes onboarding when everything is done.

The HR team also gets a chat assistant for policy questions.

Built-in checks:
✅ Document reminders are folded into the check-ins, so a new hire never gets more than one email a day
✅ The policy assistant only answers from company policy. If the policy doesn't cover it, it says so

First impressions shouldn't depend on someone remembering a checklist.

If onboarding still runs on someone's to-do list, I can automate it for your team. 📩

🌐 See my work and book a call: https://ramonvallejera.com
▶️ See it work: https://ramonvallejera.com/case-study/hotel-employee-onboarding

#n8n #HRAutomation #EmployeeOnboarding #HumanResources #HRTech #Hospitality #AIAutomation #WorkflowAutomation #SmallBusiness #NoCode
