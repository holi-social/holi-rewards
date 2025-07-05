resource "google_sql_database" "rewards" {
  name     = local.name_generic_max30
  instance = local.shared_db_instance

  lifecycle {
    prevent_destroy = local.is_production
  }
}

resource "google_sql_user" "rewards" {
  instance = google_sql_database.rewards.instance
  name     = local.name_generic_max30
  password = data.google_secret_manager_secret_version_access.db_password.secret_data
}
