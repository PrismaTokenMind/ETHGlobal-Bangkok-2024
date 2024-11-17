use std::time::Duration;
use elliptic_curve::pkcs8::DecodePublicKey;
use neon::prelude::*;
use tlsn_core::proof::{SessionProof, TlsProof};

fn verify(mut cx: FunctionContext) -> JsResult<JsObject> {
    let presentation_cx = cx.argument::<JsString>(0)?.value(&mut cx);
    let notary_key_cx = cx.argument::<JsString>(1)?.value(&mut cx);

    let (sent, recv, time) =
        verify_presentation(presentation_cx.as_str(), notary_key_cx.as_str()).or_else(|e| cx.throw_error(e))?;

    let obj: Handle<JsObject> = cx.empty_object();
    let sent_str = cx.string(sent);
    obj.set(&mut cx, "sent", sent_str)?;
    let recv_str = cx.string(recv);
    obj.set(&mut cx, "recv", recv_str)?;
    let session_time = cx.number(time as f64);
    obj.set(&mut cx, "time", session_time)?;

    Ok(obj)
}

pub fn verify_presentation(proof: &str, notary_key: &str) -> Result<(String, String, i64), String> {

    let proof: TlsProof = serde_json::from_str(proof)
        .map_err(|e| format!("Failed to parse proof: {}", e))?;

    let TlsProof {
        // The session proof establishes the identity of the server and the commitments
        // to the TLS transcript.
        session,
        // The substrings proof proves select portions of the transcript, while redacting
        // anything the Prover chose not to disclose.
        substrings,
    } = proof;

    // Verify the session proof against the Notary's public key
    //
    // This verifies the identity of the server using a default certificate verifier which trusts
    // the root certificates from the `webpki-roots` crate.
    session
        .verify_with_default_cert_verifier(notary_pubkey(notary_key)?)
        .map_err(|e| format!("Failed to verify session proof: {}", e))?;

    let SessionProof {
        // The session header that was signed by the Notary is a succinct commitment to the TLS transcript.
        header,
        // This is the session_info, which contains the server_name, that is checked against the
        // certificate chain shared in the TLS handshake.
        session_info,
        ..
    } = session;

    // The time at which the session was recorded
    let time = chrono::DateTime::UNIX_EPOCH + Duration::from_secs(header.time());

    // Verify the substrings proof against the session header.
    //
    // This returns the redacted transcripts
    let (mut sent, mut recv) = substrings.verify(&header).unwrap();

    // Replace the bytes which the Prover chose not to disclose with 'X'
    sent.set_redacted(b'X');
    recv.set_redacted(b'X');

    Ok((String::from_utf8(sent.data().to_vec()).unwrap(), String::from_utf8(recv.data().to_vec()).unwrap(), time.timestamp()))
}

/// Returns a Notary pubkey trusted by this Verifier
fn notary_pubkey(key: &str) -> Result<p256::PublicKey, String> {

    p256::PublicKey::from_public_key_pem(key)
        .map_err(|e| format!("Failed to parse Notary pubkey: {}", e))
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("verify", verify)?;
    Ok(())
}