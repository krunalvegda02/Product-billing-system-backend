import dotenv from "dotenv";
import connectDB from "./Database/index.js";
import app from "./app.js";
import { ensureDirectoryExists } from "./Utils/Helper.js";
import { createAdmin } from "./Utils/createAdmin.js";

dotenv.config();

const port = process.env.PORT;

connectDB()
  .then(() => {
    app.listen(port, () => {
      ensureDirectoryExists("./public/temp");
      console.log(`Server is running on port ${port}`);
      createAdmin();
    });
  })
  .catch((err) => {
    console.log("MONGODB connnection failed: ", err);
  });
