// @ts-nocheck
import htmlToImage from "dom-to-image";
import React, { useState } from "react";
import Draggable from "react-draggable";
import {
  BsArrowDown,
  BsArrowUp,
  BsFillBookmarkFill,
  BsFillCaretDownFill,
  BsFillCaretUpFill,
} from "react-icons/bs";
import Select from "react-select";
import Xarrow, { Xwrapper, useXarrow } from "react-xarrows";

import axios from "axios";
import "./App.css";
// import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";

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

const BUoptionList = [
  { value: "BU-A", label: "BU-A" },
  { value: "BU-B", label: "BU-B" },
  { value: "BU-C", label: "BU-C" },
  { value: "HO", label: "HO" },
];

const jobFamilyOptionList = [
  { value: "HR & Admin.", label: "HR & Admin." },
  { value: "Operational Excellence", label: "Operational Excellence" },
  { value: "Supply Chain Management", label: "Supply Chain Management" },
  { value: "HO", label: "HO" },
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

const YourComponent = () => {
  const updateXarrow = useXarrow();

  const ref = React.createRef(null);
  const createFileName = (extension = "", ...names) => {
    if (!extension) {
      return "";
    }

    return `${names.join("")}.${extension}`;
  };

  const takeScreenShot = async (node: HTMLElement) => {
    const dataURI = await htmlToImage.toPng(node, {
      quality: 1,
    });

    return dataURI;
  };

  const download = (image, { name = "img", extension = "png" } = {}) => {
    const a = document.createElement("a");
    a.href = image;
    a.download = createFileName(extension, name);
    a.click();
  };

  const downloadScreenshot = () => takeScreenShot(ref.current).then(download);

  //a funcion to convert the screenshot into pdf
  const downloadPdf = () => {
    htmlToImage
      .toPng(ref.current)
      .then((dataUrl) => {
        //width of the image
        const width = ref.current.clientWidth * 1.4;
        const height = ref.current.clientHeight * 2;
        console.log("width", width);
        console.log("height", height);
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [width, height],
        });
        pdf.addImage(dataUrl, "PNG", 0, 0);
        pdf.save("screenshot.pdf");
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };

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

  const [uniqueSubJobFamilies, setUniqueSubJobFamilies] = useState();

  const [buValue, setBUValue] = useState<
    { value: String; label: string }[] | undefined
  >();
  const [jobFamilyMapping, setJobFamilyMapping] = useState();
  const [level, setLevel] = useState(levelList[0]);

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
        setData(undefined);
        setIsError(false);
        setErrorMessage("");
        setUniqueSubJobFamilies(undefined);

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
        const uniqueSubJobFamilies_ = Array.from(
          new Set(
            data.flatMap((item) =>
              item.uniqueJobs.map((job) => job.sub_job_family)
            )
          )
        );
        setUniqueSubJobFamilies(uniqueSubJobFamilies_);
        setIsLoading(false);
        console.log("data", data);
      } catch (error) {
        console.error("Error uploading and processing file:", error);
        setIsError(true);
        // setIsError("Something went wrong");
      }
    } else {
      console.error("No file selected");
    }
  };

  return (
    <div className="  bg-transparent">
      <div className=" flex gap-4 py-4 px-4">
        <input type="file" accept=".xlsx" onChange={handleFileChange} />
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
          {`${isLoading ? "..." : "Draw"}`}{" "}
        </button>
        {data && data.length > 0 ? (
          <>
            <button
              className="bg-black py-1 px-2  text-gray-100 w-16 active:bg-gray-900 active:scale-105 hover:shadow-xl"
              onClick={downloadScreenshot}
            >
              Export
            </button>
            {/* <button onClick={downloadPdf}>Export PDF</button> */}
          </>
        ) : (
          <></>
        )}
      </div>
      {data && data.length ? (
        <section ref={ref}>
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

          <table className="mt-20 min-w-full overflow-x-visible">
            <thead className="">
              <tr className=" ">
                <th className=" font-bold   py-4 "></th>
                {uniqueSubJobFamilies?.map((subJobFamily) => (
                  <th key={subJobFamily} className=" font-semibold  px-2 ">
                    {subJobFamily}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Xwrapper>
                {data?.map((row) => (
                  <tr
                    key={row.band}
                    className=" border border-dashed border-b-2"
                  >
                    <td className=" p-10  font-bold">
                      <div className="relative">
                        <small className="absolute -rotate-90 text-xl">
                          {row.band}
                        </small>
                        <small className="absolute text-xl ml-1 -rotate-90 text-center font-bold text-gray-600">
                          {row.range}
                        </small>
                        <span className="absolute scale-[3.6] -top-8 ml-20 text-gray-300 flex flex-col   justify-between">
                          {row.percentage ? (
                            <>
                              <BsArrowUp size={20} />
                              <small className="text-[0.36rem]  text-center  -rotate-90 font-bold py-2 text-gray-600">
                                {row.percentage ?? ""}
                              </small>
                              <BsArrowDown size={20} />
                            </>
                          ) : (
                            <></>
                          )}
                        </span>{" "}
                      </div>
                    </td>
                    {uniqueSubJobFamilies?.map((subJobFamily) => (
                      <Draggable onDrag={updateXarrow} onStop={updateXarrow}>
                        <td key={subJobFamily} className="relative  py-[8rem]">
                          <div
                            id={
                              row.uniqueJobs.find(
                                (job) => job.sub_job_family === subJobFamily
                              )?.id ?? "undefined"
                            }
                            style={{
                              left: 24,
                              right: 24,
                              bottom: 0,
                              transform: `translate(0,-${
                                ((row?.uniqueJobs?.find(
                                  (job) => job?.sub_job_family === subJobFamily
                                )?.hayScore ?? 0) /
                                  20) *
                                  1.89 +
                                "px"
                              })`,
                            }}
                            className={`absolute z-50  px-1  h-36 text-2xl flex flex-col  justify-center items-center 
                  text-center ${
                    row.uniqueJobs.find(
                      (job) => job.sub_job_family === subJobFamily
                    )?.title
                      ? "outline outline-gray-500"
                      : ""
                  }  ${
                              row.uniqueJobs.find(
                                (job) => job.sub_job_family === subJobFamily
                              )?.stepGapIcon == "High Step Gap"
                                ? "!bg-blue-200"
                                : row.uniqueJobs.find(
                                    (job) => job.sub_job_family === subJobFamily
                                  )?.stepGapIcon == "Low Step Gap"
                                ? "!bg-yellow-200"
                                : ""
                            }`}
                          >
                            <small className="font-semibold">
                              {row.uniqueJobs.find(
                                (job) => job.sub_job_family === subJobFamily
                              )?.outlierIcon === -1 ? (
                                <NegativeOutlierIcon />
                              ) : row.uniqueJobs.find(
                                  (job) => job.sub_job_family === subJobFamily
                                )?.outlierIcon === 1 ? (
                                <PositiveOutlierIcon />
                              ) : (
                                <></>
                              )}{" "}
                              {
                                row.uniqueJobs.find(
                                  (job) => job.sub_job_family === subJobFamily
                                )?.title
                              }
                            </small>
                            <small>
                              {
                                row.uniqueJobs.find(
                                  (job) => job.sub_job_family === subJobFamily
                                )?.current_grade
                              }
                            </small>
                            <small className="font-semibold">
                              {
                                row.uniqueJobs.find(
                                  (job) => job.sub_job_family === subJobFamily
                                )?.hayScore
                              }
                            </small>
                          </div>
                          <Xarrow
                            start={
                              row.uniqueJobs.find(
                                (job) => job.sub_job_family == subJobFamily
                              )?.parentId
                                ? row.uniqueJobs.find(
                                    (job) => job.sub_job_family == subJobFamily
                                  )?.id
                                : undefined
                            } //can be react ref
                            end={
                              row.uniqueJobs.find(
                                (job) => job.sub_job_family == subJobFamily
                              )?.parentId
                                ? row.uniqueJobs.find(
                                    (job) => job.sub_job_family == subJobFamily
                                  )?.parentId
                                : undefined
                            } //or an id
                            strokeWidth={1.5}
                            path={"grid"}
                            showHead={false}
                            showTail={true}
                            // curveness={0.8}
                            // color="#0000007f"
                            color={
                              row.uniqueJobs.find(
                                (job) => job.sub_job_family == subJobFamily
                              )?.parentId
                                ? getRandomColor(
                                    row.uniqueJobs.find(
                                      (job) =>
                                        job.sub_job_family == subJobFamily
                                    )?.parentId
                                  )
                                : "black"
                            }
                            // color="black"
                            zIndex={0}
                            // lineColor={"blue"}
                            // _cpx1Offset={5}
                            // _cpx2Offset={5}
                            // _cpy1Offset={5}
                            // _cpy2Offset={5}
                            // _debug={true}
                            // dashness={true}
                            // labels={`${row.uniqueJobs.find(job=>job.sub_job_family==subJobFamily).parentId} - ${row.uniqueJobs.find(job=>job.sub_job_family==subJobFamily).parentId}`}
                            startAnchor={"top"}
                            endAnchor={"bottom"}
                            gridBreak="5%10"
                          />
                        </td>
                      </Draggable>
                    ))}
                  </tr>
                ))}
              </Xwrapper>
            </tbody>
          </table>
        </section>
      ) : isLoading ? (
        <>Loading</>
      ) : (
        <></>
      )}
    </div>
  );
};

export default YourComponent;
