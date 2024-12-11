import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Building2, Users, Globe2 } from 'lucide-react';
import { MEMBERS_DATA } from '../data/members';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const Map = () => {
  // Initialisation de l'icône par défaut
  React.useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div style={{ height: '600px', width: '100%' }}>
        <MapContainer
          center={[48.8566, 2.3522]}
          zoom={3}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {MEMBERS_DATA.map((member) => (
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

export default Map;