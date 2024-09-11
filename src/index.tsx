import React from "react";
import ReactDOM from "react-dom/client";
import App from "@base/App";
import { AppConfigProvider } from "@base/hooks/useAppConfig";
import { RecoilRoot } from "recoil";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <RecoilRoot>
      <AppConfigProvider>
        <App />
      </AppConfigProvider>
    </RecoilRoot>
  </React.StrictMode>
);
