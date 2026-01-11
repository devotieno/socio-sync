import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSubscriptionCheckout } from '@/lib/lemonsqueezy';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { variantId } = body;

    if (!variantId) {
      return NextResponse.json(
        { error: 'Variant ID is required' },
        { status: 400 }
      );
    }

    const checkout = await createSubscriptionCheckout(
      session.user.id,
      session.user.email!,
      variantId,
      `${process.env.NEXTAUTH_URL}/dashboard`
    );

    if (!checkout) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    // Lemonsqueezy checkout response structure
    const checkoutUrl = (checkout as any).data?.attributes?.url || (checkout as any).attributes?.url;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'No checkout URL received' },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
