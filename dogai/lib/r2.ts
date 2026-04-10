import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createReadStream } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export async function uploadToR2(
  filePath: string,
  contentType: string,
  folder = "dogs"
): Promise<string> {
  const ext = path.extname(filePath);
  const key = `${folder}/${randomUUID()}${ext}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: createReadStream(filePath),
      ContentType: contentType,
    })
  );

  return `${PUBLIC_URL}/${key}`;
}

export async function uploadBufferToR2(
  buffer: Buffer,
  ext: string,
  contentType: string,
  folder = "dogs"
): Promise<string> {
  const key = `${folder}/${randomUUID()}.${ext}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `${PUBLIC_URL}/${key}`;
}
