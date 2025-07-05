locals {
  # ZONE apis.holi.social
  dns_zone    = data.terraform_remote_state.holi_infra_state.outputs.dns_apis_zone_name
  root_domain = data.terraform_remote_state.holi_infra_state.outputs.dns_apis_zone_domain

  rewards_domain = local.is_production ? "rewards.${local.root_domain}" : "${local.environment_name}.rewards.${local.root_domain}"
}

resource "google_dns_record_set" "rewards" {
  name         = local.rewards_domain
  managed_zone = local.dns_zone

  type = google_cloud_run_domain_mapping.rewards_backend.status[0].resource_records[0].type
  ttl  = 300

  rrdatas = [
    google_cloud_run_domain_mapping.rewards_backend.status[0].resource_records[0].rrdata
  ]
}
