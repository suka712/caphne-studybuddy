output "deploy_role_arn" {
  description = "Role ARN that CI (GitHub Actions + GitLab CI) assumes via OIDC. Use as AWS_ROLE_ARN in GitLab / role-to-assume in workflow YAML."
  value       = aws_iam_role.deploy.arn
}

output "oidc_provider_arn" {
  description = "OIDC provider ARN (referenced by the role's trust policy)"
  value       = aws_iam_openid_connect_provider.github.arn
}
