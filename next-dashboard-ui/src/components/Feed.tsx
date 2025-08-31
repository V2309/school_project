import prisma from "@/lib/prisma";
import Post from "@/components/Post";
import { getCurrentUser } from "@/lib/hooks/auth";


const Feed = async ({ userProfileId, classCode }: { userProfileId?: string, classCode?: string }) => {
  const user = await getCurrentUser();

  if (!user) return;

  const whereCondition = classCode
    ? { parentPostId: null, classCode: classCode }
    : userProfileId
    ? { parentPostId: null, userId: userProfileId }
    : {
        parentPostId: null,
        userId: user.id as string, // Chỉ hiển thị bài viết của chính user này
      };

  const postIncludeQuery = {
    user: { select: { username: true, img: true } },
    _count: { select: { likes: true, rePosts: true, comments: true } },
    likes: { where: { userId: user.id as string }, select: { id: true } },
    rePosts: { where: { userId: user.id as string }, select: { id: true } },
    saves: { where: { userId: user.id as string }, select: { id: true } },
  };

  const posts = await prisma.post.findMany({
    where: whereCondition,
    include: {
      rePost: {
        include: postIncludeQuery,
      },
      ...postIncludeQuery,
    },
    take: 3,
    skip: 0,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="">
      {posts.map((post) => (
        <div key={post.id}>
          <Post post={post} />
        </div>
      ))}
      {/* <InfiniteFeed userProfileId={userProfileId} classCode={classCode} /> */}
    </div>
  );
};

export default Feed;