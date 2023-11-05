//@ts-nocheck
import { useEffect, useState } from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import TreeChart from "./TreeChart";
import { OrganizationChart } from "primereact/organizationchart";
import Xarrow from "react-xarrows";

import "./App.css";
import {
  BsFillBookmarkFill,
  BsFillCaretDownFill,
  BsFillCaretUpFill,
  BsArrowDown,
  BsArrowUp,
} from "react-icons/bs";
import axios from "axios";

const NegativeOutlierIcon = () => (
  <>
    <span className="text-red-500">
      <BsFillCaretDownFill />
    </span>
  </>
);

const PositiveOutlierIcon = () => (
  <>
    <span className="text-green-500">
      <BsFillCaretUpFill />
    </span>
  </>
);

interface IData {
  band: string;
  range: string;
  uniqueJobs: {
    title: string;
    current_band: string;
    current_grade: string;
    hayScore: number;
    outlierIcon: -1 | 1 | 0;
    stepGapIcon: "High Step Gap" | "Low Step Gap" | "Other Step Gap";
    id: string;
    parentId: string;
  }[];
}

interface IFlattenedData {
  band: string;
  range: string;
  title: string;
  current_band: string;
  current_grade: string;
  hayScore: number;
  outlierIcon: -1 | 1 | 0;
  stepGapIcon: "High Step Gap" | "Low Step Gap" | "Other Step Gap";
  id: string;
  parentId: string;
}

interface ITransformedData {
  label: item.title;
  data: IFlattenedData;
  children: IFlattenedData;
  expanded: true;
}

