import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
  try {
    const { public_id } = await req.json()

    if (!public_id) {
      return Response.json({ error: "Missing public_id" }, { status: 400 })
    }

    const result = await cloudinary.uploader.destroy(public_id)

    return Response.json({ ok: true, result })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}