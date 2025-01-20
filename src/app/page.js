"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import {
  faCircleInfo,
  faCheckCircle,
  faXmarkCircle,
  faTimesCircle,
  // faArrowRotateLeft,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import { Colab } from "@lobehub/icons";
import styles from "./page.module.css";

import APIV3 from "./apiv3";

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);

  const [inputUrl, setInputUrl] = useState("");
  const [flaskStatus, setFlaskStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null);
  const [proceed, setProceed] = useState(false);

  useEffect(() => {
    if (inputUrl && proceed) {
      const checkFlaskReadiness = async (ngrokUrl) => {
        try {
          const formattedNgrokUrl = ngrokUrl.endsWith("/")
            ? ngrokUrl
            : `${ngrokUrl}/`;
          const response = await fetch(`${formattedNgrokUrl}health`);
          if (response.ok) {
            setFlaskStatus(true);
          } else {
            setFlaskStatus(false);
          }
        } catch (error) {
          setFlaskStatus(false);
        }
      };
      checkFlaskReadiness(inputUrl);
    }
  }, [inputUrl, proceed]);

  const checkFlaskReadiness = async (ngrokUrl) => {
    try {
      const formattedNgrokUrl = ngrokUrl.endsWith("/")
        ? ngrokUrl
        : `${ngrokUrl}/`;
      const response = await fetch(`${formattedNgrokUrl}health`);
      if (response.ok) {
        setFlaskStatus(true);
      } else {
        setFlaskStatus(false);
      }
    } catch (error) {
      setFlaskStatus(false);
    }
  };

  console.log(inputUrl);
  const handleStartClick = () => {
    setIsStarted(true);
  };
  const handleInputChange = (e) => {
    setInputUrl(e.target.value); // Update input value when the user types
  };

  const handleSubmit = async () => {
    checkFlaskReadiness(inputUrl);
    // Regular expression to validate a basic URL structure
    const urlPattern =
      /^(https?:\/\/)([a-z0-9-]+\.)+[a-z]{2,6}(:[0-9]+)?(\/[^\s]*)?$/i;

    // Check if the entered URL matches the pattern
    if (!inputUrl || !urlPattern.test(inputUrl)) {
      setStatus("False");
      setResult(
        "Invalid URL. Please make sure the URL is correct and the app is running."
      );
      return;
    }

    try {
      const response = await fetch(inputUrl); // Fetch the result from the URL
      if (!response.ok) {
        setResult(
          "Invalid URL. Please make sure the URL is correct and the app is running."
        );
      }

      console.log(response); // Log the HTML content to the console (or use it in your app)
      if (
        response.status === 200 &&
        response.body.locked === false &&
        response.url === inputUrl &&
        response.url.includes("ngrok-free.app")
      ) {
        setStatus("True");
        setResult(
          "Great! The URL is valid, and your app is running through ngrok"
        );
      } else {
        setStatus("False");
        setResult(
          "Invalid URL. Please make sure the URL is correct and the app is running."
        );
      }
    } catch (error) {
      // console.error("Error fetching data:", error);
      setStatus("False");
      setResult(
        "Invalid URL. Please make sure the URL is correct and the app is running."
      );
      // alert("Failed to fetch data from the URL.");
    }
  };

  return (
    <div className={styles.containerBG}>
      <video autoPlay muted loop>
        <source src="/ScrapeSenseBG.mp4" type="video/mp4" />
      </video>
      <div className={`${styles.container} ${isStarted ? styles.started : ""}`}>
        <Image
          title="ScrapeSense"
          src="/logo.png"
          alt="Logo"
          width={400}
          height={400}
          className={`${styles.logo} ${isStarted ? styles.logoStarted : ""}`}
        />

        {!isStarted && (
          <div className={styles.descriptionBox}>
            <p className={styles.description}>
              Welcome to <strong>ScrapeSense</strong>,
            </p>
            <br />
            <p className={styles.description}>an advanced NLP platform!</p>
            <br />
            <p className={styles.description}>
              Automates sentiment analysis of YouTube Arabic comments.
            </p>
          </div>
        )}
        {!isStarted && (
          <button className={styles.startButton} onClick={handleStartClick}>
            &#9881; Setup ScrapeSense
          </button>
        )}
        {/* Form Box - appears after the logo translation */}
        {isStarted && (
          <>
            {" "}
            <div className={styles.formBox}>
              {!proceed && (
                <>
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
                </>
              )}

              {/* Displaying the result */}
              {result && status === "False" && !proceed ? (
                <>
                  <div className={styles.resultErrorBox}>
                    <FontAwesomeIcon
                      icon={faXmarkCircle}
                      className={styles.errorIcon}
                    />
                    <pre className={styles.resultErrorText}>
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>

                  <div>
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
                      to start the Flask app and get an ngrok link.
                    </p>
                    <button onClick={handleSubmit}>Connect</button>
                  </div>
                </>
              ) : result && status === "True" && !proceed ? (
                <div className={styles.resultValidationBox}>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className={styles.validateIcon}
                  />
                  <pre className={styles.resultValidationText}>
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              ) : null}
              {status === null && !proceed ? (
                <div>
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
                    to start the Flask app and get an ngrok link.
                  </p>
                  <button onClick={handleSubmit}>Connect</button>
                </div>
              ) : status === "True" && !proceed ? (
                <div>
                  <button onClick={() => setProceed(true)}>Proceed</button>
                </div>
              ) : null}
              {proceed && <APIV3 ngrokUrl={inputUrl} />}
              {flaskStatus === true ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className={styles.successIcon}
                  />
                  <span
                    style={{
                      marginLeft: "10px",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "13px",
                      padding: "5px",
                    }}
                  >
                    Flask app: Running
                  </span>
                </div>
              ) : flaskStatus === false ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    className={styles.errorIcon}
                  />
                  <span
                    style={{
                      marginLeft: "10px",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "13px",
                      padding: "5px",
                    }}
                  >
                    Flask app: Not running
                  </span>
                  {/* <Link
                    href={{
                      pathname: "/",
                    }}
                  >
                    <FontAwesomeIcon
                      title="Return to Home"
                      icon={faArrowRotateLeft}
                      className={styles.returnIcon}
                    />
                    <span className={styles.returnText}></span>
                  </Link> */}
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
      <div className={styles.bottomIcons}>
        <a
          href="https://github.com/bensaied/ScrapeSense"
          title="GitHub Repository"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            icon={faGithub}
            className={`${styles.icon} ${styles.github}`}
          />
        </a>
        <a
          href="https://linkedin.com/in/bensaied"
          title="LinkedIn Profile"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            icon={faLinkedin}
            className={`${styles.icon} ${styles.linkedin}`}
          />
        </a>
      </div>
    </div>
  );
}
