import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// We use the raw MongoClient for Better-Auth's internal tables
const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db(); // Uses the database specified in your URI

export const auth = betterAuth({
    database: mongodbAdapter(db),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }
    },
    user: {
        additionalFields: {
            // We inject our custom game stat directly into the Auth User table!
            maxAltitude: {
                type: "number",
                required: false,
                defaultValue: 0
            }
        }
    }
});