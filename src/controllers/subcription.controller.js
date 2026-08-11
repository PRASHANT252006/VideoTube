import {  Subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const subscribed=asyncHandler(async(req,res)=>{
    const { channelId } = req.params;
    const subscriber = req.user._id;
     if(!mongoose.isValidObjectId(channelId)){
            throw new ApiError(400,"channelId is required");
         } 
    const isSubscribed = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId
});
if(isSubscribed){
    return res.status(400).json(
    new ApiResponse(400, null, "Already Subscribed")
);
}
      
          
         if (subscriber.toString() === channelId.toString()) {
    throw new ApiError(400, "You cannot subscribe to yourself");
}
         const subscription = await Subscription.create({
            subscriber,
            channel: channelId})
      return res.status(201).json(
          new ApiResponse(201, subscription, "Subscription created successfully")
      );
})
const unsubscribe=asyncHandler(async(req,res)=>{
    const { channelId } = req.params;
    const subscriber = req.user._id;
     if(!mongoose.isValidObjectId(channelId)){
            throw new ApiError(400,"channelId is required");
         } 
          const isSubscribed = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId
});
if(!isSubscribed){
    return res.status(400).json(
    new ApiResponse(400, null, "Already UnSubscribed")
);
}
 await Subscription.findByIdAndDelete(isSubscribed._id);


    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Unsubscribed successfully"
        )
    );

});
const getSubscriberCount = asyncHandler(async(req,res)=>{

    const { channelId } = req.params;


    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channelId");
    }


    const subscriberCount = await Subscription.countDocuments({
        channel: channelId
    });


    return res.status(200).json(
        new ApiResponse(
            200,
            {subscriberCount},
            "Subscriber count fetched successfully"
        )
    );

});
const getChannelSubscribers = asyncHandler(async(req,res)=>{

    const {channelId}=req.params;


    const subscribers = await Subscription.find({
        channel: channelId
    })
    .populate(
        "subscriber",
        "username fullName avatar"
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            subscribers,
            "Subscribers fetched successfully"
        )
    );

});
const checkSubscription = asyncHandler(async(req,res)=>{

    const {channelId}=req.params;

    const subscription = await Subscription.findOne({
        subscriber:req.user._id,
        channel:channelId
    });


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                isSubscribed: !!subscription
            },
            "Subscription status"
        )
    );

});
 export {subscribed,unsubscribe,getSubscriberCount,getChannelSubscribers,checkSubscription};