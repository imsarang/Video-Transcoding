# upsert IAM user for video-tools-bff
provider "aws" {
    region = "ap-south-1" #asia pacific(mumbai)
}

# create iam user
resource "aws_iam_user" "user" {
    name = var.iam_user
}

# create access key for existing/ new user
resource "aws_iam_access_key" "user_key" {
    user = aws_iam_user.user.name
}

# output aws creds for aws cli configuration
output "aws_access_key_id" {
    value = aws_iam_access_key.user_key.id
    sensitive = true
}

output "aws_secret_key" {
    value = aws_iam_access_key.user_key.secret
    sensitive = true
}

output "aws_configure_command" {
    value = <<EOT
aws configure set aws_access_key_id ${aws_iam_access_key.user_key.id} --profile ${var.iam_user}
aws configure set aws_secret_access_key ${aws_iam_access_key.user_key.secret} --profile ${var.iam_user}
aws configure set region ap-south-1 --profile ${var.iam_user}
EOT
    sensitive = true
}

output "iam_user" {
    value=aws_iam_user.user.name
}

