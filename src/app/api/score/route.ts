import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { connectToDatabase } from "@/src/lib/db";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { score } = await request.json();

        const db = await connectToDatabase();
        const collection = db.connection.collection('user');

        const userObjectId = new ObjectId(session.user.id);

        const currentUser = await collection.findOne({ _id: userObjectId });
        const currentRecord = currentUser?.maxAltitude || 0;

        if (score > currentRecord) {
            await collection.updateOne(
                { _id: userObjectId },
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
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await connectToDatabase();
        const collection = db.connection.collection('user');

        const userObjectId = new ObjectId(session.user.id);

        const currentUser = await collection.findOne({ _id: userObjectId });
        const maxAltitude = currentUser?.maxAltitude || 0;

        return Response.json({ success: true, maxAltitude });

    } catch (error) {
        console.error("Score Fetch Error:", error);
        return Response.json({ error: "Failed to fetch score" }, { status: 500 });
    }
}