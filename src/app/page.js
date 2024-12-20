"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faCircleInfo, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { Colab } from "@lobehub/icons";
import styles from "./page.module.css";

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);
  // const [ngrokUrl, setNgrokUrl] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [result, setResult] = useState(null);

  const handleStartClick = () => {
    setIsStarted(true);
  };
  const handleInputChange = (e) => {
    setInputUrl(e.target.value); // Update input value when the user types
  };

  const handleSubmit = async () => {
    // Regular expression to validate a basic URL structure
    const urlPattern =
      /^(https?:\/\/)([a-z0-9-]+\.)+[a-z]{2,6}(:[0-9]+)?(\/[^\s]*)?$/i;

    // Check if the entered URL matches the pattern
    if (!inputUrl || !urlPattern.test(inputUrl)) {
      alert("Please enter a valid Ngrok URL.");
      return;
    }

    try {
      const response = await fetch(inputUrl); // Fetch the result from the URL
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      console.log(response); // Log the HTML content to the console (or use it in your app)
      if (
        response.status === 200 &&
        response.body.locked === false &&
        response.url === inputUrl
      ) {
        setResult("Great! The URL is valid and the app is running..");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data from the URL.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.container} ${isStarted ? styles.started : ""}`}>
        <Image
          src="/logo.png"
          alt="Logo"
          width={400}
          height={400}
          className={`${styles.logo} ${isStarted ? styles.logoStarted : ""}`}
        />

        {!isStarted && (
          <div className={styles.descriptionBox}>
            <p className={styles.description}>
              Welcome to <strong>ScrapeSense</strong>, your ultimate web
              scraping solution!
            </p>
            <br />
            <p className={styles.description}>
              Automates YouTube comment sentiment analysis.
            </p>
          </div>
        )}
        {!isStarted && (
          <button className={styles.startButton} onClick={handleStartClick}>
            &#9658; Start Scraping
          </button>
        )}
        {/* Form Box - appears after the logo translation */}
        {isStarted && (
          <div className={styles.formBox}>
            <strong>
              Connect to your Google Colab <Colab.Color size={20} />{" "}
            </strong>
            <input
              type="text"
              placeholder="Enter ngrok URL"
              className={styles.formInput}
              value={inputUrl}
              onChange={handleInputChange}
            />
            {/* <input
              type="text"
              placeholder="Enter API v3 key"
              className={styles.formInput}
            /> */}
            <p className={styles.note}>
              <FontAwesomeIcon
                icon={faCircleInfo}
                className={styles.iconPadding}
              />
              Note: Please follow the steps provided in the in the{" "}
              <a
                href="https://github.com/bensaied/ScrapeSense"
                target="_blank"
                rel="noopener noreferrer"
              >
                repository
              </a>{" "}
              to start the Flask app and get an ngrok link.
            </p>
            <button onClick={handleSubmit}>Connect</button>
            {/* Displaying the result */}
            {result && (
              <div className={styles.resultBox}>
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className={styles.validateIcon}
                />
                <pre className={styles.resultText}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
      <div className={styles.bottomIcons}>
        <a
          href="https://github.com/bensaied/ScrapeSense"
          title="GitHub Repository"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faGithub} className={styles.icon} />
        </a>
        <a
          href="https://linkedin.com/in/bensaied"
          title="LinkedIn Profile"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faLinkedin} className={styles.icon} />
        </a>
      </div>
    </div>
  );
}
