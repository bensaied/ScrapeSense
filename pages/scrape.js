"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import styles from "../src/app/css/scrape.module.css";
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
import { FaSpinner } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import { useDemoData } from "@mui/x-data-grid-generator";
import { Box } from "@mui/material";

const PipilineScrape = () => {
  // Router
  const router = useRouter();
  const { ngrokUrl, apiKey } = router.query;
  // Flask Status
  const [flaskStatus, setFlaskStatus] = useState(null);
  // Pipeline Stage Status (1-2)
  const [currentStage, setCurrentStage] = useState(1);
  //FormBox: Search Videos
  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState();
  const [updateFormQuery, setUpdateFormQuery] = useState(null);
  const [updateFormMaxVid, setUpdateFormMaxVid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultForm, setResultForm] = useState(null);
  const [statusForm, setStatusForm] = useState(null);
  //Table: Display and Export Data
  const [videosData, setVideosData] = useState([]);
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
    if (
      rawData &&
      Array.isArray(rawData.comments) &&
      Array.isArray(rawData.videos)
    ) {
      rawData.comments.forEach((comment) => {
        const video = rawData.videos.find((v) => v.id === comment.video_id);

        const videoTitle = video ? video.title : "Unknown Video";
        rows.push({
          id: comment.comment_id, // Unique ID for the comment
          VideoTitle: videoTitle,
          Comment: comment.text,
          PublishDate: new Date(comment.published_at).toLocaleString(), // Format date
          Likes: comment.like_count,
        });
      });
    } else {
      console.error("rawData does not contain a valid 'comments' array.");
    }

    return rows;
  };
  const rows = useMemo(() => mapDataToRows(videosData), [videosData]);
  const columns = [
    { field: "VideoTitle", headerName: "Video Title", width: 280 },
    { field: "Comment", headerName: "Comment", width: 620 },
    { field: "PublishDate", headerName: "Publish Date", width: 200 },
    { field: "Likes", headerName: "Likes", width: 100 },
  ];

  const VISIBLE_FIELDS = ["VideoTitle", "Comment", "PublishDate", "Likes"]; // Fields you want to display

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

  console.log("router.query", router.query);
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

  //HandleSubmitForm: Search Videos
  const handleSubmitForm = async (e) => {
    if (
      !videosData ||
      query !== updateFormQuery ||
      maxResults !== updateFormMaxVid
    ) {
      setUpdateFormQuery(query);
      setUpdateFormMaxVid(maxResults);
      e.preventDefault();

      if (!query || !maxResults) {
        setStatusForm("Failed");
        setResultForm(
          "Please complete the form. Query and Max Videos Results cannot be empty."
        );
        return;
      }

      // POST API Form Search Videos to Flask Endpoint
      const formattedNgrokUrl = ngrokUrl.endsWith("/")
        ? ngrokUrl
        : `${ngrokUrl}/`;

      try {
        setLoading(true);

        const response = await fetch(`${formattedNgrokUrl}searchVideos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: query,
            max_results: maxResults,
            developerKey: apiKey,
          }),
        });

        const data = await response.json();
        setVideosData(data);
        console.log("data :", data);
        if (response.ok) {
          setStatusForm("Success");
          setResultForm("Your query has been submitted successfully.");
          setCurrentStage(2);
        } else {
          setStatusForm("Failed");
          setResultForm(
            "Problem submitting your query. Please try again later."
          );
        }
      } catch (error) {
        //   console.error("Error:", error);
        setStatusForm("Failed");
        setResultForm(
          "Please complete the form. Query and Max Videos Results cannot be empty."
        );
      } finally {
        setLoading(false); // End loading after the response is received or if there's an error
      }
    } else {
      setCurrentStage(2);
    }
  };
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
          Pipeline 1: YouTube Comments Data Scraping
        </h2>
        {/* Pipeline 1 */}
        <div className={styles.pipeline}>
          <div
            className={`${styles.stage} ${
              currentStage >= 1 ? styles.enabled : styles.disabled
            }`}
            data-title="Search Videos"
          >
            1
          </div>
          <div className={styles.connector}></div>
          <div
            className={`${styles.stage} ${
              currentStage >= 2 ? styles.enabled : styles.disabled
            }`}
            data-title="Display and Export Data"
          >
            2
          </div>
        </div>
        {currentStage === 1 ? (
          <>
            {/* First Step: Search Videos */}
            <div className={styles.formBox}>
              <strong>Complete the Form</strong>{" "}
              <input
                type="text"
                placeholder="Query"
                className={styles.formInput}
                value={query || ""}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
              />
              <input
                type="number"
                placeholder="Max Videos Results"
                className={styles.formInput}
                value={maxResults}
                onChange={(e) => {
                  setMaxResults(e.target.value);
                }}
              />
            </div>
            <div className={styles.buttonContainerStep1}>
              <button
                title="Proceed to Step 2"
                className={styles.proceedButton}
                onClick={handleSubmitForm}
              >
                {" "}
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
              <br />
            </div>
            {loading && (
              <div className={styles.loadingContainer}>
                <FaSpinner className={styles.loadingIcon} />
                <p>Loading... Please wait while we process your query.</p>
              </div>
            )}
            {resultForm && statusForm === "Success" && !loading ? (
              <div
                style={{
                  color: "red",
                  fontSize: "1.1em",
                  marginTop: "8px",
                  marginBottom: "8px",
                }}
              >
                {resultForm}
              </div>
            ) : resultForm && statusForm === "Failed" && !loading ? (
              <div
                style={{
                  color: "red",
                  fontSize: "1.1em",
                  marginTop: "8px",
                  marginBottom: "8px",
                }}
              >
                {resultForm}
              </div>
            ) : null}
          </>
        ) : currentStage === 2 ? (
          /* Second Step: Fetch Video Details */
          <>
            {" "}
            <div className={styles.formBoxStep2}>
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
            <div className={styles.buttonContainerStep2}>
              <button
                title="Return to Step 1"
                className={styles.proceedButton}
                onClick={() => {
                  setCurrentStage(1);
                  setNextPipeline(false);
                  setStatusForm(null);
                }}
              >
                {" "}
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              {nextPipeline ? (
                <Link
                  href={{
                    pathname: "/clean",
                    query: { ngrokUrl, apiKey },
                  }}
                >
                  <button
                    title="Proceed to the second pipeline"
                    className={styles.proceedButton}
                    onClick={handleSubmitForm}
                  >
                    {" "}
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </Link>
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

export default PipilineScrape;
