import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },

        owner: {
            //here owner is comment owner people who wrote comment
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        target: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: "targetType",
        },

        targetType: {
            type: String,
            required: true,
            enum: ["Video", "Tweet"],
        },
    },
    {
        timestamps: true,
    }
);

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);