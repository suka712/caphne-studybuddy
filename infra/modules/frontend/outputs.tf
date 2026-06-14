output "distribution_id" {
  description = "CloudFront distribution ID — used for invalidations"
  value       = aws_cloudfront_distribution.this.id
}

output "distribution_domain_name" {
  description = "CloudFront distribution domain"
  value       = aws_cloudfront_distribution.this.domain_name
}

output "bucket_name" {
  description = "S3 bucket name for static-site sync"
  value       = aws_s3_bucket.this.id
}
