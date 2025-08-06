import AWS from "aws-sdk";
import { parse } from "path";

export async function uploadToS3(file: File) {
  try {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const s3 = new AWS.S3({
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
      },
      region: "us-east-1", // Thay đổi theo khu vực của bạn
    });

    const file_key = "uploads/" + Date.now().toString() + file.name.replace(" ", "-"); // Thay đổi đường dẫn nếu cần
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: file_key, // Tên tệp trên S3
      Body: file, // Dữ liệu tệp
    };
    const upload = s3.putObject(params).on("httpUploadProgress", (evt) => {
      console.log("Upload progress:", parseInt(((evt.loaded*100)/evt.total).toString())) + "%";
    }).promise();

    await upload.then((data) => {
      console.log("File uploaded successfully:", file_key);
    
    })
    return Promise.resolve({
     file_key,
     file_name: file.name,
    });




  }
  

  
  
  
  catch (error) {
    console.error("Error updating AWS config:", error);
    throw new Error("Failed to configure AWS SDK");
  }
}

export function getS3Url(file_key: string) {
    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.us-east-1.amazonaws.com/${file_key}`;
    return url;
}