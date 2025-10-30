"use server";
import prisma from "@/lib/prisma";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/hooks/auth";

import { z } from "zod";
import { UploadResponse } from "imagekit/dist/libs/interfaces";
import { imagekit } from "../utils";


 
 // add post cho lớp học cụ thể
 export const addPostToClass = async (
   prevState: { success: boolean; error: boolean },
   formData: FormData
 ) => {
   const user = await getCurrentUser();
 
   if (!user) return { success: false, error: true };
 
   const desc = formData.get("desc") as string;
   const file = formData.get("file") as File;
   const classCode = formData.get("classCode") as string;
 
   // Kiểm tra classCode
   if (!classCode) {
     return { success: false, error: true };
   }
 
   // Xác thực người dùng có quyền post vào lớp này không
   if (user.role === "teacher") {
     const teacher = await prisma.teacher.findUnique({
       where: { userId: user.id as string },
     });
     if (!teacher) {
       return { success: false, error: true };
     }
     
     const classExists = await prisma.class.findFirst({
       where: { 
         class_code: classCode,
         supervisorId: teacher.id 
       },
     });
     
     if (!classExists) {
       return { success: false, error: true };
     }
   } else if (user.role === "student") {
     const student = await prisma.student.findUnique({
       where: { userId: user.id as string },
       include: { classes: true },
     });
     
     if (!student) {
       return { success: false, error: true };
     }
     
     const isInClass = student.classes.some(cls => cls.class_code === classCode);
     if (!isInClass) {
       return { success: false, error: true };
     }
   }
 
   let img = "";
   let imgHeight = 0;
   let video = "";
 
   if (file && file.size > 0) {
     if (!imagekit) {
       throw new Error("ImageKit is not configured. Please check your environment variables.");
     }
 
     const uploadFile = async (file: File): Promise<UploadResponse> => {
       const bytes = await file.arrayBuffer();
       const buffer = Buffer.from(bytes);
 
       return new Promise((resolve, reject) => {
         imagekit.upload(
           {
             file: buffer,
             fileName: file.name,
             folder: "/posts",
           },
           function (error, result) {
             if (error) reject(error);
             else resolve(result as UploadResponse);
           }
         );
       });
     };
 
     try {
       const result: UploadResponse = await uploadFile(file);
       if (result.fileType === "image") {
         img = result.filePath;
         imgHeight = result.height || 0;
       } else {
         video = result.filePath;
       }
     } catch (error) {
       console.log("Upload error:", error);
     }
   }
 
   try {
     await prisma.post.create({
       data: {
         desc,
         userId: user.id as string,
         classCode,
         img,
         imgHeight,
         video,
         isSensitive: false,
       },
     });
     
     revalidatePath(`/class/${classCode}/newsfeed`);
     return { success: true, error: false };
   } catch (err) {
     console.log(err);
     return { success: false, error: true };
   }
 };
 
 
// like post
export const likePost = async (postId: number) => {
  const user = await getCurrentUser();

  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: user.id as string,
        postId: postId,
      },
    });

    if (existingLike) {
      // Unlike: xóa like
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return { success: true, liked: false };
    } else {
      // Like: tạo like mới
      await prisma.like.create({
        data: { 
          userId: user.id as string, 
          postId 
        },
      });
      return { success: true, liked: true };
    }
  } catch (err) {
    console.log(err);
    return { success: false, error: "Failed to toggle like" };
  }
};



// add comment

