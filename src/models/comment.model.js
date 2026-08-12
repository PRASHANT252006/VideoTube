import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema(
{
    content:{
        type:String,
        required:true
    },

    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    target:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },

    targetType:{
        type:String,
        enum:["Video","Tweet"],
        required:true
    }

},
{
    timestamps:true
});


commentSchema.plugin(mongooseAggregatePaginate);


export const Comment = mongoose.model(
    "Comment",
    commentSchema
);