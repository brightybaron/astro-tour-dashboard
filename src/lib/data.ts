import { prisma } from "@lib/prisma";

// Fetch all posts, ordered by creation date in descending order
export const getContent = async () => {
  try {
    const result = await prisma.post.findMany({
      orderBy: {
        createdAt: "asc",
      },
      include: {
        images: {
          orderBy: {
            url: "asc",
          },
        }, // Include related images if you have a relation defined
      },
    });
    return result;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new Error("Failed to fetch posts");
  }
};

// Fetch a single post by its slug
export const getContentBySlug = async (slug: string) => {
  try {
    const result = await prisma.post.findUnique({
      where: {
        slug: slug,
      },
      include: {
        images: {
          orderBy: {
            url: "asc",
          },
        }, // Include related images if you have a relation defined
      },
    });
    return result;
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
    throw new Error(`Failed to fetch post with slug ${slug}`);
  }
};
