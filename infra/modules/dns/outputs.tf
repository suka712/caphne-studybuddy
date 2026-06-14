output "zone_id" {
  description = "Route 53 hosted zone ID"
  value       = aws_route53_zone.this.zone_id
}

output "frontend_cert_arn" {
  description = "ACM cert ARN for caphne.co + www.caphne.co (us-east-1)"
  value       = aws_acm_certificate.frontend.arn
}

output "api_cert_arn" {
  description = "ACM cert ARN for api.caphne.co (us-east-1)"
  value       = aws_acm_certificate.api.arn
}
