import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// const uploadOncloudinary = async (localFilePath) => {
//     try {
//         if (!localFilePath) return null;
//         const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
//         console.log("Uploaded on cloudinary:", response.url);

//         fs.unlinkSync(localFilePath);
//         return response;
//     } catch (error) {
//         fs.unlinkSync(localFilePath);
//         return null;
//     }
// }

// export { uploadOncloudinary };

// // cloudinary.v2.uploader.upload("http://res.cloudinary.com/demo/image/upload/w_100,h_100,c_fill,g_auto,r_max/sample.jpg", { public_id: "olympics flag" }, (error, result) => { console.log(result) });
const uploadOncloudinary = async (localFilePath) => {
    if (!localFilePath) return null;

    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        return response;
    } catch (error) {
        console.error(error);
        return null;
    } finally {
        if (fs.existsSync(localFilePath)) {
            await fs.promises.unlink(localFilePath);
        }
    }
};
export { uploadOncloudinary };