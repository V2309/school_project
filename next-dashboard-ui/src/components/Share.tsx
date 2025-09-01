// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { useFormState } from "react-dom";
// import Image from "./Image";
// import NextImage from "next/image";
// import ImageEditor from "@/components/ImageEditor";
// import { addPostToClass } from "@/lib/actions";

// const Share = ({ classCode, userImg }: { classCode: string, userImg?: string }) => {
//   const [media, setMedia] = useState<File | null>(null);
//   const [isEditorOpen, setIsEditorOpen] = useState(false);
//   const [settings, setSettings] = useState<{
//     type: "original" | "wide" | "square";
//     sensitive: boolean;
//   }>({
//     type: "original",
//     sensitive: false,
//   });

//   const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setMedia(e.target.files[0]);
//     }
//   };

//   const previewURL = media ? URL.createObjectURL(media) : null;

//   const [state, formAction] = useFormState(addPostToClass, {
//     success: false,
//     error: false,
//   });

//   const [isPending, setIsPending] = useState(false);

//   const formRef = useRef<HTMLFormElement | null>(null);

//   useEffect(() => {
//     if (state.success) {
//       formRef.current?.reset();
//       setMedia(null);
//       setSettings({ type: "original", sensitive: false });
//       setIsPending(false);
//     }
//     if (state.error) {
//       setIsPending(false);
//     }
//   }, [state]);

//   const handleSubmit = (formData: FormData) => {
//     setIsPending(true);
//     formAction(formData);
//   };

//   return (
//     <form
//       ref={formRef}
//       className="p-4 flex gap-4"
//       action={handleSubmit}
//     >
//       {/* AVATAR */}
//       <div className="relative w-10 h-10 rounded-full overflow-hidden">
//         <Image src={userImg || "/avatar.png"} alt="" w={100} h={100} tr={true} />
//       </div>
//       {/* OTHERS */}
//       <div className="flex-1 flex flex-col gap-4">
//         <input
//           type="hidden"
//           name="classCode"
//           value={classCode}
//         />
//         <input
//           type="text"
//           name="imgType"
//           value={settings.type}
//           hidden
//           readOnly
//         />
//         <input
//           type="text"
//           name="isSensitive"
//           value={settings.sensitive ? "true" : "false"}
//           hidden
//           readOnly
//         />
//         <input
//           type="text"
//           name="desc"
//           placeholder="Chia sẻ điều gì đó với lớp học..."
//           className="bg-transparent outline-none placeholder:text-textGray text-xl"
//         />
//         {/* PREVIEW IMAGE */}
//         {media?.type.includes("image") && previewURL && (
//           <div className="relative rounded-xl overflow-hidden">
//             <NextImage
//               src={previewURL}
//               alt=""
//               width={600}
//               height={600}
//               className={`w-full ${
//                 settings.type === "original"
//                   ? "h-full object-contain"
//                   : settings.type === "square"
//                   ? "aspect-square object-cover"
//                   : "aspect-video object-cover"
//               }`}
//             />
//             <div
//               className="absolute top-2 left-2 bg-black bg-opacity-50 text-white py-1 px-4 rounded-full font-bold text-sm cursor-pointer"
//               onClick={() => setIsEditorOpen(true)}
//             >
//               Edit
//             </div>
//             <div
//               className="absolute top-2 right-2 bg-black bg-opacity-50 text-white h-8 w-8 flex items-center justify-center rounded-full cursor-pointer font-bold text-sm"
//               onClick={() => setMedia(null)}
//             >
//               X
//             </div>
//           </div>
//         )}
//         {media?.type.includes("video") && previewURL && (
//           <div className="relative">
//             <video src={previewURL} controls />
//             <div
//               className="absolute top-2 right-2 bg-black bg-opacity-50 text-white h-8 w-8 flex items-center justify-center rounded-full cursor-pointer font-bold text-sm"
//               onClick={() => setMedia(null)}
//             >
//               X
//             </div>
//           </div>
//         )}
//         {isEditorOpen && previewURL && (
//           <ImageEditor
//             onClose={() => setIsEditorOpen(false)}
//             previewURL={previewURL}
//             settings={settings}
//             setSettings={setSettings}
//           />
//         )}
//         <div className="flex items-center justify-between gap-4 flex-wrap">
//           <div className="flex gap-4 flex-wrap">
//             <input
//               type="file"
//               name="file"
//               onChange={handleMediaChange}
//               className="hidden"
//               id="file"
//               accept="image/*,video/*"
//             />
//             <label htmlFor="file">
//               <NextImage
//                 src="/img.png"
//                 alt="Upload image"
//                 width={20}
//                 height={20}
//                 className="cursor-pointer"
//               />
//             </label>
//             <NextImage
//               src="/gif.png"
//               alt="Create"
//               width={20}
//               height={20}
//               className="cursor-pointer"
//             />
//             <NextImage
//               src="/list.png"
//               alt="Poll"
//               width={20}
//               height={20}
//               className="cursor-pointer"
//             />
//             <NextImage
//               src="/smile.png"
//               alt="Emoji"
//               width={20}
//               height={20}
//               className="cursor-pointer"
//             />
//             <NextImage
//               src="/calendar.png"
//               alt="Schedule"
//               width={20}
//               height={20}
//               className="cursor-pointer"
//             />
//             <NextImage
//               src="/location.png"
//               alt="Location"
//               width={20}
//               height={20}
//               className="cursor-pointer"
//             />
//           </div>
//           <button
//             className="bg-white text-black font-bold rounded-full py-2 px-4 disabled:cursor-not-allowed"
//             disabled={isPending}
//           >
//             {isPending ? "Posting" : "Post"}
//           </button>
//           {state.error && (
//             <span className="text-red-300 p-4">Something went wrong!</span>
//           )}
//         </div>
//       </div>
//     </form>
//   );
// };

