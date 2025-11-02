"use client";

import { useUser } from "@/hooks/useUser";
import Image from "next/image";
import { useState } from "react";

interface Comment {
  id: number;
  desc: string;
  createdAt: Date;
  user: {
    username: string;
    img: string | null;
  };
}

const SimpleComments = ({
  comments,
  onAddComment,
}: {
  comments: Comment[];
  onAddComment: (commentText: string) => void;
}) => {
  const { user, loading } = useUser();
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user || submitting) return;

    setSubmitting(true);
    onAddComment(commentText.trim());
    setCommentText("");
    setSubmitting(false);
  };

  return (
    <div className="mt-2 pt-2 border-t border-gray-100">
      {/* Comments list */}
      {comments.length > 0 && (
        <div className="space-y-2 mb-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={comment.user.img ? `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}${comment.user.img}` : "/avatar.png"}
                  alt="User Avatar"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block">
                  <div className="font-semibold text-sm">{comment.user.username}</div>
                  <div className="text-sm text-gray-800">{comment.desc}</div>
                </div>
                <div className="flex items-center gap-4 mt-1 ml-3 text-xs text-gray-500">
                  <button className="hover:underline">Like</button>
                  <button className="hover:underline">Reply</button>
                  <span>{new Date(comment.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment input form */}
      {user && !loading && (
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={user?.img ? `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}${user.img}` : "/avatar.png"}
              alt="User Avatar cmt1"
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
          <div className="flex-1 flex items-center gap-2 ml-3">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hãy nói gì đó..."
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "..." : "Bình luận"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SimpleComments;
