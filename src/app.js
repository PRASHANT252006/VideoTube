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

import playlistroute from './routes/playlist.routes.js'
app.use("/api/v1/playlist",playlistroute);

import videoRouter from "./routes/video.routes.js";
app.use("/api/v1/videos", videoRouter);

import likeRouter from "./routes/like.routes.js";

app.use(
    "/api/v1/likes",
    likeRouter
);

import subscriptionRouter from "./routes/subscrition.routes.js";
app.use(
    "/api/v1/subscriptions",
    subscriptionRouter
);

import dashboardRouter from "./routes/dash.routes.js";
app.use(
    "/api/v1/dashboard",
    dashboardRouter
);


import searchRouter from "./routes/search.routes.js";
app.use(
    "/api/v1/search",
    searchRouter
);


import notificationRouter from "./routes/notification.routes.js";
app.use(
    "/api/v1/notifications",
    notificationRouter
);

export { app }