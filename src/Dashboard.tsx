//@ts-nocheck
import { useEffect, useState } from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import TreeChart from "./TreeChart";
import { OrganizationChart } from "primereact/organizationchart";

import "./App.css";
import {
  BsFillBookmarkFill,
  BsFillCaretDownFill,
  BsFillCaretUpFill,
  BsArrowDown,
  BsArrowUp,
} from "react-icons/bs";
import axios from "axios";
import Xarrow, { Xwrapper, useXarrow } from "react-xarrows";
import Draggable from "react-draggable";

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

const colorMap = {}; // To store colors for each parent_id

function getRandomColor(parentId) {
  if (colorMap[parentId]) {
    return colorMap[parentId];
  }

  // Generate a random color with a minimum brightness level
  const minBrightness = 40; // Adjust this value as needed
  let randomColor;

  do {
    randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
  } while (getBrightness(randomColor) < minBrightness);

  colorMap[parentId] = randomColor;

  return randomColor;
}
// Function to calculate brightness (assuming a hex color)
function getBrightness(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function Dashboard({ bu }) {
  const [uploadedFile, setUploadedFile] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [data, setData] = useState<
    {
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
    }[]
  >([]); // Initialize data as an empty array

  const [specificValue, setSpecificValue] = useState(bu); // Replace with your specific value
  const [lineRender, setLineRender] = useState("grid");
  const handleFileChange = (event) => {
    setUploadedFile(event.target.files[0]);
  };

  const handleValueChange = (event) => {
    setSpecificValue(event.target.value);
  };

  const URL = "https://bua-fastapi.onrender.com";
  // const URL = "http://localhost:8000";

  const uploadFile = async () => {
    if (uploadedFile) {
      const formData = new FormData();
      formData.append("excel_file", uploadedFile);

      try {
        setIsLoading(true);
        const response = await axios.post(
          `${URL}/api/process_excel?specific_value=${specificValue}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Assuming the API response is in the expected format
        setData(response.data);
        setIsLoading(false);
        console.log("data", data);
      } catch (error) {
        console.error("Error uploading and processing file:", error);
        setIsError(true);
        setIsError("Something went wrong");
      }
    } else {
      console.error("No file selected");
    }
  };

  const updateXarrow = useXarrow();

  return (
    <>
      <div className="w-screen container px-1 py-2">
        {/* Create a simple file input field for XLSX file upload */}
        <input type="file" accept=".xlsx" onChange={handleFileChange} />
        <input
          defaultValue={specificValue}
          type="text"
          className="ring-2 ring-gray-400 rounded"
          onChange={handleValueChange}
        />
        <button
          onClick={uploadFile}
          className="ml-2 bg-green-400 rounded px-2 py-1"
        >
          Upload
        </button>
        <div className="container header ">
          <div className="flex justify-between items-center">
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
        <div className="container chart-settings py-2 mb-4">
          {/* dropdown input to select chart lines type "curves" or "lines" */}

          <small className="text-base">Relation lines rendering: </small>
          <select
            defaultValue={"grid"}
            onChange={(e) => setLineRender(e.target.value)}
            className="ring-1 ring-gray-400 rounded"
          >
            <option value="smooth">Curves</option>
            <option selected value="grid">
              Lines
            </option>
          </select>
        </div>
        <section className="container h-screen chart" id="content-id">
          {isLoading ? (
            "Loading..."
          ) : isError ? (
            <div className="text-red-500 text-center">{errorMessage}</div>
          ) : (
            <div className=" ">
              {data.map((item, index) => (
                <div className="  z-5 ">
                  <div
                    key={index}
                    className="relative w-full flex items-center "
                  >
                    <div className="left-labels left-0 sticky">
                      <div className=" w-full ">
                        <div className="h-full  flex items-center justify-center">
                          <small className="  -rotate-90   font-bold   ">
                            {item.band}
                          </small>
                          <small className="-rotate-90 text-xs  font-bold text-gray-600">
                            {item.range}
                          </small>
                          <span className="h-36 w-full text-gray-300 flex flex-col   justify-between">
                            <BsArrowUp size={30} />
                            <small className=" w-fulls text-xs font-bold py-2 text-gray-600">
                              {item.percentage ?? 0}%
                            </small>
                            <BsArrowDown size={30} />
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* <pre className="bg-red-200">{JSON.stringify(item)}</pre> */}
                    <div
                      className={`relative flex ${
                        item?.uniqueJobs.length < 10
                          ? "justify-around w-screen"
                          : "justify-between w-screen"
                      }  gap-2 text-xs`}
                    >
                      {item?.uniqueJobs.map((job, jobIndex) => (
                        <>
                          <Xwrapper>
                            <Draggable
                              onDrag={updateXarrow}
                              onStop={updateXarrow}
                            >
                              <div
                                id={job.id}
                                key={jobIndex}
                                style={{
                                  zIndex: 999,
                                  backgroundColor: "white",
                                  opacity: 0.8,
                                  position: "relative",
                                  left: "100px",
                                  // bottom: "-24px",
                                  // backgroundColor,
                                  top: `-${job.hayScore * 0.023}` + "px",
                                }}
                                className={`flex flex-col items-center  cursor-pointer w-1 px-2 py-1 ring-gray-600 ring-1 ${
                                  job.stepGapIcon == "High Step Gap"
                                    ? "!bg-blue-200"
                                    : job.stepGapIcon == "Low Step Gap"
                                    ? "!bg-yellow-200"
                                    : ""
                                }`}
                              >
                                {job.outlierIcon === -1 ? (
                                  <NegativeOutlierIcon />
                                ) : job.outlierIcon === 1 ? (
                                  <PositiveOutlierIcon />
                                ) : (
                                  <></>
                                )}
                                <small className="text-center text-xs">
                                  {job.title}
                                </small>
                                <small className="">
                                  {" "}
                                  ({job.current_grade})
                                </small>
                                <small className="font-bold">
                                  {job.hayScore}
                                </small>
                                {/* <br />
                                <small className="font-bold">{job.id}</small>
                                {" / "}
                                <small className="font-bold">
                                  {job.parentId ?? "-"}
                                </small> */}
                              </div>
                            </Draggable>
                            <Xarrow
                              start={job.parentId ? job.parentId : undefined} //can be react ref
                              end={job.parentId ? job.id : undefined} //or an id
                              strokeWidth={1.5}
                              path={lineRender}
                              // showHead={false}
                              showTail={true}
                              // curveness={0.8}
                              // color="#0000007f"
                              color={
                                job.parentId
                                  ? getRandomColor(job.parentId)
                                  : "black"
                              }
                              zIndex={0}
                              // lineColor={"blue"}
                              // _cpx1Offset={5}
                              // _cpx2Offset={5}
                              // _cpy1Offset={5}
                              // _cpy2Offset={5}
                              // _debug={true}
                              dashness={true}
                              // labels={`${job.parentId} - ${job.parentId}`}
                            />
                          </Xwrapper>
                        </>
                      ))}
                    </div>
                  </div>
                  {/* ...dotted line... */}
                  <hr className="my-2 border-gray-200" />
                </div>
              ))}
            </div>
          )}
        </section>
        {/* <JobChart data={data} /> */}
      </div>
    </>
  );
}

export default Dashboard;
