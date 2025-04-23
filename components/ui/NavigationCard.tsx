import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import RippleButton from './RippleButton';

interface NavigationCardProps {
  title: string;
  description?: string;
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  iconColor?: string;
  route: string;
  style?: ViewStyle;
  badgeCount?: number;
  hapticStyle?: 'light' | 'medium' | 'heavy';
}

export default function NavigationCard({
  title,
  description,
  icon,
  iconColor,
  route,
  style,
  badgeCount,
  hapticStyle = 'medium',
}: NavigationCardProps) {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const tintColor = Colors[colorScheme].tint;
  
  const handleNavigation = () => {
    router.push(route as any);
  };
  
  return (
    <RippleButton 
      style={{ ...styles.card, ...(style || {}) }}
      onPress={handleNavigation}
      hapticStyle={hapticStyle}
      accessibilityLabel={`Navigate to ${title}`}
      accessibilityHint={`Opens the ${title} screen`}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor || tintColor }]}>
          <IconSymbol name={icon} size={24} color="#FFFFFF" />
          {badgeCount !== undefined && badgeCount > 0 && (
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</ThemedText>
            </View>
          )}
        </View>
        
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {description && (
            <ThemedText style={styles.description}>{description}</ThemedText>
          )}
        </View>
        
        <IconSymbol 
          name="chevron.right" 
          size={20} 
          color={Colors[colorScheme].text} 
          style={{ opacity: 0.5 }}
        />
      </View>
    </RippleButton>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  description: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 3,
    lineHeight: 16,
  },
}); 