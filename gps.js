if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    position => {
      // Handle successful position retrieval
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
      
      // Now, you can send this information to a web API if needed
    },
    error => {
      // Handle errors (e.g., user denies permission or the device doesn't have GPS)
      console.error('Error getting location:', error.message);
    }
  );
} else {
  console.error('Geolocation is not supported in this browser.');
}
