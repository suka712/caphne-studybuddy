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
