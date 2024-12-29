"use client";
import { useState, useEffect, useRef, useMemo } from "react";
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

const PipilineClean = () => {
  // Router
  const router = useRouter();
  const { ngrokUrl, apiKey } = router.query;
  // Flask Status
  const [flaskStatus, setFlaskStatus] = useState(null);
  // Pipeline Stage Status (1-5)
  const [currentStage, setCurrentStage] = useState(1);
  // Step 1 - Import Dataset
  const [importDatasetResult, setImportDatasetResult] = useState(null);
  const [statusFileUpload, setStatusFileUpload] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [loading, setLoading] = useState(false);
  // Step 2 - Data Inspection
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  // Step 3 - Clean Data
  const [cleanedData, setCleanedData] = useState([]);
  const [statusClean, setStatusClean] = useState(false);
  const [resultClean, setResultClean] = useState(null);
  // Step 4 - Tokenization
  const [tokenizedData, setTokenizedData] = useState([]);
  const [statusTokenize, setStatusTokenize] = useState(false);
  const [resultTokenize, setResultTokenize] = useState(null);
  // Step 5 - Preview Dataset
  const [nextPipeline, setNextPipeline] = useState(false);
  // Custom toolbar component
  const CustomToolbar = () => (
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <GridToolbar />
    </Box>
  );

  const mapDataToRows = (rawData) => {
    const rows = [];
    console.log("rawData", rawData);
    if (rawData && Array.isArray(rawData) && rawData.length > 0) {
      rawData.forEach((dataItem, index) => {
        const { Comment, Label } = dataItem;
        const uniqueId = `comment-${index + 1}`;

        rows.push({
          id: uniqueId,
          Comment: Comment,
          Label: Label,
        });
      });
    } else {
      console.error("rawData does not contain a valid 'comments' array.");
    }

    return rows;
  };
  const rows = useMemo(() => mapDataToRows(tokenizedData), [tokenizedData]);
  const columns = [
    { field: "Comment", headerName: "Comment", width: 1150 },
    { field: "Label", headerName: "Label", width: 100 },
  ];

  const VISIBLE_FIELDS = ["Comment", "Label"];

  // Filter columns based on the visible fields
  const filteredColumns = useMemo(
    () => columns.filter((col) => VISIBLE_FIELDS.includes(col.field)),
    []
  );
  // You can also modify column properties like disabling filters for certain fields
  const modifiedColumns = useMemo(
    () =>
      filteredColumns.map((col) =>
        col.field === "rating" ? { ...col, filterable: false } : col
      ),
    [filteredColumns]
  );

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

  const labels = [...new Set(importedData.map((row) => row.Label))];
  const commentCounts = labels.map(
    (label) => importedData.filter((row) => row.Label === label).length
  );

  // useEffect for Data Inspection
  useEffect(() => {
    if (currentStage === 2 && chartRef.current) {
      const numRows = importedData.length;
      const numMissingComments = importedData.filter(
        (row) => !row.Comment
      ).length;
      const numMissingLabels = importedData.filter((row) => !row.Label).length;

      const labels = [...new Set(importedData.map((row) => row.Label))];
      const commentCounts = labels.map(
        (label) => importedData.filter((row) => row.Label === label).length
      );
      const chartData = {
        labels,
        datasets: [
          {
            label: "Comment Count by Label",
            data: commentCounts,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      };

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(chartRef.current, {
        type: "bar",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  }, [currentStage, importedData]);

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
            setImportedData(data);
            setStatusFileUpload(true);
            setImportDatasetResult("File uploaded and validated successfully!");
            setLoading(false);

            // Optional: Plot sentiment distribution (you can use a charting library like d3.js or Chart.js for this)
            // For now, let's just log the sentiment counts
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

  // Handle Data Cleaning
  const handleCleanData = async (e) => {
    e.preventDefault();

    if (!importedData) {
      setStatusClean(false);
      setResultClean("There is no data to clean.");
      // console.log("There is no data to clean.");

      return;
    }

    try {
      setLoading(true);

      const formattedNgrokUrl = ngrokUrl.endsWith("/")
        ? ngrokUrl
        : `${ngrokUrl}/`;

      // POST the uploaded data to the Flask cleaning endpoint
      const response = await fetch(`${formattedNgrokUrl}clean`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(importedData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Cleaned Data:", data.cleanedData);
        setCleanedData(data.cleanedData); // Handle cleaned data
        setImportedData(data.cleanedData); // Update imported data with cleaned data
        setStatusClean(true);
        setResultClean("Your data has been cleaned successfully.");
      } else {
        // console.error("Error:", data);
        setStatusClean(false);
        setResultClean("There is no data to clean.");
      }
    } catch (error) {
      // console.error("Error:", error);
      setStatusClean(false);
      setResultClean("Your Flask app is down.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Data Tokenization
  const handleTokenizeData = async (e) => {
    e.preventDefault();

    if (!cleanedData) {
      setStatusTokenize(false);
      setResultTokenize("There is no data to tokenize.");
      // console.log("There is no data to tokenize.");
      return;
    }

    try {
      setLoading(true);

      const formattedNgrokUrl = ngrokUrl.endsWith("/")
        ? ngrokUrl
        : `${ngrokUrl}/`;

      // POST the cleaned data to the Flask tokenization endpoint
      const response = await fetch(`${formattedNgrokUrl}tokenize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Tokenized Data:", data.tokenizedData);
        setTokenizedData(data.tokenizedData); // Handle tokenized data
        // setImportedData(data.tokenizedData);
        setStatusTokenize(true);
        setResultTokenize("Your data has been tokenized successfully.");
      } else {
        // console.error("Error:", data);
        setStatusTokenize(false);
        setResultTokenize("There is no data to tokenize.");
      }
    } catch (error) {
      // console.error("Error:", error);
      setStatusTokenize(false);
      setResultTokenize("Your Flask app is down.");
    } finally {
      setLoading(false);
    }
  };

  // Proceed to the next Pipeline 'Embedding'
  const proceedToEmbedding = () => {
    router.push(
      {
        pathname: "/embedding",
        query: { ngrokUrl, apiKey },
      },
      `/embedding?ngrokUrl=${encodeURIComponent(
        ngrokUrl
      )}&apiKey=${encodeURIComponent(apiKey)}`,
      {
        shallow: true,
      }
    );
    // Store tokenizedData in sessionStorage or another client-side state manager
    if (tokenizedData) {
      sessionStorage.setItem("tokenizedData", JSON.stringify(tokenizedData));
    }
    if (cleanedData) {
      sessionStorage.setItem("cleanedData", JSON.stringify(cleanedData));
    }
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
              currentStage >= 3 ? styles.enabled : styles.disabled
            }`}
            data-title="Clean Data"
          >
            3
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${
              currentStage >= 4 ? styles.enabled : styles.disabled
            }`}
            data-title="Tokenization"
          >
            4
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${
              currentStage >= 5 ? styles.enabled : styles.disabled
            }`}
            data-title="Preview Dataset"
          >
            5
          </div>
        </div>

        {currentStage === 1 ? (
          <>
            <div className={styles.importDataContainer}>
              <h2 className={styles.importDataTitle}>Import Your Dataset</h2>
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
                    <span className={styles.noteError}>
                      ⚠️ {importDatasetResult}
                    </span>
                  )
                ) : (
                  <span className={styles.noteError}></span>
                )}

                {/* Your dataset should include two columns: "Comment" and
                "Label" */}
              </p>
              <Button
                variant="contained"
                component="label"
                color="info"
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
            </div>

            {statusFileUpload && (
              <button
                title="Proceed to Step 2"
                className={styles.proceedButtonStep1}
                onClick={() => setCurrentStage(2)}
              >
                {" "}
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            )}
          </>
        ) : currentStage === 2 ? (
          /* Second Step: Data Inspection */
          <>
            {" "}
            <div className={styles.reportContainer}>
              <div className={styles.report}>
                <div className={styles.reportContent}>
                  <table className={styles.reportTable}>
                    <tbody>
                      <tr>
                        <td>Number of Rows</td>
                        <td>{importedData.length}</td>
                      </tr>
                      <tr
                        className={
                          importedData.filter((row) => !row.Comment).length > 0
                            ? styles.warning
                            : ""
                        }
                      >
                        <td>Missing Comments</td>
                        <td>
                          {importedData.filter((row) => !row.Comment).length}
                        </td>
                      </tr>
                      <tr
                        className={
                          importedData.filter((row) => !row.Label).length > 0
                            ? styles.warning
                            : ""
                        }
                      >
                        <td>Missing Labels</td>
                        <td>
                          {importedData.filter((row) => !row.Label).length}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className={styles.legendContainer}>
                    <table className={styles.legendTable}>
                      <thead>
                        <tr>
                          <th>Label</th>
                          <th>Number of Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {labels.map((label, index) => (
                          <tr key={index}>
                            <td>{label}</td>
                            <td>{commentCounts[index]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className={styles.chartContainer}>
                <canvas ref={chartRef}></canvas>
              </div>
            </div>
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
            <div className={styles.dataCleaningStep}>
              <h2 className={styles.dataCleaningTitle}>
                Preview of Cleaning Changes
              </h2>

              <p className={styles.dataCleaningDescription}>
                <FontAwesomeIcon
                  icon={faCircleInfo}
                  className={styles.iconPadding}
                />{" "}
                Note: Your uploaded data will be cleaned by following these
                steps:
              </p>
              <ul className={styles.dataCleaningSteps}>
                <li>
                  1. Remove rows with empty <b>Comment</b> or <b>Label</b>{" "}
                  columns.
                </li>
                <li>2. Remove all non-Arabic characters and punctuation.</li>
                <li>
                  3. Clean the text by eliminating unnecessary spaces and
                  specific words (e.g., "و").
                </li>
              </ul>
              {/* Loading Indicator */}
              {loading && (
                <div className={styles.loadingContainer}>
                  <FaSpinner className={styles.loadingIcon} />
                  <p
                    style={{
                      fontSize: "0.9em",
                      marginTop: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    Cleaning in progress...
                  </p>
                </div>
              )}
              {/* Result Status */}

              {resultClean && !loading ? (
                statusClean ? (
                  <>
                    <span className={styles.noteSuccessStep3}>
                      ✅ {resultClean}
                    </span>
                    <p
                      style={{
                        color: "#1976d2",
                        marginTop: "5px",
                        marginBottom: "5px",
                        fontSize: "0.9em",
                        textAlign: "center",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className={styles.iconPadding}
                      />{" "}
                      You can re-inspect your cleaned data by returning to the
                      previous step.
                    </p>
                  </>
                ) : (
                  <span className={styles.noteErrorStep3}>
                    ❌ {resultClean}
                  </span>
                )
              ) : null}
              <div className={styles.dataCleaningButtonContainer}>
                <button
                  className={styles.dataCleaningButton}
                  onClick={handleCleanData}
                >
                  <FaBroom /> Clean Data
                </button>
              </div>
            </div>
            <div className={styles.buttonContainer}>
              <button
                title="Return to Step 2"
                className={styles.proceedButton}
                onClick={() => setCurrentStage(2)}
              >
                {" "}
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              {statusClean && (
                <button
                  title="Proceed to Step 4"
                  className={styles.proceedButton}
                  onClick={() => setCurrentStage(4)}
                >
                  {" "}
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              )}
            </div>
          </>
        ) : currentStage === 4 ? (
          <>
            {" "}
            <div className={styles.tokenizationStep}>
              <h3 className={styles.tokenizationTitle}>
                Transform Comments into Word Lists
              </h3>
              <p className={styles.tokenizationDescription}>
                <FontAwesomeIcon
                  icon={faCircleInfo}
                  className={styles.iconPadding}
                />{" "}
                Note: In this step, each comment{" "}
                <strong className={styles.strong}>
                  {" "}
                  will be split into a list of individual words
                </strong>
                , preparing the data for advanced analysis.
                <div style={{ marginTop: "25px", marginBottom: "25px" }} />
                Click the button below to tokenize your data.
              </p>
              {loading && (
                <div className={styles.loadingContainer}>
                  <FaSpinner className={styles.loadingIcon} />
                  <p
                    style={{
                      fontSize: "0.9em",
                      marginTop: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    Tokenizing in progress...
                  </p>
                </div>
              )}
              {resultTokenize && !loading ? (
                statusTokenize ? (
                  <>
                    <span className={styles.noteSuccessStep3}>
                      ✅ {resultTokenize}
                    </span>
                    <p
                      style={{
                        color: "#1976d2",
                        marginTop: "5px",
                        marginBottom: "5px",
                        fontSize: "0.9em",
                        textAlign: "center",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className={styles.iconPadding}
                      />{" "}
                      You can preview your tokenized data in the next step.
                    </p>
                  </>
                ) : (
                  <span className={styles.noteErrorStep3}>
                    ❌ {resultTokenize}
                  </span>
                )
              ) : null}
              <div className={styles.tokenizationButtonContainer}>
                <button
                  className={styles.tokenizationButton}
                  onClick={handleTokenizeData}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    style={{ width: "20px", height: "20px" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.75 4.75h14.5v14.5H4.75zM9.25 6.75v6.5M14.75 10.25v3M12 6.75v10.5"
                    />
                  </svg>{" "}
                  Tokenize Data
                </button>
              </div>
            </div>
            <div className={styles.buttonContainer}>
              <button
                title="Return to Step 3"
                className={styles.proceedButton}
                onClick={() => setCurrentStage(3)}
              >
                {" "}
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              {statusTokenize && (
                <button
                  title="Proceed to Step 5"
                  className={styles.proceedButton}
                  onClick={() => setCurrentStage(5)}
                >
                  {" "}
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              )}
            </div>
          </>
        ) : currentStage === 5 ? (
          <>
            {" "}
            <div className={styles.tablePreview}>
              {/* <div className={styles.tableContainer}> */}
              <div style={{ height: 280, width: "100%" }}>
                <DataGrid
                  rows={rows}
                  columns={modifiedColumns}
                  slots={{ toolbar: CustomToolbar }}
                  loading={false}
                  density="compact"
                />
              </div>
            </div>
            <label>
              <input
                onClick={() => setNextPipeline(!nextPipeline)}
                type="checkbox"
                name="exportConfirmation"
                required
              />{" "}
              I confirm that I have exported my data as a CSV file.
            </label>
            <div className={styles.buttonContainerStep5}>
              <button
                title="Return to Step 4"
                className={styles.proceedButton}
                onClick={() => {
                  setCurrentStage(4);
                  setNextPipeline(false);
                }}
              >
                {" "}
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              {nextPipeline ? (
                <button
                  title="Proceed to the third pipeline"
                  className={styles.proceedButton}
                  onClick={proceedToEmbedding}
                >
                  {" "}
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              ) : null}

              <br />
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