export const addComment = async (
  prevState: { success: boolean; error: boolean },
  formData: FormData
) => {

const user = await getCurrentUser();
  if (!user) return { success: false, error: true };

  const postId = formData.get("postId");
  const username = formData.get("username");
  const desc = formData.get("desc");

  const Comment = z.object({
    parentPostId: z.number(),
    desc: z.string().max(140),
  });

  const validatedFields = Comment.safeParse({
    parentPostId: Number(postId),
    desc,
  });

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return { success: false, error: true };
  }

  try {
    await prisma.post.create({
      data: {
        ...validatedFields.data,
        userId: user.id as string,
      },
    });
    revalidatePath(`/${username}/status/${postId}`);
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// get comments for a post
export const getPostComments = async (postId: number) => {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const comments = await prisma.post.findMany({
      where: { parentPostId: postId },
      include: {
        user: { select: { username: true, img: true } },
        _count: { select: { likes: true, rePosts: true, comments: true } },
        likes: { where: { userId: user.id as string }, select: { id: true } },
        rePosts: { where: { userId: user.id as string }, select: { id: true } },
        saves: { where: { userId: user.id as string }, select: { id: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return comments;
  } catch (err) {
    console.log(err);
    return [];
  }
};

// delete post
export const deletePost = async (postId: number) => {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    // Tìm post để kiểm tra quyền sở hữu
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, classCode: true },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    // Kiểm tra quyền xóa: chỉ người tạo post hoặc teacher của lớp mới được xóa
    let hasPermission = false;

    if (post.userId === user.id) {
      // Người tạo post
      hasPermission = true;
    } else if (user.role === "teacher" && post.classCode) {
      // Teacher của lớp có thể xóa post trong lớp của mình
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id as string },
      });
      
      if (teacher) {
        const classExists = await prisma.class.findFirst({
          where: { 
            class_code: post.classCode,
            supervisorId: teacher.id 
          },
        });
        
        if (classExists) {
          hasPermission = true;
        }
      }
    }

    if (!hasPermission) {
      return { success: false, error: "Permission denied" };
    }

    // Sử dụng transaction để xóa tất cả dữ liệu liên quan
    await prisma.$transaction(async (prisma) => {
      // 1. Xóa tất cả likes của post này
      await prisma.like.deleteMany({
        where: { postId: postId },
      });

      // 2. Xóa tất cả saved posts
      await prisma.savedPosts.deleteMany({
        where: { postId: postId },
      });

      // 3. Xóa tất cả comments (posts con)
      await prisma.post.deleteMany({
        where: { parentPostId: postId },
      });

      // 4. Xóa tất cả reposts
      await prisma.post.deleteMany({
        where: { rePostId: postId },
      });

      // 5. Cuối cùng xóa post chính
      await prisma.post.delete({
        where: { id: postId },
      });
    });

    // Revalidate các trang liên quan
    if (post.classCode) {
      revalidatePath(`/class/${post.classCode}/newsfeed`);
    }

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: "Failed to delete post" };
  }
};

// update post
export const updatePost = async (
  prevState: { success: boolean; error: boolean },
  formData: FormData
) => {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: true };

  const postId = parseInt(formData.get("postId") as string);
  const desc = formData.get("desc") as string;
  const file = formData.get("file") as File;
  const removeMedia = formData.get("removeMedia") === "true";

  try {
    // Tìm post để kiểm tra quyền sở hữu
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, classCode: true, img: true, video: true },
    });

    if (!post) {
      return { success: false, error: true };
    }

    // Kiểm tra quyền sửa: chỉ người tạo post mới được sửa
    if (post.userId !== user.id) {
      return { success: false, error: true };
    }

    let updateData: any = { desc };

    // Xử lý media
    if (removeMedia) {
      // Xóa media hiện tại
      updateData.img = null;
      updateData.imgHeight = null;
      updateData.video = null;
    } else if (file && file.size > 0) {
      // Upload media mới
      if (!imagekit) {
        throw new Error("ImageKit is not configured. Please check your environment variables.");
      }

      const uploadFile = async (file: File): Promise<UploadResponse> => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        return new Promise((resolve, reject) => {
          imagekit.upload(
            {
              file: buffer,
              fileName: file.name,
              folder: "/posts",
            },
            function (error, result) {
              if (error) reject(error);
              else resolve(result as UploadResponse);
            }
          );
        });
      };

      try {
        const result: UploadResponse = await uploadFile(file);
        if (result.fileType === "image") {
          updateData.img = result.filePath;
          updateData.imgHeight = result.height || 0;
          updateData.video = null; // Clear video if uploading image
        } else {
          updateData.video = result.filePath;
          updateData.img = null; // Clear image if uploading video
          updateData.imgHeight = null;
        }
      } catch (error) {
        console.log("Upload error:", error);
        return { success: false, error: true };
      }
    }

    // Cập nhật post
    await prisma.post.update({
      where: { id: postId },
      data: updateData,
    });

    // Revalidate các trang liên quan
    if (post.classCode) {
      revalidatePath(`/class/${post.classCode}/newsfeed`);
    }

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
