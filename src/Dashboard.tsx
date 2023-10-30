import { useState } from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import TreeChart from "./TreeChart";

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

function Dashboard() {
  const [uploadedFile, setUploadedFile] = useState(null);

  const [data, setData] = useState([]); // Initialize data as an empty array
  const [specificValue, setSpecificValue] = useState(null); // Replace with your specific value

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
      } catch (error) {
        console.error("Error uploading and processing file:", error);
      }
    } else {
      console.error("No file selected");
    }
  };

  return (
    <>
      {/* Create a simple file input field for XLSX file upload */}
      <input type="file" accept=".xlsx" onChange={handleFileChange} />
      <input
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
                <div className="w-24 h-4 bg-blue-200" />
                <small className="text-xs">High Step-Gap</small>
              </span>
              <span className="flex gap-2">
                <div className="w-24 h-4 bg-yellow-200" />
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
      <section className="chart">
        <div className="w-screen fixed">
          {data.map((item, index) => (
            <div className="top-250 left-0">
              <div key={index} className="flex items-center">
                <div className="left-labels ">
                  <div className="h-36 w-5 bg-lime-400">
                    <div className="flex">
                      <small className="[writing-mode:vertical-lr]  flex justify-center rotate-180 h-36 font-bold  py-2">
                        {item.band}
                      </small>
                      <small className="[writing-mode:vertical-lr]  flex justify-center rotate-180 h-36   font-bold py-2 text-gray-600">
                        {item.range}
                      </small>
                      <span className="h-36 text-gray-300 flex flex-col   justify-between">
                        <BsArrowUp size={30} />
                        <small className="  text-base font-bold py-2 text-gray-600">
                          {item.percentage}%
                        </small>
                        <BsArrowDown size={30} />
                      </span>
                    </div>
                  </div>
                </div>
                {/* <pre className="bg-red-200">{JSON.stringify(item)}</pre> */}
                <div
                  className={`flex ${
                    item?.uniqueJobs.length < 10
                      ? "justify-center w-screen"
                      : ""
                  }  gap-2 text-xs`}
                >
                  {/* {item?.uniqueJobs.map((job, jobIndex) => (
                  <div
                    key={jobIndex}
                    style={{
                      position: "relative",
                      left: "100px",
                      bottom: 0,

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
                  </div>
                ))} */}
                </div>
              </div>
              {/* ...dotted line... */}
              <hr className="my-2" />
            </div>
          ))}
        </div>
        <div className="h-screen absolute left-[100px] top-[500px]">
          <TreeChart jsonData={data} />
        </div>
      </section>
    </>
  );
}

export default Dashboard;
