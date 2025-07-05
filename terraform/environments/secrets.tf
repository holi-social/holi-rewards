data "google_secret_manager_secret_version_access" "db_password" {
  secret  = local.is_production ? "REWARDS_DB_PASSWORD_PRODUCTION" : "REWARDS_DB_PASSWORD_DEVELOPMENT"
}
