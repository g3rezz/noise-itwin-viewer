import { IModelConnection, ScreenViewport } from "@itwin/core-frontend";
import { QueryRowFormat } from "@itwin/core-common";

export default class IModelDataFetcher {
  public static fetchBuildingData = async (iModel: IModelConnection) => {
    const buildingsToFetch: string[] = ["'Buildings_3857 [0]'"];

    const buildingsQuery = `
      SELECT ECInstanceId, Origin
      FROM GisDynamic.Buildings_3857
      WHERE UserLabel IN (${buildingsToFetch.toString()})`;

    const result = iModel.query(buildingsQuery, undefined, {
      rowFormat: QueryRowFormat.UseJsPropertyNames,
    });

    const buildingsData = [];
    for await (const row of result) {
      buildingsData.push(row);
    }

    // const elementId = buildingsData[0].id;

    // const props = await iModel.elements.loadProps(elementId, {
    //   wantGeometry: true,
    // });

    return buildingsData;
  };

  // Hide synched items in the viewport
  // e.g. iModel geolocation .geojson files
  public static hideSyncedItems = async (
    viewPort: ScreenViewport,
    toggle?: boolean
  ) => {
    const categoryIds = await IModelDataFetcher.getCategoryIds(viewPort.iModel);

    if (toggle) {
      viewPort.changeCategoryDisplay(categoryIds, toggle);
    } else {
      viewPort.changeCategoryDisplay(categoryIds, false);
    }
  };

  private static getCategoryIds = async (iModel: IModelConnection) => {
    const categoriesToHide = [
      "'Roads_3857'",
      "'Buildings_3857'",
      "'Receivers_3857'",
    ];

    const query = `SELECT ECInstanceId FROM BisCore.Category
          WHERE CodeValue IN (${categoriesToHide.toString()})`;

    const result = iModel.query(query, undefined, {
      rowFormat: QueryRowFormat.UseJsPropertyNames,
    });
    const categoryIds = [];

    for await (const row of result) {
      categoryIds.push(row.id);
    }

    return categoryIds;
  };
}
