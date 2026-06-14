provider "aws" {
  region = "ap-southeast-1"

  default_tags {
    tags = {
      Project   = "caphne"
      ManagedBy = "terraform"
    }
  }
}

# CloudFront ACM certs must live in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project   = "caphne"
      ManagedBy = "terraform"
    }
  }
}
