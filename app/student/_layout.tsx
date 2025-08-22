import { Tabs } from 'expo-router';
import {Ionicons} from "@expo/vector-icons";

export default function StudentLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#22c55e',
                tabBarInactiveTintColor: '#22c55e',
                tabBarStyle: {
                    borderRadius: 15,
                    backgroundColor: '#111',
                    marginBottom: 25,
                    marginLeft: 10,
                    marginRight: 10,
                    padding: 20,
                    position: 'absolute',
                    borderWidth: 1,
                    borderColor: '#22c55e',
                },
                tabBarLabelStyle: {
                    color: '#22c55e',
                },
            }}>
            <Tabs.Screen name="home"
                         options={{
                             tabBarLabel: 'Home',
                             tabBarIcon: ({ color, size, focused }) => (
                                 <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
                             ),
                         }}/>
            <Tabs.Screen name="account"
                         options={{
                             tabBarLabel: 'Konto',
                             tabBarIcon: ({ color, size, focused }) => (
                                 <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
                             ),
                         }}/>
        </Tabs>
    );
}