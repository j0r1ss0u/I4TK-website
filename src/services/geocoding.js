export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();

    // Attendre 1 seconde pour respecter la limite de taux
    await delay(1000);

    return {
      city: data.address.city || data.address.town || data.address.village,
      country: data.address.country,
      display_name: data.display_name
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};