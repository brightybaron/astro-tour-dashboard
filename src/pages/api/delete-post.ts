import { prisma } from "@lib/prisma";
import { supabase } from "@lib/supabase";
import type { APIRoute } from "astro";

export const DELETE: APIRoute = async ({ request }) => {
  if (request.headers.get("Content-Type") === "application/json") {
    const data = await request.json();
    const id = data.id;

    try {
      // Fetch the post to get associated images
      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          images: true, // Assuming 'images' is the relation name in your Prisma schema
        },
      });

      if (!post) {
        return new Response(JSON.stringify({ message: "Post not found" }), {
          status: 404,
        });
      }

      if (post.images.length > 0) {
        const imagePaths = post.images.map((img) => img.url);
        for (const path of imagePaths) {
          const { error } = await supabase.storage
            .from("uploads")
            .remove([path]);
          if (error) {
            console.error(`Error deleting image: ${path}`, error);
            return new Response(
              JSON.stringify({ message: `Error deleting image: ${path}` }),
              { status: 500 }
            );
          }
        }
      }

      await prisma.image.deleteMany({
        where: { postId: id },
      });

      // Delete post from Prisma
      await prisma.post.delete({
        where: { id },
      });

      return new Response(
        JSON.stringify({ message: "Post and images deleted successfully!" }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting post:", error);
      return new Response(
        JSON.stringify({ message: "Failed to delete the post" }),
        { status: 500 }
      );
    }
  }
  return new Response(null, { status: 400 });
};
