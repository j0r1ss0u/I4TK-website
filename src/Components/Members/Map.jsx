/************************************
 * IMPORTS
 ************************************/
import React from 'react';
// Composants Leaflet pour la carte
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// Icônes pour l'interface
import { MapPin, Building2, Users, Globe2 } from 'lucide-react';
// Données des membres
import { MEMBERS_DATA } from '../data/members';
// Styles Leaflet
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

/************************************
 * COMPOSANT PRINCIPAL MAP
 ************************************/
const Map = () => {
  /************************************
   * INITIALISATION DE LEAFLET
   * Configuration des icônes de marqueurs
   ************************************/
  React.useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  /************************************
   * FONCTION UTILITAIRE POUR LES URLs
   ************************************/
  const formatUrl = (url) => {
      if (!url) return '';

      // Remplace https// par https://
      const cleanedUrl = url.replace(/https\/\//g, 'https://');

      // Si l'URL commence déjà par https://, on la laisse telle quelle
      return cleanedUrl.startsWith('https://') ? cleanedUrl : `https://${cleanedUrl}`;
  };


  /************************************
   * RENDU DU COMPOSANT
   ************************************/
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Container de la carte */}
      <div style={{ height: '600px', width: '100%' }}>
        <MapContainer
          center={[48.8566, 2.3522]}
          zoom={3}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          {/* Couche de fond OpenStreetMap */}
          <TileLayer
            url="//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Marqueurs pour chaque membre */}
          {MEMBERS_DATA.map((member) => (
            <Marker 
              key={member.id}
              position={[member.lat, member.lng]}
            >
              {/* Popup d'information */}
              <Popup>
                <div className="p-2 min-w-[200px]">
                  {/* En-tête avec nom et catégorie */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      {member.fullName && (
                        <p className="text-sm text-gray-600">{member.fullName}</p>
                      )}
                    </div>
                    {/* Icône selon la catégorie */}
                    {member.category === "Academic" ? (
                      <Building2 className="w-4 h-4 text-blue-800 flex-shrink-0" />
                    ) : (
                      <Users className="w-4 h-4 text-green-700 flex-shrink-0" />
                    )}
                  </div>

                  {/* Informations détaillées */}
                  <div className="mt-2 space-y-1">
                    {/* Localisation */}
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      {member.city}, {member.country}
                    </div>

                    {/* Site web */}
                    {member.website && (
                        <div className="flex items-center text-sm">
                            <Globe2 className="w-3 h-3 mr-1" />
                            <a
                                href={formatUrl(member.website)}
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
