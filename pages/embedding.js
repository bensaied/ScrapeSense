"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import styles from "../src/app/css/embedding.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import {
  faCircleInfo,
  faCheckCircle,
  // faXmarkCircle,
  faTimesCircle,
  faArrowRotateLeft,
  faArrowRight,
  faArrowLeft,
  // faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FaSpinner, FaBroom } from "react-icons/fa";
import Button from "@mui/material/Button";
import Papa from "papaparse";
import Image from "next/image";
import Link from "next/link";
import { Chart } from "chart.js/auto";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box } from "@mui/material";
// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import { useDemoData } from "@mui/x-data-grid-generator";

const PipilineEmbedding = () => {
  // Router
  const router = useRouter();
  const { ngrokUrl, apiKey } = router.query;
  // Flask Status
  const [flaskStatus, setFlaskStatus] = useState(null);
  // Pipeline Stage Status (1-2)
  const [currentStage, setCurrentStage] = useState(1);
  // Step 1 - Select Method

  useEffect(() => {
    document.title = "ScrapeSense";
  }, []);
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("display", "flex");
      document.body.style.setProperty("flex-direction", "column");
      document.body.style.setProperty("margin", "0");
      document.body.style.setProperty("padding", "0");
      document.body.style.setProperty("min-height", "100vh");
      document.body.style.setProperty("margin-top", "0");
    }
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
        <h2 className={styles.pipelineTitle}>Pipeline 3: Word Embedding</h2>
        {/* Pipeline 3 */}
        <div className={styles.pipeline}>
          <div
            className={`${styles.stage} ${
              currentStage >= 1 ? styles.enabled : styles.disabled
            }`}
            data-title="Select Method"
          >
            1
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${
              currentStage >= 2 ? styles.enabled : styles.disabled
            }`}
            data-title="Set Parameters"
          >
            2
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${
              currentStage >= 3 ? styles.enabled : styles.disabled
            }`}
            data-title="Run Embedding"
          >
            3
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${
              currentStage >= 4 ? styles.enabled : styles.disabled
            }`}
            data-title="View Results"
          >
            4
          </div>
        </div>

        {currentStage === 1 ? (
          <>
            <button
              title="Proceed to Step 2"
              className={styles.proceedButtonStep1}
              onClick={() => setCurrentStage(2)}
            >
              {" "}
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </>
        ) : currentStage === 2 ? (
          /* Second Step: Data Inspection */
          <>
            <div className={styles.buttonContainer}>
              <button
                title="Return to Step 1"
                className={styles.proceedButton}
                onClick={() => setCurrentStage(1)}
              >
                {" "}
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <button
                title="Proceed to Step 3"
                className={styles.proceedButton}
                onClick={() => setCurrentStage(3)}
              >
                {" "}
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </>
        ) : currentStage === 3 ? (
          <>
            <div className={styles.buttonContainer}>
              <button
                title="Return to Step 2"
                className={styles.proceedButton}
                onClick={() => setCurrentStage(2)}
              >
                {" "}
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>

              <button
                title="Proceed to Step 4"
                className={styles.proceedButton}
                onClick={() => setCurrentStage(4)}
              >
                {" "}
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </>
        ) : currentStage === 4 ? (
          <>
            <div className={styles.buttonContainer}>
              <button
                title="Return to Step 3"
                className={styles.proceedButton}
                onClick={() => setCurrentStage(3)}
              >
                {" "}
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>

              <button
                title="Proceed to the fourth pipeline"
                className={styles.proceedButton}
              >
                {" "}
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </>
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
    </div>
  );
};

export default PipilineEmbedding;
