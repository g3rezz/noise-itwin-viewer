import {
  DisplayStyle3dProps,
  SpatialViewDefinitionProps,
} from "@itwin/core-common";
import { IModelConnection, SpatialViewState } from "@itwin/core-frontend";

export class GlobalDisplayApi {
  public static readonly getInitialView = async (imodel: IModelConnection) => {
    const viewDefinitionProps: SpatialViewDefinitionProps = {
      angles: { pitch: 0, roll: 0, yaw: 0 },
      camera: {
        eye: [674467.3, 6582698.61, 2237],
        focusDist: 1000,
        lens: 45,
      },
      cameraOn: true,
      categorySelectorId: "0x825",
      classFullName: "BisCore:SpatialViewDefinition",
      code: { scope: "0x28", spec: "0x1c", value: "" },
      description: "",
      displayStyleId: "0x824",
      extents: [1000, 1000, 1000],
      id: "0x822",
      isPrivate: false,
      model: "0x28",
      modelSelectorId: "0x823",
      origin: [674467.3, 6582698.61, 237],
    };

    const displayStyleProps: DisplayStyle3dProps = {
      classFullName: "BisCore:DisplayStyle3d",
      code: { scope: "0x28", spec: "0xa", value: "" },
      id: "0x824",
      model: "0x28",
      jsonProperties: {
        styles: {
          backgroundMap: {
            applyTerrain: true,
            terrainSettings: { heightOriginMode: 0 },
          },
          environment: {
            ground: {
              display: false,
            },
            sky: {
              display: true,
              groundColor: 8228728,
              nadirColor: 3880,
              skyColor: 16764303,
              zenithColor: 16741686,
            },
            atmosphere: {
              display: true,
            },
          },
          viewflags: {
            backgroundMap: true,
            grid: false,
            renderMode: 6,
            visEdges: true,
          },
          // Make the edge in black color
          // hline: {
          //   visible: { color: 0 },
          // },
        },
      },
    };

    return SpatialViewState.createFromProps(
      {
        viewDefinitionProps,
        displayStyleProps,
        categorySelectorProps: {
          categories: [],
          classFullName: "BisCore:CategorySelector",
          code: { scope: "0x28", spec: "0x8", value: "" },
          id: "0x825",
          model: "0x28",
        },
        modelSelectorProps: {
          classFullName: "BisCore:ModelSelector",
          code: { scope: "0x28", spec: "0x11", value: "" },
          id: "0x823",
          model: "0x28",
          models: [],
        },
      },
      imodel
    );
  };
}
