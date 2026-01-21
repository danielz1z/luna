// Custom entry point - Unistyles must be configured BEFORE expo-router loads any routes
// This ensures StyleSheet.configure() runs before any component calls StyleSheet.create()
import './lib/unistyles';
import 'expo-router/entry';
