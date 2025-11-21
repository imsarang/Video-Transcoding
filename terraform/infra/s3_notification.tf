# Allow S3 to invoke lambda
resource "aws_lambda_permission" "allow_s3_invoke"{
    statement_id = "AllowS3Invoke"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.s3_to_sqs.function_name
    principal = "s3.amazonaws.com"
    source_arn = aws_s3_bucket.temp_bucket_videos.arn
}

# set S3 -> lambda trigger
resource "aws_s3_bucket_notification" "notify_lambda_on_upoload" {
    bucket = aws_s3_bucket.temp_bucket_videos.id

    lambda_function {
        lambda_function_arn = aws_lambda_function.s3_to_sqs.arn
        events = ["s3:ObjectCreated:*"]
    }

    depends_on = [ aws_lambda_permission.allow_s3_invoke ]
}