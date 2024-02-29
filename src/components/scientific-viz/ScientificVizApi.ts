import { AuxChannel, IModelJson, Polyface } from "@itwin/core-geometry";
import {
  AnalysisStyle,
  AnalysisStyleProps,
  ThematicGradientSettingsProps,
} from "@itwin/core-common";
import { Animator, Viewport } from "@itwin/core-frontend";
import { ScientificVizDecorator } from "./ScientificVizDecorator";
import { jsonBuildingsAll } from "./BuildingsAll";
import { jsonBuildingsAllSmaller } from "./BuildingsAllSmaller";
import { jsonBuildingsClusters } from "./BuildingsClusters";
import { jsonBuildingsGroups } from "./BuildingsGroups";

export default class ScientificVizApi {
  // Create all buildings from BuildingsAll.ts
  public static async createBuildings(): Promise<Polyface> {
    const jsonString = JSON.stringify(jsonBuildingsAll);
    const polyface = IModelJson.Reader.parse(
      JSON.parse(jsonString)
    ) as Polyface;
    return polyface;
  }

  // Create the other buildings from BuildingsAllSmaller.ts
  // As a workaround for one AnalysisStyle per decoration limitation
  public static async createBuildingsSmaller(): Promise<Polyface> {
    const jsonString = JSON.stringify(jsonBuildingsAllSmaller);
    const polyfaceNoStyle = IModelJson.Reader.parse(
      JSON.parse(jsonString)
    ) as Polyface;
    return polyfaceNoStyle;
  }

  // Create a specific cluster from BuildingClusters.ts
  public static async createCluster(clusterId: string): Promise<Polyface> {
    const clusterData = (
      jsonBuildingsClusters as Record<
        string,
        {
          indexedMesh: {
            auxData: {
              channels: {
                dataType: number;
                inputName: string;
                name: string;
                data: { input: number; values: number[] }[];
              }[];
              indices: number[];
            };
            point: number[][];
            pointIndex: number[];
          };
        }
      >
    )[clusterId];

    const jsonString = JSON.stringify(clusterData);
    const buildingCluster = IModelJson.Reader.parse(
      JSON.parse(jsonString)
    ) as Polyface;

    return buildingCluster;
  }

  // Create a specific building from BuildingSolos.ts
  public static async createBuilding(buildingId: string): Promise<Polyface> {
    const buildingData = (
      jsonBuildingsGroups as Record<
        string,
        {
          indexedMesh: {
            auxData: {
              channels: {
                dataType: number;
                inputName: string;
                name: string;
                data: { input: number; values: number[] }[];
              }[];
              indices: number[];
            };
            point: number[][];
            pointIndex: number[];
          };
        }
      >
    )[buildingId];

    const jsonString = JSON.stringify(buildingData);
    const polyBuilding = IModelJson.Reader.parse(
      JSON.parse(jsonString)
    ) as Polyface;

    return polyBuilding;
  }

  public static createAnalysisStyleForChannels(
    thematicChannel?: AuxChannel,
    thematicSettings?: ThematicGradientSettingsProps
  ) {
    const props: AnalysisStyleProps = {};

    if (
      thematicChannel &&
      thematicChannel.name &&
      thematicChannel.scalarRange
    ) {
      props.scalar = {
        channelName: thematicChannel.name,
        range: thematicChannel.scalarRange,
        thematicSettings,
      };
    }

    return AnalysisStyle.fromJSON(props);
  }

  // The viewport's analysis style controls which channels from the auxData are used to display the mesh.
  public static setAnalysisStyle(vp: Viewport, style?: AnalysisStyle) {
    vp.displayStyle.settings.analysisStyle = style;
  }

  // This method shows how to determine if an analysis style can be animated.
  public static styleSupportsAnimation(style: AnalysisStyle) {
    // The channels array holds all the channels available on the polyface.
    const channels =
      ScientificVizDecorator.decorator.polyface.data.auxData?.channels;
    if (!channels) return false;

    // The analysis style specifies up to three channelNames.
    const channelNames = [
      style.displacement?.channelName,
      style.thematic?.channelName, // We are using the thematic channel
      style.normalChannelName,
    ];

    // The style can be animated if any of the three channels has more than one set of data.
    return channels.some(
      (c) => c.data.length > 1 && channelNames.includes(c.name)
    );
  }

  // For styles that can be animated, the viewport's analysis fraction controls the interpolation
  // between the members of the data array.
  public static getAnalysisFraction(vp: Viewport) {
    return vp.analysisFraction;
  }

  // Changing this sets the state of the visualization for styles that can be animated.
  public static setAnalysisFraction(vp: Viewport, fraction: number) {
    vp.analysisFraction = fraction;
  }

  // Stops the animator in the viewport.
  public static stopAnimation(vp: Viewport) {
    vp.setAnimator(undefined);
  }

  // Creates and starts an animator in the viewport.
  public static startAnimation(vp: Viewport, interruptFunc: () => void) {
    const animator: Animator = {
      // Will be called before rendering a frame as well as force the viewport to re-render every frame.
      animate: () => {
        let newFraction = 0.005 + ScientificVizApi.getAnalysisFraction(vp);

        if (1.0 < newFraction) newFraction = 0.0;

        ScientificVizApi.setAnalysisFraction(vp, newFraction);
        return false;
      },
      // Will be called if the animation is interrupted (e.g. the camera is moved)
      interrupt: () => {
        interruptFunc();
      },
    };

    vp.setAnimator(animator);
  }

  // Sets up a listener to detect changes to the display style.  This includes changes to the analysisFraction.
  public static listenForAnalysisFractionChanges(
    viewport: Viewport,
    listenerFunc: (vp: Viewport) => void
  ) {
    return viewport.onDisplayStyleChanged.addListener((vp) => listenerFunc(vp));
  }
}
