"use client";
import Image from "next/image";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { Colab } from "@lobehub/icons";
import styles from "./page.module.css";

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);

  const handleStartClick = () => {
    setIsStarted(true);
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
            <button>Connect</button>
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
