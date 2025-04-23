import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Haptics from 'expo-haptics';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface GoogleFitCardProps {
  title: string;
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  iconColor: string;
  lastSynced: string;
  onToggle: (enabled: boolean) => void;
  enabled: boolean;
  syncStatus: SyncStatus;
}

const GoogleFitCard = ({
  title,
  icon,
  iconColor,
  lastSynced,
  onToggle,
  enabled,
  syncStatus
}: GoogleFitCardProps) => {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <ThemedView style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <IconSymbol size={22} name={icon} color={iconColor} />
        </View>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.cardTitle}>{title}</ThemedText>
          <ThemedText style={styles.lastSynced}>
            {syncStatus === 'syncing' ? 'Syncing...' : `Last synced: ${lastSynced}`}
          </ThemedText>
        </View>
        <Pressable 
          style={[styles.toggleContainer, enabled ? { backgroundColor: '#e0f2f7' } : {}]} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggle(!enabled);
          }}
        >
          <View style={[styles.toggle, enabled ? { backgroundColor: tintColor, transform: [{ translateX: 16 }] } : {}]} />
        </Pressable>
      </View>
      
      <View style={styles.cardContent}>
        {syncStatus === 'syncing' ? (
          <View style={styles.loadingContainer}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, { width: '70%' }]} />
            <View style={[styles.skeletonLine, { width: '50%' }]} />
          </View>
        ) : syncStatus === 'error' ? (
          <View style={styles.errorContainer}>
            <IconSymbol size={30} name="exclamationmark.triangle" color="#FF3B30" />
            <ThemedText style={styles.errorText}>Sync failed. Tap to retry.</ThemedText>
          </View>
        ) : (
          <ThemedText style={styles.contentText}>
            {enabled ? 'Data sync is enabled' : 'Enable sync to track your progress'}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
};

export default function GoogleFitSync() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  
  const [sleepEnabled, setSleepEnabled] = useState(true);
  const [stepsEnabled, setStepsEnabled] = useState(true);
  const [syncingStatus, setSyncingStatus] = useState<{[key: string]: SyncStatus}>({
    sleep: 'idle',
    steps: 'idle'
  });

  const handleSync = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Set both cards to syncing state
    setSyncingStatus({
      sleep: 'syncing',
      steps: 'syncing'
    });
    
    // Simulate sync process
    setTimeout(() => {
      setSyncingStatus(prev => ({
        ...prev,
        sleep: 'success'
      }));
    }, 1500);
    
    setTimeout(() => {
      setSyncingStatus(prev => ({
        ...prev,
        steps: 'success'
      }));
    }, 2200);
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>Google Fit Integration</ThemedText>
      
      <GoogleFitCard
        title="Sleep Data"
        icon="bed.double.fill"
        iconColor="#7e5ae6"
        lastSynced="Today, 9:32 AM"
        onToggle={setSleepEnabled}
        enabled={sleepEnabled}
        syncStatus={syncingStatus.sleep}
      />
      
      <GoogleFitCard
        title="Activity Data"
        icon="figure.walk"
        iconColor="#4CAF50"
        lastSynced="Today, 9:32 AM"
        onToggle={setStepsEnabled}
        enabled={stepsEnabled}
        syncStatus={syncingStatus.steps}
      />
      
      <Pressable 
        style={[styles.fabContainer, { backgroundColor: tintColor }]}
        onPress={handleSync}
        accessibilityLabel="Sync with Google Fit"
        accessibilityHint="Syncs your sleep and activity data with Google Fit"
      >
        {Object.values(syncingStatus).includes('syncing') ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <IconSymbol size={24} name="arrow.clockwise" color="white" />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 80,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f5f5f7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastSynced: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  toggleContainer: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    padding: 2,
  },
  toggle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#9ba1a6',
  },
  cardContent: {
    marginTop: 12,
    height: 60,
    justifyContent: 'center',
  },
  contentText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  skeletonLine: {
    height: 12,
    width: '90%',
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    marginVertical: 4,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  errorText: {
    color: '#FF3B30',
    marginLeft: 8,
    fontSize: 14,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
}); 