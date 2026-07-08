# GitHub Actions OIDC provider — the trust anchor that lets GitHub-issued tokens
# be exchanged for short-lived AWS credentials.
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

# GitLab CI OIDC provider — the migration made GitLab the primary CI, so its
# tokens also need to be exchangeable for AWS credentials. AWS validates
# gitlab.com against its trust store, so no thumbprint is required.
resource "aws_iam_openid_connect_provider" "gitlab" {
  url            = "https://gitlab.com"
  client_id_list = ["https://gitlab.com"]
}

# Trust policy: which GitHub Actions runs can assume this role.
# We scope to `repo:<owner>/<repo>:*` which covers main, PR branches, tags.
data "aws_iam_policy_document" "trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repo}:*"]
    }
  }

  # GitLab CI: scope to this project's branches (covers MR branches + main).
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.gitlab.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "gitlab.com:aud"
      values   = ["https://gitlab.com"]
    }

    condition {
      test     = "StringLike"
      variable = "gitlab.com:sub"
      values   = ["project_path:${var.gitlab_project}:ref_type:branch:ref:*"]
    }
  }
}

resource "aws_iam_role" "deploy" {
  name               = "ci-deploy"
  description        = "Assumed by CI (GitHub Actions + GitLab CI) via OIDC for build, deploy, and terraform"
  assume_role_policy = data.aws_iam_policy_document.trust.json
}

# Permissions policy — start broad enough to cover deploys + terraform, scope
# down later. Everything granted here is needed for at least one workflow.
data "aws_iam_policy_document" "deploy" {
  # ── Frontend deploys: sync to S3 bucket + invalidate CloudFront ──
  statement {
    sid    = "FrontendS3Sync"
    effect = "Allow"
    actions = [
      "s3:ListBucket",
      "s3:GetBucketLocation",
    ]
    resources = ["arn:aws:s3:::${var.frontend_bucket_name}"]
  }
  statement {
    sid    = "FrontendS3Objects"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = ["arn:aws:s3:::${var.frontend_bucket_name}/*"]
  }
  statement {
    sid    = "CloudFrontInvalidate"
    effect = "Allow"
    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation",
      "cloudfront:ListInvalidations",
    ]
    resources = [var.frontend_distribution_arn, var.api_distribution_arn]
  }

  # ── Backend deploys: SSM send-command + read status ──
  statement {
    sid     = "SSMSendCommand"
    effect  = "Allow"
    actions = ["ssm:SendCommand"]
    resources = [
      "arn:aws:ec2:*:*:instance/${var.ec2_instance_id}",
      "arn:aws:ssm:*::document/AWS-RunShellScript",
    ]
  }
  statement {
    sid    = "SSMCommandStatus"
    effect = "Allow"
    actions = [
      "ssm:GetCommandInvocation",
      "ssm:ListCommandInvocations",
      "ssm:ListCommands",
    ]
    resources = ["*"]
  }

  # ── Parameter Store: read so workflows can pull config at build time ──
  statement {
    sid    = "ParameterStoreRead"
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParametersByPath",
    ]
    resources = ["arn:aws:ssm:*:*:parameter${var.parameter_path}/*"]
  }

  # ── Terraform state: read/write the state file and acquire the lock ──
  statement {
    sid    = "TerraformStateBucket"
    effect = "Allow"
    actions = [
      "s3:ListBucket",
      "s3:GetBucketLocation",
    ]
    resources = ["arn:aws:s3:::${var.tf_state_bucket}"]
  }
  statement {
    sid    = "TerraformStateObjects"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = ["arn:aws:s3:::${var.tf_state_bucket}/*"]
  }

  # ── Terraform plan/apply: needs to read everything to detect drift, and
  # write to resources it manages. Pragmatic broad grant for now; revisit
  # later with permission-set-by-resource if you want tighter ─────────────
  statement {
    sid    = "TerraformManageResources"
    effect = "Allow"
    actions = [
      "ec2:*",
      "iam:*",
      "s3:*",
      "cloudfront:*",
      "route53:*",
      "acm:*",
      "ssm:*",
      "kms:Decrypt",
      "logs:*",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "deploy" {
  name   = "ci-deploy"
  role   = aws_iam_role.deploy.id
  policy = data.aws_iam_policy_document.deploy.json
}
