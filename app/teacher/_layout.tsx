import {Tabs} from "expo-router";
import {Ionicons} from "@expo/vector-icons";


export default function TeacherLayout() {
    return(
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#22c55e',
                tabBarInactiveTintColor: '#8a8a8a',
                tabBarStyle: {
                    borderRadius: 30,
                    height: 60,
                    backgroundColor: '#141414',
                    marginBottom: 25,
                    marginLeft: 10,
                    marginRight: 10,
                    padding: 20,
                    position: 'absolute',
                    borderWidth: 1,
                    borderTopWidth: 1,
                    borderColor: '#2a2a2a',
                    justifyContent: 'center',
                },
                tabBarLabelStyle: {
                    fontWeight: '600',
                },
            }}>
            <Tabs.Screen name="home"
                         options={{
                             tabBarLabel: 'Home',
                             tabBarIcon: ({ color, size, focused }) => (
                                 <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
                             ),
                         }}/>

            <Tabs.Screen name="appt"
                         options={{
                             tabBarLabel: 'Termine',
                             tabBarIcon: ({ color, size, focused }) => (
                                 <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
                             ),
                         }}/>

            <Tabs.Screen name="timeTable"
                         options={{
                             tabBarLabel: 'Plan',
                             tabBarIcon: ({ color, size, focused }) => (
                                 <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />
                             ),
                         }}/>
        </Tabs>
    )
}