resource "google_service_account" "rewards" {
  account_id   = local.name_generic_max30
  display_name = "holi-rewards: service account (${local.environment})"
}

resource "google_project_iam_member" "rewards" {
  for_each = toset([
    "roles/secretmanager.secretAccessor",
    "roles/run.invoker",
  ])

  project = local.project
  member  = "serviceAccount:${google_service_account.rewards.email}"
  role    = each.key
}
