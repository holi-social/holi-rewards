resource "google_project_service_identity" "rewards_pubsub_serviceaccount" {
  provider = google-beta

  project = local.project_id
  service = "pubsub.googleapis.com"
}

resource "google_kms_crypto_key_iam_member" "rewards_pubsub" {
  crypto_key_id = data.terraform_remote_state.holi_infra_state.outputs.artifact_registry_cloudfunctions_key_id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_project_service_identity.rewards_pubsub_serviceaccount.email}"
}
