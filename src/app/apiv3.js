"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";

import styles from "./css/apiv3.module.css";

export default function APIV3() {
  const [apiKey, setApiKey] = useState("");

  const handleYouTubeSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey) {
      alert("Please provide a valid YouTube API v3 key.");
      return;
    }

    try {
      const response = await fetch("YOUR_NGROK_COLAB_URL", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("YouTube scraping started successfully!");
      } else {
        throw new Error(data.error || "Failed to start scraping.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while starting the YouTube scraper.");
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
        <p className={styles.note}>
          <FontAwesomeIcon icon={faCircleInfo} className={styles.iconPadding} />
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
        <button type="submit" className={styles.submitButton}>
          Submit API Key
        </button>
      </form>
    </div>
  );
}
