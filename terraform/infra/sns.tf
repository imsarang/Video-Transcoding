resource "aws_sns_topic" "video_event_topic" {
    name = "video-event-topic"
}

resource "aws_sns_topic_subscription" "video_event_topic_subscription_http" {
    topic_arn = aws_sns_topic.video_event_topic.arn
    protocol = "https"
    endpoint = "https://ce13d5e6cafa.ngrok-free.app/video/webhook"
}
