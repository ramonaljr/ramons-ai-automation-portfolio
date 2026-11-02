import { PROFILE } from '@/lib/portfolio'

/**
 * Copy for /privacy and /terms, in Markdown for `LegalPage`.
 *
 * The privacy policy describes what the code actually does, so change it when
 * a data flow changes: a new form field, another third-party embed, a new n8n
 * step that stores something. Bump the matching `updated` date with any edit;
 * the page and the sitemap both read it.
 *
 * Google's OAuth consent screen links to both pages, and its review reads the
 * "Google user data" section, so keep that wording in line with Google's
 * Limited Use requirements.
 */

export const PRIVACY = {
  updated: '2026-11-02',
  title: 'Privacy policy',
  intro:
    'What this site collects when you write to me, book a call or use the chat, where it goes, and how to have it removed.',
  body: `
## Who I am

This site belongs to ${PROFILE.legalName}, an independent automation specialist based in the ${PROFILE.location}. I am the one responsible for the personal information described here. You can reach me at [${PROFILE.email}](mailto:${PROFILE.email}).

## What I collect

I only collect what you choose to send me, plus the minimum a website needs to run.

### When you write to me

The contact form asks for your name, email address, the service you are interested in and your message. These are sent to my email inbox, and you get an automatic confirmation at the address you gave.

### When you book a call

Calls are booked through Calendly, which is embedded on this site. Calendly collects the details you enter there and handles them under [its own privacy policy](https://calendly.com/privacy). I receive your name, email address, the time you picked and your answers to the booking questions.

An older booking link may still take you to a form on this site. That form collects your name, email address, the time you picked, a topic and any notes, and adds the booking to my Google Calendar.

### When you use the chat assistant

The chat assistant sends your messages, together with a random session number, to my automation server so it can answer you. The answer is written by an AI model hosted by Groq. Please do not type passwords, payment details or other sensitive information into the chat.

### When you browse

- **Analytics.** I use Vercel Web Analytics and Speed Insights to see which pages are read and how fast they load. They do not use cookies and do not identify you personally.
- **Browser storage.** The site keeps two small values in your browser's session storage: whether you have already seen the opening animation, and the chat session number. Both are cleared when you close the tab. The site sets no cookies of its own.
- **Server logs and abuse protection.** Like any website, the hosting service records basic request details such as your IP address and browser type. My forms also hold your IP address in memory for a few minutes to stop the same sender from flooding them.
- **The intro video.** It is hosted on Loom and only loads if you press play. Loom then handles your viewing under [its own privacy policy](https://www.loom.com/privacy-policy).

## How I use it

I use your information to reply to you, run the calls you book, answer your chat questions, keep the site secure and understand which pages are useful. I do not sell it, rent it or use it for advertising, and I do not add you to a mailing list.

## Who handles it for me

These services process information on my behalf, each under its own terms:

- **Vercel** hosts this website and provides its analytics.
- **Hostinger** hosts the server that runs my n8n automations, which receive the forms and chat messages.
- **Google** provides the Gmail account the forms reply from and the Google Calendar that bookings go to.
- **Groq** runs the AI model behind the chat assistant.
- **Calendly** runs the booking calendar.
- **Loom** hosts the intro video.

Some of these providers store data outside the Philippines. I only use providers that protect personal information to a standard comparable to Philippine law.

## Google user data

My automations connect to my own Google account through Google's APIs, including Gmail, Google Calendar, Google Drive and Google Sheets. They do this to send replies, put booked calls on my calendar and run my own business workflows. This site never asks you to sign in with Google and does not access your Google account.

Information received from Google APIs is used only for those purposes. It is not sold, not used for advertising, and not used to train AI models. My use and transfer of information received from Google APIs adheres to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.

## How long I keep it

Messages and booking details stay in my email and calendar for as long as we are in touch, and I delete them when you ask. Chat conversations are not saved to a database. My automation server keeps short technical logs to fix problems, and I clear them regularly.

## Your rights

Under the Philippine Data Privacy Act of 2012, and similar laws where you live, you can ask me to show you the information I hold about you, correct it, delete it or stop using it. Email [${PROFILE.email}](mailto:${PROFILE.email}) and I will reply within 30 days. If you are not satisfied with my answer, you can complain to the [National Privacy Commission](https://privacy.gov.ph) or your local data protection authority.

## Children

This site is meant for businesses and adults. I do not knowingly collect information from anyone under 18.

## Changes to this policy

If I change how this site handles personal information, I will update this page and the date at the top.
`
}

export const TERMS = {
  updated: '2026-11-02',
  title: 'Terms of service',
  intro: 'The ground rules for using this site, its chat assistant and its booking tools.',
  body: `
## About these terms

This site is run by ${PROFILE.legalName} (I, me, my). By using it you agree to these terms. If you do not agree, please do not use the site.

## What this site is for

This site describes my automation services and shows examples of my work. It is for general information only. Case studies marked as sample work are illustrative builds made for fictional clients, and the results they describe are not a promise of what any project will achieve.

## The chat assistant

The chat assistant is an AI tool that answers questions about my services. Its answers can be incomplete or wrong, and they are not professional, legal, financial or tax advice. Nothing it says is a quote, a commitment or an agreement. Please confirm anything important with me directly.

## Enquiries and bookings

Sending a message or booking a call does not create a contract or oblige either of us to work together. Any project is covered by a separate written agreement, or by the terms of the platform we work through, such as Upwork. Please give a day's notice if you need to cancel or move a call.

## Using the site fairly

Please do not misuse the site. That includes sending spam or automated traffic through the forms or the chat, trying to get around the site's security or rate limits, attempting to break or overload it, or using the chat to produce harmful or illegal content.

## Intellectual property

The text, design, images, films and code on this site belong to me unless stated otherwise. You may share links to it and quote short passages with credit. Workflow files I publish on GitHub come with the license stated in their repository.

## Other services and links

The site embeds and links to services I do not control, including Calendly, Loom, GitHub, LinkedIn and Upwork. Their own terms and privacy policies apply when you use them.

## No warranty

The site and the chat assistant are provided as they are. I work to keep them accurate and available, but I cannot guarantee they will always be correct, complete or online.

## Limitation of liability

To the extent the law allows, I am not liable for any indirect or consequential loss arising from your use of this site or the chat assistant, or from relying on its content. Nothing in these terms limits liability that cannot be limited by law.

## Governing law

These terms are governed by the laws of the Republic of the Philippines, and the courts of the Philippines have jurisdiction over any dispute about them.

## Changes to these terms

I may update these terms from time to time. The date at the top shows when they last changed, and using the site after a change means you accept the new version.

## Contact

Questions about these terms go to [${PROFILE.email}](mailto:${PROFILE.email}).
`
}
