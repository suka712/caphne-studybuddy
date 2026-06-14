# Modules need to declare the providers they use, including aliased ones.
terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      configuration_aliases = [aws.us_east_1]
    }
  }
}

resource "aws_route53_zone" "this" {
  name = var.zone_name
}

# ACM certs (must be us-east-1 for CloudFront)
resource "aws_acm_certificate" "frontend" {
  provider = aws.us_east_1

  domain_name               = var.zone_name
  subject_alternative_names = ["www.${var.zone_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate" "api" {
  provider = aws.us_east_1

  domain_name       = "api.${var.zone_name}"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# ACM DNS-validation records (one CNAME per cert per SAN)
resource "aws_route53_record" "acm_apex_validation" {
  zone_id = aws_route53_zone.this.zone_id
  name    = "_4b2968da6d376270a71b0b8e3723e1d1.${var.zone_name}"
  type    = "CNAME"
  ttl     = 300
  records = ["_0439dbdc2275268bc7e2e8a1c5991cbb.jkddzztszm.acm-validations.aws."]
}

resource "aws_route53_record" "acm_www_validation" {
  zone_id = aws_route53_zone.this.zone_id
  name    = "_37e262e32da9bd00b566b010072374cc.www.${var.zone_name}"
  type    = "CNAME"
  ttl     = 300
  records = ["_f5020ab6f0838e945a8b6986459cd89a.jkddzztszm.acm-validations.aws."]
}

resource "aws_route53_record" "acm_api_validation" {
  zone_id = aws_route53_zone.this.zone_id
  name    = "_ce36565da3ff2a8c1de92a9d0dfcbe3f.api.${var.zone_name}"
  type    = "CNAME"
  ttl     = 300
  records = ["_32ead942ee48d671e111f91b950753b9.jkddzztszm.acm-validations.aws."]
}
