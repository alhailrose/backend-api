import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Konfigurasi S3 Client untuk DigitalOcean Spaces
const s3 = new S3Client({
  endpoint: process.env.SPACES_ENDPOINT, // Harus mencakup protokol, seperti "https://sgp1.digitaloceanspaces.com"
  region: "us-east-1", // Region tidak relevan untuk DigitalOcean Spaces, gunakan default
  credentials: {
    accessKeyId: process.env.SPACES_ACCESS_KEY,
    secretAccessKey: process.env.SPACES_SECRET_KEY,
  },
});

const bucketName = process.env.SPACES_BUCKET_NAME;

const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

const uploadProfilePhotoToSpaces = async (file) => {
  try {
    // Pastikan file valid
    if (!file) {
      throw new Error("No file provided for upload.");
    }

    const uniqueCode = Math.random().toString(36).substring(2, 10);
    const fileName = `Photo-Profile_Image/profile-photo-${uniqueCode}`;
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: file.buffer,
      ACL: "public-read",
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    // Buat URL publik
    const publicUrl = `https://${bucketName}.${process.env.SPACES_ENDPOINT.replace(
      "https://",
      ""
    )}/${fileName}`;

    return publicUrl;
  } catch (err) {
    console.error("Error uploading to Spaces:", err);
    throw err;
  }
};

const deleteFileFromSpaces = async (publicUrl) => {
  try {
    // Ekstrak file path dari URL
    const filePath = publicUrl.replace(
      `https://${bucketName}.${process.env.SPACES_ENDPOINT.replace(
        "https://",
        ""
      )}/`,
      ""
    );

    const headParams = { Bucket: bucketName, Key: filePath };

    // Cek apakah file ada
    try {
      const headCommand = new HeadObjectCommand(headParams);
      await s3.send(headCommand);
    } catch (err) {
      if (err.name === "NotFound") {
        console.warn(`File not found in Spaces: ${publicUrl}`);
        return {
          status: "success",
          message: "File not found in Spaces, no action needed",
        };
      }
      throw err;
    }

    // Hapus file
    const deleteParams = { Bucket: bucketName, Key: filePath };
    const deleteCommand = new DeleteObjectCommand(deleteParams);
    await s3.send(deleteCommand);

    return {
      status: "success",
      message: "File successfully deleted from Spaces",
    };
  } catch (err) {
    console.error("Error deleting file from Spaces:", err);
    throw {
      status: "failed",
      message: "Failed to delete file from Spaces",
    };
  }
};

export { upload, uploadProfilePhotoToSpaces, deleteFileFromSpaces };
