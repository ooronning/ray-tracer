import Hitable, { HitRecord } from './Hitable';
import HitableList from './HitableList';
import Sphere from './Sphere';
import Vector from './Vector';
import Ray from './Ray';
import Camera from './Camera';

export default class CanvasPainter {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D; // fix once this is better understood
  ns: number; // no idea wtf this is supposed to be, fuck it

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.canvas = canvas;
    this.canvas.width = width ? width : 500;
    this.canvas.height = height ? height : 500;
    this.ns = height;
    this.context = this.canvas.getContext('2d')!;
  }

  static color(ray: Ray, world: Hitable) : Vector {
    const hit = world.hit(ray, 0.0, Number.MAX_VALUE, null);
    if (hit) {
      return Vector.multiply(
        0.5, 
        new Vector(hit.normal.x + 1.0, hit.normal.y + 1.0, hit.normal.z + 1.0));
    } else {
      const unitDirection: Vector = Vector.unitVector(ray.direction());
      const t: number = 0.5 * (unitDirection.y + 1.0);
      return Vector.add(
        Vector.multiply(1.0 - t, new Vector(1.0, 1.0, 1.0)),
        Vector.multiply(t, new Vector(0.5, 0.7, 1.0))
      );
    }
  }

  render(): void {
    // allows us to interface with CanvasPainter's internal canvas property
    const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    let arrayOffset = 0;

    const lowerLeftCorner = new Vector(-2.0, -1.0, -1.0);
    const horizontal = new Vector(4.0, 0.0, 0.0);
    const vertical = new Vector(0.0, 2.0, 0.0);
    const origin = new Vector(0.0, 0.0, 0.0);

    const list: Array<Hitable> = [
      new Sphere(new Vector(0, 0, -1.0), 0.5),
      new Sphere(new Vector(0, -100.5, -1), 100)
    ];
    
    const world = new HitableList(list);
    const camera = new Camera();

    for (let j = this.canvas.height - 1; j >= 0; j--) {
      for (let i = 0; i < this.canvas.width; i++) {

        const col: Vector = new Vector(0, 0, 0);
        for (let s = 0; s < this.ns; s++) {
          const u: number = (i + Math.random()) / this.canvas.width;
          const v: number = (j + Math.random()) / this.canvas.height;

          const ray: Ray = camera.getRay(u, v);
          const p: Vector = ray.pointAtParameter(2.0);
          col.add(CanvasPainter.color(ray, world));
        }

        col.divide(this.ns);

        const ir = 255.99 * col.x;
        const ig = 255.99 * col.y;
        const ib = 255.99 * col.z;
        const ia = 0xFF;

        imageData.data[arrayOffset] = ir;
        imageData.data[arrayOffset + 1] = ig;
        imageData.data[arrayOffset + 2] = ib;
        imageData.data[arrayOffset + 3] = ia;

        arrayOffset += 4;
      }
    }

    this.context.putImageData(imageData, 0, 0);
    document.getElementById('target')!.appendChild(this.canvas);
  }
}