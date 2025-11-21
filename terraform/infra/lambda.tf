# IAM role for lambda
resource "aws_iam_role" "lambda_exec"{
    name="lambda_s3_to_sqs_exec_role"

    assume_role_policy = jsonencode({
        Version = "2012-10-17",
        Statement = [{
            Effect = "Allow",
            Principal = {Service = "lambda.amazonaws.com"},
            Action="sts:AssumeRole"
        }]
    })
}

# Policy: allow logging. SQS send, and S3 read access
resource "aws_iam_role_policy" "lambda_policy" {
    name = "lambda_s3_to_sqs_policy"
    role = aws_iam_role.lambda_exec.id
    policy = jsonencode({
        Version = "2012-10-17",
        Statement = [
            {
                Effect = "Allow",
                Action = [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ],
                Resource = "arn:aws:logs:*:*:*"
            },
            {
                Effect = "Allow",
                Action = ["sqs:SendMessage"],
                Resource = aws_sqs_queue.video_jobs.arn
            },
            {
                Effect="Allow",
                Action=[
                    "s3:GetObject",
                    "s3:ListBucket"
                ],
                Resource = [
                    aws_s3_bucket.temp_bucket_videos.arn,
                    "${aws_s3_bucket.temp_bucket_videos.arn}/*"
                ]
            }
        ]
    })
}

# Zip lambda source code
data "archive_file" "s3_to_sqs_zip" {
    type="zip"
    source_dir="${path.module}/lambda/s3_to_sqs"
    output_path = "${path.module}/s3_to_sqs.zip"
}

# lambda function
resource "aws_lambda_function" "s3_to_sqs"{
    function_name = "s3-upload-to-sqs"
    role=aws_iam_role.lambda_exec.arn
    handler="index.handler"
    runtime="nodejs18.x"

    filename=data.archive_file.s3_to_sqs_zip.output_path
    source_code_hash=data.archive_file.s3_to_sqs_zip.output_base64sha256

    environment {
      variables = {
        SQS_QUEUE_URL = aws_sqs_queue.video_jobs.url
        OUTPUT_BUCKET = aws_s3_bucket.bucket_videos.bucket
      }
    }
    depends_on = [ aws_iam_role_policy.lambda_policy ]
}
