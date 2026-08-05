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
import router from './routes/user.routes.js';

//routes declaration
app.use("/api/v1/users", router);
//http://localhost:5000/api/v1/users/register

import tweetrouter from "./routes/tweet.routes.js";

app.use("/api/v1/tweets", tweetrouter);


import commentroute from "./routes/comment.routes.js";
app.use("/api/v1/comments", commentroute);

export { app }