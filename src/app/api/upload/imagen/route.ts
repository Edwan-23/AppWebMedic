import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const tipo = (formData.get("tipo") as string) || "publicacion"; // publicacion o donacion

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Use JPG, PNG o WEBP" },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. Máximo 5MB" },
        { status: 400 }
      );
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = file.name.split(".").pop();
    const prefix = tipo === "donacion" ? "donacion" : "publicacion";
    const folder = tipo === "donacion" ? "donaciones" : "publicaciones";
    const fileName = `${prefix}_${timestamp}_${random}.${extension}`;

    // Definir ruta donde se guardará
    const uploadDir = path.join(process.cwd(), "public", "images", folder);
    
    // Crear directorio si no existe
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);

    // Convertir el archivo a buffer y guardarlo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Retornar la URL de la imagen
    const imageUrl = `/images/${folder}/${fileName}`;

    return NextResponse.json(
      {
        mensaje: "Imagen subida exitosamente",
        url: imageUrl
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error al subir imagen:", error);
    return NextResponse.json(
      { error: "Error al subir la imagen" },
      { status: 500 }
    );
  }
}
