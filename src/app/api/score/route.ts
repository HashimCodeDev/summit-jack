import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { connectToDatabase } from "@/src/lib/db";

export async function POST(request: Request) {
    try {
        // 1. Verify the user is logged in securely on the server
        const session = await auth.api.getSession({
            headers: await headers() // Await headers for Next.js 15+ compatibility
        });

        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { score } = await request.json();

        // 2. Connect to the MongoDB cluster
        const db = await connectToDatabase();

        // Better-Auth creates a collection named "user" by default
        const collection = db.connection.collection('user');

        // 3. Fetch the user's current record
        const currentUser = await collection.findOne({ _id: session.user.id });
        const currentRecord = currentUser?.maxAltitude || 0;

        // 4. Update the DB ONLY if they beat their high score
        if (score > currentRecord) {
            await collection.updateOne(
                { _id: session.user.id },
                { $set: { maxAltitude: score } }
            );
            return Response.json({ success: true, updated: true, newRecord: score });
        }

        return Response.json({ success: true, updated: false, currentRecord });

    } catch (error) {
        console.error("Score Save Error:", error);
        return Response.json({ error: "Failed to process score" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        // 1. Verify the user is logged in
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Connect to the database
        const db = await connectToDatabase();
        const collection = db.connection.collection('user');

        // 3. Find the user and extract their max altitude (default to 0 if they haven't played)
        const currentUser = await collection.findOne({ _id: session.user.id });
        const maxAltitude = currentUser?.maxAltitude || 0;

        return Response.json({ success: true, maxAltitude });

    } catch (error) {
        console.error("Score Fetch Error:", error);
        return Response.json({ error: "Failed to fetch score" }, { status: 500 });
    }
}