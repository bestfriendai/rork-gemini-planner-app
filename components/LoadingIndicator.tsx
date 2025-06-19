import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform, Easing } from 'react-native';
import { colors } from '@/constants/colors';

interface LoadingIndicatorProps {
  size?: number;
  color?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  size = 40,
  color = colors.primary
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rotation animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderColor: color,
            transform: [
              { rotate: spin },
              { scale: pulseValue }
            ]
          }
        ]}
      />
      <View
        style={[
          styles.dot,
          {
            width: size * 0.2,
            height: size * 0.2,
            backgroundColor: color
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: 2,
    borderRadius: 100,
    borderStyle: Platform.select({ web: 'solid', default: 'dashed' }),
    position: 'absolute',
  },
  dot: {
    borderRadius: 100,
    backgroundColor: colors.primary,
  },
});