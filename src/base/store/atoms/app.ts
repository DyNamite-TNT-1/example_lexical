import { atom } from "recoil";
import { DefaultAppConfigProps } from "@base/types/app";

import defaultAppConfig from "@base/config/app";

export const appConfigAtom = atom<DefaultAppConfigProps>({
  key: "appConfigAtom",
  default: {
    ...defaultAppConfig,
  } as DefaultAppConfigProps,
});
