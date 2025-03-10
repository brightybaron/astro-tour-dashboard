import { getContentBySlug } from "@lib/data";
import { prisma } from "@lib/prisma";
import { supabase } from "@lib/supabase";
import { slugify } from "@lib/utils";

export async function PUT({ request }: { request: any }) {
  try {
    const formData = await request.formData();
    const nama = formData.get("nama");
    const lokasi = formData.get("lokasi");
    const jenistrip = formData.get("jenistrip");

    if (!nama || !lokasi || !jenistrip) {
      return new Response(
        JSON.stringify({ message: "Nama, lokasi, dan jenis trip diperlukan" }),
        { status: 400 }
      );
    }

    const oldSlug = formData.get("oldSlug");
    const newSlug = slugify(nama);
    const existingPost = await getContentBySlug(oldSlug || newSlug);
    if (!existingPost) {
      return new Response(JSON.stringify({ message: "Post tidak ditemukan" }), {
        status: 404,
      });
    }

    if (newSlug !== existingPost.slug) {
      const postWithNewSlug = await getContentBySlug(newSlug);
      if (postWithNewSlug && postWithNewSlug.id !== existingPost.id) {
        return new Response(
          JSON.stringify({ message: "Nama trip sudah digunakan" }),
          { status: 400 }
        );
      }
    }

    // const parseJSON = (key: string) => {
    //   try {
    //     return JSON.parse(formData.get(key)?.toString() || "[]");
    //   } catch {
    //     return [];
    //   }
    // };

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

    let itineraries = [];
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

    let descriptions = [];
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

    let existingImageIds: string[] = [];
    try {
      const existingImagesStr = formData.get("existingImages") as string;
      if (existingImagesStr) {
        existingImageIds = JSON.parse(existingImagesStr);
      }
    } catch (e) {
      return new Response(
        JSON.stringify({ message: "Format existingImages tidak valid" }),
        { status: 400 }
      );
    }

    // const existingImageIds = parseJSON("existingImages").map((item: any) =>
    //   typeof item === "string" ? item : item.id
    // );

    const images = formData.getAll("photos") as File[];
    let imageUrls: string[] = [];

    if (images.length > 0) {
      const uploadTasks = images.map(async (image) => {
        if (image.size > 0) {
          const { data, error } = await supabase.storage
            .from("uploads")
            .upload(`${newSlug}/${image.name}`, image, {
              cacheControl: "3600",
              upsert: true,
            });
          if (error) throw new Error("Error uploading image");
          return data.path;
        }
        return null;
      });

      imageUrls = (await Promise.all(uploadTasks)).filter(Boolean) as string[];
    }

    // Prisma Transaction for Data Consistency
    const updatedPost = await prisma.$transaction(async (tx) => {
      // Hapus gambar yang tidak lagi digunakan
      const imagesToDelete = existingPost.images.filter(
        (img: any) => !existingImageIds.includes(img.id)
      );
      await Promise.all(
        imagesToDelete.map(async (img) => {
          await supabase.storage.from("uploads").remove([img.url]);
          await tx.image.delete({ where: { id: img.id } });
        })
      );

      // Simpan gambar baru ke database
      const newImageIds = await Promise.all(
        imageUrls.map(async (url) => {
          const newImage = await tx.image.create({
            data: { url, postId: existingPost.id },
          });
          return newImage.id;
        })
      );

      return tx.post.update({
        where: { id: existingPost.id },
        data: {
          nama,
          lokasi,
          jenistrip,
          slug: newSlug,
          highlight,
          destinasi,
          fasilitas,
          harga,
          itineraries,
          descriptions,
          images: {
            connect: [...existingImageIds, ...newImageIds].map((id) => ({
              id,
            })),
          },
        },
        include: { images: true },
      });
    });

    return new Response(
      JSON.stringify({ message: "Post berhasil diupdate", post: updatedPost }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating post:", error);
    return new Response(
      JSON.stringify({ message: "Terjadi kesalahan saat mengupdate post" }),
      { status: 500 }
    );
  }
}
