import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export async function POST(req: NextRequest) {
  if (!ACCESS_TOKEN) {
    return NextResponse.json({ error: "WhatsApp access token is not configured." }, { status: 500 });
  }

  try {
    const { to, message } = await req.json();

    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: {
          body: message
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("WhatsApp API error:", errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}