"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import styles from "../src/app/css/clean.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import {
  faCircleInfo,
  faCheckCircle,
  // faXmarkCircle,
  faTimesCircle,
  faArrowRotateLeft,
  // faArrowRight,
  // faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FaSpinner } from "react-icons/fa";
import Button from "@mui/material/Button";
import Papa from "papaparse";
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
  // Step 1 - Import Dataset
  const [importDatasetResult, setImportDatasetResult] = useState(null);
  const [statusFileUpload, setStatusFileUpload] = useState(false);
  const [loading, setLoading] = useState(false);

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
      document.body.style.setProperty("margin-top", "0"); // Reset margin-top
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

  // Handle upload DataSet file
  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (!file) {
      // alert("No file selected.");
      setImportDatasetResult("No file selected.");
      setStatusFileUpload(false);
      return;
    }

    if (file.type !== "text/csv") {
      // alert("Please upload a CSV file.");
      setImportDatasetResult("Please upload a CSV file.");
      setStatusFileUpload(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target.result;
      setLoading(true);

      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const { data, meta } = results;

          if (!meta.fields || meta.fields.length !== 2) {
            setImportDatasetResult(
              "The file must contain exactly two columns: 'Comment' and 'Label'."
            );
            setStatusFileUpload(false);
            setLoading(false);

            return;
          }

          if (
            !meta.fields.includes("Comment") ||
            !meta.fields.includes("Label")
          ) {
            setImportDatasetResult(
              "The CSV file must have columns named 'Comment' and 'Label'."
            );
            setStatusFileUpload(false);
            setLoading(false);

            return;
          } else {
            console.log("Validated CSV data:", data);
            setStatusFileUpload(true);
            setImportDatasetResult("File uploaded and validated successfully!");
            setLoading(false);
          }
        },
        error: (error) => {
          setImportDatasetResult("Error reading the file");
          setStatusFileUpload(false);
          setLoading(false);
        },
      });
    };

    reader.readAsText(file);
  };

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
          <>
            <div>
              <p className={styles.note}>
                <FontAwesomeIcon
                  icon={faCircleInfo}
                  className={styles.iconPadding}
                />
                Note: After exporting your dataset in the previous pipeline and
                <strong className={styles.strong}>
                  {" "}
                  annotating your comments manually
                </strong>
                , you can import it here with two specific columns for the
                cleaning process.
              </p>
              <p>
                {loading && (
                  <div className={styles.loadingContainer}>
                    <FaSpinner className={styles.loadingIcon} />
                    <p>Loading... Uploading and validating file.</p>
                  </div>
                )}

                {importDatasetResult ? (
                  statusFileUpload ? (
                    <span className={styles.noteSuccess}>
                      ✅ {importDatasetResult}
                    </span>
                  ) : (
                    <span className={styles.note1}>
                      ⚠️ {importDatasetResult}
                    </span>
                  )
                ) : (
                  <span className={styles.note1}></span>
                )}

                {/* Your dataset should include two columns: "Comment" and
                "Label" */}
              </p>
            </div>
            <Button
              variant="contained"
              component="label"
              color="primary"
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                backgroundColor: "#1976d2",
                "&:hover": { backgroundColor: "#1565c0" },
              }}
            >
              Upload Data Set
              <input type="file" hidden onChange={handleFileUpload} />
            </Button>
          </>
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
