resource "google_service_account" "rewards" {
  account_id   = local.name_generic_max30
  display_name = "holi-rewards: service account (${local.environment})"
}

resource "google_project_iam_member" "rewards" {
  for_each = toset([
    "roles/secretmanager.secretAccessor",
    "roles/pubsub.publisher",
    "roles/run.invoker",
    "roles/iam.serviceAccountOpenIdTokenCreator",
  ])

  project = local.project
  member  = "serviceAccount:${google_service_account.rewards.email}"
  role    = each.key
}

# add our service account to the key used for encrypting okuna pubsub messages
resource "google_kms_crypto_key_iam_member" "rewards" {
  crypto_key_id = data.terraform_remote_state.holi_infra_state.outputs.artifact_registry_cloudfunctions_key_id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_service_account.rewards.email}"
}

resource "google_project_service_identity" "pubsub" {
  project = local.project
  service = "pubsub.googleapis.com"
}

resource "google_project_iam_member" "pubsub_sa_token_creator" {
  project = local.project
  role    = "roles/iam.serviceAccountTokenCreator"
  member  = google_project_service_identity.pubsub.member
}
