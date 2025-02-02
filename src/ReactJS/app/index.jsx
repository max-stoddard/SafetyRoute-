import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  FlatList,
  Text,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Polyline } from "react-native-maps";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

import { GOOGLE_API_KEY } from '@env';

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const routeCoordinates = [];


export default function App() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const [start, setStart] = useState(null); // Coordinates for current location
  const [end, setEnd] = useState(null);     // Coordinates for destination
  const mapRef = React.useRef(null);

  // Get current location and set the initial region
  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
      if (routeCoordinates.length > 0) {
        setInitialRegion({
          latitude: routeCoordinates[0].latitude,
          longitude: routeCoordinates[0].longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        setInitialRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    };
    getLocation();
  }, []);

  // Fetch autocomplete suggestions for text1 (Current Location)
  useEffect(() => {
    if (text1.length >= 3) {
      fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text1
        )}&key=${GOOGLE_API_KEY}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "OK") {
            setSuggestions1(data.predictions);
          } else {
            setSuggestions1([]);
          }
        })
        .catch((error) => {
          console.error(error);
          setSuggestions1([]);
        });
    } else {
      setSuggestions1([]);
    }
  }, [text1]);

  // Fetch autocomplete suggestions for text2 (Destination)
  useEffect(() => {
    if (text2.length >= 3) {
      fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text2
        )}&key=${GOOGLE_API_KEY}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "OK") {
            setSuggestions2(data.predictions);
          } else {
            setSuggestions2([]);
          }
        })
        .catch((error) => {
          console.error(error);
          setSuggestions2([]);
        });
    } else {
      setSuggestions2([]);
    }
  }, [text2]);

   // Helper to recenter the map on a given coordinate
   const recenterMap = (coordinate) => {
    if (mapRef.current && coordinate) {
      mapRef.current.animateToRegion({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  // When a suggestion is selected for the current location, fetch its details
  const handleSuggestionPress1 = (item) => {
    setText1(item.description);
    setSuggestions1([]);
    fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${
       item.place_id
      }&key=${GOOGLE_API_KEY}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "OK") {
          const location = data.result.geometry.location;
          const coordinate = { latitude: location.lat, longitude: location.lng };
          setStart(coordinate);
          recenterMap(coordinate);
        } else {
          console.error("Place details error:", data.error_message);
        }
      })
      .catch((error) => console.error("Fetch error:", error));
  };

  // When a suggestion is selected for the destination, fetch its details
  const handleSuggestionPress2 = (item) => {
    setText2(item.description);
    setSuggestions2([]);
    fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${
       item.place_id
      }&key=${GOOGLE_API_KEY}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "OK") {
          const location = data.result.geometry.location;
          const coordinate = { latitude: location.lat, longitude: location.lng };
          setEnd(coordinate);
          recenterMap(coordinate);
        } else {
          console.error("Place details error:", data.error_message);
        }
      })
      .catch((error) => console.error("Fetch error:", error));
  };

  const recenterToRoute = () => {
    if (mapRef.current && routeCoordinates.length > 0) {
      mapRef.current.fitToCoordinates(routeCoordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  const recenterToLiveLocation = () => {
    if (mapRef.current && currentLocation) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const resetMapToNorth = () => {
    if (mapRef.current) {
      const camera = {
        heading: 0, // Reset heading to 0 (North)
        pitch: 0,
      };
      mapRef.current.animateCamera(camera, { duration: 500 });
    }
  };

  // Render a suggestion item in the dropdown
  const renderSuggestionItem = ({ item }, onPressHandler) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => onPressHandler(item)}
    >
      <Text style={styles.suggestionText}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {initialRegion && (
          <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion}>
            {/* Draw Route on Map */}
            {routeCoordinates.length > 0 && (
              <>
                <Polyline coordinates={routeCoordinates} strokeWidth={5} strokeColor="blue" />
                <Marker coordinate={routeCoordinates[0]} title="Start" />
                <Marker coordinate={routeCoordinates[routeCoordinates.length - 1]} title="End" />
              </>
            )}

            {/* User Location Marker */}
            {currentLocation && (
              <Marker coordinate={currentLocation}>
                <View style={styles.locationDotContainer}>
                  <View style={styles.whiteOuterRing} />
                  <View style={styles.blueInnerDot} />
                </View>
              </Marker>
            )}

            {/* Optionally, render markers for the fetched start and end positions */}
            {start && (
              <Marker coordinate={start} pinColor="green" title="Selected Start" />
            )}
            {end && (
              <Marker coordinate={end} pinColor="red" title="Selected End" />
            )}
          </MapView>
        )}

        {/* Profile Icon */}
        <TouchableOpacity style={styles.profileButton} onPress={() => console.log("Profile Pressed")}>
          <Ionicons name="person-circle" size={50} color="white" />
        </TouchableOpacity>

        {/* Left Button - Recenter Route */}
        <TouchableOpacity style={styles.recenterRouteButton} onPress={recenterToRoute}>
          <MaterialIcons name="map" size={30} color="white" />
        </TouchableOpacity>

        {/* Right Button - Recenter Live Location */}
        <TouchableOpacity style={styles.recenterLiveButton} onPress={recenterToLiveLocation}>
          <MaterialIcons name="my-location" size={30} color="white" />
        </TouchableOpacity>

        {/* Compass Button - Rotate to North */}
        <TouchableOpacity style={styles.compassButton} onPress={resetMapToNorth}>
          <MaterialIcons name="explore" size={30} color="white" />
        </TouchableOpacity>

        {/* Keyboard Handling and Text Inputs */}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.avoidingView}>
          <View style={styles.textBoxContainer}>
            {/* Dropdown for the first text input */}
            {suggestions1.length > 0 && (
              <View style={styles.dropdown}>
                <FlatList
                  data={suggestions1}
                  keyExtractor={(item) => item.place_id}
                  renderItem={(item) =>
                    renderSuggestionItem(item, handleSuggestionPress1)
                  }
                />
              </View>
            )}
            <TextInput
              style={[styles.textBox, styles.topBox]}
              placeholder="Current Location"
              value={text1}
              onChangeText={setText1}
            />
            {/* Dropdown for the second text input */}
            {suggestions2.length > 0 && (
              <View style={styles.dropdown}>
                <FlatList
                  data={suggestions2}
                  keyExtractor={(item) => item.place_id}
                  renderItem={(item) =>
                    renderSuggestionItem(item, handleSuggestionPress2)
                  }
                />
              </View>
            )}
            <TextInput
              style={[styles.textBox, styles.bottomBox]}
              placeholder="Destination..."
              value={text2}
              onChangeText={setText2}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  profileButton: {
    position: "absolute",
    top: 50,
    right: 25,
    backgroundColor: "#666666",
    borderRadius: 30,
    elevation: 8,
  },
  recenterRouteButton: {
    position: "absolute",
    bottom: 180,
    left: 20,
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 30,
    elevation: 8,
  },
  recenterLiveButton: {
    position: "absolute",
    bottom: 180,
    right: 20,
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 30,
    elevation: 8,
  },
  compassButton: {
    position: "absolute",
    bottom: 250,
    right: 20,
    backgroundColor: "#FF9500",
    padding: 12,
    borderRadius: 30,
    elevation: 8,
  },
  avoidingView: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  textBoxContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    padding: 10,
  },
  textBox: {
    width: "100%",
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 15,
    backgroundColor: "white",
  },
  topBox: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 0,
  },
  bottomBox: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  locationDotContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  whiteOuterRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
    position: "absolute",
  },
  blueInnerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#007AFF",
  },
  dropdown: {
    backgroundColor: "white",
    borderColor: "gray",
    borderWidth: 1,
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: 14,
  },
});
