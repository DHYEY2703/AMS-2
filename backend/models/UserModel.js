import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "teacher", "student"],
    default: "student",
  },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  profilePic: { type: String, default: "" },
});

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;