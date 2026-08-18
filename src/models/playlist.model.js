import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
const playlistSchema = new mongoose.Schema(
    {
        name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
},

description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
},

videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
}],

owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
},

isPublic: {
    type: Boolean,
    default: true,
},
    }, { timestamps: true }
)

playlistSchema.index({ owner: 1 });
playlistSchema.plugin(mongooseAggregatePaginate);
export const Playlist = mongoose.model('Playlist', playlistSchema);