"use client";

import { useEffect, useState } from "react";
import { isAppApiError } from "@/lib/api/errors";
import {
  getMySettings,
  requestVerificationEmail,
  sendFixtureEmail,
  updateMySettings,
} from "@/lib/api/me";
import type {
  FixtureEmailResponse,
  SettingsResponse,
  VerifyEmailRequestResponse,
} from "@/types/me";

type LoadStatus = "loading" | "ready" | "error";

function getSettingsError(error: unknown, fallback: string) {
  if (isAppApiError(error)) {
    if (error.status === 429) {
      return "That account action is being rate limited right now. Please wait a moment and try again.";
    }

    return error.message;
  }

  return fallback;
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifyPending, setVerifyPending] = useState(false);
  const [togglePending, setTogglePending] = useState(false);
  const [sendPending, setSendPending] = useState(false);
  const [verifyResponse, setVerifyResponse] =
    useState<VerifyEmailRequestResponse | null>(null);
  const [emailResponse, setEmailResponse] =
    useState<FixtureEmailResponse | null>(null);

  async function loadSettings() {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await getMySettings();
      setSettings(response);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        getSettingsError(error, "We couldn't load your account settings.")
      );
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  async function resendVerification() {
    setVerifyPending(true);
    setErrorMessage(null);
    setVerifyResponse(null);

    try {
      const response = await requestVerificationEmail();
      setVerifyResponse(response);
      return response;
    } catch (error) {
      setErrorMessage(
        getSettingsError(error, "We couldn't resend the verification email.")
      );
      throw error;
    } finally {
      setVerifyPending(false);
    }
  }

  async function setEmailOptIn(nextValue: boolean) {
    setTogglePending(true);
    setErrorMessage(null);
    setEmailResponse(null);

    try {
      const response = await updateMySettings(nextValue);
      setSettings(response);
      return response;
    } catch (error) {
      setErrorMessage(
        getSettingsError(error, "We couldn't update your reminder preference.")
      );
      throw error;
    } finally {
      setTogglePending(false);
    }
  }

  async function sendFixtureDigest() {
    setSendPending(true);
    setErrorMessage(null);
    setEmailResponse(null);

    try {
      const response = await sendFixtureEmail();
      setEmailResponse(response);
      return response;
    } catch (error) {
      setErrorMessage(
        getSettingsError(error, "We couldn't send your fixture email.")
      );
      throw error;
    } finally {
      setSendPending(false);
    }
  }

  return {
    settings,
    status,
    errorMessage,
    verifyPending,
    togglePending,
    sendPending,
    verifyResponse,
    emailResponse,
    reloadSettings: loadSettings,
    resendVerification,
    setEmailOptIn,
    sendFixtureDigest,
  };
}
