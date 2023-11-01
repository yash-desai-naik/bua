//@ts-nocheck

import React from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import "./App.css";
import {
  BsFillBookmarkFill,
  BsFillCaretDownFill,
  BsFillCaretUpFill,
  BsArrowDown,
  BsArrowUp,
} from "react-icons/bs";

const NegativeOutlierIcon = () => (
  <span className="absolute text-red-500">
    <BsFillCaretDownFill />
  </span>
);

const PositiveOutlierIcon = () => (
  <span className="absolute text-green-500">
    <BsFillCaretUpFill />
  </span>
);

const convertToHierarchy = (data) => {
  const idMapping = {};
  const rootNodes = [];

  // Create a map of nodes based on their IDs
  data.forEach((node) => {
    idMapping[node.id] = { ...node, children: [] };
  });

  // Construct the tree hierarchy
  data.forEach((node) => {
    const parentNode = idMapping[node.parentId];
    // console.log("parentNode", parentNode)
    // console.log("node", node)
    if (parentNode) {
      parentNode.children.push(idMapping[node.id]);
    } else {
      rootNodes.push(idMapping[node.id]);
    }
  });

  return rootNodes;
};

const renderTreeNode = (data) => (
  <TreeNode
    key={data.id}
    label={
      <div className="h-36 ">
        <div
        // style={{
        //   position: "relative",
        //   left: "100px",
        //   bottom: 0,
        //   top: `-${data.hayScore * 0.023}` + "px",
        // }}
        >
          <div className="">
            {data.outlierIcon === -1 ? (
              <NegativeOutlierIcon />
            ) : data.outlierIcon === 1 ? (
              <PositiveOutlierIcon />
            ) : (
              <></>
            )}
            <span className="ml-4">
              {`${data.title} (${data.current_grade})`}
            </span>
            <br />
            <small className="font-bold">{data.hayScore}</small>
          </div>
        </div>
      </div>
    }
  >
    {data.children.map((child) => renderTreeNode(child))}
  </TreeNode>
);

const ExampleTree = ({ jsonData }) => {
  // Call the function to get the flattened uniqueJobs array
  const flattenedJobs = flattenUniqueJobs(jsonData);
  const hierarchicalData = convertToHierarchy(flattenedJobs);
  const dd = removeDuplicateObjects(hierarchicalData);

  return <Tree>{dd.map((root) => renderTreeNode(root))}</Tree>;
};

export default ExampleTree;

function removeDuplicateObjects(arr) {
  const uniqueObjects = [];

  // Create a Map to track object uniqueness
  const uniqueMap = new Map();

  for (const obj of arr) {
    const objString = JSON.stringify(obj);

    if (!uniqueMap.has(objString)) {
      uniqueMap.set(objString, true); // Mark object as seen
      uniqueObjects.push(obj);
    }
  }

  return uniqueObjects;
}
// Function to flatten the uniqueJobs hierarchy
function flattenUniqueJobs(data) {
  const flattenedUniqueJobs = [];

  function traverse(bandData, parentJobId = null) {
    for (const job of bandData.uniqueJobs) {
      // Create a new job object
      const jobObject = {
        band: bandData.band,
        range: bandData.range,
        ...job,
      };

      // Add the job to the flattened array
      flattenedUniqueJobs.push(jobObject);

      // Check if the job has a parent (parentId) and continue flattening
      if (job.id === parentJobId) {
        traverse(bandData, job.id);
      }
    }
  }

  for (const bandData of data) {
    traverse(bandData);
  }

  return flattenedUniqueJobs;
}
