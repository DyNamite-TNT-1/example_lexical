import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { RecoilRoot } from "recoil";
import App from "@base/App";

export const baseUrl = (): string => {
  if (location.pathname.indexOf("/web") === 0) {
    return "/web";
  }
  return "/";
};
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <RecoilRoot>
      <BrowserRouter basename={baseUrl()}>
        <App />
      </BrowserRouter>
    </RecoilRoot>
  </React.StrictMode>
);
