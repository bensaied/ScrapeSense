"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faCheckCircle,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./css/apiv3.module.css";
import styles1 from "./page.module.css";

const APIV3 = ({ ngrokUrl }) => {
  const [apiKey, setApiKey] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null);

  const handleYouTubeSubmit = async (e) => {
    e.preventDefault();

    if (!apiKey) {
      setStatus("Failed");
      setResult(
        "API key cannot be empty. Please provide a valid YouTube API v3 key."
      );
      return;
    }

    // POST API KEY V3 TO COLAB ENDPOINT
    const formattedNgrokUrl = ngrokUrl.endsWith("/")
      ? ngrokUrl
      : `${ngrokUrl}/`;

    try {
      const response = await fetch(`${formattedNgrokUrl}scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();
      console.log("data :", data);
      if (response.ok) {
        setStatus("Success");
        setResult("YouTube scraping process has started successfully.");
      } else {
        setStatus("Failed");
        setResult(
          "Invalid API key. Please provide a valid YouTube API v3 key."
        );
      }
    } catch (error) {
      //   console.error("Error:", error);
      setStatus("Failed");
      setResult("Invalid API key. Please provide a valid YouTube API v3 key.");
    }
  };

  return (
    <div>
      <strong>YouTube Video Search and Data Export Process</strong>
      <form onSubmit={handleYouTubeSubmit} className={styles.form}>
        <label htmlFor="apiKey">Enter Your YouTube API v3 Key:</label>
        <input
          type="text"
          id="apiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter API v3 key"
          className={styles.input}
        />

        {!result && (
          <>
            <p className={styles1.note}>
              <FontAwesomeIcon
                icon={faCircleInfo}
                className={styles1.iconPadding}
              />
              Note: Please follow the steps provided in the{" "}
              <a
                href="https://github.com/bensaied/ScrapeSense"
                target="_blank"
                rel="noopener noreferrer"
              >
                repository
              </a>{" "}
              to create your YouTube API v3 key.
            </p>

            <button type="submit" className={styles1.submitButton}>
              Submit API Key
            </button>
          </>
        )}
        {result && status === "Success" ? (
          <>
            <div className={styles1.resultValidationBox}>
              <FontAwesomeIcon
                icon={faCheckCircle}
                className={styles1.validateIcon}
              />
              <pre className={styles1.resultValidationText}>{result}</pre>
            </div>
            <button className={styles.submitButton}>Start Scraping</button>
          </>
        ) : result && status === "Failed" ? (
          <>
            <div className={styles1.resultErrorBox}>
              <FontAwesomeIcon
                icon={faXmarkCircle}
                className={styles1.errorIcon}
              />
              <pre className={styles1.resultErrorText}>{result}</pre>
            </div>
            <p className={styles.note}>
              <FontAwesomeIcon
                icon={faCircleInfo}
                className={styles.iconPadding}
              />
              Note: Please follow the steps provided in the{" "}
              <a
                href="https://github.com/bensaied/ScrapeSense"
                target="_blank"
                rel="noopener noreferrer"
              >
                repository
              </a>{" "}
              to create your YouTube API v3 key.
            </p>
            <button type="submit" className={styles1.submitButton}>
              Submit API Key
            </button>
          </>
        ) : null}
      </form>
    </div>
  );
};
export default APIV3;
