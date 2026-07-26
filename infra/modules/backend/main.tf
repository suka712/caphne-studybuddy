# =========================
# Default VPC references
# =========================
data "aws_vpc" "default" {
  default = true
}

data "aws_internet_gateway" "default" {
  filter {
    name   = "attachment.vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_subnet" "default" {
  vpc_id            = data.aws_vpc.default.id
  default_for_az    = true
  availability_zone = "ap-southeast-1a"
}

data "aws_route_table" "main" {
  vpc_id = data.aws_vpc.default.id
  filter {
    name   = "association.main"
    values = ["true"]
  }
}

# =========================
# VPC IPv6 plumbing
# =========================
resource "aws_vpc_ipv6_cidr_block_association" "default" {
  vpc_id                           = data.aws_vpc.default.id
  assign_generated_ipv6_cidr_block = true
}

resource "aws_route" "ipv6_default" {
  route_table_id              = data.aws_route_table.main.id
  destination_ipv6_cidr_block = "::/0"
  gateway_id                  = data.aws_internet_gateway.default.id
}

# =========================
# Security Groups
# =========================
data "aws_ec2_managed_prefix_list" "cloudfront_ipv4" {
  name = "com.amazonaws.global.cloudfront.origin-facing"
  filter {
    name   = "owner-id"
    values = ["AWS"]
  }
}

data "aws_ec2_managed_prefix_list" "cloudfront_ipv6" {
  name = "com.amazonaws.global.ipv6.cloudfront.origin-facing"
  filter {
    name   = "owner-id"
    values = ["AWS"]
  }
}

resource "aws_security_group" "app" {
  name        = "caphne-app-sg"
  description = "Caphne origin, CF-only ingress"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "CloudFront IPv4 origin-facing on 8080"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    prefix_list_ids = [data.aws_ec2_managed_prefix_list.cloudfront_ipv4.id]
  }

  egress {
    description      = "All outbound"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

resource "aws_security_group" "app_ipv6" {
  name        = "caphne-app-sg-ipv6"
  description = "Caphne origin, CF IPv6 ingress"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "CF origin-facing IPv6"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    prefix_list_ids = [data.aws_ec2_managed_prefix_list.cloudfront_ipv6.id]
  }

  egress {
    description      = "All outbound"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

# =========================
# IAM
# =========================
resource "aws_iam_role" "ec2" {
  name        = "caphne-ec2"
  description = "Allows EC2 instances to call AWS services on your behalf."

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy" "parameter_store" {
  name = "caphne-parameter-store"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath",
        ]
        # GetParametersByPath authorizes against the path node itself; the
        # single/batch gets authorize against the child parameters. Grant both,
        # or the by-path call the service uses to load env is denied.
        Resource = [
          "arn:aws:ssm:*:*:parameter${var.parameter_path}",
          "arn:aws:ssm:*:*:parameter${var.parameter_path}/*",
        ]
      },
      {
        Effect   = "Allow"
        Action   = "kms:Decrypt"
        Resource = "*"
        Condition = {
          StringEquals = {
            "kms:ViaService" = "ssm.*.amazonaws.com"
          }
        }
      },
    ]
  })
}

resource "aws_iam_instance_profile" "ec2" {
  name = "caphne-ec2"
  role = aws_iam_role.ec2.name
}

# =========================
# EC2
# =========================
resource "aws_instance" "this" {
  ami           = var.instance_ami
  instance_type = var.instance_type

  subnet_id              = data.aws_subnet.default.id
  vpc_security_group_ids = [aws_security_group.app.id, aws_security_group.app_ipv6.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  associate_public_ip_address = false
  ipv6_address_count          = 1

  # DR only: ignore_changes on user_data below means this never touches the
  # live instance. It only runs if this resource is ever replaced from
  # scratch, so a fresh box still boots with a working local Redis.
  user_data = <<-EOF
    #!/bin/bash
    set -eux
    apt-get update -qq
    apt-get install -y redis-server
    sed -i "s/^bind .*/bind 127.0.0.1 -::1/" /etc/redis/redis.conf
    sed -i "s/^supervised .*/supervised systemd/" /etc/redis/redis.conf
    systemctl enable --now redis-server
  EOF

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
    instance_metadata_tags      = "disabled"
  }

  root_block_device {
    delete_on_termination = true
  }

  tags = {
    Name = var.instance_name_tag
  }

  lifecycle {
    ignore_changes = [ami, user_data, user_data_base64]
  }
}

# =========================
# Parameter Store
# =========================
locals {
  parameters_string = [
    "CLIENT_URL",
    "GITHUB_CLIENT_ID",
    "GOOGLE_CLIENT_ID",
    "NODE_ENV",
    "PORT",
    "REDIS_URL",
    "SERVER_URL",
  ]

  parameters_secure = [
    "DATABASE_URL",
    "GITHUB_CLIENT_SECRET",
    "GOOGLE_CLIENT_SECRET",
    "JWT_SECRET",
  ]
}

resource "aws_ssm_parameter" "string" {
  for_each = toset(local.parameters_string)

  name  = "${var.parameter_path}/${each.key}"
  type  = "String"
  value = "placeholder"

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "secure" {
  for_each = toset(local.parameters_secure)

  name  = "${var.parameter_path}/${each.key}"
  type  = "SecureString"
  value = "placeholder"

  lifecycle {
    ignore_changes = [value]
  }
}

# =========================
# CloudFront API distribution
# =========================
resource "aws_cloudfront_distribution" "api" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "caphne-api"
  price_class     = "PriceClass_All"
  http_version    = "http2"
  aliases         = ["api.${var.domain_name}"]

  origin {
    origin_id   = "caphne-origin"
    domain_name = "origin.${var.domain_name}"

    custom_origin_config {
      http_port                = 8080
      https_port               = 443
      origin_protocol_policy   = "http-only"
      origin_ssl_protocols     = ["TLSv1.2"]
      origin_read_timeout      = 60
      origin_keepalive_timeout = 5
      ip_address_type          = "dualstack"
    }

    connection_attempts = 3
    connection_timeout  = 10
  }

  default_cache_behavior {
    target_origin_id         = "caphne-origin"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]
    compress                 = true
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # CachingDisabled
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3" # AllViewer
  }

  viewer_certificate {
    acm_certificate_arn      = var.api_cert_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

# =========================
# DNS records pointing at backend resources
# =========================
resource "aws_route53_record" "api_a" {
  zone_id = var.zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.api.domain_name
    zone_id                = aws_cloudfront_distribution.api.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "origin_aaaa" {
  zone_id = var.zone_id
  name    = "origin.${var.domain_name}"
  type    = "AAAA"
  ttl     = 60
  records = aws_instance.this.ipv6_addresses
}
