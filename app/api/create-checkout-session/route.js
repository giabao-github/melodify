import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { stripe } from '../../libs/stripe';
import { getURL } from '../../libs/helpers';
import { createOrRetrieveCustomer } from '../../libs/supabaseAdmin';


export async function POST(request) {
  const { price, quantity = 1, metadata = {} } = await request.json();

  try {
    const supabase = createRouteHandlerClient({
      cookies
    });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Failed to retrieve user data');
    }

    const customer = await createOrRetrieveCustomer({
      uuid: user?.id || '',
      email: user?.email || ''
    });

    if (!customer) {
      throw new Error('Failed to retrieve customer data');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer,
      line_items: [
        {
          price: price.id,
          quantity
        }
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      subscription_data: {
        trial_from_plan: true,
        metadata
      },
      success_url: `${getURL()}/account`,
      cancel_url: `${getURL()}`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.log('Error: ' + error.message);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
