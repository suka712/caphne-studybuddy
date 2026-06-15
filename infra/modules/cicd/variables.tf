variable "github_repo" {
  description = "GitHub repository in owner/name format"
  type        = string
}

variable "frontend_bucket_name" {
  description = "S3 bucket used for the static site"
  type        = string
}

variable "frontend_distribution_arn" {
  description = "CloudFront distribution ARN for the frontend"
  type        = string
}

variable "api_distribution_arn" {
  description = "CloudFront distribution ARN for the API"
  type        = string
}

variable "ec2_instance_id" {
  description = "EC2 instance ID for SSM RunCommand deploys"
  type        = string
}

variable "parameter_path" {
  description = "Parameter Store prefix the CI role can read"
  type        = string
  default     = "/caphne/prod"
}

variable "tf_state_bucket" {
  description = "S3 bucket holding Terraform state"
  type        = string
}
