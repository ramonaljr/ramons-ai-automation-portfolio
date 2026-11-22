# Project Portfolio — Workflow Build Plan

This document is the blueprint for the n8n portfolio workflows. Each project is designed to be understandable by a business owner: the canvas should show where work begins, what the automation checks, when a person must approve something, and what result is produced.

## Portfolio build order

| Order | Project | Business area | Main result |
|---:|---|---|---|
| 1 | Automated Invoice Processing | Finance | Clean invoices are prepared; exceptions go to a person |
| 2 | AI Customer Support and Appointment Booking | Customer service | Customers receive approved answers and can book a meeting |
| 3 | Automatic Lead Assignment and Follow-Up | Sales | Every new lead receives a quick response and has a clear owner |
| 4 | Automated Customer Payment Follow-Up | Finance | Overdue customers receive polite, scheduled reminders |
| 5 | Automatic Order and Inventory Checking | Operations | Orders are checked against available stock before confirmation |
| 6 | Content Planning and Publishing Automation | Marketing | Content moves from idea to approval, publishing, and reporting |
| 7 | Real Estate Lead Follow-Up and Viewing Booking | Real estate | Property inquiries are qualified and moved toward a viewing |

## Rules for every workflow

- Prefer visible n8n nodes such as Trigger, Edit Fields, IF, Switch, Merge, Wait, Gmail, Google Sheets, Calendar, Slack, and database nodes.
- Use a Code node only when a task cannot be expressed clearly with standard nodes.
- Every workflow must include sample data, a happy path, an exception path, and a human handoff.
- Portfolio versions must not send real messages, create real bills, or modify live records.
- Live actions remain disabled until credentials, test accounts, and approval rules are confirmed.
- Node names must describe business actions, not technical actions.
- Each workflow ends with a simple record showing what happened, when it happened, and what happens next.

---

## 1. Automated Invoice Processing

### Purpose

Reduce manual invoice checking while preventing incorrect or suspicious invoices from reaching the accounting system.

### Process map

```mermaid
flowchart LR
    A[Invoice arrives by email or upload] --> B[Read invoice details]
    B --> C[Find vendor and purchase order]
    C --> D[Check vendor, totals, duplicate, and confidence]
    D --> E{All checks passed?}
    E -- Yes --> F[Prepare accounting draft]
    E -- No --> G[Send to finance reviewer]
    G --> H{Reviewer approves?}
    H -- Yes --> F
    H -- No --> I[Reject or request correction]
    F --> J[Save audit record]
    I --> J
```

### Recommended n8n nodes

1. Email Trigger, Google Drive Trigger, or Form Trigger
2. Extract From File
3. Information Extractor or AI node for reading the invoice
4. Google Sheets, Airtable, or accounting lookup for vendor and purchase-order records
5. Edit Fields for totals and standardized values
6. IF nodes for approved vendor, duplicate invoice, amount difference, and reading confidence
7. Form, Slack, or email approval step
8. QuickBooks or Xero node to create a **draft**, never a final payment
9. Data Table or Google Sheets audit record

### Human approval

A finance reviewer is required when the vendor is unknown, the invoice may be a duplicate, totals do not match, the purchase-order difference exceeds the limit, or the invoice cannot be read confidently.

### Portfolio test cases

- Clean invoice that matches an approved purchase order
- New vendor that requires review
- Duplicate invoice number
- Incorrect total or large purchase-order difference
- Poor-quality document that cannot be read confidently

### Success measures

- Percentage of invoices processed without manual data entry
- Average time from receipt to accounting draft
- Number of exceptions caught before posting
- Duplicate invoices prevented

---

## 2. AI Customer Support and Appointment Booking

### Purpose

Answer common customer questions using approved business information, book appointments, and safely hand uncertain questions to a person.

### Process map

```mermaid
flowchart LR
    A[Customer sends a message] --> B[Identify the request]
    B --> C[Search approved business information]
    C --> D{Reliable answer found?}
    D -- No --> E[Send to a support person]
    D -- Yes --> F[Prepare an approved answer]
    F --> G{Customer wants an appointment?}
    G -- No --> H[Send the answer]
    G -- Yes --> I[Check available times]
    I --> J[Offer or book a time]
    E --> K[Save conversation record]
    H --> K
    J --> K
```

### How RAG fits in

RAG means the assistant searches the company's approved information before answering. The portfolio demo should use a small approved knowledge source. The production version can search Google Drive, Notion, website pages, or a vector database. The assistant must not invent an answer when the source does not contain one.

### Recommended n8n nodes

1. Chat Trigger, Webhook, Gmail Trigger, or Facebook Lead/Webhook
2. Text Classifier for FAQ, appointment, complaint, sales, or human-help request
3. Google Drive, Notion, Supabase Vector Store, Pinecone, or another approved knowledge source
4. Question and Answer Chain or AI Agent with tightly limited tools
5. IF node for answer confidence and risky topics
6. Google Calendar availability and event nodes
7. Gmail, WhatsApp, or chat response node
8. CRM or Data Table conversation record

