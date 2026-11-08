import layout from '@/content/demos/order-stock-check.layout.json'
import { CENTRAL, clock } from '@/lib/demos/sample'
import type { DemoBundle, DemoLayout, DemoOutcome, DemoScenario } from '@/lib/demos/types'

/**
 * New orders for Juniper & Moss, the fictional shop the build was made for
 * (mugs, tote bags and candles). Every 15 minutes the scenario finds orders
 * marked New, looks up each SKU in the inventory sheet, and the Router sends
 * the order down every route whose filter passes: an order that leaves stock
 * under its reorder level is confirmed and flagged. Make shows a sheet's
 * columns as "Header (letter)", so the bundles here do too. The emails and
 * Slack messages are the blueprint's own text with the sample filled in.
 */

const ORDER_COLUMNS = ['Order ID', 'Date', 'Customer', 'Email', 'SKU', 'Qty', 'Status', 'Notes', 'Updated']
const STOCK_COLUMNS = ['SKU', 'Product', 'Stock', 'Reorder level']

type Order = { id: string; row: number; customer: string; email: string; sku: string; qty: number }
type Item = { sku: string; product: string; stock: number; reorder: number; row: number }

const INVENTORY: Item[] = [
  { sku: 'MUG-SPK-01', product: 'Speckled Stoneware Mug', stock: 40, reorder: 10, row: 2 },
  { sku: 'TOTE-LIN-02', product: 'Linen Market Tote', stock: 14, reorder: 12, row: 3 },
  { sku: 'CND-CED-03', product: 'Cedar & Sage Candle', stock: 4, reorder: 8, row: 4 }
]

/** The order as Make's Search Rows hands it on: one bundle, every column. */
const orderBundle = (order: Order, placed: string) => ({
  __ROW_NUMBER__: order.row,
  'Order ID (A)': order.id,
  'Date (B)': placed,
  'Customer (C)': order.customer,
  'Email (D)': order.email,
  'SKU (E)': order.sku,
  'Qty (F)': order.qty,
  'Status (G)': 'New',
  'Notes (H)': '',
  'Updated (I)': ''
})

const stockBundle = (item: Item) => ({
  __ROW_NUMBER__: item.row,
  'SKU (A)': item.sku,
  'Product (B)': item.product,
  'Stock (C)': item.stock,
  'Reorder level (D)': item.reorder
})

