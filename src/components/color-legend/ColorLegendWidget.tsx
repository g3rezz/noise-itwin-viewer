import React from "react";
import {
  StagePanelLocation,
  StagePanelSection,
  UiItemsProvider,
  Widget,
  WidgetState,
} from "@itwin/appui-react";
import "./ColorLegend.scss";

export const ColorLegendWidget = () => {
  return (
    <div className="color-legend-container">
      <div className="legend-items">
        <div className="legend-item">
          <div className="color-box color-35"></div>
          {"<= 35 dB"}
        </div>
        <div className="legend-item">
          <div className="color-box color-40"></div>
          {"> 35 - 40 dB"}
        </div>
        <div className="legend-item">
          <div className="color-box color-45"></div>
          {"> 40 - 45 dB"}
        </div>
        <div className="legend-item">
          <div className="color-box color-50"></div>
          {"> 45 - 50 dB"}
        </div>
        <div className="legend-item">
          <div className="color-box color-55"></div>
          {"> 50 - 55 dB"}
        </div>
        <div className="legend-item">
          <div className="color-box color-60"></div>
          {"> 55 - 60 dB"}
        </div>
        <div className="legend-item">
          <div className="color-box color-65"></div>
          {"> 60 - 65 dB"}
        </div>
        <div className="legend-item">
          <div className="color-box color-70"></div>
          {"> 65 - 70 dB"}
        </div>
        <div className="legend-item">
          <div className="color-box color-75"></div>
          {"> 70 - 75 dB"}
        </div>
        <div className="legend-item">
          <div className="color-box color-80"></div>
          {"> 75 - 80 dB"}
        </div>
        <div className="legend-item">
          <div className="color-box color-high"></div>
          {"> 80 dB"}
        </div>
      </div>
    </div>
  );
};

export class ColorLegendWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ColorLegendWidgetProvider";

  public provideWidgets(
    _stageId: string,
    _stageUsage: string,
    location: StagePanelLocation,
    _section?: StagePanelSection
  ): ReadonlyArray<Widget> {
    const widgets: Widget[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push({
        id: "ColorLegendWidget",
        label: "Color Legend",
        defaultState: WidgetState.Open,
        content: <ColorLegendWidget />,
      });
    }
    return widgets;
  }
}
