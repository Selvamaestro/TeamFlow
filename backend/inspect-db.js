// Database Inspection Script
require("dotenv").config();
const mongoose = require("mongoose");

async function inspectDB() {
    console.log("==================================================");
    console.log("             TEAMFLOW DATABASE INSPECTION         ");
    console.log("==================================================");

    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;

        console.log(`\nConnection Status: CONNECTED`);
        console.log(`Database Name:     ${mongoose.connection.name}`);
        console.log(`MongoDB Host:      ${mongoose.connection.host}`);

        const collections = await db.listCollections().toArray();
        console.log(`Total Collections: ${collections.length}\n`);

        for (const col of collections) {
            const name = col.name;
            const count = await db.collection(name).countDocuments();
            const docs = await db.collection(name).find({}).limit(5).toArray();

            console.log(`--------------------------------------------------`);
            console.log(`📁 Collection: ${name.toUpperCase()} (${count} documents)`);
            console.log(`--------------------------------------------------`);

            if (docs.length === 0) {
                console.log("   (No documents found in this collection)\n");
            } else {
                docs.forEach((doc, idx) => {
                    console.log(` [Document ${idx + 1}]`);
                    console.log(JSON.stringify(doc, null, 3));
                    console.log("");
                });
            }
        }

        console.log("==================================================");
        console.log("          DATABASE INSPECTION COMPLETE            ");
        console.log("==================================================");
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("❌ Database Connection Failed:", err.message);
        process.exit(1);
    }
}

inspectDB();
