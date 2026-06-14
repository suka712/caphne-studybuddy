output "instance_id" {
  description = "EC2 instance ID (for SSM RunCommand from CI/CD)"
  value       = aws_instance.this.id
}

output "instance_ipv6" {
  description = "EC2 IPv6 address (CloudFront origin)"
  value       = aws_instance.this.ipv6_addresses[0]
}

output "api_distribution_id" {
  description = "CloudFront API distribution ID"
  value       = aws_cloudfront_distribution.api.id
}
