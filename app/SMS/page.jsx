import React from "react";
import Login from "../../components/SMS/Login";
import Dashboard from "../../components/SMS/Dashboard";
function page({ params, searchParams }) {
  return (
    <div>
      <Login/>
      {/* <Dashboard/> */}
    </div>
  );
}

export default page;
