use crate::config::{Config, ModelSettings};
use crate::tlsn_operations::extract_private_data;
use anyhow::{Context, Result};
use http_body_util::BodyExt;
use hyper::client::conn::http1::SendRequest;
use hyper::header::{AUTHORIZATION, CONNECTION, CONTENT_TYPE, HOST};
use hyper::Method;
use pyo3::{pyclass, pymethods};
use tracing::debug;

#[pyclass]
#[derive(Debug, Clone)]
pub struct APIResponse {
    #[pyo3(get, set)]
    pub status_code: u16,
    #[pyo3(get, set)]
    pub response: String,
}

#[pymethods]
impl APIResponse {
    fn json(&self) -> String {
        self.response.clone()
    }
}

pub(super) async fn single_interaction_round(
    request_sender: &mut SendRequest<String>,
    config: &Config,
    messages: Vec<serde_json::Value>,
    tools: Vec<serde_json::Value>,
    top_p: f64, temperature: f64,
    recv_private_data: &mut Vec<Vec<u8>>,
    sent_private_data: &mut Vec<Vec<u8>>,
) -> Result<APIResponse> {

    // Prepare the Request to send to the model's API
    let request = generate_request(messages, tools, top_p, temperature, &config.model_settings)
        .context("Error generating request")?;

    // Collect the private data transmitted in the request
    extract_private_data(
        sent_private_data,
        request.headers(),
        config.privacy_settings.request_topics_to_censor,
    );

    debug!("Request: {:?}", request);

    debug!("Sending request to Model...");

    let response = request_sender
        .send_request(request)
        .await
        .map_err(|e| {
            anyhow::anyhow!("Error sending request to Model: {:?}", e)
        })?;

    debug!("Response: {:?}", response);

    let status_code = response.status().as_u16();

    // Collect the received private data
    extract_private_data(
        recv_private_data,
        response.headers(),
        config.privacy_settings.response_topics_to_censor,
    );

    // Collect the body
    let payload = response
        .into_body()
        .collect()
        .await
        .context("Error reading response body")?
        .to_bytes();

    let json_response = serde_json::from_str::<serde_json::Value>(&String::from_utf8_lossy(&payload))
        .context("Error parsing the response")?;

    // Pretty printing the response
    debug!(
        "Response: {}",
        serde_json::to_string_pretty(&json_response).context("Error pretty printing the response")?
    );

    Ok(APIResponse {
        status_code,
        response: serde_json::to_string(&json_response).context("Error serializing the response")?,
    })
}

fn generate_request(
    messages: Vec<serde_json::Value>,
    tools: Vec<serde_json::Value>,
    top_p: f64, temperature: f64,
    model_settings: &ModelSettings,
) -> Result<hyper::Request<String>> {
    let mut json_body = serde_json::Map::new();
    json_body.insert("model".to_string(), serde_json::json!(model_settings.id));
    json_body.insert("messages".to_string(), serde_json::to_value(messages).context("Error serializing messages")?);
    if !tools.is_empty() {
        json_body.insert("tools".to_string(), serde_json::to_value(tools).context("Error serializing tools")?);
    }
    json_body.insert("top_p".to_string(), serde_json::json!(top_p));
    json_body.insert("temperature".to_string(), serde_json::json!(temperature));
    let json_body = serde_json::Value::Object(json_body);

    // Build the HTTP request to send the prompt to Model's API
    hyper::Request::builder()
        .method(Method::POST)
        .uri(model_settings.api_settings.inference_route.clone())
        .header(HOST, model_settings.api_settings.server_domain.clone())
        .header("Accept-Encoding", "identity")
        .header(CONNECTION, "close")
        .header(CONTENT_TYPE, "application/json")
        .header(
            AUTHORIZATION,
            format!("Bearer {}", model_settings.key),
        )
        .body(json_body.to_string())
        .context("Error building the request")
}