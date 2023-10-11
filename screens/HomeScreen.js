import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { removeItem } from '../utils/asyncStorage';
import { Entypo } from '@expo/vector-icons';
import { startActivityAsync, ActivityAction } from 'expo-intent-launcher';

let { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  let navigation = useNavigation();

  let handleReset = async () => {
    await removeItem('onboarded');
    navigation.push('Onboarding');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleReset} style={styles.onboardingButton}>
        <Text>
          Go back to <Text style={styles.onboardingBold}>onboarding</Text>
        </Text>
      </TouchableOpacity>
      <View style={styles.heading}>
        <Text style={styles.text}>SleepTracker</Text>
        <Text>Welcome to the dashboard</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            startActivityAsync(ActivityAction.WIFI_SETTINGS);
          }}
        >
          <Text style={styles.buttonText}>Connect To Device</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Add Audio Alarm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Download Data</Text>
        </TouchableOpacity>
        <Entypo name="circle-with-cross" size={24} color="black" />
        <Text>Device not connected!</Text>
      </View>
      <View>
        <Text style={styles.footer}>
          Designed at <Text style={styles.bss}>BSS</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  lottie: {
    width: width * 0.9,
    height: width,
  },
  heading: {
    marginTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },

  text: {
    fontWeight: 'bold',
    fontSize: width * 0.09,
    marginTop: 80,
  },
  buttonContainer: {
    marginTop: 100,
    marginBottom: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#000000',
    width: 400,
    height: 50,
    marginBottom: 40,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'semibold',
    letterSpacing: 0.25,
    color: 'white',
  },
  footer: {
    marginBottom: 60,
  },
  bss: {
    fontWeight: 'bold',
  },
  onboardingButton: {
    marginTop: 60,
  },
  onboardingBold: {
    fontWeight: 'bold',
  },
});
