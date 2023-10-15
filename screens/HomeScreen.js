import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { removeItem } from '../utils/asyncStorage';
import { Entypo } from '@expo/vector-icons';
import { startActivityAsync, ActivityAction } from 'expo-intent-launcher';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import Spinner from 'react-native-loading-spinner-overlay';
import * as DocumentPicker from 'expo-document-picker';

let { width, height } = Dimensions.get('window');
import api from '../api';

const baseUrl = 'http://10.42.0.1:3000';

export default function HomeScreen() {
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  let navigation = useNavigation();

  const downloadFromUrl = async () => {
    try {
      setLoading(true);
      const filename = 'logs.csv';
      const result = await FileSystem.downloadAsync(
        `${baseUrl}/logs`,
        FileSystem.documentDirectory + filename
      );
      console.log(result);

      save(result.uri, filename, result.headers['Content-Type']);
    } finally {
      setLoading(false);
    }
  };

  const save = async (uri, filename, mimetype) => {
    if (Platform.OS === 'android') {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          filename,
          mimetype
        )
          .then(async (uri) => {
            await FileSystem.writeAsStringAsync(uri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
          })
          .catch((e) => console.log(e));
      } else {
        shareAsync(uri);
      }
    } else {
      shareAsync(uri);
    }
  };

  const checkDevicePresence = async () => {
    try {
      await api.health();
      setDeviceConnected(true);
      console.log('device connected');
    } catch (error) {
      setDeviceConnected(false);
      console.log('device disconnected');
    }
  };

  const upload = async () => {
    try {
      setLoading(true);
      let response = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (response.type == 'success') {
        let { name, size, uri } = response;
        let nameParts = name.split('.');
        let fileType = nameParts[nameParts.length - 1];
        var fileToUpload = {
          name: name,
          size: size,
          uri: uri,
          type: 'application/' + fileType,
        };
        console.log(fileToUpload, '...............file');
        await api.postDocument(fileToUpload);
        alert('Alarm uploaded successfully');
      }
    } catch (error) {
      alert('Error uploading alarm audio. Make sure device is connected');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDevicePresence();
    setInterval(async () => {
      await checkDevicePresence();
    }, 5000);
  }, []);

  let handleReset = async () => {
    await removeItem('onboarded');
    navigation.push('Onboarding');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Spinner
        //visibility of Overlay Loading Spinner
        visible={loading}
        //Text with the Spinner
        textContent={'Loading...'}
        //Text style of the Spinner Text
        textStyle={styles.spinnerTextStyle}
      />

      <TouchableOpacity onPress={handleReset} style={styles.onboardingButton}>
        <Text>
          Go back to <Text style={styles.onboardingBold}>onboarding</Text>
        </Text>
      </TouchableOpacity>
      <View style={styles.heading}>
        <Text style={styles.text}>VigilEye</Text>
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
        <TouchableOpacity style={styles.button} onPress={upload}>
          <Text style={styles.buttonText}>Add Audio Alarm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={downloadFromUrl}>
          <Text style={styles.buttonText}>Download Data</Text>
        </TouchableOpacity>
        {deviceConnected ? (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Entypo name="check" size={24} color="black" />
            <Text>Device connected!</Text>
          </View>
        ) : (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Entypo name="circle-with-cross" size={24} color="black" />
            <Text>Device not connected!</Text>
          </View>
        )}
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
  spinnerTextStyle: {
    color: '#FFF',
  },
});
