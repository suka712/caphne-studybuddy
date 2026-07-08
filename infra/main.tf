module "dns" {
  source = "./modules/dns"

  zone_name = "caphne.co"

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }
}

module "frontend" {
  source = "./modules/frontend"

  bucket_name = "caphne-frontend"
  domain_name = "caphne.co"
  zone_id     = module.dns.zone_id
  cert_arn    = module.dns.frontend_cert_arn

  providers = {
    aws.us_east_1 = aws.us_east_1
  }
}

module "backend" {
  source = "./modules/backend"

  domain_name  = "caphne.co"
  zone_id      = module.dns.zone_id
  api_cert_arn = module.dns.api_cert_arn
  instance_ami = "ami-0b605d0e1f3fc1fa8"
}

module "cicd" {
  source = "./modules/cicd"

  github_repo               = "suka712/caphne-studybuddy"
  gitlab_project            = "nauri/caphne-studybuddy"
  frontend_bucket_name      = module.frontend.bucket_name
  frontend_distribution_arn = "arn:aws:cloudfront::387219500825:distribution/${module.frontend.distribution_id}"
  api_distribution_arn      = "arn:aws:cloudfront::387219500825:distribution/${module.backend.api_distribution_id}"
  ec2_instance_id           = module.backend.instance_id
  tf_state_bucket           = "caphne-terraform-state-61346134"
}

output "github_actions_role_arn" {
  description = "Use this ARN in .github/workflows/*.yml under role-to-assume"
  value       = module.cicd.deploy_role_arn
}
