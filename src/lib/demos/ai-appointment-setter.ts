import layout from '@/content/demos/ai-appointment-setter.layout.json'
import { at, CENTRAL, longDay, minutesFrom, workday } from '@/lib/demos/sample'
import type { DemoBundle, DemoLayout, DemoScenario } from '@/lib/demos/types'

/**
 * The voice agent's tools: five webhooks VAPI calls during a phone call.
 *
 * A call uses several of them in turn (check the times, then book; or find
 * the appointment, then cancel), so each scenario starts from the webhooks
 * that call would hit, in order. Field names are the build's own: VAPI's
 * tool-call payload, the Code nodes' returns, the Airtable columns. The
 * agent is called Amy in the build. Callers, numbers and IDs are made up.
 */

const AGENT = 'Amy'
const CALLER = '+15125550148'

/** A VAPI tool call as it arrives on the webhook. */
const toolCall = (name: string, id: string, args: Record<string, unknown>, callId: string) => ({
  body: {
    message: {
      type: 'tool-calls',
      toolCallList: [{ id, type: 'function', function: { name, arguments: args } }],
      call: { id: callId, customer: { number: CALLER } },
      assistant: { name: AGENT }
    }
  }
})

const reply = (toolCallId: string, result: string) => ({ results: [{ toolCallId, result }] })

