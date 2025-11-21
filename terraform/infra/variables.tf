variable "iam_user" {
    description = "Name of iam user to ensure user exists"
    type=string
    default="my-terraform-user"
}

variable "s3_bucket_video_temp" {
    description = "Name of s3 bucket to collect videos from user"
    type = string
    default = "transcoding-videos-temp"
}

variable "s3_bucket_video" {
    description = "Name of s3 bucket to store processed videos"
    type=string
    default="transcoding-videos"
}

resource "random_id" "suffix" {
  byte_length = 4
}