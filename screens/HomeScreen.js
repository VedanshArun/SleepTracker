import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Switch,
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { VLCPlayer, VlCPlayerView } from 'react-native-vlc-media-player';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { removeItem } from '../utils/asyncStorage';
import { Entypo } from '@expo/vector-icons';
import { startActivityAsync, ActivityAction } from 'expo-intent-launcher';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import Spinner from 'react-native-loading-spinner-overlay';
import * as DocumentPicker from 'expo-document-picker';
import Slider from 'react-native-slider';

let { width, height } = Dimensions.get('window');
import api from '../api';

const baseUrl = 'http://10.42.0.1:3000';

export default function HomeScreen() {
  const video = useRef(null);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraIp, setCameraIp] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isEnabled2, setIsEnabled2] = useState(false);
  const [sensitivity, setSensitivity] = useState(0.25);
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
      // setLoading(true);
      let response = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      console.log('here.......');
      console.log(response);
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
        console.log('uploaded....');
        alert('Alarm uploaded successfully');
      }
    } catch (error) {
      console.log(error);
      alert('Error uploading alarm audio. Make sure device is connected');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDevicePresence();
    cameraIpAddress();
    getCameraConfig();
    setInterval(async () => {
      await checkDevicePresence();
    }, 5000);
  }, []);

  let cameraIpAddress = async () => {
    const data = await api.getCameraIp();
    if (data && data.devices && data.devices.ip) {
      setCameraIp(data.devices.ip);
    }
  };

  let getCameraConfig = async () => {
    const { data } = await api.getCameraConfig();
    setIsEnabled(data.invert_camera);
    setIsEnabled2(data.camera_alarm);
    setSensitivity(data.eye_threshold);
  };

  let setCameraConfig = async (config) => {
    try {
      const data = await api.setCameraConfig(config);
    } catch (error) {
      console.log(error);
    }
  };

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
        <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
          Sensitivity: {sensitivity}
        </Text>
        <View
          style={{
            flex: 1,
            marginLeft: 10,
            marginRight: 10,
            marginBottom: 20,
            alignItems: 'stretch',
            justifyContent: 'center',
          }}
        >
          <Slider
            value={sensitivity}
            minimumValue={0.2}
            maximumValue={0.3}
            step={0.01}
            style={{ width: 250 }}
            onValueChange={(value) => {
              value = parseFloat(value.toFixed(2));
              setCameraConfig({
                invert_camera: isEnabled,
                camera_alarm: isEnabled2,
                eye_threshold: value,
              });
              setSensitivity(value);
            }}
          />
        </View>
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
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <Text>invert image</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={async () => {
              setCameraConfig({
                invert_camera: !isEnabled,
                camera_alarm: isEnabled2,
                eye_threshold: sensitivity,
              });
              setIsEnabled(!isEnabled);
            }}
            value={isEnabled}
          />
          <Text style={{}}>camera alarm</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isEnabled2 ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={async () => {
              setCameraConfig({
                invert_camera: isEnabled,
                camera_alarm: !isEnabled2,
                eye_threshold: sensitivity,
              });
              setIsEnabled2(!isEnabled2);
            }}
            value={isEnabled2}
          />
        </View>
        {cameraIp && (
          <VLCPlayer
            style={[styles.video]}
            videoAspectRatio="16:9"
            source={{
              uri: `rtsp://vigileye:bone3600@${cameraIp}:554/stream1`,
            }}
          />
        )}
        <Text style={styles.footer}>
          Designed at <Text style={styles.bss}>BSS</Text>
        </Text>
      </View>
      <View>
        {/* <Text style={styles.footer}>
          Designed at <Text style={styles.bss}>BSS</Text>
        </Text> */}
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
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
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
    marginBottom: 30,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'semibold',
    letterSpacing: 0.25,
    color: 'white',
  },
  footer: {
    marginBottom: 10,
  },
  bss: {
    fontWeight: 'bold',
  },
  onboardingButton: {
    marginTop: 130,
  },
  onboardingBold: {
    fontWeight: 'bold',
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
  video: {
    alignSelf: 'center',
    width: 320,
    height: 200,
  },
});
