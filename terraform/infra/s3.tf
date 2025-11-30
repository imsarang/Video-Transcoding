# First, reference the IAM state outputs
data "terraform_remote_state" "iam" {
  backend = "local" # or "s3" if you're using a remote backend
  config = {
    path = "../iam/terraform.tfstate"
  }
}
# creating bucket for videos from user
resource "aws_s3_bucket" "temp_bucket_videos" {
  bucket = "${var.s3_bucket_video_temp}-d743f617"
}

# creating bucket for processed videos
resource "aws_s3_bucket" "bucket_videos" {
  bucket = "${var.s3_bucket_video}-d743f617"
}

# disable ACLs and use bucket ownership controls (defaults to private)
resource "aws_s3_bucket_ownership_controls" "temp_bucket_videos_ownership" {
    bucket = aws_s3_bucket.temp_bucket_videos.id

    rule {
        object_ownership = "BucketOwnerEnforced"
    }
}

# ensure bucket is private via public access block
resource "aws_s3_bucket_public_access_block" "temp_bucket_videos_pab" {
    bucket = aws_s3_bucket.temp_bucket_videos.id

    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
}

# lifecycle rule for temp bucket
# resource "aws_s3_bucket_lifecycle_configuration" "temp_bucket_videos_lifecycle" {
#     bucket = aws_s3_bucket.temp_bucket_videos.id

#     rule {
#         id     = "auto-delete-temp"
#         status = "Enabled"

#         expiration {
#             days = 1
#         }
#     }
# }

# disable ACLs and use bucket ownership controls (defaults to private)
resource "aws_s3_bucket_ownership_controls" "bucket_videos_ownership" {
    bucket = aws_s3_bucket.bucket_videos.id

    rule {
        object_ownership = "BucketOwnerEnforced"
    }
}

# ensure bucket is private via public access block
resource "aws_s3_bucket_public_access_block" "bucket_videos_pab" {
    bucket = aws_s3_bucket.bucket_videos.id

    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
}


# iam policy to allow access to the above 2 buckets
resource "aws_iam_policy" "s3_access" {
    name = "${data.terraform_remote_state.iam.outputs.iam_user}-video-s3-policy"
    description="allow access to s3 video buckets"

    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Action = [
                    "s3:PutObject",
                    "s3:GetObject",
                    "s3:ListBucket",
                    "s3:DeleteObject"
                ]
                Effect = "Allow"
                Resource = [
                    "${aws_s3_bucket.temp_bucket_videos.arn}/*",
                    "${aws_s3_bucket.bucket_videos.arn}/*",
                    aws_s3_bucket.temp_bucket_videos.arn,
                    aws_s3_bucket.bucket_videos.arn
                ]
            }
        ]
    })
}

# attach the policy to the iam user
resource "aws_iam_user_policy_attachment" "attach_video_policy" {
    user = data.terraform_remote_state.iam.outputs.iam_user
    policy_arn = aws_iam_policy.s3_access.arn
}

# attach cors policy for temp bucket
resource "aws_s3_bucket_cors_configuration" "temp_bucket_video_cors"{
    bucket = aws_s3_bucket.temp_bucket_videos.id

    cors_rule {
        id="temp-video-upload"
        allowed_methods = [ "GET", "PUT", "POST", "DELETE" ]
        allowed_origins = [
            "http://localhost:3000",
            "http://localhost:3001"
        ]
        allowed_headers = ["*"]
        expose_headers = [
            "ETag",
            "x-amz-meta-audiochannels",
            "x-amz-meta-audiosamplerate",
            "x-amz-meta-framerate",
            "x-amz-meta-job",
            "x-amz-meta-noaudio",
            "x-amz-meta-targetformat",
            "x-amz-meta-videoresolution",
            "x-amz-meta-videocodec",
            "x-amz-meta-audiobitrate",
            "x-amz-meta-videobitrate",
            "x-amz-meta-audiocodec",
            ]
        max_age_seconds = 3000
    }
}

# attach cors policy for processed bucket
resource "aws_s3_bucket_cors_configuration" "bucket_video_cors"{
    bucket = aws_s3_bucket.bucket_videos.id

    cors_rule {
        id="temp-video-upload"
        allowed_methods = [ "GET", "PUT", "POST", "DELETE" ]
        allowed_origins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3005"
        ]
        allowed_headers = ["*"]
        expose_headers = [
            "ETag",
            "x-amz-meta-audiochannels",
            "x-amz-meta-audiosamplerate",
            "x-amz-meta-framerate",
            "x-amz-meta-job",
            "x-amz-meta-noaudio",
            "x-amz-meta-targetformat",
            "x-amz-meta-videoresolution",
            "x-amz-meta-videocodec",
            "x-amz-meta-audiobitrate",
            "x-amz-meta-videobitrate",
            "x-amz-meta-audiocodec"
            ]
        max_age_seconds = 3000
    }
}