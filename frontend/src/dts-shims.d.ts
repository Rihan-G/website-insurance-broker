declare module "*.png" {
  const src: string;
  export default src;
}
declare module "*.svg" {
  const src: string;
  export default src;
}
declare module "*.webp" {
  const src: string;
  export default src;
}
declare module "html2canvas" {
  function html2canvas(element: HTMLElement, options?: Record<string, unknown>): Promise<HTMLCanvasElement>;
  export default html2canvas;
}
