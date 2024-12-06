// components/CustomTabBar.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedView } from '@/components/ThemedView';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const activeTintColor = Colors[colorScheme ?? 'light'].tint;
  const inactiveTintColor = Colors[colorScheme ?? 'light'].icon;

  return (
    <ThemedView style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Đảm bảo icon cũng sử dụng màu trắng cho nút ở giữa
        const iconName = options.tabBarIcon
          ? options.tabBarIcon({ color: index === 2 ? '#fff' : isFocused ? activeTintColor : inactiveTintColor })
          : null;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.tab, index === 2 && styles.middleTab, isFocused && styles.focusedTab, index !== 2 && styles.sideTab, index === 1 && { marginRight: 38 }, index === 3 && { marginLeft: 38 }]}
          >
            {iconName}
            <Text style={{ color: index === 2 ? '#fff' : isFocused ? activeTintColor : inactiveTintColor , fontWeight: '600', fontSize: 12}}>
              {options.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    // height: 70,
    // gap: 5,
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    position: 'relative', 
    
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    // paddingHorizontal: 2,
  },
  sideTab: {
     // Nền trắng cho các tab bên ngoài
  },
  middleTab: {
    position: 'absolute',  
    top: -10,              
    left: '50%',           
    transform: [{ translateX: -35 }],
    height:75,            
    width:75,             
    backgroundColor: '#ef4444', 
    borderRadius:75,      
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
    zIndex: 10,  
  },
  textWhite: {
    color: '#fff',
  },
  // focusedTab: {
  //   backgroundColor: '#e7e5e4', // Đổi màu khi tab giữa được chọn (màu đỏ đậm hơn)
  // },
});
