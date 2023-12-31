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
import PPT from "./PPT";

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

// const BUoptionList = [
//   // { value: "Dummy", label: "Dummy" },
//   { value: "BU-A", label: "BU-A" },
//   { value: "BU-B", label: "BU-B" },
//   { value: "BU-C", label: "BU-C" },
//   { value: "HO", label: "HO" },
// ];

// const jobFamilyOptionList = [
//   // { value: "Dummy", label: "Dummy" },
//   { value: "Corporate Communications", label: "Corporate Communications" },
//   { value: "Dummy", label: "Dummy" },
//   { value: "Engineering", label: "Engineering" },
//   { value: "Finance & Accounts", label: "Finance & Accounts" },
//   { value: "HR & Admin.", label: "HR & Admin." },
//   { value: "Innovation & Technology", label: "Innovation & Technology" },
//   { value: "IT Services", label: "IT Services" },
//   { value: "Legal & Secretarial", label: "Legal & Secretarial" },
//   { value: "MD's Office", label: "MD's Office" },
//   {
//     value: "Marketing & Product Management",
//     label: "Marketing & Product Management",
//   },
//   { value: "Operational Excellence", label: "Operational Excellence" },
//   { value: "Operations", label: "Operations" },
//   { value: "QA/QC", label: "QA/QC" },
//   { value: "Strategy", label: "Strategy" },
//   { value: "Supply Chain Management", label: "Supply Chain Management" },