function Dashboard({ bu }) {
  const [uploadedFile, setUploadedFile] = useState(null);

  const [data, setData] = useState<IData[]>([]); // Initialize data as an empty array
  const [flattenedData, setFlattenedData] = useState([]);
  const [transformedData, setTransformedData] = useState();
  const [specificValue, setSpecificValue] = useState(bu); // Replace with your specific value

  const handleFileChange = (event) => {
    setUploadedFile(event.target.files[0]);
  };

  const handleValueChange = (event) => {
    setSpecificValue(event.target.value);
  };

  const uploadFile = async () => {
    if (uploadedFile) {
      const formData = new FormData();
      formData.append("excel_file", uploadedFile);

      try {
        const response = await axios.post(
          `http://localhost:8000/api/process_excel/?specific_value=${specificValue}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Assuming the API response is in the expected format
        setData(response.data);
        console.log("data", data);
      } catch (error) {
        console.error("Error uploading and processing file:", error);
      }
    } else {
      console.error("No file selected");
    }
  };

  function flattenUniqueJobs(data: IData[]) {
    // Create an empty array to store the flattened uniqueJobs
    const flattenedJobs: IFlattenedData = [];

    // Iterate through the bands in the data
    data.forEach((band) => {
      // Iterate through the uniqueJobs in each band
      band.uniqueJobs.forEach((job) => {
        // Push each job into the flattenedJobs array
        flattenedJobs.push(job);
      });
    });

    return flattenedJobs;
  }

  function transformData(inputData: IFlattenedData[]) {
    // Create an object to map IDs to their respective objects
    const idMap = {};
    const result = [];

    // Create a map of objects using their IDs
    inputData.forEach((item) => {
      idMap[item.id] = {
        label: item.title,
        data: item,
        children: [],
        expanded: true,
      };
    });

    // Build the hierarchy based on parentId
    inputData.forEach((item) => {
      if (item.parentId) {
        const parent = idMap[item.parentId];
        if (parent) {
          parent.children.push(idMap[item.id]);
        } else {
          result.push(idMap[item.id]);
        }
      } else {
        result.push(idMap[item.id]);
      }
    });

    return result;
  }

  useEffect(() => {
    console.log("data", data);

    setFlattenedData(flattenUniqueJobs(data));
  }, [data]);

  useEffect(() => {
    console.log("flat", flattenedData);
    setTransformedData(transformData(flattenedData));
  }, [flattenedData]);

  useEffect(() => {
    console.log("trnsformed", transformedData);
  }, [transformedData]);

  const nodeTemplate = (node) => {
    return (
      <div
        className={`w-full h-full flex flex-column  ${
          (node.data.stepGapIcon == "High Step Gap" ? "bg-blue-200" : node,
          data.stepGapIcon == "Low Step Gap" ? "bg-yellow-200" : "")
        } `}
      >
        <div className=" font-medium text-xs">
          {" "}
          {node.data.outlierIcon === -1 ? (
            <NegativeOutlierIcon />
          ) : node.data.outlierIcon === 1 ? (
            <PositiveOutlierIcon />
          ) : (
            <></>
          )}
          {node.label}
        </div>
        <span alt={node.label} className="text-xs font-bold">
          ({node.data.current_grade})
        </span>
        <br />
        <span alt={node.label} className="text-xs">
          {node.data.hayScore}
        </span>
        {node.data.stepGapicon == "High Step Gap" ? (
          <div
            className="bg-blue-200"
            style={{ width: "20px", height: "20px" }}
          ></div>
        ) : node.data.stepGapIcon == "Low Step Gap" ? (
          <div
            className="bg-yellow-200"
            style={{
              opacity: "0.3",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          ></div>
        ) : (
          <></>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="sticky left-0">
        {/* Create a simple file input field for XLSX file upload */}
        <input type="file" accept=".xlsx" onChange={handleFileChange} />
        <input
          type="text"
          defaultValue={specificValue}
          className="ring-2 ring-gray-400 rounded"
          onChange={handleValueChange}
        />
        <button
          onClick={uploadFile}
          className="ml-2 bg-green-400 rounded px-2 py-1"
        >
          Upload
        </button>
        <div className="header container p-10">
          <div className="flex ">
            <h1 className="text-3xl text-green-900 ">
              Emerging Relativity of roles – SBUs ({specificValue})
            </h1>
            <div className="legend-outlier flex gap-4">
              <div className="flex-col gap-4 my-2">
                <span className="inline-flex gap-3">
                  <NegativeOutlierIcon />
                  <small className="text-xs">Negative Outlier</small>
                </span>
                <span className="flex gap-3">
                  <PositiveOutlierIcon />
                  <small className="text-xs">Positive Outlier</small>
                </span>
              </div>
              <div className="flex-col gap-2">
                <span className=" inline-flex  gap-2 my-2">
                  <div style={{ width: "20px" }} className=" bg-blue-200">
                    {" "}
                  </div>
                  <small className="text-xs">High Step-Gap</small>
                </span>
                <span className="flex gap-2">
                  <div style={{ width: "20px" }} className=" bg-yellow-200" />
                  <small className="text-xs">Low Step-Gap</small>
                </span>
              </div>
              <div className="flex-col gap-2 my-2">
                <span className="text-green-800 inline-flex  gap-2">
                  <BsFillBookmarkFill />
                  <small className="text-xs">High Span of Control</small>
                </span>
                <span className="text-red-800 flex gap-2">
                  <BsFillBookmarkFill />
                  <small className="text-xs">Low Span of Control</small>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="chart">
        <div className=" ">
          {data.map((item, index) => (
            <div className="  z-5 ">
              <div key={index} className="flex items-center ">
                <div className="left-labels left-0 sticky">
                  <div className="h-4rem w-full bg-lime-400 ">
                    <div className="flex">
                      <small className=" -rotate-90 flex align-items-center justify-content-center  h-4rem font-bold  py-2">
                        {item.band}
                      </small>
                      <small className="-rotate-90 text-xs flex align-items-center justify-content-center  h-4rem   font-bold py-2 text-gray-600">
                        {item.range}
                      </small>
                      {/* <span className="h-36 text-gray-300 flex flex-col   justify-between">
                        <BsArrowUp size={30} />
                        <small className="  text-base font-bold py-2 text-gray-600">
                          {item.percentage}%
                        </small>
                        <BsArrowDown size={30} />
                      </span> */}
                    </div>
                  </div>
                </div>
                {/* <pre className="bg-red-200">{JSON.stringify(item)}</pre> */}
                {/* <div
                  className={`flex ${
                    item?.uniqueJobs.length < 10
                      ? "justify-center w-screen"
                      : ""
                  }  gap-2 text-xs`}
                >
                  {item?.uniqueJobs.map((job, jobIndex) => (
                    <div
                      key={jobIndex}
                      style={{
                        position: "relative",
                        left: "100px",
                        bottom: 0,
                        backgroundColor: getRandomColor(job.parentId),
                        top: `-${job.hayScore * 0.023}` + "px",
                      }}
                      className="w-36 h-24 px-2 py-1 ring-gray-300 ring-1 gap-4"
                    >
                      {job.outlierIcon === -1 ? (
                        <NegativeOutlierIcon />
                      ) : job.outlierIcon === 1 ? (
                        <PositiveOutlierIcon />
                      ) : (
                        <></>
                      )}
                      {job.title}
                      <br />
                      <small className="font-bold">{job.hayScore}</small>
                      <br />
                      <small className="font-bold">{job.id}</small>
                      {" / "}
                      <small className="font-bold">{job.parentId}</small>
                    </div>
                  ))}
                </div> */}
              </div>
              {/* ...dotted line... */}
              {/* <hr className="my-2" /> */}
              <div className="my-6"></div>
            </div>
          ))}
        </div>
        {/* <div className="h-screen absolute left-[100px] top-[500px]">
          <TreeChart jsonData={data} />
        </div> */}
      </section>
      <div className="absolute top-X">
        {data.length > 0 &&
        flattenedData.length > 0 &&
        transformedData.length > 0 ? (
          <OrganizationChart
            value={transformedData}
            nodeTemplate={nodeTemplate}
          />
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default Dashboard;
