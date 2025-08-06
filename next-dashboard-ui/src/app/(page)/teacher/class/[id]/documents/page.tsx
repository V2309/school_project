
import FileUpload from "@/components/FileUpload";


export default async function Document() {

  return (
    <div className="px-4 py-4 bg-white rounded-lg shadow-md flex flex-col h-full">
      {/* <h1 className="text-2xl font-bold mb-6">Danh sách tài liệu</h1> */}
      <FileUpload />

      <h2 className="text-xl font-bold mt-6">Danh sách tài liệu</h2>
      <ul className="list-disc list-inside">
        <li>Tài liệu 1</li>
        <li>Tài liệu 2</li>
        <li>Tài liệu 3</li>
      </ul>
    </div>
  );
}
