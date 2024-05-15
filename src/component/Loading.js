import React, { useEffect } from "react";
import { Spin } from "antd";

function Loading() {
  return (
    <>
      <div className="loading_box">
        <Spin />
      </div>
    </>
  );
}

export default Loading;
