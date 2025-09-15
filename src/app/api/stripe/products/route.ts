import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/authOptions';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeSecretKey!, { apiVersion: '2024-06-20' });

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'Admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productData } = await request.json();
        const product = await stripe.products.create({
            name: productData.name,
            default_price_data: {
                unit_amount: Math.round(productData.supplement * 100),
                currency: 'gbp'
            },
        });

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Stripe API Error:', error);
        return NextResponse.json({ error: 'Failed to create Stripe product' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'Admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productData } = await request.json();
        const product = await stripe.products.update(productData.stripeProductId, {
            name: productData.name,
        });

        const prices = await stripe.prices.list({ product: product.id });
        if (prices.data.length > 0) {
            await stripe.prices.update(prices.data[0].id, {
                active: false,
            });
        }
        await stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(productData.supplement * 100),
            currency: 'gbp'
        });

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Stripe API Error:', error);
        return NextResponse.json({ error: 'Failed to update Stripe product' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'Admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
        }

        await stripe.products.update(id, { active: false });

        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error('Stripe API Error:', error);
        return NextResponse.json({ error: 'Failed to delete Stripe product' }, { status: 500 });
    }
}