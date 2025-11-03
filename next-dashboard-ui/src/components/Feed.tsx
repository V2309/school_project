import prisma from "@/lib/prisma";
import Post from "@/components/Post";
import { getCurrentUser } from "@/hooks/auth";
import InfiniteFeed from "./InfiniteFeed";

const Feed = async ({ userProfileId, classCode }: { userProfileId?: string, classCode?: string }) => {
  // Chỉ cần render InfiniteFeed, để nó tự load tất cả posts
  return (
    <div className="">
      <InfiniteFeed userProfileId={userProfileId} classCode={classCode} />
    </div>
  );
};

export default Feed;