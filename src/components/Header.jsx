import React from "react";

function Header({title}) {
  return (
    <div className="text-center">
      <img
        src="https://logrocket-assets.io/img/logo.png"
        alt="The website logo"
        width="300"
        className="img-thumbnail"
        style={{ marginTop: "20px" }}
      />
      <h1>{title}</h1>
    </div>
  );
}

export default Header;