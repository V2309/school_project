
import { getCurrentUser } from "@/hooks/auth";
import DocumentPageClient from "@/components/DocumentPageClient";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {File} from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/setting";
export default async function Document() {
  // Lấy thông tin user từ server
  const user = await getCurrentUser();
  
  


  return (
    <div className="px-4 py-4 bg-white rounded-lg shadow-md flex flex-col h-full">
 

      <div className="flex-1">
        
       
        {/* Truyền role xuống client component */}
        <DocumentPageClient userRole={user?.role as string} />
      </div>
    </div>
  );
}
