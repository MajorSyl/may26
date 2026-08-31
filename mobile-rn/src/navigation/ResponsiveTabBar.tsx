import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { ShieldCheck } from 'lucide-react-native';
import { Breakpoint } from '../hooks/useBreakpoint';
import { colors } from '../theme';

// Mobile keeps React Navigation's own default bottom tab bar untouched
// (re-exported, not reimplemented) -- only tablet/desktop swap to a
// persistent left side rail, per the brief's "desktop gets persistent
// side/top navigation instead of bottom tabs" requirement. The
// TabNavigator pads scene content by the rail's width so screens sit
// beside it rather than underneath it.
export default function ResponsiveTabBar(props: BottomTabBarProps & { breakpoint: Breakpoint; sidebarWidth: number }) {
  const { breakpoint, sidebarWidth, state, descriptors, navigation } = props;
  const insets = useSafeAreaInsets();

  if (breakpoint === 'mobile') {
    return <BottomTabBar {...props} />;
  }

  const showLabels = breakpoint === 'desktop';

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: sidebarWidth,
        backgroundColor: colors.rotaryDark,
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 12,
        gap: 4
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const label = (options.title ?? route.name) as string;
        const icon = options.tabBarIcon ? options.tabBarIcon({ focused: isFocused, color: isFocused ? colors.white : '#8B9BC7', size: 20 }) : null;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{
              flexDirection: showLabels ? 'row' : 'column',
              alignItems: 'center',
              gap: showLabels ? 12 : 4,
              paddingVertical: 12,
              paddingHorizontal: showLabels ? 20 : 8,
              marginHorizontal: 8,
              borderRadius: 12,
              backgroundColor: isFocused ? 'rgba(46,134,245,0.18)' : 'transparent'
            }}
          >
            {icon}
            <Text
              style={{
                color: isFocused ? colors.white : '#8B9BC7',
                fontSize: showLabels ? 13 : 9,
                fontWeight: isFocused ? '700' : '600'
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}

      <View style={{ flex: 1 }} />

      {/* Admin Sign In needs to be reachable without digging into the More
          menu on tablet/desktop, where there's room for a persistent
          footer link -- mobile keeps it in More only, since the bottom tab
          bar has no room for a permanent extra entry. */}
      <Pressable
        onPress={() => (navigation.getParent() as any)?.navigate('AdminLogin')}
        style={{
          flexDirection: showLabels ? 'row' : 'column',
          alignItems: 'center',
          gap: showLabels ? 12 : 4,
          paddingVertical: 12,
          paddingHorizontal: showLabels ? 20 : 8,
          marginHorizontal: 8,
          borderRadius: 12
        }}
      >
        <ShieldCheck size={20} color="#8B9BC7" />
        <Text style={{ color: '#8B9BC7', fontSize: showLabels ? 13 : 9, fontWeight: '600' }}>Admin Sign In</Text>
      </Pressable>
    </View>
  );
}
