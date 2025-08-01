locals {
  okuna_topic = local.is_production ? data.terraform_remote_state.okuna_common.outputs.google_pubsub_topic_okuna_production : data.terraform_remote_state.okuna_common.outputs.google_pubsub_topic_okuna_staging
}

resource "google_pubsub_subscription" "rewards_push" {
  project = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  name    = local.name_generic
  topic   = local.okuna_topic

  expiration_policy {
    ttl = "" # never expire
  }

  push_config {
    push_endpoint = "${google_cloud_run_service.rewards_backend.status[0].url}/pubsub"

    oidc_token {
      service_account_email = google_service_account.rewards.email
    }
  }

  retry_policy {
    minimum_backoff = "1s"
    maximum_backoff = "60s"
  }

  depends_on      = [google_project_iam_member.rewards]
}

resource "google_monitoring_alert_policy" "rewards_unacked_messages_alert" {
  project      = data.terraform_remote_state.holi_infra_state.outputs.shared_project_id
  display_name = "Okuna -> Rewards: Unacked Messages Alert (${local.environment_name}) / subscription_id='${google_pubsub_subscription.rewards_push.name}'"
  combiner     = "OR"
  conditions {
    display_name = "Unacked messages condition"
    condition_prometheus_query_language {
      query    = "rate(pubsub_googleapis_com:subscription_oldest_unacked_message_age{subscription_id='${google_pubsub_subscription.rewards_push.name}'}[5m]) >= 1"
      duration = "300s"
    }
  }

  alert_strategy {
    auto_close = "300s"
  }

  notification_channels = [local.environment_name == "production" ? data.terraform_remote_state.holi_infra_monitoring_state.outputs.monitoring_notification_channel_slack_production_id : data.terraform_remote_state.holi_infra_monitoring_state.outputs.monitoring_notification_channel_slack_staging_id]

  documentation {
    content   = "Alert triggered when Pub/Sub subscription(s) (subscription_id='${google_pubsub_subscription.rewards_push.name}') have unacknowledged messages for more than 5 minutes. Please check the cloud function deployment and logs to see if the subscriber works correctly."
    mime_type = "text/markdown"
  }
}

output "google_pubsub_okuna_subscription_id" {
  value = google_pubsub_subscription.rewards_push.id
}