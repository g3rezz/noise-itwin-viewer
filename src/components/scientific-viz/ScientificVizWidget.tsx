import React, { useCallback, useEffect } from "react";
import {
  StagePanelLocation,
  StagePanelSection,
  UiItemsProvider,
  useActiveViewport,
  Widget,
  WidgetState,
} from "@itwin/appui-react";
import { SvgPause, SvgPlay } from "@itwin/itwinui-icons-react";
import {
  Alert,
  IconButton,
  LabeledSelect,
  SelectOption,
  Slider,
  Button,
} from "@itwin/itwinui-react";
import { SvgHelpCircularHollow, SvgZoomIn } from "@itwin/itwinui-icons-react";
import {
  ThematicGradientColorScheme,
  ThematicGradientMode,
  ThematicGradientSettingsProps,
  Gradient,
  ColorDef,
  Placement3d,
} from "@itwin/core-common";
import { StandardViewId, IModelApp } from "@itwin/core-frontend";
import {
  AuxChannelDataType,
  Point3d,
  Polyface,
  Range3d,
  YawPitchRollAngles,
} from "@itwin/core-geometry";
import "./ScientificViz.scss";
import ScientificVizApi from "./ScientificVizApi";
import { ScientificVizDecorator } from "./ScientificVizDecorator";

// Define the buildings for selection
export type SampleMeshName =
  | "All"
  | "Cluster B1"
  | "Cluster C1"
  | "Cluster C2"
  | "Cluster C3"
  | "Cluster CA1"
  | "Cluster CA2"
  | "Cluster CA3"
  | "Cluster CA4"
  | "Innovation Factory"
  | "Campus-Tower"
  | "Research Building 1"
  | "Research Building 2"
  | "Research Building 3"
  | "Research Building 4"
  | "Research Building 5";
const sampleMeshNames: SelectOption<SampleMeshName>[] = [
  { label: "All", value: "All" },
  { label: "Cluster B1", value: "Cluster B1" },
  { label: "Cluster C1", value: "Cluster C1" },
  { label: "Cluster C2", value: "Cluster C2" },
  { label: "Cluster C3", value: "Cluster C3" },
  { label: "Cluster CA1", value: "Cluster CA1" },
  { label: "Cluster CA2", value: "Cluster CA2" },
  { label: "Cluster CA3", value: "Cluster CA3" },
  { label: "Cluster CA4", value: "Cluster CA4" },
  { label: "Campus-Tower", value: "Campus-Tower" },
  { label: "Innovation Factory", value: "Innovation Factory" },
  { label: "Research Building 1", value: "Research Building 1" },
  { label: "Research Building 2", value: "Research Building 2" },
  { label: "Research Building 3", value: "Research Building 3" },
  { label: "Research Building 4", value: "Research Building 4" },
  { label: "Research Building 5", value: "Research Building 5" },
];

