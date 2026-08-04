// require('dotenv').config({ path: "./.env" })
import dotenv from "dotenv";
// import moongoose from "moongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
// import express from "express";
import { app } from "./app.js";
dotenv.config({
    path: "./.env"
})

connectDB()
    .then(() => { app.listen(process.env.PORT || 8000, () => { console.log(`Server is running on port ${process.env.PORT || 8000}`) }) })
    .catch((error) => {
        console.log("MONGODB CONNECTION ERROR", error);
    })




//aprreoach 1:
// import express from "express";
// const app = express();
// (async () => {
//     try {
//         mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         app.on("error", () => {
//             console.log("Error while connecting to the database");
//             throw error
//         })
//         app.listen(process.env.PORT, () => { console.log(`Server is running on port ${process.env.PORT}`) });
//     }
//     catch (error) {
//         console.log("Error while connecting to the database", error);
//         throw error
//     }
// })()