import { useCallback, useRef } from "react";
import { MapView } from "@/components/Map";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPinned } from "lucide-react";

type Coordinates = { latitude: number; longitude: number };

type ProjectLocationPickerProps = {
  value: Coordinates;
  onChange: (value: Coordinates) => void;
};

export function ProjectLocationPicker({ value, onChange }: ProjectLocationPickerProps) {
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const updateMarker = useCallback((position: google.maps.LatLngLiteral) => {
    if (!markerRef.current && mapRef.current && window.google?.maps?.marker?.AdvancedMarkerElement) {
      markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position,
        title: "Localisation du projet",
      });
    } else if (markerRef.current) {
      markerRef.current.position = position;
    }
  }, []);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    updateMarker({ lat: value.latitude, lng: value.longitude });
    map.addListener("click", (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      const next = { latitude: event.latLng.lat(), longitude: event.latLng.lng() };
      updateMarker({ lat: next.latitude, lng: next.longitude });
      onChange(next);
    });
  }, [onChange, updateMarker, value.latitude, value.longitude]);

  return (
    <Card className="border-sky-200 bg-sky-50/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><MapPinned className="h-5 w-5 text-sky-700" />Choisir la localisation sur la carte</CardTitle>
        <CardDescription>Cliquez sur la carte pour positionner le projet. Vous pouvez ensuite ajuster les valeurs GPS manuellement.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="overflow-hidden rounded-lg border bg-muted">
          <MapView
            className="h-[260px]"
            initialCenter={{ lat: value.latitude, lng: value.longitude }}
            initialZoom={12}
            onMapReady={handleMapReady}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div className="rounded-md bg-background px-3 py-2"><span className="font-medium text-foreground">Latitude</span><br />{value.latitude.toFixed(6)}</div>
          <div className="rounded-md bg-background px-3 py-2"><span className="font-medium text-foreground">Longitude</span><br />{value.longitude.toFixed(6)}</div>
        </div>
      </CardContent>
    </Card>
  );
}
