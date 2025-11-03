"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "./Post";
import { useEffect } from "react";

const fetchPosts = async (pageParam: number, userProfileId?: string, classCode?: string) => {
  const params = new URLSearchParams({
    cursor: pageParam.toString(),
  });
  
  if (userProfileId) params.append("user", userProfileId);
  if (classCode) params.append("classCode", classCode);
  
  const res = await fetch(`/api/posts?${params.toString()}`);
  return res.json();
};

const InfiniteFeed = ({ userProfileId, classCode }: { userProfileId?: string, classCode?: string }) => {
  const { data, error, status, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["posts", userProfileId, classCode],
    queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam, userProfileId, classCode),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : undefined,
  });

  // Manual scroll detection for debugging - PHẢI ĐẶT TRƯỚC CONDITIONAL RETURNS
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const scrollPercentage = (scrollTop + windowHeight) / documentHeight;
      
    
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, fetchNextPage]);



  const allPosts = data?.pages?.flatMap((page) => page.posts) || [];
  


  if (error) return (
    <div className="text-center py-8 text-red-500">
      ❌ Có lỗi xảy ra khi tải bài viết!
    </div>
  );
  
  if (status === "pending") return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-500">Đang tải bài viết...</span>
    </div>
  );

  // Nếu không có posts nào
  if (allPosts.length === 0 && !hasNextPage) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Chưa có bài viết nào trong lớp này</p>
      </div>
    );
  }

  return (
    <div>
      
      <InfiniteScroll
        dataLength={allPosts.length}
        next={() => {
          fetchNextPage();
        }}
        hasMore={!!hasNextPage}
        loader={
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-500">Đang tải thêm bài viết...</span>
          </div>
        }
        endMessage={
          <div className="text-center py-8">
            <p className="text-gray-500">Bạn đã xem hết tất cả bài viết!</p>
          </div>
        }
        scrollThreshold={0.8}
        scrollableTarget="class-content-scroll"
      >
        {allPosts.map((post) => (
          <div key={post.id} className="mb-4">
            <Post post={post} />
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default InfiniteFeed;