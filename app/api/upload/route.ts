// app/api/upload/route.ts
// Receives a file from the admin form → uploads to Railway S3 bucket → returns public URL
//
// Required env vars (auto-injected by Railway when you add a Bucket service):
//   RAILWAY_BUCKET_NAME
//   RAILWAY_BUCKET_ENDPOINT_URL
//   AWS_ACCESS_KEY_ID
//   AWS_SECRET_ACCESS_KEY
//   AWS_REGION (usually "auto")

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"

// ─── S3 client pointing at Railway bucket ─────────────────────
const s3 = new S3Client({
  region:   process.env.AWS_REGION ?? "auto",
  endpoint: process.env.RAILWAY_BUCKET_ENDPOINT_URL!,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]
const MAX_BYTES     = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  // ── Check env vars are present ──
  if (
    !process.env.RAILWAY_BUCKET_NAME ||
    !process.env.RAILWAY_BUCKET_ENDPOINT_URL ||
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY
  ) {
    return NextResponse.json(
      { error: "Railway bucket env vars not configured" },
      { status: 500 }
    )
  }

  try {
    const form = await req.formData()
    const file = form.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // ── Validate type ──
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Use JPEG, PNG, WebP or AVIF.` },
        { status: 400 }
      )
    }

    // ── Validate size ──
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 5MB.` },
        { status: 400 }
      )
    }

    // ── Build a unique key ──
    const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
    const rand = Math.random().toString(36).slice(2, 8)
    const key  = `phones/${Date.now()}-${rand}.${ext}`

    // ── Convert File → Buffer ──
    const buffer = Buffer.from(await file.arrayBuffer())

    // ── Upload to Railway bucket ──
    await s3.send(
      new PutObjectCommand({
        Bucket:      process.env.RAILWAY_BUCKET_NAME,
        Key:         key,
        Body:        buffer,
        ContentType: file.type,
        // Make publicly readable — remove if your bucket is private
        ACL:         "public-read",
      })
    )

    // ── Build public URL ──
    // Railway bucket URL format: https://<endpoint>/<bucket-name>/<key>
    const url = `${process.env.RAILWAY_BUCKET_ENDPOINT_URL}/${process.env.RAILWAY_BUCKET_NAME}/${key}`

    return NextResponse.json({ url, key })

  } catch (err: any) {
    console.error("[upload] Railway S3 error:", err)
    return NextResponse.json(
      { error: err.message ?? "Upload failed" },
      { status: 500 }
    )
  }
}