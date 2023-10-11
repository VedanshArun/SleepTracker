import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import React from 'react';
import Onboarding from 'react-native-onboarding-swiper';
import { useNavigation } from '@react-navigation/native';
import { setItem } from '../utils/asyncStorage';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const navigation = useNavigation();

  const handleDone = () => {
    navigation.navigate('Home');
    setItem('onboarded', '1');
  };

  const doneButton = ({ ...props }) => {
    return (
      <TouchableOpacity style={styles.doneButton} {...props}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      <Onboarding
        onDone={handleDone}
        onSkip={handleDone}
        // bottomBarHighlight={false}
        DoneButtonComponent={doneButton}
        containerStyles={{ paddingHorizontal: 15 }}
        pages={[
          {
            backgroundColor: '#000000',
            image: (
              <View style={styles.lottie}>
                <Image
                  source={require('../assets/animations/device_new.gif')}
                  style={styles.lottie}
                />
              </View>
            ),
            title: 'Connect Device',
            subtitle:
              'Connect your SleepTracker device to the mobile application using wifi name: bss-sleep-detection',
          },
          {
            backgroundColor: '#000000',
            image: (
              <View style={styles.lottie}>
                <Image
                  source={require('../assets/animations/audio_new.gif')}
                  style={styles.lottie}
                />
              </View>
            ),
            title: 'Customizable Alarms',
            subtitle: 'Customize the alarms for the SleepTracker devices.',
          },
          {
            backgroundColor: '#000000',
            image: (
              <View style={styles.lottie}>
                <Image
                  source={require('../assets/animations/data_new.gif')}
                  style={styles.lottie}
                />
              </View>
            ),
            title: 'Download Data',
            subtitle: 'Download the Historical Data for analysis',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  lottie: {
    width: width * 0.9,
    height: width,
  },
  doneButton: {
    padding: 20,
    // backgroundColor: 'white',
    // borderTopLeftRadius: '100%',
    // borderBottomLeftRadius: '100%'
  },
  doneButtonText: {
    color: '#ffffff',
  },
});
