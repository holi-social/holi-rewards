resource "google_sql_database" "rewards" {
  name     = local.name_generic_max30
  instance = local.shared_db_instance
}

resource "google_sql_user" "rewards" {
  instance = google_sql_database.rewards.instance
  name     = local.name_generic_max30
  password = data.google_secret_manager_secret_version_access.db_password.secret_data
}

output "database_name" {
  value       = google_sql_database.rewards.name
  description = "database name"
}

output "database_user" {
  value       = google_sql_user.rewards.name
  description = "database user"
}

output "database_password_secret" {
  value       = data.google_secret_manager_secret_version_access.db_password.secret
  description = "secret name for database password"
}
