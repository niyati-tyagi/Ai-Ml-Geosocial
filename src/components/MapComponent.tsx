import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Activity } from '../types';
import { cn } from '../lib/utils';
import { Users, Clock, CheckCircle2 } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  activities: Activity[];
  onJoin: (id: string) => void;
  joinedActivities: Set<string>;
  center: [number, number];
  zoom: number;
}

// Custom hook to create emoji markers
const createEmojiIcon = (emoji: string) => {
  return L.divIcon({
    html: `<div class="w-10 h-10 bg-[#1a1a1a] border-2 border-blue-500/50 rounded-2xl flex items-center justify-center text-xl shadow-2xl transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform duration-300 backdrop-blur-md">
            ${emoji}
          </div>`,
    className: 'custom-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Component to handle map center and zoom changes
const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({
  activities,
  onJoin,
  joinedActivities,
  center,
  zoom,
}) => {
  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={true}
        className="h-full w-full"
        attributionControl={false}
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark-tile-layer"
        />
        
        {activities.map((activity) => (
          <Marker
            key={activity.id}
            position={[activity.lat, activity.lng]}
            icon={createEmojiIcon(activity.icon)}
          >
            <Popup className="custom-popup">
              <div className="w-64 p-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={activity.userAvatar}
                      alt={activity.userName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate leading-tight">{activity.title}</h4>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{activity.category}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-500/60" />
                    {activity.time}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                    <Users className="w-3.5 h-3.5 text-purple-500/60" />
                    {joinedActivities.has(activity.id) ? activity.attendees + 1 : activity.attendees} attending
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onJoin(activity.id);
                  }}
                  className={cn(
                    "w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2",
                    joinedActivities.has(activity.id)
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                  )}
                >
                  {joinedActivities.has(activity.id) ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Joined
                    </>
                  ) : (
                    "Join Now"
                  )}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
