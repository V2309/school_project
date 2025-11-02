"use client";
import { likePost, addComment as addCommentAction } from "@/lib/actions/post.action";
import { socket } from "@/socket";
import { useUser } from "@/hooks/useUser";
import { useOptimistic, useState, useEffect } from "react";
import SimpleComments from "./SimpleComments";

const PostInteractions = ({
  username,
  postId,
  count,
  isLiked,

  classCode,
}: {
  username: string;
  postId: number;
  count: { likes: number; comments: number };
  isLiked: boolean;
  classCode?: string;
}) => {
  const [state, setState] = useState({
    likes: count.likes,
    isLiked: isLiked,
 
    comments: count.comments,
  });

  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  // Load comments when user opens comment section for the first time
  useEffect(() => {
    if (showComments && !commentsLoaded) {
      fetchComments();
    }
  }, [showComments, commentsLoaded]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (response.ok) {
        const comments = await response.json();
        setCommentsList(comments);
        setCommentsLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const { user } = useUser();

  const likeAction = async () => {
    if (!user) return;

    if (!optimisticCount.isLiked) {
      const notificationData = {
        receiverUsername: username,
        data: {
          senderUsername: user.username,
          type: "like",
          link: `/${username}/status/${postId}`,
        },
      };
      
      console.log("Sending notification:", notificationData);
      socket.emit("sendNotification", notificationData);
    }

    addOptimisticCount("like");
    await likePost(postId);
    setState((prev) => {
      return {
        ...prev,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
        isLiked: !prev.isLiked,
      };
    });
  };

  
  const addCommentOptimistic = (commentText: string) => {
    if (!user) return;
    
    // Tạo comment mới optimistically
    const newComment = {
      id: Date.now(), // temporary ID
      desc: commentText,
      createdAt: new Date(),
      user: {
        username: user.username,
        img: null
      }
    };
    
    // Add to comments list
    setCommentsList(prev => [...prev, newComment]);
    
    // Update comment count
    setState(prev => ({
      ...prev,
      comments: prev.comments + 1
    }));
    
    // Submit to server in background
    addComment(postId, commentText);
  };

  const addComment = async (postId: number, commentText: string) => {
    try {
      // Call the actual server action to save comment
      const formData = new FormData();
      formData.append("postId", postId.toString());
      formData.append("username", username);
      formData.append("desc", commentText);
      if (classCode) {
        formData.append("classCode", classCode);
      }
      
      const result = await addCommentAction({ success: false, error: false }, formData);
      
      if (result.success) {
        // Optionally refresh comments from server to get real IDs
        await fetchComments();
      } else {
        console.error("Failed to save comment to server");
        // Could revert optimistic update here
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      // On error, you could revert the optimistic update
    }
  };

  const [optimisticCount, addOptimisticCount] = useOptimistic(
    state,
    (prev, type: "like") => {
      if (type === "like") {
        return {
          ...prev,
          likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
          isLiked: !prev.isLiked,
        };
      }
      return prev;
    }
  );
  return (
    <div>
      {/* INTERACTION BUTTONS */}
      <div className="flex items-center justify-between gap-4 lg:gap-16 my-2 text-textGray">
        <div className="flex items-center  flex-1 gap-16">
          {/* COMMENTS */}
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                className={`${showComments ? "fill-iconBlue" : "fill-textGray"} group-hover:fill-iconBlue`}
                d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"
              />
            </svg>
            <span className={`${showComments ? "text-iconBlue" : "text-textGray"} group-hover:text-iconBlue text-sm`}>
              {state.comments}
            </span>
          </button>
    
        {/* LIKE */}
        <form action={likeAction}>
          <button className="flex items-center gap-2 cursor-pointer group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                className={`${
                  optimisticCount.isLiked ? "fill-iconPink" : "fill-textGray"
                } group-hover:fill-iconPink`}
                d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"
              />
            </svg>
            <span
              className={`${
                optimisticCount.isLiked ? "text-iconPink" : "text-textGray"
              } group-hover:text-iconPink text-sm`}
            >
              {optimisticCount.likes}
            </span>
          </button>
        </form>
      </div>
   
      </div>
      
      {/* COMMENTS SECTION */}
      {showComments && (
        <SimpleComments
          comments={commentsList}
          onAddComment={addCommentOptimistic}
        />
      )}
    </div>
  );
};

export default PostInteractions;