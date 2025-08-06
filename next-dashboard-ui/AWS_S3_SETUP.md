# Hướng dẫn cấu hình AWS S3 cho Upload File

## 1. Tạo S3 Bucket trên AWS

1. Đăng nhập vào AWS Console
2. Tìm và truy cập service "S3"
3. Nhấn "Create bucket"
4. Đặt tên bucket (ví dụ: `my-school-documents`)
5. Chọn region (khuyến nghị: `us-east-1`)
6. Bỏ chọn "Block all public access" nếu muốn file có thể truy cập public
7. Nhấn "Create bucket"

## 2. Tạo IAM User với quyền S3

1. Truy cập IAM service trên AWS Console
2. Vào "Users" > "Create user"
3. Đặt tên user (ví dụ: `s3-upload-user`)
4. Chọn "Attach policies directly"
5. Tìm và chọn policy: `AmazonS3FullAccess` (hoặc tạo custom policy)
6. Tạo user và lưu lại **Access Key ID** và **Secret Access Key**

## 3. Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục root của project và thêm:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your_access_key_id"
AWS_SECRET_ACCESS_KEY="your_secret_access_key"
AWS_BUCKET_NAME="your_bucket_name"
AWS_REGION="us-east-1"
```

## 4. Cấu hình CORS cho S3 Bucket (nếu cần)

Nếu gặp lỗi CORS, thêm policy này vào bucket:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

## 5. Cấu hình Bucket Policy (nếu muốn public read)

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

## 6. Test Upload

Sau khi cấu hình xong, restart development server:

```bash
npm run dev
```

Thử upload file trong trang Documents của lớp học.

## Troubleshooting

### Lỗi "Missing required key 'Bucket'"
- Kiểm tra file `.env.local` có đúng tên variables không
- Restart development server sau khi thay đổi env

### Lỗi "Access Denied"
- Kiểm tra IAM user có đủ quyền S3 không
- Kiểm tra Access Key và Secret Key

### Lỗi CORS
- Thêm CORS policy vào S3 bucket
- Kiểm tra AllowedOrigins có bao gồm domain của bạn

## Security Notes

- Không commit file `.env.local` vào git
- Sử dụng IAM policies tối thiểu cần thiết
- Cân nhắc sử dụng presigned URLs cho security tốt hơn
