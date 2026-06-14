terraform {
  backend "s3" {
    bucket       = "caphne-terraform-state-61346134"
    key          = "prod/terraform.tfstate"
    region       = "ap-southeast-1"
    encrypt      = true
    use_lockfile = true
  }
}
