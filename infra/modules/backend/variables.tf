variable "zone_id" {
  description = "Route 53 hosted zone ID"
  type        = string
}

variable "api_cert_arn" {
  description = "ACM cert ARN (us-east-1) for api.<domain>"
  type        = string
}

variable "domain_name" {
  description = "Apex domain (caphne.co)"
  type        = string
}

variable "parameter_path" {
  description = "Parameter Store prefix, e.g. /caphne/prod"
  type        = string
  default     = "/caphne/prod"
}

variable "instance_ami" {
  description = "AMI ID for the EC2"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t4g.nano"
}

variable "instance_name_tag" {
  description = "Name tag on the EC2"
  type        = string
  default     = "caphne-prod-v6"
}