export const ScientificVizWidget = () => {
  const [lowValues, setLowValues] = React.useState<{
    x: number;
    y: number;
    z: number;
  }>({
    x: 674467.3,
    y: 6582698.61,
    z: 237,
  });
  const [highValues, setHighValues] = React.useState<{
    x: number;
    y: number;
    z: number;
  }>({
    x: 675781.9,
    y: 6583500.84,
    z: 291,
  });
  const [analysisStyleRange, setAnalysisStyleRange] = React.useState<
    any | undefined
  >(undefined);
  const [meshName, setMeshName] = React.useState<SampleMeshName>("All");
  const [thematicChannelData, setThematicChannelData] = React.useState<{
    currentChannelName: string;
    channelNames: string[];
  }>({ currentChannelName: "Lden", channelNames: [] });
  const [isAnimated, setIsAnimated] = React.useState<boolean>(false);
  const [canBeAnimated, setCanBeAnimated] = React.useState<boolean>(false);
  const viewport = useActiveViewport();
  const [fraction, setFraction] = React.useState<number>(
    ScientificVizApi.getAnalysisFraction(viewport!)
  );

  // Get only the channels that have a defined data type and name
  const getChannelsByType = (
    polyface: Polyface | undefined,
    ...types: AuxChannelDataType[]
  ) => {
    const auxData = polyface?.data.auxData;
    if (!auxData) return [];
    return auxData.channels.filter(
      (c) => types.includes(c.dataType) && undefined !== c.name
    );
  };

  const applyZoom = async () => {
    const vp = IModelApp.viewManager.selectedView;

    if (vp) {
      const placementForDecoration = createPlacement(lowValues, highValues);
      vp.zoomToPlacements([placementForDecoration], {
        animateFrustumChange: true,
        standardViewId: StandardViewId.Iso,
      });
    }
  };

  // Create a Placement3d object to enable zoom in
  const createPlacement = (
    low: { x: number; y: number; z: number },
    high: { x: number; y: number; z: number }
  ) => {
    const origin = Point3d.fromJSON({ x: 0, y: 0, z: 0 });
    const angles = YawPitchRollAngles.createRadians(0, 0, 0);
    const lowPoint = Point3d.fromJSON(low);
    const highPoint = Point3d.fromJSON(high);
    const range = Range3d.fromJSON({ low: lowPoint, high: highPoint });

    return new Placement3d(origin, angles, range);
  };

  // Callback to initialize the decorator based on the selected mesh
  const initializeDecorator = useCallback(async () => {
    if (!viewport) return;

    // Cleanup the existing decorator, if any
    if (ScientificVizDecorator.decorator) {
      ScientificVizApi.setAnalysisStyle(viewport, undefined);
      ScientificVizDecorator.decorator.dispose();
    }

    // Smaller buildings unterneath as a workaround to AnalysisStyle limitation
    const polyfaceNoStyle = await ScientificVizApi.createBuildingsSmaller();

    ScientificVizDecorator.decorator = new ScientificVizDecorator(
      viewport,
      polyfaceNoStyle,
      meshName
    );

    // Generate buildings according to selection
    const polyface =
      meshName === "All"
        ? await ScientificVizApi.createBuildings()
        : meshName === "Cluster C3"
        ? await ScientificVizApi.createCluster("cluster_01")
        : meshName === "Cluster C2"
        ? await ScientificVizApi.createCluster("cluster_02")
        : meshName === "Cluster C1"
        ? await ScientificVizApi.createCluster("cluster_03")
        : meshName === "Cluster B1"
        ? await ScientificVizApi.createCluster("cluster_04")
        : meshName === "Cluster CA4"
        ? await ScientificVizApi.createCluster("cluster_05")
        : meshName === "Cluster CA3"
        ? await ScientificVizApi.createCluster("cluster_06")
        : meshName === "Cluster CA2"
        ? await ScientificVizApi.createCluster("cluster_07")
        : meshName === "Cluster CA1"
        ? await ScientificVizApi.createCluster("cluster_08")
        : meshName === "Research Building 5"
        ? await ScientificVizApi.createBuilding("buildings_groups_06")
        : meshName === "Research Building 4"
        ? await ScientificVizApi.createBuilding("buildings_groups_09")
        : meshName === "Research Building 3"
        ? await ScientificVizApi.createBuilding("buildings_groups_11")
        : meshName === "Research Building 2"
        ? await ScientificVizApi.createBuilding("buildings_groups_13")
        : meshName === "Research Building 1"
        ? await ScientificVizApi.createBuilding("buildings_groups_16")
        : meshName === "Innovation Factory"
        ? await ScientificVizApi.createBuilding("buildings_groups_17")
        : await ScientificVizApi.createBuilding("buildings_groups_18");

    // Create the new decorator, it will add itself to the viewport
    ScientificVizDecorator.decorator = new ScientificVizDecorator(
      viewport,
      polyface,
      meshName
    );

    console.log("Decorators array:", IModelApp.viewManager.decorators);
    console.log(ScientificVizDecorator.decorator.meshName);
    console.log(ScientificVizDecorator.decorator);

    // Populate state with list of channels appropriate for the current mesh
    const thematicChannelNames = [
      ...getChannelsByType(
        polyface,
        AuxChannelDataType.Scalar,
        AuxChannelDataType.Distance
      ).map((c) => c.name!),
    ];

    // Pick the defaults for the chosen mesh
    let defaultThematicChannel: string = "Lden";

    setThematicChannelData({
      currentChannelName: defaultThematicChannel,
      channelNames: thematicChannelNames,
    });

    // Set the zoom-in coordinates according to the selected building
    // Accessed with ScientificVizDecorator.decorator.graphic?._graphic.range
    switch (meshName) {
      case "Cluster B1":
        setLowValues({ x: 675411.73, y: 6582698.61, z: 237 });
        setHighValues({ x: 675781.9, y: 6582999.67, z: 291 });
        break;
      case "Cluster C1":
        setLowValues({ x: 675131.47, y: 6582934.71, z: 237 });
        setHighValues({ x: 675468.77, y: 6583235.52, z: 276 });
        break;
      case "Cluster C2":
        setLowValues({ x: 674889.51, y: 6583110, z: 237 });
        setHighValues({ x: 675197.04, y: 6583386.37, z: 276 });
        break;
      case "Cluster C3":
        setLowValues({ x: 674467.3, y: 6583239.28, z: 237 });
        setHighValues({ x: 674907.56, y: 6583500.84, z: 276 });
        break;
      case "Cluster CA1":
        setLowValues({ x: 675536.39, y: 6582855.54, z: 237 });
        setHighValues({ x: 675751.5, y: 6583067.99, z: 258 });
        break;
      case "Cluster CA2":
        setLowValues({ x: 675401.49, y: 6583055.12, z: 237 });
        setHighValues({ x: 675550.28, y: 6583203.72, z: 252 });
        break;
      case "Cluster CA3":
        setLowValues({ x: 675220.7, y: 6583178.63, z: 237 });
        setHighValues({ x: 675411.97, y: 6583348.64, z: 252 });
        break;
      case "Cluster CA4":
        setLowValues({ x: 675022.11, y: 6583324.46, z: 237 });
        setHighValues({ x: 675224.55, y: 6583482.6, z: 252 });
        break;
      case "Research Building 5":
        setLowValues({ x: 674743.69, y: 6583334.05, z: 237 });
        setHighValues({ x: 674907.56, y: 6583439.54, z: 276 });
        break;
      case "Research Building 4":
        setLowValues({ x: 674925.48, y: 6583287.88, z: 237 });
        setHighValues({ x: 675042.31, y: 6583386.37, z: 258 });
        break;
      case "Research Building 3":
        setLowValues({ x: 675039.24, y: 6583200.74, z: 237 });
        setHighValues({ x: 675197.04, y: 6583339.6, z: 276 });
        break;
      case "Research Building 2":
        setLowValues({ x: 675185.58, y: 6583087.51, z: 237 });
        setHighValues({ x: 675343.79, y: 6583235.52, z: 258 });
        break;
      case "Research Building 1":
        setLowValues({ x: 675322.11, y: 6582982.89, z: 237 });
        setHighValues({ x: 675468.77, y: 6583127.55, z: 276 });
        break;
      case "Innovation Factory":
        setLowValues({ x: 675411.73, y: 6582731.72, z: 237 });
        setHighValues({ x: 675726.23, y: 6582999.67, z: 258 });
        break;
      case "Campus-Tower":
        setLowValues({ x: 675679.11, y: 6582714.98, z: 237 });
        setHighValues({ x: 675746.08, y: 6582780.27, z: 291 });
        break;
      default:
        // Use default values for "All" or other cases
        setLowValues({ x: 674467.3, y: 6582698.61, z: 237 });
        setHighValues({ x: 675781.9, y: 6583500.84, z: 291 });
        break;
    }
  }, [viewport, meshName]);

  // Effect to configure the viewport settings on mount and handle cleanup
  useEffect(() => {
    if (viewport) {
      const viewFlags = viewport.viewFlags.copy({
        // Copying view flags to ensure visibility of edges
        visibleEdges: true,
        hiddenEdges: false,
      });
      viewport.viewFlags = viewFlags;
      viewport.setStandardRotation(StandardViewId.Iso); // Setting the viewport rotation to standard isometric view
      viewport.zoomToVolume(viewport.iModel.projectExtents); // Zooming to the volume of the entire project

      // Adding a listener for changes in analysis fraction (for animation)
      const dropListener = ScientificVizApi.listenForAnalysisFractionChanges(
        viewport,
        (vp) => {
          setFraction(vp.analysisFraction);
        }
      );
      return () => dropListener();
    }
    return undefined;
  }, [viewport]);

  // Effect to update the analysis fraction in the viewport
  useEffect(() => {
    if (viewport) {
      ScientificVizApi.setAnalysisFraction(viewport, fraction);
    }
  }, [fraction, viewport]);

  // Effect to initialize the decorator when the viewport or initializeDecorator function changes
  useEffect(() => {
    if (!viewport) return;
    void initializeDecorator();
  }, [viewport, initializeDecorator]);

  // Effect to update the analysis style based on selected channels and options
  useEffect(() => {
    if (!viewport || !ScientificVizDecorator.decorator) return;

    const polyface = ScientificVizDecorator.decorator.polyface;
    const thematicChannel = polyface.data.auxData?.channels.find(
      (c) => thematicChannelData.currentChannelName === c.name
    );

    if (!thematicChannel) return;

    // Map a scalar value to a ColorDef based on DIN 18005-2:1991 (Germany)
    const mapScalarToColor = (scalarValue: number): ColorDef => {
      const colorRanges: [number, ColorDef][] = [
        [80, ColorDef.from(19, 67, 103)], // darkBlue
        [75, ColorDef.from(24, 85, 140)], // blue
        [70, ColorDef.from(136, 73, 123)], // purple
        [65, ColorDef.from(141, 26, 39)], // darkRed
        [60, ColorDef.from(199, 25, 50)], // red
        [55, ColorDef.from(239, 121, 38)], // orange
        [50, ColorDef.from(159, 111, 44)], // brown
        [45, ColorDef.from(236, 215, 33)], // yellow
        [40, ColorDef.from(14, 76, 60)], // darkGreen
        [35, ColorDef.from(29, 132, 53)], // green
        [0, ColorDef.from(183, 206, 142)], // lightGreen (Default color)
      ];

      for (const [threshold, color] of colorRanges) {
        if (scalarValue > threshold) {
          return color;
        }
      }

      return ColorDef.from(190, 190, 190); // Default color as ColorDef
    };

    // Initialize minScalar and maxScalar for the first data element
    let minScalar = Number.MAX_VALUE;
    let maxScalar = Number.MIN_VALUE;

    // Initialize an array to store mappings for all data elements
    const mappings: Gradient.KeyColorProps[][] = [];

    // Iterate over each data element in the Animation channel
    for (const dataElement of thematicChannel.data) {
      // Update minScalar and maxScalar for the current data element
      const minValue = Math.min(...dataElement.values);
      const maxValue = Math.max(...dataElement.values);
      minScalar = Math.min(minScalar, minValue);
      maxScalar = Math.max(maxScalar, maxValue);
      // Create an array with 256 values for the current data element
      const mapping: Gradient.KeyColorProps[] = new Array(256)
        .fill(0)
        .map((_, i) => {
          const normalizedValue = i / 255;
          const scalarValue =
            minScalar + normalizedValue * (maxScalar - minScalar);
          const colorDef = mapScalarToColor(scalarValue);

          return {
            value: normalizedValue,
            color: colorDef.tbgr,
          };
        });

      // Add the mapping to the array
      mappings.push(mapping);
    }

    // Use the mapping to set up the thematic gradient settings for the current data element
    for (const mapping of mappings) {
      const thematicSettings: ThematicGradientSettingsProps = {
        colorScheme: ThematicGradientColorScheme.Custom,
        customKeys: mapping,
        mode: ThematicGradientMode.Stepped,
        stepCount: mapping.length,
        marginColor: 0x7f7f7f,
      };

      // Create an analysis style for the current data element
      const analysisStyle = ScientificVizApi.createAnalysisStyleForChannels(
        thematicChannel,
        thematicSettings
      );

      // Set the analysis style for the current data element
      ScientificVizApi.setAnalysisStyle(viewport, analysisStyle);

      // You may want to handle animation here based on your requirements
      setIsAnimated(false);
      setCanBeAnimated(ScientificVizApi.styleSupportsAnimation(analysisStyle));

      setAnalysisStyleRange(analysisStyle?.thematic?.range);
    }
  }, [viewport, meshName, thematicChannelData]);

  const handleThematicChannelChange = (channelName: string) => {
    switch (channelName) {
    }

    setThematicChannelData({
      ...thematicChannelData,
      currentChannelName: channelName,
    });
  };

  // Effect to start/stop animation based on state
  useEffect(() => {
    if (!viewport) return;

    if (isAnimated) {
      ScientificVizApi.startAnimation(viewport, () => {
        setIsAnimated(false);
      });
      return () => {
        ScientificVizApi.stopAnimation(viewport);
      };
    }

    return undefined;
  }, [isAnimated, viewport]);

  // Change display text based on channel name
  const getDisplayText = (channelName: string) => {
    switch (channelName) {
      case "Lden":
        return "24-hours";
      case "Lday":
        return "Day";
      case "Levening":
        return "Evening";
      case "Lnight":
        return "Night";
      default:
        return channelName;
    }
  };

  const infoLabel = (label: string, tooltip: string) => (
    <span className="sv-toggle-label">
      {label}
      <IconButton size="small" styleType="borderless" title={tooltip}>
        <SvgHelpCircularHollow />
      </IconButton>
    </span>
  );

  const getNumberColor = (value: number) => {
    if (value <= 35) {
      return { color: "#b7ce8e" };
    } else if (value <= 40) {
      return { color: "#1d8435" };
    } else if (value <= 45) {
      return { color: "#0e4c3c" };
    } else if (value <= 50) {
      return { color: "#ecd721" };
    } else if (value <= 55) {
      return { color: "#9f6f2c" };
    } else if (value <= 60) {
      return { color: "#ef7926" };
    } else if (value <= 65) {
      return { color: "#c71932" };
    } else if (value <= 70) {
      return { color: "#8d1a27" };
    } else if (value <= 75) {
      return { color: "#88497b" };
    } else if (value <= 80) {
      return { color: "#18558c" };
    } else {
      return { color: "#134367" };
    }
  };

  const getNumberStyle = (value: number) => {
    const color = getNumberColor(value).color;
    return {
      color: "#fff", // White text color
      background: color, // Background color based on the value
      padding: "2px 5px",
      borderRadius: "4px",
    };
  };

  // Render the component UI
  return (
    <div className="sv-options">
      <div className="sv-grid">
        <LabeledSelect
          label={infoLabel(
            "Buildings",
            "Displays planned buildings on Campus West"
          )}
          size="small"
          options={sampleMeshNames}
          value={meshName}
          onChange={(mesh) => setMeshName(mesh)}
          message="Choose buildings for decibel levels display."
        />
        <LabeledSelect
          label={infoLabel(
            "Time of Day",
            "Display the decibel levels at a specific time of day"
          )}
          size="small"
          options={thematicChannelData.channelNames.map((val) => ({
            label: getDisplayText(val),
            value: val,
          }))}
          value={thematicChannelData.currentChannelName}
          onChange={(thematicChannel) =>
            handleThematicChannelChange(thematicChannel)
          }
          message="Choose a time of day or select 'Animation'."
        />
        <div className="sv-animation" style={{ marginBottom: "12%" }}>
          <IconButton
            label="Play the animation."
            size="small"
            styleType="cta"
            onClick={() => setIsAnimated((state) => !state)}
            disabled={!canBeAnimated}
          >
            {isAnimated ? <SvgPause /> : <SvgPlay />}
          </IconButton>
          <Slider
            style={{ width: "90%" }}
            min={0}
            minLabel=""
            max={1}
            maxLabel=""
            tickLabels={["Day", "Evening", "Night"]}
            values={[fraction]}
            step={0.01}
            onUpdate={(values) => {
              if (!isAnimated) setFraction(values[0]);
            }}
            disabled={!canBeAnimated || isAnimated}
          />
        </div>
        <Button
          startIcon={<SvgZoomIn />}
          size="large"
          className="custom-styled-button"
          styleType="high-visibility"
          onClick={applyZoom}
        >
          Zoom to{" "}
          <strong className="zoom-text condensed-text">{` ${meshName}`}</strong>
        </Button>
      </div>
      <Alert type="informational" className="sv-instructions">
        <div className="alert-content">
          <div className="alert-line">
            <span className="alert-label">Minimum:</span>{" "}
            <strong style={getNumberStyle(Math.round(analysisStyleRange?.low))}>
              {Math.round(analysisStyleRange?.low)}
            </strong>{" "}
            dB
          </div>
          <div className="alert-line">
            <span className="alert-label">Maximum:</span>{" "}
            <strong
              style={getNumberStyle(Math.round(analysisStyleRange?.high))}
            >
              {Math.round(analysisStyleRange?.high)}
            </strong>{" "}
            dB
          </div>
        </div>
      </Alert>
    </div>
  );
};

export class ScientificVizWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ScientificVizWidgetProvider";

  // Provide the widget for the specified stage location
  public provideWidgets(
    _stageId: string,
    _stageUsage: string,
    location: StagePanelLocation,
    _section?: StagePanelSection
  ): ReadonlyArray<Widget> {
    const widgets: Widget[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push({
        id: "ScientificVizWidgetProvider",
        label: "Visualization Controls",
        defaultState: WidgetState.Open,
        content: <ScientificVizWidget />,
      });
    }
    return widgets;
  }
}
