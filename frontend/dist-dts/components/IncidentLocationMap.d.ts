import "leaflet/dist/leaflet.css";
import { type IncidentPin } from "../types/incidentMap";
export declare function IncidentLocationMap({ value, onChange, }: {
    value: IncidentPin | null;
    onChange: (next: IncidentPin | null) => void;
}): import("react/jsx-runtime").JSX.Element;
