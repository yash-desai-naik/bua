//@ts-nocheck
import React, { useEffect, useState } from "react";
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
// import * as htmlToImage from "html-to-image";
import htmlToImage from "dom-to-image";

import Select from "react-select";

import exportAsImage from "./utils/exportAsImage";

{
  /* <option value="BU-A" />
<option value="BU-B" />
<option value="BU-C" />
<option value="HO" /> */
}

// Array of all BU
const BUoptionList = [
  { value: "BU-A", label: "BU-A" },
  { value: "BU-B", label: "BU-B" },
  { value: "BU-C", label: "BU-C" },
  { value: "HO", label: "HO" },
];

const jobFamilyOptionList = [
 { value: "Corporate Communications", label: "Corporate Communications" },
  { value: "Dummy", label: "Dummy" },
  { value: "Engineering", label: "Engineering" },
  { value: "Finance & Accounts", label: "Finance & Accounts" },
  { value: "HR & Admin.", label: "HR & Admin." },
  { value: "Innovation & Technology", label: "Innovation & Technology" },
  { value: "IT Services", label: "IT Services" },
  { value: "Legal & Secretarial", label: "Legal & Secretarial" },
  { value: "MD's Office", label: "MD's Office" },
  { value: "Marketing & Product Management", label: "Marketing & Product Management" },
  { value: "Operational Excellence", label: "Operational Excellence" },
  { value: "Operations", label: "Operations" },
  { value: "QA/QC", label: "QA/QC" },
  { value: "Strategy", label: "Strategy" },
  { value: "Supply Chain Management", label: "Supply Chain Management" }
];

const levelList = [
  { value: undefined, label: "All" },
  { value: "1", label: "n-1" },
  { value: "2", label: "n-2" },
  { value: "3", label: "n-3" },
  { value: "4", label: "n-4" },
  { value: "5", label: "n-5" },
  { value: "6", label: "n-6" },
  { value: "7", label: "n-7" },
  { value: "8", label: "n-8" },
];

