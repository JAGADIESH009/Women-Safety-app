module.exports = ({ config }) => {
  // If the GOOGLE_SERVICES_JSON environment variable is provided (e.g. by EAS Build as a file env var),
  // use its path instead of the local fallback.
  if (process.env.GOOGLE_SERVICES_JSON) {
    config.android = config.android || {};
    config.android.googleServicesFile = process.env.GOOGLE_SERVICES_JSON;
  }
  return config;
};
