import React, { useState } from "react";
import { getAuth, PhoneAuthProvider, RecaptchaVerifier, linkWithCredential } from "firebase/auth";
import { useAuth } from "@/components/AuthProvider";

export default function PhoneNumberUpdater() {
  const { user } = useAuth();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const startPhoneVerification = async () => {
    setMessage("");
    setSending(true);
    const auth = getAuth();
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', { size: 'invisible' }, auth);
    }
    const provider = new PhoneAuthProvider(auth);
    try {
      const verificationId = await provider.verifyPhoneNumber(phone, window.recaptchaVerifier);
      setConfirmationResult({ verificationId });
      setMessage("Verification code sent!");
    } catch (err) {
      setMessage("Error sending code: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const verifyCodeAndLink = async () => {
    if (!confirmationResult) return;
    setVerifying(true);
    const auth = getAuth();
    const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, code);
    try {
      await linkWithCredential(user, credential);
      setMessage("Phone number linked successfully! Please refresh the page to see the update.");
    } catch (err) {
      setMessage("Error linking phone: " + err.message);
    } finally {
      setVerifying(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <input
        type="tel"
        placeholder="Enter phone number (+91...)"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        disabled={!!confirmationResult || sending}
        style={{ marginRight: 8 }}
      />
      <button onClick={startPhoneVerification} disabled={!!confirmationResult || sending || !phone}>
        {sending ? "Sending..." : "Send Code"}
      </button>
      <div id="recaptcha-container"></div>
      {confirmationResult && (
        <>
          <input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={e => setCode(e.target.value)}
            disabled={verifying}
            style={{ margin: '8px 8px 0 0' }}
          />
          <button onClick={verifyCodeAndLink} disabled={verifying || !code}>
            {verifying ? "Verifying..." : "Verify & Link"}
          </button>
        </>
      )}
      {message && <p style={{ marginTop: 8 }}>{message}</p>}
    </div>
  );
} 