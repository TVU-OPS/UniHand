// app/(tabs)/about/index.tsx
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function SosMapScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">About</ThemedText>
      <ThemedText>This is the About screen.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});