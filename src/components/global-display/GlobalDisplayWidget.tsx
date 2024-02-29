import React, { useEffect, useState } from "react";
import {
  StagePanelLocation,
  StagePanelSection,
  UiItemsProvider,
  useActiveViewport,
  Widget,
  WidgetState,
} from "@itwin/appui-react";
import { BackgroundMapType } from "@itwin/core-common";

import { SvgHelpCircularHollow } from "@itwin/itwinui-icons-react";
import { IconButton, Text, ToggleSwitch } from "@itwin/itwinui-react";
import "./GlobalDisplay.scss";

const GlobalDisplayWidget = () => {
  const viewport = useActiveViewport();
  /** True for 3d terrain, false for a flat map. */
  const [terrain, setTerrain] = useState<boolean>(true);
  /** Display map labels with the map imagery. */
  const [mapLabels, setMapLabels] = useState<boolean>(false);
  /** Display 3d building meshes from Open Street Map Buildings. */
  const [buildings, setBuildings] = useState<boolean>(false);
  /** If buildings are displayed, also display their edges. */
  const [buildingEdges, setBuildingEdges] = useState<boolean>(false);

  useEffect(() => {
    if (viewport) {
      viewport.changeBackgroundMapProps({
        applyTerrain: terrain,
      });
      viewport.changeBackgroundMapProvider({
        type: mapLabels ? BackgroundMapType.Hybrid : BackgroundMapType.Aerial,
      });
    }
  }, [viewport, terrain, mapLabels]);

  useEffect(() => {
    if (viewport) {
      viewport.displayStyle.setOSMBuildingDisplay({
        onOff: buildings,
      });
    }
  }, [viewport, buildings]);

  useEffect(() => {
    if (viewport) {
      viewport.viewFlags = viewport.viewFlags.with(
        "visibleEdges",
        buildingEdges
      );
    }
  }, [viewport, buildingEdges]);

  const infoLabel = (label: string, tooltip: string) => (
    <span className="gd-toggle-label">
      <Text>{label}</Text>
      <IconButton size="small" styleType="borderless" title={tooltip}>
        <SvgHelpCircularHollow />
      </IconButton>
    </span>
  );

  return (
    <div className="gd-container">
      <div className="gd-options">
        <div className="gd-options-toggles">
          <ToggleSwitch
            label={infoLabel(
              "Terrain",
              "Display 3d terrain from Cesium World Terrain Service"
            )}
            checked={terrain}
            onChange={() => setTerrain(!terrain)}
          />
          <ToggleSwitch
            label={infoLabel(
              "Map Labels",
              "Include labels in the Bing map imagery"
            )}
            checked={mapLabels}
            onChange={() => setMapLabels(!mapLabels)}
          />
          <ToggleSwitch
            label={infoLabel(
              "Buildings",
              "Display building meshes from Open Street Map"
            )}
            checked={buildings}
            onChange={() => setBuildings(!buildings)}
          />
          <ToggleSwitch
            label={infoLabel(
              "Building Edges",
              "Display the edges of the building meshes"
            )}
            checked={buildingEdges}
            onChange={() => setBuildingEdges(!buildingEdges)}
          />
        </div>
      </div>
    </div>
  );
};

export class GlobalDisplayWidgetProvider implements UiItemsProvider {
  public readonly id: string = "GlobalDisplayWidgetProvider";

  public provideWidgets(
    _stageId: string,
    _stageUsage: string,
    location: StagePanelLocation,
    _section?: StagePanelSection
  ): ReadonlyArray<Widget> {
    const widgets: Widget[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push({
        id: "GlobalDisplayWidget",
        label: "Context Controls",
        defaultState: WidgetState.Closed,
        content: <GlobalDisplayWidget />,
      });
    }
    return widgets;
  }
}
