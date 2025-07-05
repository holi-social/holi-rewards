resource "random_id" "rewards" {
  byte_length = 2
}

locals {
  # predefined environment names are staging, production, and <branchname>
  environment      = terraform.workspace
  environment_name = trim(substr(local.environment, 0, 22), ".-") # limits the length of the name that it fits constraints google imposes for some resources, e.g. project ids
  environment_type = contains(["staging", "production"], local.environment) ? local.environment : "review"

  is_production = local.environment == "production"

  default_region = data.terraform_remote_state.holi_infra_state.outputs.default_region
  project        = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id

  shared_db_instance = local.environment == "production" ? data.terraform_remote_state.holi_infra_state.outputs.database_name_production : data.terraform_remote_state.holi_infra_state.outputs.database_name_development
  shared_db_host     = local.environment == "production" ? data.terraform_remote_state.holi_infra_state.outputs.database_ip_address_production : data.terraform_remote_state.holi_infra_state.outputs.database_ip_address_development

  name_generic       = "rewards-${local.environment_name}-${random_id.rewards.hex}"
  name_generic_max30 = "rewards-${substr(local.environment_name, 0, 14)}-${random_id.rewards.hex}"
  name_template      = "rewards-%s-${local.environment_name}-${random_id.rewards.hex}"
}

variable "image_tag" {
  type     = string
  nullable = false
}
