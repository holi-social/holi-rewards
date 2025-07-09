locals {
  okuna_topic = local.is_production ? data.terraform_remote_state.okuna_common.outputs.google_pubsub_topic_okuna_production : data.terraform_remote_state.okuna_common.outputs.google_pubsub_topic_okuna_staging
}

resource "google_eventarc_trigger" "rewards_push" {
  name     = local.name_generic
  location = local.default_region

  matching_criteria {
    attribute = "type"
    value     = "google.cloud.pubsub.topic.v1.messagePublished"
  }

  destination {
    cloud_run_service {
      service = google_cloud_run_service.rewards_backend.name
      region  = google_cloud_run_service.rewards_backend.location
      path    = "/pubsub"
    }

    network_config {
      network_attachment = data.terraform_remote_state.holi_infra_state.outputs.vpc_access_connector_name
    }
  }

  transport {
    pubsub {
      topic = local.okuna_topic
    }
  }

  service_account = google_service_account.rewards.email
  depends_on      = [google_project_iam_member.rewards]
}
