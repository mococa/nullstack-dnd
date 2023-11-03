import Nullstack, { HTMLAttributes, NullstackClientContext } from "nullstack";

export interface NullstackDnDProps extends HTMLAttributes<HTMLDivElement> {
  options?: {
    rearranging_duration?: number;
    column_gap?: number;
    columns_count?: number;
  };
  onReorder?: (indexes: number[]) => void;
  children: JSX.Element[];
}

export class NullstackDnD extends Nullstack<NullstackDnDProps> {
  ref: HTMLDivElement;

  rearranging_duration: number;
  column_gap: number;
  columns_count: number;

  rearranging: boolean;

  drag_destination_index: number | null;
  dragged_element: HTMLElement;
  dragged_element_index: number | null;
  container_element: HTMLElement;
  draggable_elements: HTMLElement[];
  onReorder?: (indexes: number[]) => void;
  order: number[];

  initiate({
    options = {
      rearranging_duration: 100,
      column_gap: 10,
      columns_count: 4,
    },
    onReorder,
  }: NullstackClientContext<NullstackDnDProps>) {
    this.rearranging_duration = options.rearranging_duration ?? 100;
    this.column_gap = options.column_gap ?? 10;
    this.columns_count = options.columns_count ?? 4;
    this.onReorder = onReorder;

    this.drag_destination_index = null;
    this.dragged_element_index = null;
    this.rearranging = false;
    this.container_element = this.ref;
  }

  hydrate() {
    this.draggable_elements = Array.from(this.ref?.children) as HTMLElement[];

    this._arrangeItems(this.draggable_elements);
    this._setupEventListeners();
  }

  _arrangeItems(items: HTMLElement[]) {
    const element = (this.draggable_elements || [])[0];

    const width = (element?.clientWidth || 0) + this.column_gap;
    const height = (element?.clientHeight || 0) + this.column_gap;

    items.forEach((item, i) => {
      item.setAttribute("data-index", String(i));

      const pos = {
        x: i % this.columns_count,
        y: Math.floor(i / this.columns_count),
      };

      item.style.top = `${pos.y * height}px`;
      item.style.left = `${pos.x * width}px`;
    });
  }

  _rearrangeItems(arr: HTMLElement[], from_index: number, to_index: number) {
    const moved_element = arr.splice(from_index, 1)[0];

    arr.splice(to_index, 0, moved_element);

    return arr;
  }

  _setupEventListeners() {
    this.draggable_elements.forEach((item) => {
      item.addEventListener("dragstart", this._handleDragStart.bind(this));
      item.addEventListener("dragend", this._handleDragEnd.bind(this));
      item.addEventListener("dragover", this._handleDragOver.bind(this));
      item.addEventListener("drop", this._handleDrop.bind(this));
    });
  }

  _tryOnReorder() {
    const elements = Array.from(this.ref.children) as HTMLElement[];

    this.order = elements.map(({ dataset }) => dataset.index).map(Number);

    if (!this.onReorder) return;

    this.onReorder(this.order);
  }

  _handleDragStart(e: DragEvent) {
    this.dragged_element = e.currentTarget as HTMLElement;
    const sorted_elements: HTMLElement[] = [];

    this.draggable_elements.forEach((item) => {
      const index = parseInt(item.dataset.index || "0");
      sorted_elements[index] = item;
    });

    this.draggable_elements = sorted_elements;
    this.dragged_element_index = parseInt(
      this.dragged_element.getAttribute("data-index") || "0"
    );
    this.dragged_element.style.opacity = "0";
    this.dragged_element.style.transition = "all 100ms ease";
  }

  _handleDragEnd(e: DragEvent) {
    e.preventDefault();

    this.dragged_element.style.opacity = "1";
    this.dragged_element.style.removeProperty("transition");
  }

  _handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (this.rearranging) return;

    this.drag_destination_index = parseInt(
      (e.currentTarget as HTMLElement)?.dataset?.index || "0"
    );
    this.dragged_element_index = parseInt(
      this.dragged_element.dataset.index || "0"
    );

    if (this.dragged_element_index === this.drag_destination_index) return;

    this.rearranging = true;

    const rearranged_elements = this._rearrangeItems(
      this.draggable_elements,
      this.dragged_element_index,
      this.drag_destination_index
    );

    this._arrangeItems(rearranged_elements);

    setTimeout(() => {
      this.rearranging = false;
    }, this.rearranging_duration);
  }

  _handleDrop(e: DragEvent) {
    e.preventDefault();

    this.rearranging = false;
    this._tryOnReorder();
  }

  update({ options }: NullstackDnDProps) {
    if (!options) return;
    if (options.columns_count === undefined) return;

    if (options.columns_count !== this.columns_count) {
      this.columns_count = options.columns_count;
      this._arrangeItems(this.draggable_elements);
    }
  }

  render({
    children,
    onReorder: _,
    options: __,
    ...NullstackDnDProps
  }: Partial<NullstackDnDProps>) {
    if (!children) return null;

    return (
      <div
        {...NullstackDnDProps}
        class={["dnd-content", NullstackDnDProps.class]
          .filter(Boolean)
          .join(" ")}
        ref={this.ref}
      >
        {children.map((child) => (
          <div draggable="true" class="dnd-draggable">
            {child}
          </div>
        ))}
      </div>
    );
  }
}
