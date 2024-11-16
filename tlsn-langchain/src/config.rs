use url::Url;

#[derive(Debug, Eq, PartialEq)]
pub(crate) struct ProviderURL {
    pub server_domain: String,
    pub inference_route: String,
    pub tls: bool,
}

impl TryFrom<&str> for ProviderURL {
    type Error = anyhow::Error;

    fn try_from(url: &str) -> Result<Self, anyhow::Error> {
        let parsed_url = Url::parse(&url).ok().context("Failed to parse URL")?;
        let tls = parsed_url.scheme() == "https";
        let server_domain = parsed_url.host_str().ok_or_else(|| anyhow!("Failed to parse host"))?.to_string();
        let inference_route = parsed_url.path().to_string();

        Ok(Self{server_domain, inference_route, tls})
    }
}

use anyhow::{anyhow, Context};

#[derive(Debug)]
pub struct NotarySettings {
    pub dummy_notary: bool, // TODO - improve this struct to be more effective
    pub host: &'static str,
    pub port: u16,
    pub path: &'static str,
}

/// Configuration for Notary settings, defining host, port, and path
impl Default for NotarySettings {
    fn default() -> Self {
        NotarySettings {
            dummy_notary: true,
            host: "notary.pse.dev", // TODO - figure out why this is not working
            port: 443,
            path: "v0.1.0-alpha.6",
        }
    }
}

/// Privacy settings including topics to censor in requests and responses
#[derive(Debug)]
pub struct PrivacySettings {
    pub request_topics_to_censor: &'static [&'static str],
    pub response_topics_to_censor: &'static [&'static str],
}

impl Default for PrivacySettings {
    fn default() -> Self {
        Self {
            request_topics_to_censor: &["authorization"],
            response_topics_to_censor: &[
                "anthropic-ratelimit-requests-reset",
                "anthropic-ratelimit-tokens-reset",
                "request-id",
                "x-kong-request-id",
                "cf-ray",
                "server-timing",
                "report-to",
            ],
        }
    }
}

/// Model settings including API settings, model ID, and setup prompt
#[derive(Debug)]
pub struct ModelSettings {
    pub api_settings: ProviderURL,
    pub key: String,
    pub id: String,
}

/// Complete application configuration including model, privacy, and notary settings
#[derive(Debug)]
pub struct Config {
    pub model_settings: ModelSettings,
    pub privacy_settings: PrivacySettings,
    pub notary_settings: NotarySettings,
}

impl Config {
    pub(crate) fn new(model_settings: ModelSettings) -> Self {
        Self {
            model_settings,
            privacy_settings: PrivacySettings::default(),
            notary_settings: NotarySettings::default(),
        }
    }
}


#[cfg(test)]
mod tests {
    use super::*;
    use anyhow::Result;

    #[test]
    fn test_parse_url() -> Result<()> {
        let url = "https://api.red-pill.ai/v1/chat/completions".to_string();
        let expected = ProviderURL {
            server_domain: "api.red-pill.ai".to_string(),
            inference_route: "/v1/chat/completions".to_string(),
            tls: true,
        };

        let result = ProviderURL::try_from(url.as_str())?;
        assert_eq!(result, expected);

        Ok(())
    }

    #[test]
    fn test_parse_url_http() ->  Result<()> {
        let url = "http://example.com/api/test".to_string();
        let expected = ProviderURL {
            server_domain: "example.com".to_string(),
            inference_route: "/api/test".to_string(),
            tls: false,
        };

        let result = ProviderURL::try_from(url.as_str())?;
        assert_eq!(result, expected);

        Ok(())
    }

    #[test]
    fn test_parse_url_invalid() {
        let url = "invalid_url".to_string();
        let result = ProviderURL::try_from(url.as_str());
        assert!(result.is_err())
    }
}