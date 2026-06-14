variable "bucket_name" {
  description = "S3 bucket name for the static site"
  type        = string
}

variable "domain_name" {
  description = "Apex domain (caphne.co)"
  type        = string
}

variable "zone_id" {
  description = "Route 53 hosted zone ID"
  type        = string
}

variable "cert_arn" {
  description = "ACM cert ARN (us-east-1) for caphne.co + www"
  type        = string
}

variable "name_tag" {
  description = "CloudFront distribution Name tag"
  type        = string
  default     = "Caphne"
}
