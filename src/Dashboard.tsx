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

let colorMap = {}; // To store colors for each parent_id

function getRandomColor(parentId) {
  if (colorMap[parentId]) {
    return colorMap[parentId];
  }

  const minSaturation = 30; // Adjust this value as needed
  const maxSaturation = 70; // Adjust this value as needed

  const minLightness = 30; // Adjust this value as needed
  const maxLightness = 70; // Adjust this value as needed

  let randomColor;

  do {
    const hue = Math.floor(Math.random() * 360);
    const saturation =
      Math.floor(Math.random() * (maxSaturation - minSaturation + 1)) +
      minSaturation;
    const lightness =
      Math.floor(Math.random() * (maxLightness - minLightness + 1)) +
      minLightness;

    randomColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  } while (isTooLight(randomColor) || isWhite(randomColor));

  colorMap[parentId] = randomColor;
  console.log(
    `%c color ${randomColor}`,
    `background: ${randomColor}; color:#fff`
  );

  return randomColor;
}

// Function to check if a color is too light
function isTooLight(color) {
  const lightnessThreshold = 60; // Adjust this value as needed
  const [, , lightness] = color.match(/\d+/g).map(Number);
  return lightness > lightnessThreshold;
}

// Function to check if a color is close to white
function isWhite(color) {
  return color.toLowerCase() === "white";
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
      percentage: string;
      uniqueJobs: {
        title: string;
        current_band: string;
        current_grade: string;
        curret_grade_color: string;
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

  const URL = import.meta.env.VITE_BASE_URL;
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
          Draw
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
            <div className=" w-screen">
              {data.map((item, index) => (
                <div className="relative">
                  <div key={index} className=" w-full flex items-center gap-4">
                    <div className="bg-white left-labels left-0 sticky z-50">
                      <div className="bg-white  w-full z-50">
                        <div className="bg-white  h-full  flex items-center justify-center">
                          <small className="  -rotate-90   font-bold   ">
                            {item.band}
                          </small>
                          <small className="-ml-4 w-[8rem] -rotate-90 text-xs text-center font-bold text-gray-600">
                            {item.range}
                          </small>
                          <span className="-ml-5 h-36 w-full text-gray-300 flex flex-col   justify-between">
                            {item.percentage ? (
                              <>
                                <BsArrowUp size={30} />
                                <small className=" -ml-3  text-center w-[3.8rem] -rotate-90 text-xs font-bold py-2 text-gray-600">
                                  {item.percentage ?? ""}
                                </small>
                                <BsArrowDown size={30} />
                              </>
                            ) : (
                              <></>
                            )}
                          </span>{" "}
                        </div>
                      </div>
                    </div>

                    {/* <pre className="bg-red-200">{JSON.stringify(item)}</pre> */}
                    <div
                      className={` w-screen flex
                       justify-around
                        text-xs`}
                    >
                      {item?.uniqueJobs.map((job, jobIndex) => (
                        <>
                          <Xwrapper>
                            <Draggable
                              onDrag={updateXarrow}
                              onStop={updateXarrow}
                            >
                              <div
                                style={{
                                  // width: "",
                                  // zIndex: 49,
                                  backgroundColor: "white",
                                  outline: `1px solid ${job.current_grade_color}`,
                                  opacity: 0.8,
                                  position: "relative",
                                  left: "0px",
                                  // bottom: "-24px",
                                  // backgroundColor,
                                  top: `-${job.hayScore * 0.1}` + "px",
                                }}
                                id={job.id}
                                key={jobIndex}
                                className={` cursor-pointer w-24 h-full px-2 py-1  ${
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
                                <div
                                  className="text-center"
                                  title={`${job.id}/${job.parentId ?? ""}`}
                                >
                                  <small className=" text-xs">
                                    {job.title}
                                  </small>
                                  <br />
                                  <small className="">
                                    {" "}
                                    ({job.current_grade})
                                  </small>
                                  <br />
                                  <small className="font-bold ">
                                    {job.hayScore}
                                  </small>
                                  {/* <br />
                                  <small className="text-xs">{job.id}</small>
                                  {"/"}
                                  <small className="text-xs">
                                    {job.parentId ?? "-"}
                                  </small> */}
                                </div>
                              </div>
                            </Draggable>
                            <Xarrow
                              start={job.parentId ? job.id : undefined} //can be react ref
                              end={job.parentId ? job.parentId : undefined} //or an id
                              strokeWidth={1.5}
                              path={lineRender}
                              showHead={false}
                              showTail={true}
                              // curveness={0.8}
                              // color="#0000007f"
                              color={
                                job.parentId
                                  ? getRandomColor(job.parentId)
                                  : "black"
                              }
                              // color="black"
                              // zIndex={0}
                              // lineColor={"blue"}
                              // _cpx1Offset={5}
                              // _cpx2Offset={5}
                              // _cpy1Offset={5}
                              // _cpy2Offset={5}
                              // _debug={true}
                              // dashness={true}
                              // labels={`${job.parentId} - ${job.parentId}`}
                              startAnchor={"top"}
                              endAnchor={"bottom"}
                              gridBreak="5%10"
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
