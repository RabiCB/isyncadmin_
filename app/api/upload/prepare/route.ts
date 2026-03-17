// app/api/upload/prepare/route.ts
// Step 1 of 2 — Server generates a presigned POST URL
// Client uploads the file DIRECTLY to Railway bucket (no service egress)
// Based on Railway docs pattern: createPresignedPost

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NextRequest, NextResponse } from "next/server"

const s3 = new S3Client({
  region:   process.env.AWS_REGION ?? "auto",
  endpoint: process.env.RAILWAY_BUCKET_ENDPOINT_URL!,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // required for Railway S3-compatible storage
})

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]
const MAX_BYTES     = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  if (
    !process.env.RAILWAY_BUCKET_NAME ||
    !process.env.RAILWAY_BUCKET_ENDPOINT_URL ||
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY
  ) {
    return NextResponse.json({ error: "Railway bucket env vars missing" }, { status: 500 })
  }

  try {
    const { fileName, fileType, fileSize } = await req.json()

    // Validate type
    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: `Unsupported type: ${fileType}. Use JPEG, PNG, WebP or AVIF.` },
        { status: 400 }
      )
    }

    // Validate size
    if (fileSize > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large (${(fileSize / 1024 / 1024).toFixed(1)}MB). Max 5MB.` },
        { status: 400 }
      )
    }

    // Build unique key
    const ext  = fileName.split(".").pop()?.toLowerCase() ?? "jpg"
    const rand = Math.random().toString(36).slice(2, 8)
    const key  = `phones/${Date.now()}-${rand}.${ext}`

    // Generate presigned POST — client uploads directly to Railway
    const { url, fields } = await createPresignedPost(s3, {
      Bucket:  process.env.RAILWAY_BUCKET_NAME,
      Key:     key,
      Expires: 3600,
      Conditions: [
        { bucket: process.env.RAILWAY_BUCKET_NAME },
        ["eq", "$key", key],
        ["starts-with", "$Content-Type", "image/"],
        ["content-length-range", 1000, MAX_BYTES],
      ],
    })

    // Also generate a presigned GET URL right now (7 days)
    // Client stores this directly — no proxy needed, no manual steps
    const viewUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.RAILWAY_BUCKET_NAME,
        Key:    key,
      }),
      { expiresIn: 60 * 60 * 24 * 7 }
    )

    return NextResponse.json({ url, fields, key, viewUrl })
  } catch (err: any) {
    console.error("[prepare-upload] error:", err)
    return NextResponse.json({ error: err.message ?? "Failed to prepare upload" }, { status: 500 })
  }
}