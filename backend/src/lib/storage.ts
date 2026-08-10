import { S3Client, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { HTTPException } from "hono/http-exception";
import { randomUUID } from "crypto";

const s3 = new S3Client({
    endpoint: process.env.RAILWAY_BUCKET_ENDPOINT,
    region: process.env.RAILWAY_BUCKET_REGION,
    forcePathStyle: true, // requerido por la mayoría de proveedores S3-compatibles
    credentials: {
        accessKeyId: process.env.RAILWAY_BUCKET_ACCESS_KEY_ID!,
        secretAccessKey: process.env.RAILWAY_BUCKET_SECRET_ACCESS_KEY!,
    },
});

const BUCKET = process.env.RAILWAY_BUCKET_NAME!;
const MAX_EVIDENCE_BYTES = 8 * 1024 * 1024; // 8MB

export async function createEvidenceUploadUrl(fileName: string, contentType: string) {
    const key = `payment-evidence/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${fileName}`;

    const { url, fields } = await createPresignedPost(s3, {
        Bucket: BUCKET,
        Key: key,
        Conditions: [["content-length-range", 0, MAX_EVIDENCE_BYTES], ["eq", "$Content-Type", contentType]],
        Fields: { "Content-Type": contentType },
        Expires: 300,
    });

    return { url, fields, key }; // el frontend sube con `fields` + `url`, y manda `key` como payment_receipt
}

export async function assertEvidenceExists(key: string) {
    try {
        await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    } catch {
        throw new HTTPException(400, { message: "El comprobante indicado no existe en el bucket. Súbelo primero." });
    }
}

export async function getEvidenceViewUrl(key: string) {
    return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 300 });
}