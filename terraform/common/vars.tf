locals {
  infra_outputs = data.terraform_remote_state.holi_infra_state.outputs

  default_region = local.infra_outputs.default_region
  project_id     = local.infra_outputs.shared_project_id

  database_instance_development = local.infra_outputs.database_name_development
  database_instance_production  = local.infra_outputs.database_name_production
}
