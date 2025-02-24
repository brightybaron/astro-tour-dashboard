import { prisma } from "@lib/prisma";
import { supabase } from "@lib/supabase";
import { slugify } from "@lib/utils";

export async function POST({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const nama = formData.get("nama") as string;
    const lokasi = formData.get("lokasi") as string;
    const jenistrip = formData.get("jenistrip") as string;

    // Validasi input dasar
    if (!nama || !lokasi || !jenistrip) {
      return new Response(
        JSON.stringify({ message: "Nama, lokasi, dan jenis trip diperlukan" }),
        { status: 400 }
      );
    }

    const highlight = ((formData.get("highlight") as string) || "")
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d !== "");
    const destinasi = ((formData.get("destinasi") as string) || "")
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d !== "");
    const fasilitas = ((formData.get("fasilitas") as string) || "")
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d !== "");
    const harga = ((formData.get("harga") as string) || "")
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d !== "");

    // Parse JSON dengan validasi
    let itineraries = [];
    let descriptions = [];

    try {
      const itineraryStr = formData.get("itinerary") as string;
      if (itineraryStr) {
        itineraries = JSON.parse(itineraryStr);
      }
    } catch (e) {
      return new Response(
        JSON.stringify({ message: "Format itinerary tidak valid" }),
        { status: 400 }
      );
    }

    try {
      const descriptionStr = formData.get("description") as string;
      if (descriptionStr) {
        descriptions = JSON.parse(descriptionStr);
      }
    } catch (e) {
      return new Response(
        JSON.stringify({ message: "Format description tidak valid" }),
        { status: 400 }
      );
    }

    const slug = slugify(nama);

    // Validasi slug unik
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });
    if (existingPost) {
      return new Response(
        JSON.stringify({ message: "Nama post sudah digunakan" }),
        { status: 400 }
      );
    }

    // Validasi foto
    const photos = formData.getAll("photos");
    if (!Array.isArray(photos) || photos.length === 0) {
      return new Response(
        JSON.stringify({ message: "Minimal satu gambar diperlukan" }),
        { status: 400 }
      );
    }

    if (photos.length > 5) {
      return new Response(
        JSON.stringify({
          message: "Anda hanya dapat mengunggah hingga 5 gambar",
        }),
        { status: 400 }
      );
    }

    // Validasi tipe file
    for (const photo of photos) {
      if (!(photo instanceof File && photo.type.startsWith("image/"))) {
        return new Response(
          JSON.stringify({
            message: "Upload tidak valid, pastikan semua file adalah gambar",
          }),
          { status: 400 }
        );
      }

      // Validasi tipe MIME (opsional)
      if (!photo.type.startsWith("image/")) {
        return new Response(
          JSON.stringify({
            message: `File "${photo.name}" bukan gambar yang valid`,
          }),
          { status: 400 }
        );
      }
    }

    // Store images in Supabase (parallel upload)
    const uploadedImages = await Promise.all(
      photos.map(async (file) => {
        if (!(file instanceof File)) {
          throw new Error("Invalid file object");
        }

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(`${slug}/${file.name}`, file, {
            upsert: true,
            cacheControl: "3600",
          });

        if (uploadError) {
          console.error("Supabase upload error:", uploadError.message);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        if (!uploadData?.path) {
          throw new Error(
            "Upload berhasil tetapi tidak ada path yang dikembalikan"
          );
        }

        return { url: uploadData.path };
      })
    );

    // Create post in Prisma
    const newPost = await prisma.post.create({
      data: {
        nama,
        slug,
        lokasi,
        jenistrip,
        highlight,
        destinasi,
        fasilitas,
        harga,
        descriptions,
        itineraries,
        images: {
          create: uploadedImages,
        },
      },
    });

    return new Response(JSON.stringify(newPost), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to create post",
        error: (error as Error).message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
