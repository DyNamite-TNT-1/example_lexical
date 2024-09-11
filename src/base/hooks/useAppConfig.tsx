import { useRecoilState } from "recoil";

//
// types
import { DefaultAppConfigProps, ThemeMode } from "@base/types/app";
import { appConfigAtom } from "@base/store/atoms/app";
import { createContext, useContext } from "react";
import eq from "lodash/eq";
// ==============================|| CONFIG - HOOKS  ||============================== //

type _ContextType = DefaultAppConfigProps & {
  onChangeMode: (mode: ThemeMode) => void;
  initAppSetting: (nConfig: DefaultAppConfigProps) => void;
};

const _context = createContext<_ContextType | null>(null);

export const AppConfigProvider = (props: { children: any }) => {
  const [config, setConfig] =
    useRecoilState<DefaultAppConfigProps>(appConfigAtom);

  // save app config
  const handleAppSetting = (nConfig: { mode?: ThemeMode }) => {
    setConfig((config) => {
      let resultConfig = {
        ...config,
        mode: nConfig.mode ?? config.mode,
      };
      return resultConfig;
    });
  };
  return (
    <_context.Provider
      value={{
        ...config,
        onChangeMode: (mode: ThemeMode) => {
          handleAppSetting({ mode });
        },

        initAppSetting: (nConfig: DefaultAppConfigProps) => {
          if (!eq(nConfig, config)) {
            setConfig(nConfig);
          }
        },
      }}
    >
      {props.children}
    </_context.Provider>
  );
};

const useAppConfig = () => {
  const context = useContext(_context);

  if (!context) throw new Error("context must be use inside provider");

  return context;
};

export default useAppConfig;
