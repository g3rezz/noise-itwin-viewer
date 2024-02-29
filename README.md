# <img width="50" height="50" src="data/logo.svg" /> CampusWest.noiseTwin()

## A Noise Pollution iTwin Viewer

`CampusWest.noiseTwin()` is a prototype iTwin Viewer developed on [Bentley System's](https://www.bentley.com/) [iTwin Platform](https://www.itwinjs.org/) to address noise pollution. It was created during the Prototyping Project in the third semester of the Construction and Robotics master's track at the RWTH Aachen University.

The viewer aims to represent in 3D how noise affects the future buildings on the Campus West expansion of RWTH Aachen University.

## Features

The iTwin Viewer includes the following features:

- 3D visualization of the noise impact on buildings,
- selection of the building of interest,
- the ability to change the time of day,
- animation over the different times of day,
- zoom-in functionality to the building of interest,
- minimum and maximum decibel reading of the building of interest,
- tooltip for the building of interest,
- a color scheme based on the decibel level,
- contextual information about surrounding streets and buildings.

## In Action

https://github.com/g3rezz/noise-itwin-viewer/assets/19578037/4e44c6b7-b788-4cc4-a182-e8ce11ee51cc

# iTwin Viewer Setup

## 1. Get Started

Follow the steps from the [Get Started! - Tutorials | iTwin Platform](https://developer.bentley.com/tutorials/web-application-quick-start/) guide.

### Additional Notes

- In step [2. Get the code](https://developer.bentley.com/tutorials/web-application-quick-start/#2-get-the-code) :

  - Clone this repository instead.

- In step [3. Register an Application](https://developer.bentley.com/tutorials/web-application-quick-start/#3-register-an-application):

  - Register the single page application (SPA) and fill out the missing `IMJS_AUTH_CLIENT_CLIENT_ID` in the `.env` file.

- In step [4. Create an iModel](https://developer.bentley.com/tutorials/web-application-quick-start/#4-create-an-imodel):

  - Under 6. select **Empty iModel** and then choose the **File Synchronization** tile from iModel Home.
  - Upload `buildings_3857.geojson` from your project folder in `data/qgis/data`. The synchronization might take 5 to 10 minutes.
    - You have just geolocated your iModel.
    - The iModel has to be geolocated so that the iTwin Viewer can visualize the buildings at the correct coordinates.

- In step [5. Run the code](https://developer.bentley.com/tutorials/web-application-quick-start/#5-run-the-code):
  - Obtain the `IMJS_ITWIN_ID` and `IMJS_IMODEL_ID` values:
    1. Go to **My iTwins** and open your iTwin.
    2. In **IModels** click the three dots on the **IModels** tile and select **CopyIds**.

## 2. Add the Geospatial Data Keys

The iTwin Viewer requires a Bings Maps key and a Cesium access token in the `.env` file:

```
# Api key for Bing Maps
IMJS_BING_MAPS_KEY = ""

# Access token for Cesium
IMJS_CESIUM_ION_KEY = ""
```

- For the `IMJS_BING_MAPS_KEY` variable, you can obtain a Bing Maps key from [Bing Maps Dev Center](https://www.bingmapsportal.com/).

  - More information on [Bing Maps Keys](https://www.microsoft.com/en-us/maps/bing-maps/create-a-bing-maps-key).

- For the `IMJS_CESIUM_ION_KEY` variable, you can obtain a Cesium access token from [Cesium ion](https://ion.cesium.com).
  - More information on [Cesium ion Access Tokens](https://cesium.com/learn/ion/cesium-ion-access-tokens).

These keys provide a context map, terrain, and surrounding buildings.

## 3. Run the iTwin Viewer

Run `npm install` and then `npm start` in the folder where you cloned the repository.

### `npm install`

Installs the required dependencies.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

# Documentation

To create your own visualization data for the iTwin Viewer:

## Data

The required data for the visualization in the iTwin Viewer is generated using a QGIS project, the plug-in [opeNoise](https://plugins.qgis.org/plugins/opeNoise/) and the [PyVista](https://pyvista.org) library.

| Filename                                    | Description                                                                                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| qgis_project.qgz                            | QGIS project file with the required layers.                                                                                                                  |
| qgis_receiver_points_height_generation.py   | Script that creates a height_m field in the receiver points layer and duplicates all points by updating the height_m field according to the building height. |
| buildings_3857.geojson                      | Building footprints as polygons required for decibel levels calculation.                                                                                     |
| receivers_3857.geojson                      | Receiver points required for decibel levels calculation.                                                                                                     |
| roads_3857.geojson                          | Emitters required for decibel levels calculation.                                                                                                            |
| Masterplan_Campus-West_modified_3857.tif    | Relevant part of the Campus West Masterplan.                                                                                                                 |
| openose_calculate_noise_levels_settings.xml | Settings for the decibel levels calculation.                                                                                                                 |
| pyvista.ipynb                               | Jupyter Notebook to view and organize the data from QGIS according to the data structure required for the visualization in the iTwin Viewer.                 |

## QGIS

You can use the [QGIS](https://www.qgis.org/en/site/) project located in `data/qgis` it comes with:

- buildings layer `Buildings_3857`,
- receivers layer `Receivers_3857`,
- emitters layer `Roads_3857`.

These layers provide the necessary data to conduct a noise calculation with the plug-in [opeNoise](https://plugins.qgis.org/plugins/opeNoise/).

- How the plug-in works can be seen [here](https://www.youtube.com/watch?v=uMBHcvaucc8).

- The settings for the calculation can be loaded from the `openose_calculate_noise_levels_settings.xml` file.

- Before issuing `Calculate Noise Levels` you can run the script `qgis_receiver_points_height_generation.py` to create a height attribute for the receivers.

- To create new polygons representing buildings you have to always start with the lowest right corner first moving in a clockwise direction!

- All polygons have to constitute four points and four points only!

## PyVista

Install the dependencies from the `environment.yml` file.

Export the `Buildings_3857` and `Receivers_3857` layers in a `.geojson` format from QGIS.

Put them in `data/pyvista/data` and run the script in `pyvista.ipynb`.

The script creates the necessary `.ts` files with the data from the `.geojson` files ready to be used for visualization in the iTwin Viewer.

## Limitations

### iTwin Platform `AnalysisStyle`

- The iTwin Platform currently does not support more than one [AnalysisStyle](https://www.itwinjs.org/reference/core-common/displaystyles/analysisstyle/) per viewport.
- More information on [AnalysisStyle on multiple Decorators turns black · iTwin · Discussion #17 · GitHub](https://github.com/orgs/iTwin/discussions/17).

### QGIS Plug-in opeNoise

- If calculations for a certain point in the `Receivers_3857` layer fail the value will be -99.0 and needs to be adjusted. With the current dataset `bui_id: 20`, `id_pt: 63`, and `id_pt: 282` usually fail.
- After calculation, the attribute of the receivers layer `Receivers_3857` should be renamed from `Lgeneric` to `Lden`.

# Next Steps

- [iTwin Viewer options](https://www.npmjs.com/package/@itwin/web-viewer-react)
- [Extending the iTwin Viewer](https://developer.bentley.com/tutorials/itwin-viewer-hello-world/)
- [Using the iTwin Platform](https://developer.bentley.com/)
- [iTwin Developer Program](https://www.youtube.com/playlist?list=PL6YCKeNfXXd_dXq4u9vtSFfsP3OTVcL8N)
