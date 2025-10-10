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
                    borderRadius: 30,
                    height: 60,
                    backgroundColor: '#060606',
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

            <Tabs.Screen name="dates"
                         options={{
                             tabBarLabel: 'Termine',
                             tabBarIcon: ({ color, size, focused }) => (
                                 <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
                             ),
                         }}/>

            <Tabs.Screen name="std_plan"
                         options={{
                             tabBarLabel: 'Plan',
                             tabBarIcon: ({ color, size, focused }) => (
                                 <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />
                             ),
                         }}/>
        </Tabs>
    );
}