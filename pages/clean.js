"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import styles from "../src/app/css/clean.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import {
  // faCircleInfo,
  faCheckCircle,
  // faXmarkCircle,
  faTimesCircle,
  faArrowRotateLeft,
  faArrowRight,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
// import { FaSpinner } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import { useDemoData } from "@mui/x-data-grid-generator";
// import { Box } from "@mui/material";

const PipilineClean = () => {
  // Router
  const router = useRouter();
  const { ngrokUrl, apiKey } = router.query;
  // Flask Status
  const [flaskStatus, setFlaskStatus] = useState(null);
  // Pipeline Stage Status (1-2)
  const [currentStage, setCurrentStage] = useState(1);

  useEffect(() => {
    document.title = "ScrapeSense";
  }, []);
  useEffect(() => {
    if (router.query) {
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
      checkFlaskReadiness(router.query.ngrokUrl);
    }
  }, [router.query]);

  // const checkFlaskReadiness = async (ngrokUrl) => {
  //   try {
  //     const formattedNgrokUrl = ngrokUrl.endsWith("/")
  //       ? ngrokUrl
  //       : `${ngrokUrl}/`;
  //     const response = await fetch(`${formattedNgrokUrl}health`);
  //     if (response.ok) {
  //       setFlaskStatus(true);
  //     } else {
  //       setFlaskStatus(false);
  //     }
  //   } catch (error) {
  //     setFlaskStatus(false);
  //   }
  // };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        {/* <Link
            href={{
              pathname: "/",
            }}
          > */}
        <Image
          title="ScrapeSense"
          src="/logo.png"
          alt="Logo"
          width={400}
          height={400}
          className={`${styles.logo} }`}
        />
        {/* </Link> */}
      </div>
      <div className={styles.pipelineContainer}>
        <h2 className={styles.pipelineTitle}>
          Pipeline 2: YouTube Comments Data Cleaning
        </h2>
        {/* Pipeline 2 */}
        <div className={styles.pipeline}>
          <div
            className={`${styles.stage} ${
              currentStage >= 1 ? styles.enabled : styles.disabled
            }`}
            data-title="Import Dataset"
          >
            1
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${
              currentStage >= 2 ? styles.enabled : styles.disabled
            }`}
            data-title="Data Inspection"
          >
            2
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${
              currentStage >= 2 ? styles.enabled : styles.disabled
            }`}
            data-title="Clean Data"
          >
            3
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${
              currentStage >= 2 ? styles.enabled : styles.disabled
            }`}
            data-title="Preview Cleaned Dataset"
          >
            4
          </div>
        </div>
        {currentStage === 1 ? (
          <></>
        ) : currentStage === 2 ? (
          /* Second Step: Data Inspection */
          <></>
        ) : null}
        <div className={styles.statusFlask}>
          {flaskStatus === true ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <FontAwesomeIcon
                icon={faCheckCircle}
                className={styles.successIcon}
              />
              <span className={styles.statusText}>Flask app: Running</span>
            </div>
          ) : flaskStatus === false ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <FontAwesomeIcon
                icon={faTimesCircle}
                className={styles.errorIcon}
              />
              <span className={styles.statusText}>Flask app: Not running</span>
              <Link
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
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {/* <div className={styles.bottomIcons}>
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
        </div> */}
    </div>
  );
};

export default PipilineClean;
