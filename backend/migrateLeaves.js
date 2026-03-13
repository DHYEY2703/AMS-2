import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const defaultSchema = new mongoose.Schema({
            role: String,
            studentId: mongoose.Schema.Types.ObjectId,
            userId: mongoose.Schema.Types.ObjectId
        }, { strict: false });
        const Leave = mongoose.model("LeaveMigration", defaultSchema, "leaves");

        // We do direct collection update to rename fields
        await Leave.collection.updateMany(
            { studentId: { $exists: true } },
            {
                $rename: { "studentId": "userId" }
            }
        );

        // Apply default role
        await Leave.collection.updateMany(
            { role: { $exists: false } },
            { $set: { role: "student" } }
        );

        console.log("Migration complete.");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
});