// export default Share;

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Image from "./Image";
import NextImage from "next/image";
import ImageEditor from "@/components/ImageEditor";
import { addPostToClass } from "@/lib/actions";
import { toast } from "react-toastify";

// Component con để sử dụng useFormStatus
const SubmitButton = () => {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      className="bg-white text-black font-bold rounded-full py-2 px-4 disabled:cursor-not-allowed disabled:opacity-50 transition-opacity"
      disabled={pending}
    >
      {pending ? "Đang đăng..." : "Đăng bài"}
    </button>
  );
};

const Share = ({ classCode, userImg }: { classCode: string, userImg?: string }) => {
  const [media, setMedia] = useState<File | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [settings, setSettings] = useState<{
    type: "original" | "wide" | "square";
    sensitive: boolean;
  }>({
    type: "original",
    sensitive: false,
  });

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMedia(e.target.files[0]);
    }
  };

  const previewURL = media ? URL.createObjectURL(media) : null;

  const [state, formAction] = useFormState(addPostToClass, {
    success: false,
    error: false,
  });

  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setMedia(null);
      setSettings({ type: "original", sensitive: false });
      toast.success("Đăng bài thành công!", {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
    if (state.error) {
      toast.error("Có lỗi xảy ra khi đăng bài!", {
        position: "bottom-right",
        autoClose: 5000,
      });
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      className="p-4 flex gap-4"
      action={formAction}
    >
      {/* AVATAR */}
      <div className="relative w-10 h-10 rounded-full overflow-hidden">
        <Image src={userImg || "/avatar.png"} alt="" w={100} h={100} tr={true} />
      </div>
      {/* OTHERS */}
      <div className="flex-1 flex flex-col gap-4">
        <input
          type="hidden"
          name="classCode"
          value={classCode}
        />
        <input
          type="text"
          name="imgType"
          value={settings.type}
          hidden
          readOnly
        />
        <input
          type="text"
          name="isSensitive"
          value={settings.sensitive ? "true" : "false"}
          hidden
          readOnly
        />
        <input
          type="text"
          name="desc"
          placeholder="Chia sẻ điều gì đó với lớp học..."
          className="bg-transparent outline-none placeholder:text-textGray text-xl"
          required
        />
        {/* PREVIEW IMAGE */}
        {media?.type.includes("image") && previewURL && (
          <div className="relative rounded-xl overflow-hidden">
            <NextImage
              src={previewURL}
              alt=""
              width={600}
              height={600}
              className={`w-full ${
                settings.type === "original"
                  ? "h-full object-contain"
                  : settings.type === "square"
                  ? "aspect-square object-cover"
                  : "aspect-video object-cover"
              }`}
            />
            <div
              className="absolute top-2 left-2 bg-black bg-opacity-50 text-white py-1 px-4 rounded-full font-bold text-sm cursor-pointer"
              onClick={() => setIsEditorOpen(true)}
            >
              Edit
            </div>
            <div
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white h-8 w-8 flex items-center justify-center rounded-full cursor-pointer font-bold text-sm"
              onClick={() => setMedia(null)}
            >
              X
            </div>
          </div>
        )}
        {media?.type.includes("video") && previewURL && (
          <div className="relative">
            <video src={previewURL} controls />
            <div
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white h-8 w-8 flex items-center justify-center rounded-full cursor-pointer font-bold text-sm"
              onClick={() => setMedia(null)}
            >
              X
            </div>
          </div>
        )}
        {isEditorOpen && previewURL && (
          <ImageEditor
            onClose={() => setIsEditorOpen(false)}
            previewURL={previewURL}
            settings={settings}
            setSettings={setSettings}
          />
        )}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-4 flex-wrap">
            <input
              type="file"
              name="file"
              onChange={handleMediaChange}
              className="hidden"
              id="file"
              accept="image/*,video/*"
            />
            <label htmlFor="file">
              <NextImage
                src="/img.png"
                alt="Upload image"
                width={20}
                height={20}
                className="cursor-pointer"
              />
            </label>
            <NextImage
              src="/gif.png"
              alt="Create"
              width={20}
              height={20}
              className="cursor-pointer"
            />
            <NextImage
              src="/list.png"
              alt="Poll"
              width={20}
              height={20}
              className="cursor-pointer"
            />
            <NextImage
              src="/smile.png"
              alt="Emoji"
              width={20}
              height={20}
              className="cursor-pointer"
            />
            <NextImage
              src="/calendar.png"
              alt="Schedule"
              width={20}
              height={20}
              className="cursor-pointer"
            />
            <NextImage
              src="/location.png"
              alt="Location"
              width={20}
              height={20}
              className="cursor-pointer"
            />
          </div>
          <SubmitButton />
          {state.error && (
            <span className="text-red-300 p-4">Something went wrong!</span>
          )}
        </div>
      </div>
    </form>
  );
};

export default Share;