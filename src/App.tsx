import "./App.scss";

import type { IModelConnection, ScreenViewport } from "@itwin/core-frontend";
import { FitViewTool, IModelApp, StandardViewId } from "@itwin/core-frontend";
import { FillCentered } from "@itwin/core-react";
import { ProgressLinear } from "@itwin/itwinui-react";
import {
  useAccessToken,
  Viewer,
  ViewerNavigationToolsProvider,
  ViewerPerformance,
  ViewerViewportControlOptions,
} from "@itwin/web-viewer-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Auth } from "./Auth";
import { history } from "./history";

import { UiFramework } from "@itwin/appui-react";

// Project Components
import IModelDataFetcher from "./components/IModelDataFetcher";
import { ScientificVizWidgetProvider } from "./components/scientific-viz/ScientificVizWidget";
import { GlobalDisplayApi } from "./components/global-display/GlobalDisplayApi";
import { GlobalDisplayWidgetProvider } from "./components/global-display/GlobalDisplayWidget";
import { ColorLegendWidgetProvider } from "./components/color-legend/ColorLegendWidget";
import {
  mapLayerOptions,
  tileAdminOptions,
} from "./components/global-display/MapLayerOptions";

const App: React.FC = () => {
  const [iModelId, setIModelId] = useState(process.env.IMJS_IMODEL_ID);
  const [iTwinId, setITwinId] = useState(process.env.IMJS_ITWIN_ID);
  const [changesetId, setChangesetId] = useState(
    process.env.IMJS_AUTH_CLIENT_CHANGESET_ID
  );

  const accessToken = useAccessToken();

  const authClient = Auth.getClient();

  const login = useCallback(async () => {
    try {
      await authClient.signInSilent();
    } catch {
      await authClient.signIn();
    }
  }, [authClient]);

  useEffect(() => {
    void login();
  }, [login]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("iTwinId")) {
      setITwinId(urlParams.get("iTwinId") as string);
    }
    if (urlParams.has("iModelId")) {
      setIModelId(urlParams.get("iModelId") as string);
    }
    if (urlParams.has("changesetId")) {
      setChangesetId(urlParams.get("changesetId") as string);
    }
  }, []);

  useEffect(() => {
    let url = `viewer?iTwinId=${iTwinId}`;

    if (iModelId) {
      url = `${url}&iModelId=${iModelId}`;
    }

    if (changesetId) {
      url = `${url}&changesetId=${changesetId}`;
    }
    history.push(url);
  }, [iTwinId, iModelId, changesetId]);

  /** NOTE: This function will execute the "Fit View" tool after the iModel is loaded into the Viewer.
   * This will provide an "optimal" view of the model. However, it will override any default views that are
   * stored in the iModel. Delete this function and the prop that it is passed to if you prefer
   * to honor default views when they are present instead (the Viewer will still apply a similar function to iModels that do not have a default view).
   */
  const viewConfiguration = useCallback((viewPort: ScreenViewport) => {
    // default execute the fitview tool and use the iso standard view after tile trees are loaded
    const tileTreesLoaded = () => {
      return new Promise((resolve, reject) => {
        const start = new Date();
        const intvl = setInterval(() => {
          if (viewPort.areAllTileTreesLoaded) {
            ViewerPerformance.addMark("TilesLoaded");
            ViewerPerformance.addMeasure(
              "TileTreesLoaded",
              "ViewerStarting",
              "TilesLoaded"
            );
            clearInterval(intvl);
            resolve(true);
          }
          const now = new Date();
          // after 20 seconds, stop waiting and fit the view
          if (now.getTime() - start.getTime() > 20000) {
            reject();
          }
        }, 100);
      });
    };

    tileTreesLoaded().finally(() => {
      void IModelApp.tools.run(FitViewTool.toolId, viewPort, true, false);
      viewPort.view.setStandardRotation(StandardViewId.Iso);
    });
  }, []);

  const viewCreatorOptions = useMemo(
    () => ({ viewportConfigurer: viewConfiguration }),
    [viewConfiguration]
  );

  // Connect to the iModel to query data from the iModelDB
  const onIModelConnected = (iModel: IModelConnection) => {
    // Register a callback to be executed once a view is opened in the viewPort
    IModelApp.viewManager.onViewOpen.addOnce(
      async (viewPort: ScreenViewport) => {
        IModelDataFetcher.fetchBuildingData(iModel);
        IModelDataFetcher.hideSyncedItems(viewPort);
      }
    );
  };

  const viewportOptions: ViewerViewportControlOptions = {
    viewState: async (iModelConnection) => {
      IModelApp.viewManager.onViewOpen.addOnce((viewport: ScreenViewport) => {
        // The grid just gets in the way - turn it off.
        viewport.viewFlags = viewport.view.viewFlags.with("grid", false);

        // We're not interested in seeing the contents of the iModel, only the global data.
        if (viewport.view.isSpatialView())
          viewport.view.modelSelector.models.clear();
      });
      return GlobalDisplayApi.getInitialView(iModelConnection);
    },
  };

  const defaultUiConfig = {
    hideNavigationAid: false, // Enable view cube
    hideStatusBar: true, // Disable defaul bottom bar
    hideToolSettings: true, // Disable defaul top bar
  };

  return (
    <div className="viewer-container">
      {!accessToken && (
        <FillCentered>
          <div className="signin-content">
            <ProgressLinear indeterminate={true} labels={["Signing in..."]} />
          </div>
        </FillCentered>
      )}
      <Viewer
        iTwinId={iTwinId ?? ""}
        iModelId={iModelId ?? ""}
        changeSetId={changesetId}
        authClient={authClient}
        viewCreatorOptions={viewCreatorOptions}
        enablePerformanceMonitors={true} // see description in the README (https://www.npmjs.com/package/@itwin/web-viewer-react)
        onIModelConnected={onIModelConnected}
        defaultUiConfig={defaultUiConfig}
        viewportOptions={viewportOptions}
        mapLayerOptions={mapLayerOptions}
        tileAdmin={tileAdminOptions}
        uiProviders={[
          new ScientificVizWidgetProvider(),
          new ColorLegendWidgetProvider(),
          new GlobalDisplayWidgetProvider(),
          new ViewerNavigationToolsProvider(),
        ]}
      />
    </div>
  );
};

UiFramework.frontstages.onFrontstageReadyEvent.addListener((event) => {
  const { rightPanel } = event.frontstageDef;
  rightPanel && (rightPanel.size = 275);
});

export default App;