//   { value: "WLC", label: "WLC" },
//   { value: "Marketing, PR and NPD", label: "Marketing, PR and NPD" },
//   { value: "Development", label: "Development" },
//   { value: "Business Ops and RSG", label: "Business Ops and RSG" },
//   { value: "Finance", label: "Finance" },
//   { value: "Supply Chain and QS", label: "Supply Chain and QS" },
//   { value: "HR", label: "HR" },
//   { value: "Product and IT", label: "Product and IT" },
//   { value: "Strategy", label: "Strategy" },
//   { value: "Legal and CS", label: "Legal and CS" },
// ];

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

  const [BUoptionList, setBUoptionList] = useState(null)
  const [jobFamilyOptionList, setjobFamilyOptionList] = useState(null)

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");



  const [data, setData] = useState<Data[]>([]); // Initialize data as an empty array

  const [uniqueSubJobFamilies, setUniqueSubJobFamilies] = useState<string[]>();

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
        // setIsLoading(true);
        // setData(undefined);
        // setIsError(false);
        // setErrorMessage("");
        // setUniqueSubJobFamilies(undefined);

        const url = new URL(`${BASE_URL}/api/upload_excel`);



        const response = await axios.post(url.toString(), formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Assuming the API response is in the expected format
        // setData(response.data);
        // const uniqueSubJobFamilies_ = Array.from(
        //   new Set(
        //     data.flatMap((item) =>
        //       item.uniqueJobs.map((job) => job.sub_job_family)
        //     )
        //   )
        // );
        // setUniqueSubJobFamilies(uniqueSubJobFamilies_);
        // setIsLoading(false);
        // console.log("data", data);
        setBUoptionList(response.data.bu_option_list)
        setjobFamilyOptionList(response.data.job_family_option_list)
      } catch (error) {
        console.error("Error uploading and processing file:", error);
        setIsError(true);
        // setIsError("Something went wrong");
      }
    } else {
      console.error("No file selected");
    }
  };
  const processData = async () => {
    if (uploadedFile) {
      const formData = new FormData();
      // formData.append("excel_file", uploadedFile);

      try {
        setIsLoading(true);
        // setData(undefined);
        // setIsError(false);
        // setErrorMessage("");
        // setUniqueSubJobFamilies(undefined);

        const url = new URL(`${BASE_URL}/api/process_data`);

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
        const uniqueSubJobFamilies_ = Array.from(
          new Set(
            response.data?.flatMap((item) =>
              item?.uniqueJobs.map((job) => job.sub_job_family)
            )
          )
        );
        setData(response.data);
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
    <div className="bg-transparent ">
      <div className="flex gap-4 px-4 py-4 ">

        <input className="w-56" type="file" accept=".xlsx" id="file_onput" onChange={handleFileChange} />
        <button
          onClick={uploadFile}
          className="w-16 py-1 ml-2 text-gray-100 bg-black active:bg-gray-900 active:scale-105 hover:shadow-xl"
        >
          {`${isLoading ? "..." : "Upload"}`}
        </button>

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
          onClick={processData}
          className="w-16 px-1 py-1 ml-2 text-gray-100 bg-black active:bg-gray-900 active:scale-105 hover:shadow-xl"
        >
          {`${isLoading ? "..." : "Draw"}`}{" "}
        </button>
        {data && data.length > 0 ? (
          <>
            {/* <button
              className="w-16 px-2 py-1 text-gray-100 bg-black active:bg-gray-900 active:scale-105 hover:shadow-xl"
              onClick={downloadScreenshot}
            >
              Export
            </button> */}
            {/* <button onClick={downloadPdf}>Export PDF</button> */}

            <PPT data={data} />
          </>
        ) : (
          <></>
        )}
      </div>
      {data && data.length ? (
        <section ref={ref}>
          <div className=" header">
            <div className="items-center justify-between ">
              <h1 className="text-4xl text-green-900 ">
                Emerging Relativity of roles – SBUs ({buValue ?? "All"}) - (
                {jobFamilyMapping ?? "All"})
              </h1>
              <div className="float-right mt-4 ">
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
                    <span className="inline-flex gap-2 my-2 ">
                      <div style={{ width: "20px" }} className="bg-blue-200 ">
                        {" "}
                      </div>
                      <small className="text-xs">High Step-Gap</small>
                    </span>
                    <span className="flex gap-2">
                      <div
                        style={{ width: "20px" }}
                        className="bg-yellow-200 "
                      />
                      <small className="text-xs">Low Step-Gap</small>
                    </span>
                  </div>
                  <div className="flex-col gap-2 my-2">
                    <span className="inline-flex gap-2 text-green-800">
                      <BsFillBookmarkFill />
                      <small className="text-xs">High Span of Control</small>
                    </span>
                    <span className="flex gap-2 text-red-800">
                      <BsFillBookmarkFill />
                      <small className="text-xs">Low Span of Control</small>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <table className="min-w-full mt-20 overflow-x-visible">
            <thead className="">
              <tr className="">
                <th className="w-56 font-bold "></th>
                {uniqueSubJobFamilies?.length > 0 ? uniqueSubJobFamilies?.map((subJobFamily) => (
                  <>
                    <th
                      key={subJobFamily}
                      className=" #border-gray-300  w-56 font-semibold  "
                    >
                      {/* {subJobFamily} */}

                    </th>
                    <th

                      className=" #border-gray-300  w-56 font-semibold  "
                    >
                      {" "}
                    </th>

                  </>
                )) : <>
                  <th

                    className=" #border-gray-300  w-56 font-semibold  "
                  >
                    {" "}
                  </th>
                  <th

                    className=" #border-gray-300  w-56 font-semibold  "
                  >
                    {" "}
                  </th>

                </>}
              </tr>
            </thead>
            <tbody className="">
              <Xwrapper>
                {data?.map((row) => (
                  <tr
                    key={row.band}
                    className=" #border border-dashed border-b-2"
                  >
                    <td className="p-10 font-bold ">
                      <div className="relative">
                        <small className="absolute text-2xl -rotate-90">
                          {row.band}
                        </small>
                        <small className="absolute ml-1 text-xl font-bold text-center text-gray-600 -rotate-90">
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
                        <td

                          key={subJobFamily}
                          className=" relative  py-[8rem] cursor-pointer"
                        >
                          {row?.uniqueJobs
                            ?.filter(
                              (ruj) => ruj.sub_job_family === subJobFamily
                            )
                            ?.map((uj, index__, ujobs) => (
                              <>
                                {/* <pre className="z-50 mb-28">{JSON.stringify(ujobs)}</pre> */}
                                <div className=" h-[8rem]  mt-4 flex gap-4 ">
                                  <div
                                    id={uj?.id ?? "undefined"}
                                    style={{
                                      left: 24,
                                      right: 24,
                                      // bottom: `${uj?.hayScore+10}px`,
                                      transform: `translate(0,-${((uj?.hayScore ?? 0) / 20) * 1.89 + "px"
                                        })`,
                                    }}
                                    className={`bg-white absolute z-50    w-[16rem]  text-[1.5rem] flex flex-col  justify-center items-center 
                                              text-center ${uj?.title
                                        ? "outline outline-1 outline-gray-500"
                                        : ""
                                      }  ${uj?.stepGapIcon == "High Step Gap"
                                        ? "!bg-blue-200"
                                        : uj?.stepGapIcon == "Low Step Gap"
                                          ? "!bg-yellow-200"
                                          : ""
                                      }`}
                                  >
                                    {/* <span>{`${uj.id}/${uj.parentId}`}</span> */}
                                    <span className="absolute top-0 right-0 px-1 bg-gray-300 ">
                                      {uj.title_count > 1 ? uj.title_count : ""}
                                    </span>
                                    <small className="absolute top-0 left-0 font-semibold ">
                                      {uj?.outlierIcon === -1 ? (
                                        <NegativeOutlierIcon />
                                      ) : uj?.outlierIcon === 1 ? (
                                        <PositiveOutlierIcon />
                                      ) : (
                                        <></>
                                      )}{" "}
                                    </small>
                                    <span className="break-words whitespace-break-spaces"
                                      style={{
                                        fontSize: uj.title.length > 30 ? "70%" : "100%"
                                      }}
                                    >{uj?.title}</span>
                                    <small className=""

                                      style={{
                                        fontSize: uj.title.length > 30 ? "70%" : "100%"
                                      }}
                                    >
                                      ({uj?.current_grade})
                                    </small>
                                    <small className="font-semibold "
                                      style={{
                                        fontSize: uj.title.length > 30 ? "70%" : "100%"
                                      }}
                                    >
                                      {uj?.hayScore}
                                    </small>
                                  </div>
                                </div>
                                {/* <div className="flex flex-col gap-3">
                              <div className="bg-red-500" id={uj.id}>{uj.title}</div>
                            </div> */}
                                <Xarrow
                                  start={
                                    uj?.parentId && uj.id
                                      ? row.uniqueJobs.find(
                                        (job) =>
                                          job.sub_job_family == subJobFamily
                                      )?.id
                                      : undefined
                                  } //can be react ref
                                  end={
                                    uj?.id
                                      ? row.uniqueJobs.find(
                                        (job) =>
                                          job.sub_job_family == subJobFamily
                                      )?.parentId
                                      : undefined
                                  } //or an id
                                  strokeWidth={uj.parentId && uj.id ? 1.5 : 0}
                                  path={"grid"}
                                  showHead={false}
                                  showTail={true}
                                  // curveness={0.8}
                                  // color="#0000007f"
                                  color={
                                    uj?.parentId
                                      ? getRandomColor(
                                        row.uniqueJobs.find(
                                          (job) =>
                                            job.sub_job_family == subJobFamily
                                        )?.parentId
                                      )
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
                                  // labels={`${row.uniqueJobs.find(job=>job.sub_job_family==subJobFamily).parentId} - ${row.uniqueJobs.find(job=>job.sub_job_family==subJobFamily).parentId}`}
                                  startAnchor={row?.uniqueJobs
                                    ?.filter(
                                      (ruj) => ruj.sub_job_family === subJobFamily
                                    )
                                    ?.length > 1 ? "top" : "top"}
                                  endAnchor={"bottom"}
                                  gridBreak="5%10"
                                />
                              </>
                            ))}
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
