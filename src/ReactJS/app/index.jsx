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
  Image,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Polyline } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons"; // For profile icon

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

//Temporary route
// Define the route coordinates
const routeCoordinates = [
  { latitude: 51.48209, longitude: -0.19003 },
  { latitude: 51.48167, longitude: -0.18956 },
  { latitude: 51.48157, longitude: -0.18947 },
  { latitude: 51.48153, longitude: -0.18946 },
  { latitude: 51.48146, longitude: -0.18951 },
  { latitude: 51.48138, longitude: -0.18953 },
  { latitude: 51.4812, longitude: -0.18946 },
  { latitude: 51.48111, longitude: -0.18944 },
  { latitude: 51.48106, longitude: -0.18948 },
  { latitude: 51.481, longitude: -0.18937 },
  { latitude: 51.48087, longitude: -0.18924 },
  { latitude: 51.48082, longitude: -0.18913 },
  { latitude: 51.48058, longitude: -0.18887 },
  { latitude: 51.4806, longitude: -0.18883 },
  { latitude: 51.4807, longitude: -0.1887 },
  { latitude: 51.48096, longitude: -0.18838 },
  { latitude: 51.48112, longitude: -0.18816 },
  { latitude: 51.48134, longitude: -0.18783 },
  { latitude: 51.48147, longitude: -0.18768 },
  { latitude: 51.48162, longitude: -0.18751 },
  { latitude: 51.48169, longitude: -0.18745 },
  { latitude: 51.48177, longitude: -0.18741 },
  { latitude: 51.48193, longitude: -0.18726 },
  { latitude: 51.4824, longitude: -0.18681 },
  { latitude: 51.48262, longitude: -0.18657 },
  { latitude: 51.48271, longitude: -0.18646 },
  { latitude: 51.48288, longitude: -0.18628 },
  { latitude: 51.48307, longitude: -0.18601 },
  { latitude: 51.48311, longitude: -0.18595 },
  { latitude: 51.48314, longitude: -0.18586 },
  { latitude: 51.48318, longitude: -0.18592 },
  { latitude: 51.48332, longitude: -0.1861 },
  { latitude: 51.48382, longitude: -0.18678 },
  { latitude: 51.48408, longitude: -0.18717 },
  { latitude: 51.48446, longitude: -0.18778 },
  { latitude: 51.48462, longitude: -0.18805 },
  { latitude: 51.48512, longitude: -0.18882 },
  { latitude: 51.48603, longitude: -0.18978 },
  { latitude: 51.48666, longitude: -0.19044 },
  { latitude: 51.48683, longitude: -0.19061 },
  { latitude: 51.48691, longitude: -0.19066 },
  { latitude: 51.48697, longitude: -0.19069 },
  { latitude: 51.48708, longitude: -0.19086 },
  { latitude: 51.48761, longitude: -0.19143 },
  { latitude: 51.48816, longitude: -0.19199 },
  { latitude: 51.48858, longitude: -0.19246 },
  { latitude: 51.48861, longitude: -0.19252 },
  { latitude: 51.48865, longitude: -0.19269 },
  { latitude: 51.48867, longitude: -0.19276 },
  { latitude: 51.48869, longitude: -0.1927 },
  { latitude: 51.48868, longitude: -0.19264 },
  { latitude: 51.48873, longitude: -0.1925 },
  { latitude: 51.48875, longitude: -0.19259 },
  { latitude: 51.48882, longitude: -0.19275 },
  { latitude: 51.48886, longitude: -0.19297 },
  { latitude: 51.4889, longitude: -0.19311 },
  { latitude: 51.48913, longitude: -0.1935 },
  { latitude: 51.48953, longitude: -0.19425 },
  { latitude: 51.48993, longitude: -0.19502 },
];


export default function App() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const mapRef = React.useRef(null); // Reference to MapView

  useEffect(() => {
    if (mapRef.current) {
      if (routeCoordinates.length > 0) {
        // Fit map to route
        mapRef.current.fitToCoordinates(routeCoordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      } else if (currentLocation) {
        // Center on current location
        mapRef.current.animateToRegion({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    }
  }, [routeCoordinates, currentLocation]);

  const recenterMap = async () => {
    if (mapRef.current && currentLocation) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {initialRegion && (
          <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion}>
            {/* Invisible marker to track the actual position */}
            {currentLocation && (
              <Marker coordinate={currentLocation} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={styles.locationDotContainer}>
                  <View style={styles.whiteOuterRing} />
                  <View style={styles.blueInnerDot} />
                </View>
              </Marker>
              
            )}
            {/* Route points */}
            <Marker coordinate={routeCoordinates[0]} />
            <Polyline
            coordinates={routeCoordinates}
            strokeWidth={5}
            strokeColor="blue"
            />
            <Marker coordinate={routeCoordinates[routeCoordinates.length - 1]} />
          </MapView>
        )}

        {/* Profile Icon (Top Right) */}
        <TouchableOpacity style={styles.profileButton} onPress={() => console.log("Profile Pressed")}>
          <Ionicons name="person-circle" size={60} color="white" />
        </TouchableOpacity>

        {/* Recenter Button */}
        <TouchableOpacity style={styles.recenterButton} onPress={() => { recenterMap(); console.log("Recenter Pressed"); }}>
          <MaterialIcons name="my-location" size={24} color="white" />
        </TouchableOpacity>

        {/* Keyboard Handling for Text Inputs */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.avoidingView}
        >
          <View style={styles.textBoxContainer}>
            <TextInput 
              style={[styles.textBox, styles.topBox]} 
              placeholder="Current Location" 
              value={text1} 
              onChangeText={setText1} 
            />
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
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
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
  recenterButton: {
    position: "absolute",
    bottom: 180,
    right: 20,
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  profileButton: {
    position: "absolute",
    top: 50,
    right: 25,
    backgroundColor: "#666666",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
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
});

