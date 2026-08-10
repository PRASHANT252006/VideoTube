import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
{
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    },

    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    },

    tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet",
    },

    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

},
{
    timestamps: true
});


// Validation: like must belong to something
likeSchema.pre("validate", function(next){

    if(!this.video && !this.comment && !this.tweet){
        return next(
            new Error("Like must belong to video, comment or tweet")
        );
    }

    next();
});


// Unique likes
likeSchema.index(
    { video: 1, likedBy: 1 },
    { unique: true, sparse: true }
);

likeSchema.index(
    { comment: 1, likedBy: 1 },
    { unique: true, sparse: true }
);

likeSchema.index(
    { tweet: 1, likedBy: 1 },
    { unique: true, sparse: true }
);


export const Like = mongoose.model("Like", likeSchema);