import dotenv from "dotenv";
import connectDB from "./Database/index.js";
import app from "./App.js";

dotenv.config();

const port = process.env.PORT ;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("MONGODB connnection failed: ", err);
  });
