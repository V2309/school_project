// conference page
"use client";

import React, { useEffect, useState } from "react";
import MeetingTypeList from "@/components/MeetingTypeList";

export default function ConferencePage() {
  const [now, setNow] = useState(new Date());

  // cập nhật thời gian mỗi giây
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval); // clear khi unmount
  }, []);

  const time = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit", // thêm giây cho realtime rõ hơn
  });
  const date = new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(
    now
  );

   return (
    <div className="flex justify-center bg-gray-100 p-6">
      <section className="flex w-full max-w-6xl flex-col gap-5 text-gray-900">
        <div className="h-[303px] w-full rounded-[20px] bg-hero bg-cover">
          <div className="flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11">
            <h2 className="glassmorphism max-w-[273px] rounded py-2 text-center text-base font-normal text-gray-800">
              Upcoming Meeting at: 12:30 PM
            </h2>
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-extrabold lg:text-7xl text-white">{time}</h1>
              <p className="text-lg font-medium text-sky-1 lg:text-2xl">{date}</p>
            </div>
          </div>
        </div>

        <MeetingTypeList />
      </section>
    </div>
  );
}




