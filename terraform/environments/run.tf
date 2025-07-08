resource "google_cloud_run_service" "rewards_backend" {
  name     = format(local.name_template, "backend")
  location = local.default_region

  autogenerate_revision_name = true

  template {
    spec {
      service_account_name = google_service_account.rewards.email

      containers {
        image = "${data.terraform_remote_state.holi_infra_state.outputs.artifact_registry_location}/holi-rewards:${var.image_tag}"
        ports {
          container_port = 8000
        }

        env {
          name  = "DB_HOST"
          value = local.shared_db_host
        }

        env {
          name  = "DB_USER"
          value = google_sql_user.rewards.name
        }

        env {
          name  = "DB_NAME"
          value = google_sql_database.rewards.name
        }

        env {
          name = "DB_PASSWORD"
          value_from {
            secret_key_ref {
              key  = "latest"
              name = data.google_secret_manager_secret_version_access.db_password.secret
            }
          }
        }

        env {
          name  = "JWT_AUDIENCE"
          value = local.jwt_audience
        }

        env {
          name  = "JWT_EMAIL"
          value = google_service_account.rewards.email
        }

        resources {
          limits = {
            cpu    = local.is_production ? "250m" : "250m"
            memory = local.is_production ? "512Mi" : "512Mi"
          }
          requests = {
            cpu    = local.is_production ? "250m" : "250m"
            memory = local.is_production ? "512Mi" : "512Mi"
          }
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = local.is_production ? "1" : "0"
        "autoscaling.knative.dev/maxScale" = "1"

        "run.googleapis.com/vpc-access-connector" = data.terraform_remote_state.holi_infra_state.outputs.vpc_access_connector_name
        "run.googleapis.com/vpc-access-egress"    = "private-ranges-only"
        "run.googleapis.com/startup-cpu-boost"    = "true"
      }

      labels = {
        "environment_type" = local.environment_type
        "holi_service"     = "rewards"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_domain_mapping" "rewards_backend" {
  location = google_cloud_run_service.rewards_backend.location

  name = trim(local.rewards_domain, ".")

  metadata {
    namespace = google_cloud_run_service.rewards_backend.project
  }

  spec {
    route_name = google_cloud_run_service.rewards_backend.name
  }
}

data "google_iam_policy" "rewards" {
  binding {
    role    = "roles/run.invoker"
    members = ["allUsers"]
  }
}

resource "google_cloud_run_service_iam_policy" "rewards" {
  location = google_cloud_run_service.rewards_backend.location
  project  = google_cloud_run_service.rewards_backend.project
  service  = google_cloud_run_service.rewards_backend.name

  policy_data = data.google_iam_policy.rewards.policy_data
}
