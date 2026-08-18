import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
{
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    channel: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

},
{
    timestamps: true
});


// Prevent duplicate subscriptions
subscriptionSchema.index(
    {
        subscriber: 1,
        channel: 1
    },
    {
        unique: true
    }
);


// Prevent user subscribing to himself
subscriptionSchema.pre("save", function(next){

    if(this.subscriber.equals(this.channel)){
        return next(
            new Error("You cannot subscribe to yourself")
        );
    }

    next();
});


export const Subscription = mongoose.model(
    "Subscription",
    subscriptionSchema
);