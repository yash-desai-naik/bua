import "./App.css";
import {
  BsFillBookmarkFill,
  BsFillCaretDownFill,
  BsFillCaretUpFill,
  BsArrowDown,
  BsArrowUp,
} from "react-icons/bs";
import JSONdata from "./output_data.json";

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

const data = JSONdata.map((d) => {
  return { ...d, percentage: 12 };
});

function App() {
  return (
    <>
      <div className="header container p-10">
        <div className="flex justify-between">
          <h1 className="text-3xl text-green-900 ">
            Emerging Relativity of roles – SBUs (BU-A)
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
        {data.map((item, index) => (
          <>
            <div key={index} className="flex items-center">
              <div className="left-labels">
                <div className="h-36 w-5 bg-lime-400">
                  <div className="flex">
                    <small className="[writing-mode:vertical-lr]  flex justify-center rotate-180 h-36 font-bold  py-2">
                      {item.band}
                    </small>
                    <small className="[writing-mode:vertical-lr]  flex justify-center rotate-180 h-36   font-bold py-2 text-gray-600">
                      {item.hayScoreRange}
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
              <div className="flex justify-center w-screen gap-2 text-xs">
                {item.uniqueJobs.map((job, jobIndex) => (
                  <div
                    key={jobIndex}
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
                    <small className="ml-3 font-bold">{job.hayScore}</small>
                  </div>
                ))}
              </div>
            </div>
            {/* ...dotted line... */}
            <hr className="my-2" />
          </>
        ))}
      </section>
    </>
  );
}

export default App;
