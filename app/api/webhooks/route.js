import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { stripe } from '../../libs/stripe';
import { upsertProductRecord, upsertPriceRecord, manageSubscriptionStatusChange } from '../../libs/supabaseAdmin';


const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'price.created',
  'price.updated',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);


export async function POST(request) {
  const body = await request.text();
  const signature = (await headers()).get('Stripe-Signature');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!signature || !webhookSecret) {
      return new NextResponse('Missing signature or webhook secret', { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.log('Error: ' + error.message);
    return new NextResponse(`Webhook error: ${error.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated':
          await upsertProductRecord(event.data.object);
          break;
        case 'price.created':
        case 'price.updated':
          await upsertPriceRecord(event.data.object);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object;
          await manageSubscriptionStatusChange(subscription.id, subscription.customer, event.type === 'customer.subscription.created');
          break;
        case 'checkout.session.completed':
          const checkoutSession = event.data.object;
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(subscriptionId, checkoutSession.customer, true);
          }
          break;
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.log('Error: ' + error.message);
      return new NextResponse(`Webhook error: ${error.message}`, { status: 400 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
};