// app/api/upload/serve/route.ts
// Step 2 — Given a stored key, return a presigned GET URL for reading
// Files served directly from Railway bucket — zero service egress
// Usage: GET /api/upload/serve?key=phones/1234-abc.jpg

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NextRequest, NextResponse } from "next/server"

const s3 = new S3Client({
  region:   process.env.AWS_REGION ?? "auto",
  endpoint: process.env.RAILWAY_BUCKET_ENDPOINT_URL!,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
})

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 })

  try {
    // Generate presigned URL valid for 7 days (max 90 days on Railway)
    const presignedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.RAILWAY_BUCKET_NAME!,
        Key:    key,
      }),
      { expiresIn: 60 * 60 * 24 * 7 } // 7 days
    )

    // Redirect to presigned URL — file served directly from bucket (no egress)
    return NextResponse.redirect(presignedUrl, 302)
  } catch (err: any) {
    console.error("[serve] error:", err)
    return NextResponse.json({ error: "Could not generate URL" }, { status: 500 })
  }
}