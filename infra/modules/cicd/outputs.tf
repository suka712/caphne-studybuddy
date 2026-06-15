output "deploy_role_arn" {
  description = "Role ARN that GitHub Actions assumes via OIDC. Put this in workflow YAML."
  value       = aws_iam_role.deploy.arn
}

output "oidc_provider_arn" {
  description = "OIDC provider ARN (referenced by the role's trust policy)"
  value       = aws_iam_openid_connect_provider.github.arn
}
