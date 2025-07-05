locals {
  okuna_topic  = local.is_production ? data.terraform_remote_state.okuna_common.outputs.google_pubsub_topic_okuna_production : data.terraform_remote_state.okuna_common.outputs.google_pubsub_topic_okuna_staging
  jwt_audience = "holi-rewards:${local.environment}"
}

resource "google_pubsub_subscription" "rewards_push" {
  name  = local.name_generic
  topic = local.okuna_topic

  push_config {
    push_endpoint = "https://${local.rewards_domain}/pubsub"
    attributes = {
      x-goog-version = "v1"
    }

    oidc_token {
      service_account_email = google_service_account.rewards.email
      audience              = local.jwt_audience
    }
  }

  enable_exactly_once_delivery = true
}
