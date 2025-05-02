import mongoose from "mongoose";
import { DB_NAME } from "../Constants/db.constants.js";
import app from "../App.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );
    app.on("error", () => {
      console.log("Express Error:", error);
    });

    console.log(`\n MOngoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    // console.log("ConnectionInstance :", connectionInstance.connection);
    
  } catch (error) {
    console.log("Database connectivity error:", error);
    process.exit(1);
  }
};

export default connectDB;
