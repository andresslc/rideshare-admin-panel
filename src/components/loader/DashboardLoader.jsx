import React from "react";

const DashboardLoader = () => {
  return (
    <div className="w-full h-[80vh] flex items-center justify-center">
      <div className="card-page-loader">
        <div className="loader">
          <p>loading</p>
          <div className="words">
            <span className="word text-primary-600">analytics</span>
            <span className="word text-secondary-600">forms</span>
            <span className="word text-primary-600">graphs</span>
            <span className="word text-secondary-600">cards</span>
            <span className="word text-primary-600">data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLoader;
