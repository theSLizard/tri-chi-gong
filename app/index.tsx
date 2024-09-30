import React from 'react';
import { StyleSheet, View } from 'react-native';
import TriangleWithDot from '../components/TriangleWithDot'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TriangleWithDot"
        component={TriangleWithDot}
        options={{ title: 'Tri-Chi-Gong' }} // Set custom title here
      />
    </Stack.Navigator>
  );
}

/*
export default function App() {
  return (
    <View style={styles.container}>
      <TriangleWithDot /> 
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
*/