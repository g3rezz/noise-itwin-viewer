import { assert } from "@itwin/core-bentley";
import { ColorByName, ColorDef } from "@itwin/core-common";
import {
  DecorateContext,
  Decorator,
  GraphicType,
  HitDetail,
  IModelApp,
  RenderGraphicOwner,
  Viewport,
} from "@itwin/core-frontend";
import { Polyface } from "@itwin/core-geometry";
import { SampleMeshName } from "./ScientificVizWidget";

// Render a Polyface in the viewport
export class ScientificVizDecorator implements Decorator {
  public readonly polyface: Polyface;
  private readonly _viewport: Viewport;
  private readonly _id: string;
  public graphic?: RenderGraphicOwner; // Make the graphic public to query the range to create a Placement3d object to ZoomToDecorator
  private _dispose?: () => void;
  public static decorator: ScientificVizDecorator;
  public readonly meshName: SampleMeshName; // Add meshName property

  // Initialize the decorator with the given viewport and Polyface
  public constructor(
    viewport: Viewport,
    polyface: Polyface,
    meshName: SampleMeshName = "All"
  ) {
    this._viewport = viewport;
    this.polyface = polyface;
    this._id = viewport.iModel.transientIds.getNext();
    this.meshName = meshName; // Assign meshName property

    const removeDisposalListener = viewport.onDisposed.addOnce(() =>
      this.dispose()
    );
    const removeAnalysisStyleListener =
      viewport.addOnAnalysisStyleChangedListener(() => {
        this.graphic?.disposeGraphic();
        this.graphic = undefined;
      });

    this._dispose = () => {
      removeAnalysisStyleListener();
      removeDisposalListener();
    };

    IModelApp.viewManager.addDecorator(this);
  }

  // Clear up the decorator
  public dispose(): void {
    if (!this._dispose) {
      assert(undefined === this.graphic);
      return;
    }

    this.graphic?.disposeGraphic();
    this.graphic = undefined;
    this._dispose();
    this._dispose = undefined;
    IModelApp.viewManager.dropDecorator(this);
  }

  // Render the Polyface
  public decorate(context: DecorateContext): void {
    if (context.viewport !== this._viewport) return;

    if (!this.graphic) {
      const builder = context.createGraphicBuilder(
        GraphicType.Scene,
        undefined,
        this._id
      );
      const color = ColorDef.fromTbgr(ColorByName.darkSlateBlue);
      builder.setSymbology(color, color, 1);
      builder.addPolyface(this.polyface, false);
      this.graphic = IModelApp.renderSystem.createGraphicOwner(
        builder.finish()
      );
    }

    context.addDecoration(GraphicType.Scene, this.graphic);
  }

  /** Return true if supplied Id represents a pickable decoration created by this decorator. */
  public testDecorationHit(id: string): boolean {
    return id === this._id;
  }

  public async getDecorationToolTip(
    hit: HitDetail
  ): Promise<HTMLElement | string> {
    if (hit.sourceId === this._id) {
      // Check if it's the decoration created by this decorator
      const tooltipContainer = document.createElement("div");

      const universityRWTHElement = document.createElement("div");
      universityRWTHElement.innerHTML =
        "<strong>University:</strong> RWTH Aachen";
      tooltipContainer.appendChild(universityRWTHElement);

      const campusWestElement = document.createElement("div");
      campusWestElement.innerHTML = "<strong>Expansion:</strong> Campus West";
      tooltipContainer.appendChild(campusWestElement);

      const buildingsElement = document.createElement("div");
      buildingsElement.innerHTML = `<strong>Buildings:</strong> ${this.meshName}`;
      tooltipContainer.appendChild(buildingsElement);

      return tooltipContainer;
    }

    // If it's not the decoration created by this decorator, return a default tooltip
    return "Campus West";
  }
}
