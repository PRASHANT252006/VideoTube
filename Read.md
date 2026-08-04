#pt backened
[Modellink](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj?origin=share)

//index.js
i// require('dotenv').config({ path: "./.env" })
import dotenv from "dotenv";
// import moongoose from "moongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import express from "express";

const app = express();
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

    //app.js
    import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({
    limit: "16kb"
}));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"))
app.use(cookieParser());

// Routes
import userRouter from './routes/user.routes.js';

//routes declaration
app.use("/api/v1/users", userRouter);
//http://localhost:5000/api/v1/users/register

export { app }