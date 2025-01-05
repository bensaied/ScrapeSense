import React from "react";
import styles from "../app/css/TableComponent.module.css";

const TableComponent = ({
  scrapedData,
  invalidValues,
  cleanedComments,
  cleanedLabels,
  embeddingComments,
  embeddingFeatures,
  embeddingMethod,
}) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Data</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {/* Scraped Data */}
          <tr>
            <td rowSpan="2">Scraped Data</td>
            <td>
              Comments Number:{" "}
              <span className={styles.value}>{scrapedData}</span>
            </td>
          </tr>
          <tr>
            <td>
              Invalid Values:{" "}
              <span className={styles.value}>{invalidValues}</span>
            </td>
          </tr>

          {/* Cleaned Data */}
          <tr>
            <td rowSpan="2">Cleaned Data</td>
            <td>
              Comments Number:{" "}
              <span className={styles.value}>{cleanedComments}</span>
            </td>
          </tr>
          <tr>
            <td>
              Labels: <span className={styles.value}>{cleanedLabels}</span>
            </td>
          </tr>

          {/* Embedding Data */}
          <tr>
            <td rowSpan="3">Embedding Data</td>
            <td>
              Embedding Comments:{" "}
              <span className={styles.value}>{embeddingComments}</span>
            </td>
          </tr>
          <tr>
            <td>
              Features:{" "}
              <span className={styles.value}>{embeddingFeatures}</span>
            </td>
          </tr>
          <tr>
            <td>
              Method: <span className={styles.value}>{embeddingMethod}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;
