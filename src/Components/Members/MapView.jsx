import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Building2, Users, Globe2 } from 'lucide-react';
import { useMembers } from "./MembersContext";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const MapView = () => {
  const [isClient, setIsClient] = useState(false);
  const { members } = useMembers(); // Utilisation du contexte au lieu de MEMBERS_DATA

  useEffect(() => {
    setIsClient(true);
    // Fix des icônes Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  if (!isClient) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div style={{ height: '600px', width: '100%' }}>
        <MapContainer
          center={[48.8566, 2.3522]} // Paris coordinates
          zoom={2}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {members.map((member) => (
            <Marker 
              key={member.id}
              position={[member.lat, member.lng]}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      {member.fullName && (
                        <p className="text-sm text-gray-600">{member.fullName}</p>
                      )}
                    </div>
                    {member.category === "Academic" ? (
                      <Building2 className="w-4 h-4 text-blue-800 flex-shrink-0" />
                    ) : (
                      <Users className="w-4 h-4 text-green-700 flex-shrink-0" />
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      {member.city}, {member.country}
                    </div>
                    {member.website && (
                      <div className="flex items-center text-sm">
                        <Globe2 className="w-3 h-3 mr-1" />
                        <a
                          href={`https://${member.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {member.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;