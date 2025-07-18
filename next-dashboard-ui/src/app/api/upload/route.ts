import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export const POST = async (req: Request) => {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, fileName);

  // Đảm bảo thư mục uploads tồn tại
  await writeFile(filePath, buffer);

  // Trả về URL public
  const url = `/uploads/${fileName}`;
  return NextResponse.json({ url, name: file.name, type: file.type, size: file.size });
};