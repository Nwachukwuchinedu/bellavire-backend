# 🚗 Property Distance Calculation Feature

## Overview
This feature calculates the driving and walking distance/time from a user's location to properties. It uses Google Maps API for accurate calculations with a fallback to mathematical distance calculation.

## 🛠️ Setup Required

### 1. Google Maps API Key (Optional but Recommended)
Add to your `.env` file:
```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**To get a Google Maps API key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Distance Matrix API"
4. Create credentials (API Key)
5. Add the key to your `.env` file

### 2. Property Coordinates
Properties need coordinates to calculate distances. Add coordinates to existing properties:

```javascript
// Example: Update a property with coordinates
await Property.findByIdAndUpdate(propertyId, {
  coordinates: {
    latitude: 51.5074,  // London coordinates
    longitude: -0.1278
  }
});
```

## 📡 API Usage

### Get Properties with Distance
```http
GET /api/public/properties/summary?userLat=51.5074&userLng=-0.1278&limit=10
```

### Get Single Property with Distance
```http
GET /api/public/properties/details/{propertyId}?userLat=51.5074&userLng=-0.1278
```

## 📊 Response Format

### Properties Summary Response
```json
{
  "properties": [
    {
      "propertyName": "Modern Apartment",
      "address": "123 Main St, London",
      "bedrooms": 2,
      "monthlyRent": 1200,
      "distance": {
        "driving": {
          "distance": "5.2 km",
          "duration": "12 mins",
          "distanceValue": 5200,
          "durationValue": 720
        },
        "walking": {
          "distance": "5.2 km", 
          "duration": "45 mins",
          "distanceValue": 5200,
          "durationValue": 2700
        }
      }
    }
  ]
}
```

### Property Details Response
```json
{
  "propertyName": "Modern Apartment",
  "address": "123 Main St, London",
  "bedrooms": 2,
  "distance": {
    "driving": {
      "distance": "5.2 km",
      "duration": "12 mins"
    },
    "walking": {
      "distance": "5.2 km",
      "duration": "45 mins"
    }
  }
}
```

## 🔧 How It Works

### 1. Google Maps API (Primary Method)
- Uses Google Distance Matrix API
- Provides accurate driving and walking routes
- Includes real-time traffic conditions
- Requires API key

### 2. Fallback Calculation (Haversine Formula)
- Mathematical distance calculation
- Straight-line distance approximation
- Estimated travel times
- Works without API key

### 3. Distance Calculation Process
```javascript
// 1. Check if user location provided
if (userLat && userLng) {
  // 2. Calculate distance for each property
  const distance = await distanceService.calculateDistance(
    { latitude: userLat, longitude: userLng },
    property.coordinates
  );
  
  // 3. Include in response
  property.distance = distance;
}
```

## 🌐 Frontend Integration

### Get User Location
```javascript
// Get user's current location
navigator.geolocation.getCurrentPosition(
  (position) => {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    
    // Use coordinates to fetch properties
    fetchProperties(userLat, userLng);
  },
  (error) => {
    console.error('Location error:', error);
  }
);
```

### Fetch Properties with Distance
```javascript
async function fetchProperties(userLat, userLng) {
  const response = await fetch(
    `/api/public/properties/summary?userLat=${userLat}&userLng=${userLng}`
  );
  const data = await response.json();
  
  // Display properties with distance info
  displayProperties(data.properties);
}
```

### Display Distance Information
```javascript
function displayProperties(properties) {
  properties.forEach(property => {
    if (property.distance) {
      console.log(`${property.propertyName}:`);
      console.log(`  Driving: ${property.distance.driving.distance} (${property.distance.driving.duration})`);
      console.log(`  Walking: ${property.distance.walking.distance} (${property.distance.walking.duration})`);
    }
  });
}
```

## 🎯 Features

### ✅ What's Included
- **Driving Distance & Time**: Accurate route calculation
- **Walking Distance & Time**: Pedestrian route calculation
- **Fallback Calculation**: Works without Google Maps API
- **Multiple Properties**: Batch distance calculation
- **Error Handling**: Graceful degradation
- **Performance**: Efficient API usage

### 🔄 Query Parameters
- `userLat`: User's latitude (required for distance calculation)
- `userLng`: User's longitude (required for distance calculation)
- All existing parameters still work (search, filters, pagination)

### 📱 Browser Support
- **Geolocation API**: Modern browsers
- **Fallback**: Manual coordinate input
- **Progressive Enhancement**: Works without location

## 🚀 Performance Tips

### 1. API Key Management
- Use Google Maps API key for accurate results
- Monitor API usage to avoid rate limits
- Consider caching results for repeated queries

### 2. Coordinate Storage
- Store property coordinates when creating properties
- Use geocoding service to convert addresses to coordinates
- Validate coordinate accuracy

### 3. Caching Strategy
- Cache distance calculations for static locations
- Implement client-side caching for repeated searches
- Consider server-side caching for popular locations

## 🔍 Testing

### Test with Sample Coordinates
```bash
# London coordinates
curl "http://localhost:5000/api/public/properties/summary?userLat=51.5074&userLng=-0.1278"

# New York coordinates  
curl "http://localhost:5000/api/public/properties/summary?userLat=40.7128&userLng=-74.0060"
```

### Test Fallback Calculation
```bash
# Without Google Maps API key
curl "http://localhost:5000/api/public/properties/summary?userLat=51.5074&userLng=-0.1278"
```

## 🛡️ Error Handling

### Common Scenarios
1. **No API Key**: Falls back to mathematical calculation
2. **Invalid Coordinates**: Returns null distance
3. **API Rate Limit**: Falls back to mathematical calculation
4. **Network Error**: Falls back to mathematical calculation

### Error Response Format
```json
{
  "properties": [
    {
      "propertyName": "Property Name",
      "distance": null  // Distance calculation failed
    }
  ]
}
```

## 📈 Future Enhancements

### Potential Improvements
- **Caching**: Redis cache for distance calculations
- **Batch Processing**: Optimize multiple property calculations
- **Alternative APIs**: Support for other mapping services
- **Real-time Traffic**: Live traffic condition updates
- **Public Transport**: Bus/train route calculations

---

**Note**: This feature enhances the property search experience by providing users with accurate travel information, helping them make informed decisions about property locations.
