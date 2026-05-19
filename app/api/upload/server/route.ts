import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "image",
            background_removal: "cloudinary_ai", // uses Cloudinary's built-in AI
            // OR use: background_removal: "remove_bg"  ← if you have the remove.bg add-on
            format: "png", // must be PNG to preserve transparency
          },
          (err, res) => {
            if (err) reject(err)
            else resolve(res)
          }
        )
        .end(buffer)
    })

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
    })
  } catch (err: any) {
    console.error("[cloudinary upload error]", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}