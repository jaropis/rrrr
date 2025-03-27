import React from "react";

const Tachogram = ({ selectedColumn, data }) => {
  console.log(data);
  return (
    <div>
      <h1>This is a tachogram</h1>
      <p>
        The user selected column <strong>{selectedColumn}</strong>
      </p>
    </div>
  );
};

export default Tachogram;