### Human approval

Send the conversation to a person when no reliable source is found, the customer complains, money or legal promises are requested, the customer asks for a person, or the proposed answer is below the agreed confidence level.

### Portfolio test cases

- Common service question answered from approved information
- Appointment request with an available time
- Appointment request when no suitable time is available
- Question that is missing from the knowledge source
- Risky request such as a guaranteed financial or legal outcome

### Success measures

- Percentage of common questions answered automatically
- Appointments booked without staff involvement
- Average first-response time
- Questions correctly handed to a person

---

## 3. Automatic Lead Assignment and Follow-Up

### Purpose

Respond quickly to every new lead, assign the right salesperson, and prevent promising opportunities from being forgotten.

### Process map

```mermaid
flowchart LR
    A[New lead arrives] --> B[Clean and check contact details]
    B --> C{Duplicate lead?}
    C -- Yes --> D[Update the existing record]
    C -- No --> E[Create a new lead record]
    D --> F[Rate urgency and fit]
    E --> F
    F --> G[Assign the right salesperson]
    G --> H[Send a personalized first response]
    H --> I[Wait for a reply]
    I --> J{Lead replied?}
    J -- Yes --> K[Notify owner and update stage]
    J -- No --> L[Send scheduled follow-up]
    L --> M{Follow-up limit reached?}
    M -- No --> I
    M -- Yes --> N[Move to long-term follow-up]
```

### Recommended n8n nodes

1. Form Trigger, Webhook, Gmail Trigger, or lead-ad trigger
2. Edit Fields for standardized names, email, phone, and source
3. CRM search node plus IF for duplicate checking
4. Switch for location, service, budget, or urgency
5. CRM create/update and owner assignment
6. Gmail or messaging node
7. Wait node for follow-up timing
8. IF node for reply detection and follow-up limits
9. Slack or email notification to the assigned salesperson

### Human approval

Require review for missing contact details, conflicting territory rules, very high-value leads, opt-out requests, or messages that may be complaints rather than sales inquiries.

### Portfolio test cases

- New high-priority lead
- Normal lead assigned by location
- Duplicate lead
- Lead replies after the first message
- Lead does not reply after the allowed follow-ups

### Success measures

- Time to first response
- Percentage of leads assigned correctly
- Leads receiving every planned follow-up
- Meetings or sales opportunities created

---

## 4. Automated Customer Payment Follow-Up

### Purpose

Help finance teams follow up overdue invoices consistently without sending inappropriate reminders to customers with disputes or payment arrangements.

### Process map

```mermaid
flowchart LR
    A[Daily schedule starts] --> B[Get unpaid invoices]
    B --> C[Check due date and balance]
    C --> D{Dispute or payment plan?}
    D -- Yes --> E[Send to account owner]
    D -- No --> F{How overdue is it?}
    F -- 1 to 7 days --> G[Send friendly reminder]
    F -- 8 to 30 days --> H[Send firmer reminder]
    F -- More than 30 days --> I[Request finance approval]
    G --> J[Record reminder and next date]
    H --> J
    I --> K{Approved?}
    K -- Yes --> L[Send final notice]
    K -- No --> E
    L --> J
```

### Recommended n8n nodes

1. Schedule Trigger
2. QuickBooks, Xero, Airtable, or Google Sheets lookup
3. Filter for unpaid and overdue invoices
4. IF or Switch for overdue age, dispute, and payment-plan status
5. Gmail or Outlook reminder templates
6. Wait or next-follow-up date calculation
7. Slack, email, or Form approval for sensitive accounts
8. CRM/accounting note and audit record

### Human approval

Require review for disputed bills, promised payment dates, active payment plans, VIP customers, incorrect contact details, or final notices.

### Portfolio test cases

- Newly overdue invoice
- Invoice overdue by two weeks
- Invoice overdue by more than 30 days
- Customer with an active dispute
- Customer who already paid after the list was prepared

### Success measures

- Overdue balance reduced
- Average days to payment
- Staff time saved on reminder preparation
- Incorrect reminders prevented

---

## 5. Automatic Order and Inventory Checking

### Purpose

Check whether products are available before confirming an order and alert the right person when stock is low or missing.

### Process map

```mermaid
flowchart LR
    A[New order arrives] --> B[Read products and quantities]
    B --> C[Look up current stock]
    C --> D{Enough stock for every item?}
    D -- Yes --> E[Reserve stock]
    E --> F[Confirm the order]
    D -- No --> G[Separate unavailable items]
    G --> H{Alternative or restock date available?}
    H -- Yes --> I[Offer alternative or later delivery]
    H -- No --> J[Send to operations team]
    F --> K[Update inventory and order record]
    I --> K
    J --> K
```

### Recommended n8n nodes

1. Webhook, Shopify, WooCommerce, or order-form trigger
2. Split Out for individual order lines
3. Inventory database or Google Sheets lookup
4. IF for available quantity and reorder level
5. Aggregate to rebuild the complete order result
6. Shopify/WooCommerce update or Edit Fields demo record
7. Email or Slack customer/operations notification
8. Data Table audit record

