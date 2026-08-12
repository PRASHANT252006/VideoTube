import { asyncHandler } from "../utils/asynchandler.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";


const createcomment =asyncHandler(async(req,res)=>{
 //Get:- content- targetId (video/tweet id)- targetType ("Video" or "Tweet") - req.user._id
  // validate
//   3. Check target exists:
//    - if targetType === "Video"
//        find Video by targetId
//    - else
//        find Tweet by targetId
//4. If target doesn't exist
    //   throw 404
// 5. Create comment:
//    {
//       content,
//       owner: req.user._id,
//       target: targetId,
//       targetType
//    }
  //return response
  const{ content,targetId,targetType}=req.body;

if (!content || !targetId || !targetType) {
    throw new ApiError(400, "Missing required fields");
}

const owner = req.user._id;
if (!mongoose.isValidObjectId(targetId)) {
    throw new ApiError(400, "Invalid target id");
}

let target;

if (targetType === "Video") {
    target = await Video.findById(targetId);
} else if (targetType === "Tweet") {
    target = await Tweet.findById(targetId);
} else {
    throw new ApiError(400, "Invalid target type");
}

if (!target) {
    throw new ApiError(404, `${targetType} not found`);
}


const comment=await Comment.create({
    content,
    owner,
    target: targetId,
    targetType
})
return res.status(201).json(
    new ApiResponse(
        201,
        comment,
        "Comment created successfully"
    )
);
});
const deletecomment=asyncHandler(async (req, res) => {
//  1. Get commentId from req.params
// 2. Validate ObjectId
// 3. Find comment
// 4. If comment doesn't exist
//       -> 404
// 5. Load target
//       Video or Tweet
// 6. Check permission
//       if (
//           comment.owner == req.user._id
//           ||
//           target.owner == req.user._id
//       )
// 7. Delete comment
// 8. Return response

const { commentId } = req.params;

if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
}

const comment = await Comment.findById(commentId);

if (!comment) {
    throw new ApiError(404, "Comment not found");
}
let target;

if (comment.targetType === "Video") {
    target = await Video.findById(comment.target);
} else if (comment.targetType === "Tweet") {
    target = await Tweet.findById(comment.target);
} else {
    throw new ApiError(400, "Invalid target type");
}

if (!target) {
    throw new ApiError(404, `${comment.targetType} not found`);
}

// Permission Check
const isCommentOwner = comment.owner.equals(req.user._id);
const isTargetOwner = target.owner.equals(req.user._id);

if (!isCommentOwner && !isTargetOwner) {
    throw new ApiError(
        403,
        "You are not authorized to delete this comment"
    );
}

// Delete Comment
await Comment.findByIdAndDelete(commentId);

// Response
return res.status(200).json(
    new ApiResponse(
        200,
        {},
        "Comment deleted successfully"
    )
);
});
const editcomment=asyncHandler(async (req, res) => {
    //get updatedcontent,id
    //validate
    //check requesting person is owner or not
    // update
    //return response



// 1. Get commentId from req.params
// 2. Get updatedContent from req.body
// 3. Validate commentId and updatedContent
// 4. Find the comment
//    -> If not found, return 404
// 5. Check if the requesting user is the comment owner
//    -> If not, return 403 (Forbidden)
// 6. Update the comment content
// 7. Save the updated comment (or use findByIdAndUpdate)
// 8. Return success response with updated comment


const {updatecomment}=req.body;
const {commentId}=req.params;
if(!updatecomment || !commentId){
    throw new ApiError(400,"UPDATEDCOMMENT OR COMMENTID is missing");
}
if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
}
const findcomment=await Comment.findById(commentId);
if(!findcomment){
    throw new ApiError(404,"Comment not found");
}
if (!findcomment.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to edit this comment");
}
const updatedcomment=await Comment.findByIdAndUpdate(commentId,{ content: updatecomment }, { new: true });
return res.status(200).json(
    new ApiResponse(
        200,
        updatedcomment,
        "Comment updated successfully"
    )
)});

const getusercomment=asyncHandler(async(req,res)=>{
    // 1. Get page and limit from req.query
// 2. Get userId (req.user._id or req.params.userId)
// 3. Validate userId
// 4. Find comments where owner = userId
// 5. Sort (newest first)
// 6. Paginate
// 7. Return paginated response

const { page = 1, limit = 10 } = req.query;

    const userid = req.user._id;

    const aggregate = Comment.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userid)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    const options = {
        page: Number(page),
        limit: Number(limit),
    };

    const comments = await Comment.aggregatePaginate(
        aggregate,
        options
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            comments,
            "Comments fetched successfully"
        )
    );
});

const getTargetComments = asyncHandler(async (req, res) => {

    const { targetId } = req.params;

    const { page = 1, limit = 10 } = req.query;


    if (!mongoose.isValidObjectId(targetId)) {
        throw new ApiError(400, "Invalid target id");
    }


    const aggregate = Comment.aggregate([
        {
            $match:{
                target:new mongoose.Types.ObjectId(targetId)
            }
        },

        {
            $sort:{
                createdAt:-1
            }
        },

        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },

        {
            $unwind:"$owner"
        },

        {
            $project:{
                content:1,
                createdAt:1,
                updatedAt:1,
                "owner.username":1,
                "owner.fullName":1,
                "owner.avatar":1
            }
        }
    ]);


    const options={
        page:Number(page),
        limit:Number(limit)
    };


    const comments = await Comment.aggregatePaginate(
        aggregate,
        options
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            comments,
            "Comments fetched successfully"
        )
    );
});

export { createcomment, deletecomment, editcomment, getusercomment, getTargetComments };