function scenarios(now: Date): DemoScenario[] {
  const stamp = new Intl.DateTimeFormat('sv-SE', {
    timeZone: CENTRAL,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(now)

  const placed = stamp.slice(0, 10)
  const time = clock(now)

  const earlier = [
    [
      'JM-1039',
      placed,
      'Grace Lin',
      'grace.lin@example.com',
      'MUG-SPK-01',
      4,
      'Confirmed',
      'Reserved 4; 40 left in stock',
      `${placed} 09:15`
    ],
    [
      'JM-1040',
      placed,
      'Owen Hart',
      'owen.hart@example.com',
      'CND-CED-03',
      2,
      'Confirmed',
      'Reserved 2; 4 left in stock',
      `${placed} 09:30`
    ]
  ]

  /** One order down the Router: what each module returns, and what people see. */
  function run(order: Order, item: Item) {
    const left = item.stock - order.qty
    const fits = order.qty <= item.stock
    const low = fits && left < item.reorder
    const status = fits ? 'Confirmed' : 'On hold'

    const notes = fits
      ? `Reserved ${order.qty}; ${left} left in stock`
      : `Not enough stock: ${order.qty} ordered, ${item.stock} available`

    const sheetRow = [order.id, placed, order.customer, order.email, order.sku, order.qty, status, notes, stamp]
    const bundle = orderBundle(order, placed)

    const output: Record<string, unknown> = {
      'Get new orders': bundle,
      'Look up stock': stockBundle(item),
      'Router 3': bundle
    }

    const outcomes: DemoOutcome[] = []

    if (fits) {
      output['Reserve stock'] = { ...stockBundle(item), 'Stock (C)': left }
      output['Mark order confirmed'] = {
        ...bundle,
        'Status (G)': status,
        'Notes (H)': notes,
        'Updated (I)': stamp
      }
      output['Email order confirmation'] = {
        id: '19b0c7d2a4e0f1b9',
        threadId: '19b0c7d2a4e0f1b9',
        labelIds: ['SENT']
      }

      outcomes.push(
        {
          kind: 'email',
          node: 'Email order confirmation',
          from: 'The Shop Team',
          to: order.email,
          subject: `Order ${order.id} confirmed`,
          body: `Hi ${order.customer},\n\nGood news: your order ${order.id} for ${order.qty} x ${item.product} is confirmed, and the items are reserved for you. We'll email you again when it ships.\n\nThanks for your order,\nThe Shop Team`,
          time
        },
        {
          kind: 'sheets',
          node: 'Mark order confirmed',
          file: 'Juniper & Moss Orders',
          table: 'Orders',
          columns: ORDER_COLUMNS,
          rows: [...earlier, sheetRow],
          highlight: earlier.length
        },
        {
          kind: 'sheets',
          node: 'Reserve stock',
          file: 'Juniper & Moss Inventory',
          table: 'Inventory',
          columns: STOCK_COLUMNS,
          rows: INVENTORY.map(each =>
            each.sku === item.sku
              ? [each.sku, each.product, left, each.reorder]
              : [each.sku, each.product, each.stock, each.reorder]
          ),
          highlight: INVENTORY.indexOf(item)
        }
      )
    }

    if (low) {
      output['Alert operations: low stock'] = { channel: 'C07OPERATIONS', ts: '1762654010.000300', ok: true }
      outcomes.push({
        kind: 'slack',
        node: 'Alert operations: low stock',
        channel: 'operations',
        app: 'Make',
        time,
        text: [
          `:warning: Low stock: ${item.product} (${item.sku}) is down to ${left} after order ${order.id}. The reorder level is ${item.reorder}, so please place a restock order.`
        ]
      })
    }

    if (!fits) {
      output['Put order on hold'] = { ...bundle, 'Status (G)': status, 'Notes (H)': notes, 'Updated (I)': stamp }
      output['Email customer about the delay'] = {
        id: '19b0c7e91f2a6d03',
        threadId: '19b0c7e91f2a6d03',
        labelIds: ['SENT']
      }
      output['Alert operations: order on hold'] = { channel: 'C07OPERATIONS', ts: '1762654011.000400', ok: true }

      outcomes.push(
        {
          kind: 'email',
          node: 'Email customer about the delay',
          from: 'The Shop Team',
          to: order.email,
          subject: `An update on your order ${order.id}`,
          body: `Hi ${order.customer},\n\nThanks for your order ${order.id}. We don't have enough ${item.product} in stock to fill it right now, so we've put it on hold rather than leave you waiting without word.\n\nSomeone from our team will email you within one business day with a restock date or an alternative.\n\nSorry for the wait,\nThe Shop Team`,
          time
        },
        {
          kind: 'slack',
          node: 'Alert operations: order on hold',
          channel: 'operations',
          app: 'Make',
          time,
          text: [
            `:no_entry: Order ${order.id} is on hold. ${order.customer} ordered ${order.qty} x ${item.product}, but only ${item.stock} are in stock. The customer has been told to expect an update within one business day.`
          ]
        },
        {
          kind: 'sheets',
          node: 'Put order on hold',
          file: 'Juniper & Moss Orders',
          table: 'Orders',
          columns: ORDER_COLUMNS,
          rows: [...earlier, sheetRow],
          highlight: earlier.length
        }
      )
    }

    return { output, outcomes, branch: { 'Router 3': fits ? (low ? [0, 1] : 0) : 2 } }
  }

  const confirm = run(
    { id: 'JM-1042', row: 4, customer: 'Priya Shah', email: 'priya.shah@example.com', sku: 'MUG-SPK-01', qty: 2 },
    INVENTORY[0]
  )

  const low = run(
    { id: 'JM-1043', row: 5, customer: 'Marcus Webb', email: 'marcus.webb@example.com', sku: 'TOTE-LIN-02', qty: 3 },
    INVENTORY[1]
  )

  const hold = run(
    { id: 'JM-1044', row: 6, customer: 'Hannah Cole', email: 'hannah.cole@example.com', sku: 'CND-CED-03', qty: 6 },
    INVENTORY[2]
  )

  return [
    {
      id: 'confirm',
      label: 'New order · enough stock',
      hint: 'Plenty in stock: reserved, confirmed and the customer emailed.',
      ...confirm
    },
    {
      id: 'low',
      label: 'New order · leaves stock low',
      hint: 'Confirmed, but it leaves 11 against a reorder level of 12, so operations hears about it.',
      ...low
    },
    {
      id: 'hold',
      label: 'New order · not enough stock',
      hint: 'Only 4 in stock: the order goes on hold and the customer is told why.',
      ...hold
    }
  ]
}

export const orderStockCheck: DemoBundle = { layout: layout as DemoLayout, scenarios }