### Human approval

Require review for partial orders, substitutions, negative stock, unusually large orders, price differences, or manual stock corrections.

### Portfolio test cases

- All products available
- One product unavailable
- Product below reorder level
- Large order requiring approval
- Inventory changed while the order was being checked

### Success measures

- Overselling incidents prevented
- Order-confirmation time
- Low-stock alerts acted on
- Manual inventory checks reduced

---

## 6. Content Planning and Publishing Automation

### Purpose

Move content from idea to approved post while keeping a person in control of brand quality and publishing.

### Process map

```mermaid
flowchart LR
    A[New content idea or weekly schedule] --> B[Collect topic and audience]
    B --> C[Research approved source material]
    C --> D[Prepare draft and channel versions]
    D --> E[Check brand and required details]
    E --> F[Send for human approval]
    F --> G{Approved?}
    G -- Changes needed --> H[Return with comments]
    H --> D
    G -- Yes --> I[Schedule or publish]
    I --> J[Collect performance results]
    J --> K[Update content tracker]
```

### Recommended n8n nodes

1. Schedule Trigger, Form Trigger, Notion, Airtable, or Google Sheets
2. Google Drive or approved source lookup
3. AI node for draft preparation, repurposing, or summaries
4. Edit Fields for channel, audience, links, and publishing date
5. IF for missing sources, required disclaimer, and approval status
6. Form, Slack, email, or task-management approval
7. LinkedIn, WordPress, Buffer, or other publishing node where available
8. Wait until publishing time
9. Analytics lookup and content tracker update

### Human approval

No public content is published until a person approves the final wording, factual claims, image rights, links, and scheduled date.

### Portfolio test cases

- Approved post published on schedule
- Draft returned for changes
- Missing source or required link
- Time-sensitive post held for manual review
- Published post added to the reporting tracker

### Success measures

- Time from idea to approved draft
- Hours saved on repurposing
- Percentage published on schedule
- Engagement or leads by content type

---

## 7. Real Estate Lead Follow-Up and Viewing Booking

### Purpose

Respond quickly to property inquiries, understand what the buyer or renter needs, and help qualified leads book a viewing.

### Process map

```mermaid
flowchart LR
    A[Property inquiry arrives] --> B[Find the property and lead record]
    B --> C[Ask for missing needs and contact details]
    C --> D{Property still available?}
    D -- No --> E[Suggest matching properties]
    D -- Yes --> F[Check fit: budget, location, timing]
    E --> F
    F --> G{Ready for a viewing?}
    G -- No --> H[Add to helpful follow-up]
    G -- Yes --> I[Check agent and property availability]
    I --> J[Offer viewing times]
    J --> K[Create calendar event after confirmation]
    H --> L[Update CRM and next follow-up]
    K --> L
```

### Recommended n8n nodes

1. Webhook, Facebook lead form, property portal email, or website form
2. CRM search and duplicate check
3. Property database, Airtable, or Google Sheets lookup
4. IF for availability and complete contact details
5. Switch for buying/renting, area, budget, property type, and urgency
6. Gmail, WhatsApp, or SMS conversation step
7. Google Calendar availability and event nodes
8. Wait and follow-up sequence
9. CRM update and agent notification

### Human approval

Send to an agent for unusual pricing questions, negotiation, unavailable properties with no suitable alternative, incomplete identity/contact information, complaints, or viewing changes that affect another party.

### Portfolio test cases

- Available property and qualified lead
- Unavailable property with alternatives
- Missing budget or contact details
- Viewing booked successfully
- Lead does not confirm the proposed time

### Success measures

- Inquiry response time
- Percentage of qualified leads booking viewings
- Follow-ups completed on time
- Agent time saved on early-stage questions

---

## Build phases for each project

### Phase 1 — Safe portfolio demo

- Manual Trigger or test form
- Clearly labeled sample data
- Native decision, routing, merge, and record-keeping nodes
- No real messages or changes to live systems
- At least three test cases with visible results

### Phase 2 — Connected test version

- Test inbox, form, spreadsheet, CRM, calendar, or accounting sandbox
- Credentials stored in n8n Credentials, never inside nodes
- Real error handling and retry paths
- Approval step before any sensitive action

### Phase 3 — Production-ready version

- Live trigger and live business systems
- Access limited to what the workflow needs
- Duplicate protection and safe reruns
- Error notifications, audit history, and recovery instructions
- Agreed success measures reviewed after launch

## Definition of done

A portfolio workflow is complete only when:

- A non-technical viewer can understand the canvas from left to right.
- Standard n8n nodes show the important business logic.
- The workflow has a happy path, exception path, and human handoff.
- Sample runs prove every important path.
- Sticky notes explain the problem, value, safety checks, and next integration phase.
- Screenshots and a short case-study summary are ready for the website.
- The workflow is inactive until the connected test version has been approved.
