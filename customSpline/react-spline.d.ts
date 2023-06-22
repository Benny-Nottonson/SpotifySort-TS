declare module "@/customSpline/react-spline" {
  import { Component } from "react";

  export interface SplineProps {
    scene: string;
  }

  export default class Spline extends Component<SplineProps> {}
}