function scenarios(now: Date): DemoScenario[] {
  const day = workday(now, 1)
  const when = longDay(day)
  const start = at(day, '10:00')
  const end = at(day, '10:30')
  const callId = 'demo-call-4be1c7'
  const eventId = 'demo5kq2c0nsult'
  const title = 'Primary consultation – Sarah Kim'

  const busy = [
    {
      summary: 'Team stand-up',
      status: 'confirmed',
      start: { dateTime: at(day, '09:00'), timeZone: CENTRAL },
      end: { dateTime: at(day, '09:30'), timeZone: CENTRAL }
    },
    {
      summary: 'Primary consultation – Luis Ortega',
      status: 'confirmed',
      start: { dateTime: at(day, '10:30'), timeZone: CENTRAL },
      end: { dateTime: at(day, '11:00'), timeZone: CENTRAL }
    }
  ]

  const offered = `Free on ${when}: 9:30 AM, 10:00 AM, 11:00 AM, 11:30 AM, 2:00 PM.`

  const booking = {
    toolCallId: 'tool_book_02',
    callId,
    fullName: 'Sarah Kim',
    email: 'sarah.kim@example.com',
    notes: 'First visit. Prefers mornings.',
    appointmentType: 'Primary consultation',
    Title: title,
    starttime: start,
    endtime: end,
    customer_number: CALLER,
    isValid: true
  }

  const event = {
    id: eventId,
    status: 'confirmed',
    summary: title,
    description: booking.notes,
    hangoutLink: 'https://meet.google.com/abc-defg-hij',
    start: { dateTime: start, timeZone: CENTRAL },
    end: { dateTime: end, timeZone: CENTRAL },
    attendees: [{ email: booking.email, responseStatus: 'needsAction' }]
  }

  const appointments = {
    kind: 'airtable' as const,
    file: 'AI Appointment Setter Build',
    table: 'Table 1',
    columns: ['Name', 'Phone Number', 'Email', 'starttime', 'Booking Status', 'Voice Agent'],
    earlier: [
      ['Luis Ortega', '+15125550193', 'luis.ortega@example.com', `${when}, 10:30 AM`, 'confirmed', AGENT],
      ['Hannah Cole', '+15125550117', 'hannah.cole@example.com', `${when}, 2:30 PM`, 'confirmed', AGENT]
    ]
  }

  const getSlots = {
    GetSlots: toolCall('GetSlots', 'tool_slots_01', { starttime: at(day, '09:00'), endtime: at(day, '18:00') }, callId),
    'Prepare GetSlots Request': {
      toolCallId: 'tool_slots_01',
      callId,
      starttime: at(day, '09:00'),
      endtime: at(day, '18:00'),
      timezone: CENTRAL
    },
    'Get all Caledar Events': busy,
    'Available Start Time and Date Ranges': reply('tool_slots_01', offered),
    'Respond to Vapi GetSlots1': reply('tool_slots_01', offered)
  }

  const book: DemoScenario = {
    id: 'book',
    label: 'Sarah Kim · books',
    hint: 'Asks for times, picks one, and is booked while still on the call.',
    start: ['GetSlots', 'BookSlots', 'call_results'],
    output: {
      ...getSlots,
      BookSlots: toolCall(
        'BookSlots',
        'tool_book_02',
        { fullName: 'Sarah Kim', email: booking.email, starttime: start, endtime: end, notes: booking.notes },
        callId
      ),
      'Input Arguments from Booking Tools': booking,
      If: booking,
      'Escape Json': { ...booking, notes: booking.notes },
      'Convert time to CST America/Chicago': { ...booking, timezone: CENTRAL },
      'Get Events in Booking Window': busy.slice(0, 1),
      'Check Slot Is Free': { ...booking, slotFree: true },
      'Slot Free To Book?': { ...booking, slotFree: true },
      'Create an event': event,
      'Booking Payload': {
        id: eventId,
        description: booking.notes,
        starttime: start,
        status: 'confirmed',
        Timezone: CENTRAL,
        attendees: event.attendees,
        hangoutLink: event.hangoutLink,
        Title: title,
        endtime: end
      },
      'Success Response': { bookingMessage: 'Appointment booked for Sarah Kim.' },
      'Respond to Vapi': reply('tool_book_02', 'Appointment booked for Sarah Kim.'),
      'If Booking is confirmed': { bookingMessage: 'Appointment booked for Sarah Kim.' },
      'Information to be saved in Airtable': {
        startTime: start,
        endTime: end,
        status: 'confirmed',
        Timezone: CENTRAL,
        attendee: { name: 'Sarah Kim' },
        call: { id: callId },
        assistant: { name: AGENT },
        event: { id: eventId },
        Title: title,
        customer_number: CALLER
      },
      'Log book details': {
        id: 'recSarahKim0001',
        fields: {
          Name: 'Sarah Kim',
          CallRecordingID: callId,
          'Phone Number': CALLER,
          starttime: start,
          endtime: end,
          Email: booking.email,
          'Booking Status': 'confirmed',
          meetlink: event.hangoutLink,
          'Voice Agent': AGENT,
          eventID: eventId
        }
      },
      call_results: {
        body: {
          message: {
            type: 'end-of-call-report',
            call: { id: callId },
            customer: { number: CALLER },
            durationSeconds: 94,
            cost: 0.21
          }
        }
      },
      'All Input Arguments': {
        transcript: 'AI: Thanks for calling, this is Amy... User: I would like to book a consultation...',
        recordingUrl: `https://storage.vapi.ai/${callId}.wav`,
        call: { summary: `Sarah Kim booked a primary consultation for ${when} at 10:00 AM.`, id: callId },
        cost: 0.21,
        startedAt: minutesFrom(now, -2),
        endedAt: now.toISOString(),
        customer: { number: CALLER }
      },
      'Create or update a record': {
        id: 'recCall4be1c7',
        fields: {
          'Call Recording ID': callId,
          Cost: '0.21',
          'Customer Number': CALLER,
          'Call Summay': `Sarah Kim booked a primary consultation for ${when} at 10:00 AM.`
        }
      }
    },
    outcomes: [
      {
        kind: 'chat',
        node: 'Respond to Vapi',
        app: 'VAPI',
        title: `Call with ${CALLER} · ${AGENT}`,
        lines: [
          { from: 'agent', text: 'Thanks for calling, this is Amy. How can I help?' },
          { from: 'person', text: `I'd like to book a consultation, ${when.split(',')[0]} if you can.` },
          { from: 'agent', text: `${when} I have 9:30, 10:00, 11:00, 11:30 or 2:00. Which suits you?` },
          { from: 'person', text: '10 o’clock, please. Sarah Kim, sarah.kim@example.com.' },
          { from: 'agent', text: `You're booked for ${when} at 10:00 AM. The invite is on its way to your email.` }
        ]
      },
      {
        kind: 'calendar',
        node: 'Create an event',
        title,
        date: when,
        time: '10:00 – 10:30am (Central)',
        meet: true,
        guests: ['you@example.com (organizer)', booking.email],
        note: booking.notes
      },
      {
        kind: 'airtable',
        node: 'Log book details',
        file: appointments.file,
        table: appointments.table,
        columns: appointments.columns,
        rows: [...appointments.earlier, ['Sarah Kim', CALLER, booking.email, `${when}, 10:00 AM`, 'confirmed', AGENT]],
        highlight: 2
      },
      {
        kind: 'airtable',
        node: 'Create or update a record',
        file: appointments.file,
        table: 'Call Recording',
        columns: ['Call Recording ID', 'Customer Number', 'Cost', 'Call Summay'],
        rows: [
          ['demo-call-39d0aa', '+15125550193', '0.18', 'Luis Ortega booked a primary consultation.'],
          [callId, CALLER, '0.21', `Sarah Kim booked a primary consultation for ${when} at 10:00 AM.`]
        ],
        highlight: 1
      }
    ]
  }

  const takenStart = at(day, '10:30')
  const taken = { ...booking, fullName: 'Mark Ellis', email: 'mark.ellis@example.com', starttime: takenStart }

  const refusal =
    'That time is already taken. Nothing was booked. Check availability again and offer the caller another time.'

  const slotTaken: DemoScenario = {
    id: 'taken',
    label: 'Mark Ellis · time taken',
    hint: 'Asks for a time that is already booked. Nothing is booked; Amy offers another.',
    start: ['BookSlots'],
    branch: { 'Slot Free To Book?': 1 },
    output: {
      BookSlots: toolCall(
        'BookSlots',
        'tool_book_07',
        { fullName: 'Mark Ellis', email: taken.email, starttime: takenStart, endtime: at(day, '11:00') },
        'demo-call-81f2d9'
      ),
      'Input Arguments from Booking Tools': { ...taken, Title: 'Primary consultation – Mark Ellis' },
      If: taken,
      'Escape Json': taken,
      'Convert time to CST America/Chicago': { ...taken, timezone: CENTRAL },
      'Get Events in Booking Window': busy.slice(1),
      'Check Slot Is Free': { ...taken, slotFree: false, bookingMessage: refusal },
      'Slot Free To Book?': { ...taken, slotFree: false, bookingMessage: refusal },
      'Respond to Vapi': reply('tool_book_07', refusal),

      // The filter only lets confirmed bookings through to Airtable.
      'If Booking is confirmed': []
    },
    outcomes: [
      {
        kind: 'chat',
        node: 'Respond to Vapi',
        app: 'VAPI',
        title: `Call with +15125550162 · ${AGENT}`,
        lines: [
          { from: 'person', text: `Can I get 10:30 on ${when}? Mark Ellis.` },
          { from: 'agent', text: 'Sorry, 10:30 has just been taken, so nothing is booked yet.' },
          { from: 'agent', text: 'I can do 11:00 or 11:30 the same morning. Would either work?' }
        ]
      }
    ]
  }

  const cancelCall = 'demo-call-c4a017'

  const cancel: DemoScenario = {
    id: 'cancel',
    label: 'Luis Ortega · cancels',
    hint: 'Calls to cancel. The event comes off the calendar and Airtable says Cancelled.',
    start: ['CancelSlots'],
    output: {
      CancelSlots: toolCall(
        'CancelSlots',
        'tool_cancel_03',
        { name: 'Luis Ortega', email: 'luis.ortega@example.com', starttime: at(day, '10:30') },
        cancelCall
      ),
      'Parse CancelSlot': { callId: cancelCall, toolCallId: 'tool_cancel_03', customer_number: '+15125550193' },
      'Input Aguments from cancelslot Tool': {
        name: 'Luis Ortega',
        email: 'luis.ortega@example.com',
        starttime: at(day, '10:30'),
        Cancelnotes: 'Travelling that week.',
        customer_number: '+15125550193'
      },
      'Check if required info is provided for cancellation': { name: 'Luis Ortega', email: 'luis.ortega@example.com' },
      'Find Appointment Record': {
        id: 'recLuisOrtega001',
        fields: {
          Email: 'luis.ortega@example.com',
          Name: 'Luis Ortega',
          starttime: at(day, '10:30'),
          eventID: 'demo8luis'
        }
      },
      'Delete an event': { success: true },
      'Update Record to Cancel': {
        id: 'recLuisOrtega001',
        fields: { eventID: 'demo8luis', 'Booking Status': 'Cancelled' }
      },
      'Call_id and Response': reply('tool_cancel_03', 'Cancelled'),
      'Respond to VAPI about Cancellation': reply('tool_cancel_03', 'Cancelled')
    },
    outcomes: [
      {
        kind: 'chat',
        node: 'Respond to VAPI about Cancellation',
        app: 'VAPI',
        title: `Call with +15125550193 · ${AGENT}`,
        lines: [
          { from: 'person', text: `I need to cancel my 10:30 on ${when}. Luis Ortega.` },
          { from: 'agent', text: 'Found it. Your 10:30 appointment is cancelled, and the invite is withdrawn.' }
        ]
      },
      {
        kind: 'calendar',
        node: 'Delete an event',
        title: 'Primary consultation – Luis Ortega',
        date: when,
        time: '10:30 – 11:00am (Central)',
        meet: true,
        cancelled: true,
        guests: ['you@example.com (organizer)', 'luis.ortega@example.com'],
        note: 'Cancel note: Travelling that week.'
      },
      {
        kind: 'airtable',
        node: 'Update Record to Cancel',
        file: appointments.file,
        table: appointments.table,
        columns: appointments.columns,
        rows: [
          ['Luis Ortega', '+15125550193', 'luis.ortega@example.com', `${when}, 10:30 AM`, 'Cancelled', AGENT],
          appointments.earlier[1]
        ],
        highlight: 0
      }
    ]
  }

  return [book, slotTaken, cancel]
}

export const aiAppointmentSetter: DemoBundle = {
  layout: layout as DemoLayout,
  scenarios
}
