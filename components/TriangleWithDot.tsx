import React, { useState, useEffect, useCallback } from 'react';
import { Dimensions, TextInput, View, StyleSheet, Text } from 'react-native';
import Svg, { Polygon, Circle as SvgCircle } from 'react-native-svg';
import Animated, { Easing, useSharedValue, withTiming, useAnimatedProps, withRepeat, withSequence } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const isPortrait = height > width;

// Create an Animated version of Svg.Circle
const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);

const TriangleWithDot = () => {
  //const [speed, setSpeed] = useState(1000); // Default 1000 milliseconds per edge

  const [speed1, setSpeed1] = useState(1000); // Speed for side 1
  const [speed2, setSpeed2] = useState(1000); // Speed for side 2
  const [speed3, setSpeed3] = useState(1000); // Speed for side 3

  const dotPosition = useSharedValue(0); // Shared value for dot's current position (0 to 1)

    useEffect(() => {
      const loadSavedSpeeds = async () => {
        try {
          // Use Promise.all to fetch all speed values concurrently
          const [savedSpeed1, savedSpeed2, savedSpeed3] = await Promise.all([
            AsyncStorage.getItem('speed1'),
            AsyncStorage.getItem('speed2'),
            AsyncStorage.getItem('speed3'),
          ]);
    
          console.log(
            "Reloading speed settings: " +
              savedSpeed1?.toString() +
              " : " +
              savedSpeed2?.toString() +
              " : " +
              savedSpeed3?.toString()
          );
    
          // Apply the saved values
          if (savedSpeed1) setSpeed1(Number(savedSpeed1)); else setSpeed1(1000);
          if (savedSpeed2) setSpeed2(Number(savedSpeed2)); else setSpeed2(1000);
          if (savedSpeed3) setSpeed3(Number(savedSpeed3)); else setSpeed3(1000);
        } catch (error) {
          console.error('Error loading saved speeds:', error);
        }
      };
    
      loadSavedSpeeds();
    }, []);

    // Save speed values to local storage whenever they change
    useEffect(() => {
      AsyncStorage.setItem('speed1', speed1.toString());
      console.log('Speed 1 changed to ' + speed1.toString());
    }, [speed1]);

    useEffect(() => {
      AsyncStorage.setItem('speed2', speed2.toString());
      console.log('Speed 2 changed to ' + speed2.toString());
    }, [speed2]);

    useEffect(() => {
      AsyncStorage.setItem('speed3', speed3.toString());
      console.log('Speed 3 changed to ' + speed3.toString());
    }, [speed3]);

  
  const triangleSideLength = Math.min(width, height) * 0.8; // Adjust triangle size based on view
  const triangleHeight = (Math.sqrt(3) / 2) * triangleSideLength; // Height of equilateral triangle

  // Vertices of the equilateral triangle
  const vertices = [
    { x: width / 2, y: (height - triangleHeight) / 2 }, // Top vertex
    { x: (width / 2) - (triangleSideLength / 2), y: (height + triangleHeight) / 2 }, // Bottom-left vertex
    { x: (width / 2) + (triangleSideLength / 2), y: (height + triangleHeight) / 2 }, // Bottom-right vertex
  ];

  useEffect(() => {

    dotPosition.value = 0;

    // Sequence to handle different speeds for each edge
    const animationSequence = withSequence(
      withTiming(1 / 3, {
        duration: speed1, // Time for edge 1
        easing: Easing.linear,
      }),
      withTiming(2 / 3, {
        duration: speed2, // Time for edge 2
        easing: Easing.linear,
      }),
      withTiming(1, {
        duration: speed3, // Time for edge 3
        easing: Easing.linear,
      })
    );

    // Apply withRepeat to continuously loop the sequence
    dotPosition.value = withRepeat(animationSequence, -1, false); // Repeat indefinitely, no reverse

  }, [speed1, speed2, speed3, dotPosition]);


  // Animated props to compute dot's X and Y position
  const animatedDotProps = useAnimatedProps(() => {
    const t = dotPosition.value % 1; // Ensure the position stays within 0 to 1
    let x, y;

    if (t < 1 / 3) {
      // First edge (top vertex to bottom-right vertex)
      x = vertices[0].x + (vertices[2].x - vertices[0].x) * (t * 3);
      y = vertices[0].y + (vertices[2].y - vertices[0].y) * (t * 3);
    } else if (t < 2 / 3) {
      // Second edge (bottom-right vertex to bottom-left vertex)
      x = vertices[2].x + (vertices[1].x - vertices[2].x) * ((t - 1 / 3) * 3);
      y = vertices[2].y + (vertices[1].y - vertices[2].y) * ((t - 1 / 3) * 3);
    } else {
      // Third edge (bottom-left vertex to top vertex)
      x = vertices[1].x + (vertices[0].x - vertices[1].x) * ((t - 2 / 3) * 3);
      y = vertices[1].y + (vertices[0].y - vertices[1].y) * ((t - 2 / 3) * 3);
    }

    return {
      cx: x,
      cy: y,
    };
  });

  return (
    <View style={styles.container}>

      <View style={styles.triangleContainer}>
        <Svg height={height} width={width} viewBox={`0 0 ${width} ${height}`}>

          <Polygon
            points={`${vertices[0].x},${vertices[0].y} ${vertices[1].x},${vertices[1].y} ${vertices[2].x},${vertices[2].y}`}
            fill="none"
            stroke="black"
            strokeWidth="2"
          />

          <AnimatedCircle
            animatedProps={animatedDotProps}
            r="10"
            fill="red"
          />

        </Svg>
      </View>  

      <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Speed 1"
              value={speed1.toString()}
              onChangeText={(text) => setSpeed1(Number(text) || 1000)} // Set speed for side 1
            />
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Speed 2"
              value={speed2.toString()}
              onChangeText={(text) => setSpeed2(Number(text) || 1000)} // Set speed for side 2
            />
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Speed 3"
              value={speed3.toString()}
              onChangeText={(text) => setSpeed3(Number(text) || 1000)} // Set speed for side 3
            />
      </View>           
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column', // Vertical layout
  },
  inputRow: {
    //flex: 0.1, // percentage of vertical space
    flex: isPortrait ? 0.2 : 0.1,
    flexDirection: 'row', // Horizontally layout the inputs
    justifyContent: 'space-between', // Space between inputs
    alignItems: 'center',
    width: '90%',
    //marginTop: 10, // Add some space from the top
    marginBottom: 80,
  },
  input: {
    //width: '30%', // Adjust width for each input to fit side by side
    flex: 1.0, // each input element to take equal space on the row
    height: 40,
    marginHorizontal: 5, // margin between inputs
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  triangleContainer: {
    //flex: 0.9, // % of vertical space
    flex: isPortrait ? 0.8 : 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    // Ensure the triangle fits and scales correctly
    width: '100%',
    height: '100%',
  },
});

export default TriangleWithDot;
