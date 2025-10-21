import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    Alert,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    View,
} from "react-native";
import { CalendarList, DateData } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Appointments {
    [date: string]: string[];
}

interface MarkedDates {
    [date: string]: {
        marked: boolean;
        dotColor: string;
        selected?: boolean;
        selectedColor?: string;
    };
}

export default function TeacherAppt() {
    const [markedDates, setMarkedDates] = useState<MarkedDates>({});
    const [appointments, setAppointments] = useState<Appointments>({});
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [title, setTitle] = useState<string>("");

    // Lade gespeicherte Termine beim Start
    useEffect(() => {
        const loadAppointments = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem("appointments");
                if (jsonValue != null) {
                    const savedAppointments: Appointments = JSON.parse(jsonValue);
                    setAppointments(savedAppointments);

                    const newMarked: MarkedDates = {};
                    Object.keys(savedAppointments).forEach((date) => {
                        newMarked[date] = { marked: true, dotColor: "#22c55e" };
                    });
                    setMarkedDates(newMarked);
                }
            } catch (e) {
                console.log("Fehler beim Laden der Termine:", e);
            }
        };
        loadAppointments();
    }, []);

    const handleDayPress = (date: DateData) => {
        setSelectedDate(date.dateString);
        setTitle("");
        setModalVisible(true);
    };

    const addAppointment = async () => {
        if (!title.trim()) {
            Alert.alert("Fehler", "Bitte einen Titel eingeben!");
            return;
        }

        const dayAppointments = appointments[selectedDate] || [];
        const newDayAppointments = [...dayAppointments, title];

        const updatedAppointments = {
            ...appointments,
            [selectedDate]: newDayAppointments,
        };

        setAppointments(updatedAppointments);

        setMarkedDates({
            ...markedDates,
            [selectedDate]: {
                marked: true,
                dotColor: "#22c55e",
                selected: true,
                selectedColor: "#22c55e",
            },
        });

        // Termine in AsyncStorage speichern
        try {
            await AsyncStorage.setItem(
                "appointments",
                JSON.stringify(updatedAppointments)
            );
        } catch (e) {
            console.log("Fehler beim Speichern der Termine:", e);
        }

        setModalVisible(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Termine</Text>

            <CalendarList
                style={[styles.calendar, { backgroundColor: "#000000" }]}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                pastScrollRange={12}
                futureScrollRange={12}
                scrollEnabled={true}
                showScrollIndicator={true}
                theme={{
                    backgroundColor: "#000000",
                    calendarBackground: "#000000",
                    todayTextColor: "#22c55e",
                    arrowColor: "#22c55e",
                    monthTextColor: "#22c55e",
                    dayTextColor: "#ffffff",
                    textDisabledColor: "#555555",
                }}
            />

            <FlatList
                style={styles.list}
                data={Object.keys(appointments).sort()}
                keyExtractor={(item) => item}
                contentContainerStyle={{ paddingBottom: 50 }}
                renderItem={({ item }) => (
                    <View style={styles.dayContainer}>
                        <Text style={styles.dateText}>{item}</Text>
                        {appointments[item].map((appt: string, index: number) => (
                            <Text key={index} style={styles.appointmentText}>
                                • {appt}
                            </Text>
                        ))}
                    </View>
                )}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalHeading}>
                            Neuer Termin am {selectedDate}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Titel eingeben"
                            placeholderTextColor="#888"
                            value={title}
                            onChangeText={setTitle}
                        />
                        <TouchableOpacity style={styles.button} onPress={addAppointment}>
                            <Text style={styles.buttonText}>Hinzufügen</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Abbrechen</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
        padding: 16,
    },
    heading: {
        fontSize: 26,
        color: "#22c55e",
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 10,
        textAlign: "center",
    },
    calendar: {
        width: "100%",
        height: "60%",
        borderRadius: 15,
        borderWidth: 2,
        borderColor: "#22c55e",
    },
    list: {
        flex: 1,
        marginTop: 20,
    },
    dayContainer: {
        marginBottom: 15,
        marginHorizontal: 20,
        padding: 10,
        borderWidth: 2,
        borderColor: "#22c55e",
        borderRadius: 15,
    },
    dateText: {
        color: "#22c55e",
        fontWeight: "bold",
        marginBottom: 5,
    },
    appointmentText: {
        color: "#ffffff",
        marginLeft: 5,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "85%",
        backgroundColor: "#1f1f1f",
        borderRadius: 10,
        padding: 20,
    },
    modalHeading: {
        color: "#22c55e",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: "#22c55e",
        borderRadius: 8,
        padding: 10,
        color: "#ffffff",
        marginBottom: 15,
    },
    button: {
        backgroundColor: "#22c55e",
        borderRadius: 8,
        paddingVertical: 10,
        marginBottom: 10,
    },
    cancelButton: {
        backgroundColor: "#555555",
    },
    buttonText: {
        color: "#000000",
        fontWeight: "bold",
        textAlign: "center",
    },
});