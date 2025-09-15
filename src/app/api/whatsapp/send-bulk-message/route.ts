import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export async function POST(req: NextRequest) {
  if (!ACCESS_TOKEN) {
    return NextResponse.json({ error: "WhatsApp access token is not configured." }, { status: 500 });
  }

  try {
    const { phoneNumbers, message } = await req.json();

    if (!Array.isArray(phoneNumbers) || !message) {
      return NextResponse.json({ error: "Invalid request body. Expected 'phoneNumbers' and 'message'." }, { status: 400 });
    }

    const successfulSends = [];
    const failedSends = [];

    for (const phoneNumber of phoneNumbers) {
      const payload = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message
        },
      };

      const response = await fetch(WHATSAPP_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        successfulSends.push(phoneNumber);
      } else {
        const errorData = await response.json();
        failedSends.push({ phoneNumber, error: errorData });
        console.error(`Error sending message to ${phoneNumber}:`, errorData);
      }
    }

    return NextResponse.json({
      message: "Bulk message process completed.",
      successfulSends,
      failedSends
    });

  } catch (error) {
    console.error("Error sending bulk WhatsApp message:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}