const NegativeOutlierIcon = () => (
  <>
    <span className="text-red-500 ">
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

function Dashboard() {
  const ref = React.createRef(null);
  const createFileName = (extension = "", ...names) => {
    if (!extension) {
      return "";
    }

    return `${names.join("")}.${extension}`;
  };

  const takeScreenShot = async (node: HTMLElement) => {
    console.log("node", node);

    const dataURI = await htmlToImage.toPng(node);
    return dataURI;
  };

  const download = (image, { name = "img", extension = "png" } = {}) => {
    const a = document.createElement("a");
    a.href = image;
    a.download = createFileName(extension, name);
    a.click();
  };

  const downloadScreenshot = () => takeScreenShot(ref.current).then(download);

  const exportRef = React.useRef();

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

  const [buValue, setBUValue] = useState<
    { value: String; label: string }[] | undefined
  >();
  const [jobFamilyMapping, setJobFamilyMapping] = useState();
  const [level, setLevel] = useState(levelList[0]);
  const [lineRender, setLineRender] = useState("grid");
  const handleFileChange = (event) => {
    setUploadedFile(event.target.files[0]);
  };

  const handleBUValueChange = (event) => {
    // if (event.target.value == "") {
    //   setBUValue(undefined);
    // } else setBUValue(event.target.value);

    // setBUValue(event);

    // console.log("event", event);

    // event.forEach((value) => setBUValue(value.value));
    setBUValue(event.map((value) => value.value));
  };
  const handlejobFamilyMappingChange = (event) => {
    // if (event.target.value == "") {
    //   setJobFamilyMapping(undefined);
    // } else setJobFamilyMapping(event.target.value);
    console.log("event", event);
    setJobFamilyMapping(event.map((value) => value.value));
  };
  const handleLevelChange = (event) => {
    // if (event.target.value == "") {
    //   setLevel(undefined);
    // } else setLevel(event.target.value);
    console.log("event:level", event);
    setLevel(event.value);
  };

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  // const URL = "http://localhost:8000";

  const uploadFile = async () => {
    if (uploadedFile) {
      const formData = new FormData();
      formData.append("excel_file", uploadedFile);

      try {
        setIsLoading(true);

        const url = new URL(`${BASE_URL}/api/process_excel`);

        // add query parameter bu_filter if not null or undefined
        if (buValue && buValue.length > 0) {
          // url.searchParams.set("bu_filter", buValue);

          // set as comma separated string
          url.searchParams.set("bu_filter", buValue.join(","));
        }

        // add job_family_mapping if not null or undefined
        if (jobFamilyMapping && jobFamilyMapping.length > 0) {
          // url.searchParams.set("job_family_mapping", jobFamilyMapping);
          url.searchParams.set(
            "job_family_mapping",
            jobFamilyMapping.join(",")
          );
        }

        if (level && level.length > 0) {
          url.searchParams.set("level", level);

          // url.searchParams.set("level", level.join(","));
        }

        const response = await axios.post(url.toString(), formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

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
      {/* Create a simple file input field for XLSX file upload */}
      <div className=" flex gap-4 py-4 px-4">
        <input type="file" accept=".xlsx" onChange={handleFileChange} />
        {/* <input
          type="search"
          list="bu-values"
          placeholder="BU Filter"
          defaultValue={buValue}
          type="text"
          className="px-1  ring-2 ring-gray-700 focus:ring-black "
          onChange={handleBUValueChange}
        />
        <datalist id="bu-values">
          <option value="BU-A" />
          <option value="BU-B" />
          <option value="BU-C" />
          <option value="HO" />
        </datalist> */}
        <>
          <Select
            options={BUoptionList}
            placeholder="Select BU"
            // value={buValue}
            defaultValue={buValue?.map((v, index) => ({
              value: v,
              label: v,
            }))}
            onChange={handleBUValueChange}
            isSearchable={true}
            isMulti
          />
        </>
        {/* <input
          type="search"
          list="job-family"
          placeholder="Job Family Mapping"
          defaultValue={jobFamilyMapping}
          type="text"
          className="px-1 ring-2 ring-gray-700 focus:ring-black "
          onChange={handlejobFamilyMappingChange}
        />
        <datalist id="job-family">
          <option value="HR & Admin." />
          <option value="Operational Excellence" />
          <option value="Supply Chain Management" />
          <option value="HO" />
        </datalist> */}

        <Select
          options={jobFamilyOptionList}
          placeholder="Select Job Family Mapping"
          // value={buValue}
          defaultValue={jobFamilyMapping?.map((v, index) => ({
            value: v,
            label: v,
          }))}
          onChange={handlejobFamilyMappingChange}
          isSearchable={true}
          isMulti
        />

        {/* <input
          type="search"
          list="levels"
          placeholder="Level"
          // defaultValue={""}
          type="text"
          // min={1}
          // max={7}
          className="px-1 ring-2 ring-gray-700 focus:ring-black "
          onChange={handleLevelChange}
        />
        <datalist id="levels">
          <option value="1" label="n-1"></option>
          <option value="2" label="n-2"></option>
          <option value="3" label="n-3"></option>
          <option value="4" label="n-4"></option>
          <option value="5" label="n-5"></option>
          <option value="6" label="n-6"></option>
          <option value="7" label="n-7"></option>
        </datalist> */}

        <Select
          options={levelList}
          placeholder="Select Level"
          // value={buValue}
          // defaultValue={level?.map((v, index) => ({
          //   value: v,
          //   label: v,
          // }))}
          defaultValue={level}
          // def
          onChange={handleLevelChange}
        // isClearable={true}
        // isSearchable={true}
        // isMulti
        />
        <button
          onClick={uploadFile}
          className="ml-2 bg-black  px-2 py-1 text-gray-100 w-16 active:bg-gray-900 active:scale-105 hover:shadow-xl"
        >
          Draw
        </button>
        {data.length > 0 ? (
          <>
            <button
              className="bg-black py-1 px-2  text-gray-100 w-16 active:bg-gray-900 active:scale-105 hover:shadow-xl"
              onClick={downloadScreenshot}
            >
              Export
            </button>
            {/* <button onClick={() => exportAsImage(exportRef.current, "test")}>
              Capture Image
            </button> */}
          </>
        ) : (
          <></>
        )}
      </div>
      <section
        ref={ref}
        // ref={exportRef}
        className="w-screen overflow-visible #bg-white  main-chart-section"
        style={{ backgroundColor: null }}
      >
        <div className="w-auto h-auto">
          <div className=" header ">
            <div className=" justify-between items-center">
              <h1 className="text-4xl text-green-900 ">
                Emerging Relativity of roles – SBUs ({buValue ?? "All"}) - (
                {jobFamilyMapping ?? "All"})
              </h1>
              <div className="  mt-4 float-right">
                <div className=" mr-32 legend-outlier flex gap-4 scale-[1.5]">
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
                      <div
                        style={{ width: "20px" }}
                        className=" bg-yellow-200"
                      />
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
          <>
            {/* <div className=" chart-settings py-2 mb-4">
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
            </div> */}
          </>
          <section className=" chart" id="content-id">
            {isLoading ? (
              "Loading..."
            ) : isError ? (
              <div className="text-red-500 text-center">{errorMessage}</div>
            ) : (
              <div className=" w-screen ">
                {data.map((item, index) => (
                  <div
                    className={` border-b-[.5px] border-dashed border-gray-300 relative py-8`}
                  >
                    <div key={index} className=" flex  gap-4">
                      <div className="#bg-white left-labels left-0 sticky z-50">
                        <div className="#bg-white  w-full z-50">
                          <div className="band-label #bg-white    flex items-center justify-center">
                            <small className=" text-3xl   -rotate-90   font-bold   ">
                              {item.band}
                            </small>
                            <small className="text-2xl -ml-6 w-[16rem] -rotate-90 text-center font-bold text-gray-600">
                              {item.range}
                            </small>
                            <span className="  -ml-5  h-36 w-full text-gray-300 flex flex-col   justify-between">
                              {item.percentage ? (
                                <>
                                  <BsArrowUp size={30} />
                                  <small className="text-xl -ml-4  text-center w-[3.8rem] -rotate-90 font-bold py-2 text-gray-600">
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
                        style={{
                          bottom: `-50px`,
                          justifyContent:index%2==0?'space-evenly':'space-between',
                          gap:'3rem'
                        }}
                        className={` w-screen relative  flex
                          
                            text-xs`}
                      >
                        {item?.uniqueJobs.map((job, jobIndex) => (
                          <>
                            <Xwrapper>
                              <Draggable
                                // axis="x"
                                onDrag={updateXarrow}
                                onStop={updateXarrow}
                              >
                                <div
                                  style={{
                                    // fontSize: "2rem",
                                    // width: "",
                                    // height: "116px",
                                    // zIndex: 49,
                                    backgroundColor: "white",
                                    outline: `1px solid ${job.current_grade_color}`,
                                    opacity: 0.8,
                                    position: "relative",
                                    left:
                                      item.uniqueJobs.length >= 100
                                        ? "6200px"
                                        : item.uniqueJobs.length >= 70
                                          ? "1800px"
                                          : item.uniqueJobs.length >= 30
                                            ? "500px"
                                            : "0px",
                                    // bottom: "-24px",
                                    // backgroundColor,
                                    bottom: `${job.hayScore * 0.063}` + "px",
                                    // transform: `translate(0px,30%)`,
                                  }}
                                  id={job.id}
                                  key={jobIndex}
                                  className={` flex flex-col justify-around cursor-pointer w-56 h-40  px-2 py-1  ${job.stepGapIcon == "High Step Gap"
                                      ? "!bg-blue-200"
                                      : job.stepGapIcon == "Low Step Gap"
                                        ? "!bg-yellow-200"
                                        : ""
                                    }`}
                                >
                                  <div
                                    className="text-center"
                                    title={`${job.id}/${job.parentId ?? ""}`}
                                  >{job.title_count > 1 ? <span className="absolute right-0 top-0 bg-gray-300 p-1 ">{job.title_count}</span> : <></>}
                                    {job.outlierIcon === -1 ? (
                                      <NegativeOutlierIcon />
                                    ) : job.outlierIcon === 1 ? (
                                      <PositiveOutlierIcon />
                                    ) : (
                                      <></>
                                    )}
                                    <small className=" text-xl">
                                      {job.title}
                                    </small>
                                    <br />
                                    <small className="text-xl">
                                      {" "}
                                      ({job.current_grade})
                                    </small>
                                    <br />
                                    <small className="font-bold text-xl">
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
                                end={job.id ? job.parentId : undefined} //or an id
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
                    {/* <hr className="my-2 border-gray-200" /> */}
                  </div>
                ))}
              </div>
            )}
          </section>
          {/* <JobChart data={data} /> */}
        </div>
      </section>
    </>
  );
}

export default Dashboard;
