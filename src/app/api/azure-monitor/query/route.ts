import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/authOptions';

const APPLICATION_INSIGHTS_APP_ID = process.env.APPLICATION_INSIGHTS_APP_ID;
const AZURE_MONITOR_API_KEY = process.env.AZURE_MONITOR_API_KEY;

console.log(APPLICATION_INSIGHTS_APP_ID);
console.log(AZURE_MONITOR_API_KEY);

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    // Security check: Ensure only authenticated admins can use this API
    if (!session || session.user.role !== 'Admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!APPLICATION_INSIGHTS_APP_ID || !AZURE_MONITOR_API_KEY) {
        return NextResponse.json({ error: 'Azure Monitor configuration is missing.' }, { status: 500 });
    }

    try {
        const { kqlQuery } = await request.json();

        console.log(kqlQuery);
        
        const apiUrl = `https://api.applicationinsights.io/v1/apps/${APPLICATION_INSIGHTS_APP_ID}/query`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': AZURE_MONITOR_API_KEY,
            },
            body: JSON.stringify({ query: kqlQuery }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Azure Monitor API error:', errorData);
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Proxy request failed:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
