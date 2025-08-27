// src/app/api/stripe/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

// This API route is now generic and can handle creating/updating products
// for both meals and packages.

export async function POST(req: NextRequest) {
  try {
    // It now looks for a generic 'productData' key instead of 'meal'.
    const { productData } = await req.json();

    if (!productData) {
      return NextResponse.json({ error: "Product data is required." }, { status: 400 });
    }

    const product = await stripe.products.create({
      name: productData.name,
      description: productData.description,
      default_price_data: {
        currency: "gbp",
        unit_amount: Math.round(productData.supplement * 100),
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error creating Stripe product:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    // It now looks for a generic 'productData' key.
    const { productData } = await req.json();

    if (!productData || !productData.stripeProductId) {
      return NextResponse.json({ error: "Product data with Stripe Product ID is required." }, { status: 400 });
    }

    const product = await stripe.products.retrieve(productData.stripeProductId);
    const oldPriceId = product.default_price as string | null;

    const newPrice = await stripe.prices.create({
      product: productData.stripeProductId,
      unit_amount: Math.round(productData.supplement * 100),
      currency: 'gbp',
    });

    const updatedProduct = await stripe.products.update(productData.stripeProductId, {
      name: productData.name,
      description: productData.description,
      default_price: newPrice.id,
    });

    if (oldPriceId) {
      await stripe.prices.update(oldPriceId, { active: false });
    }

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error("Error updating Stripe product and price:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
