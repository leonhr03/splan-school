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
    View, TouchableWithoutFeedback,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
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
    const [currentMonth, setCurrentMonth] = useState(Date.now().toString().slice(0,7));
    const filteredDates = Object.keys(appointments).filter(
        (date) => date.startsWith(currentMonth)
    );

    useEffect(() => {
        const loadAppointments = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem("appointments");
                if (jsonValue != null) {
                    const savedAppointments: Appointments = JSON.parse(jsonValue);
                    setAppointments(savedAppointments);

                    const newMarked: MarkedDates = {};
                    Object.keys(savedAppointments).forEach((date) => {
                        newMarked[date] = {
                            marked: true,
                            dotColor: "#22c55e",
                            selected: true,
                        };
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

            <Calendar
                style={styles.calendar}
                markedDates={markedDates}
                onDayPress={handleDayPress}
                onMonthChange={(month) => {
                    setCurrentMonth(month.dateString.slice(0, 7)); // "2025-01"
                }}
                theme={{
                    calendarBackground: "#141414",
                    textSectionTitleColor: "#ffffff",
                    monthTextColor: "#22c55e",
                    todayTextColor: "#22c55e",
                    selectedDayTextColor: "#fff",
                    selectedDayBackgroundColor: "#22c55e",
                    dayTextColor: "#ffffff",
                }}
            />




            <Text style={styles.heading}>Aktuelle Termine</Text>

            {
                filteredDates.length === 0 ? (
                    <Text style={styles.listDefaultText}>Keine Termine</Text>
                ) : (
                <FlatList
                    style={styles.list}
                    data={filteredDates}
                    keyExtractor={(item) => item}
                    contentContainerStyle={{ paddingBottom: 50 }}
                    renderItem={({ item }) => (
                        <View style={styles.dayContainer}>
                            <Text style={styles.dateText}>{item.toString().slice(8,10)}.{item.toString().slice(5,7)}.{item.toString().slice(0,4)}</Text>
                            {appointments[item].map((appt: string, index: number) => (
                            <Text key={index} style={styles.appointmentText}>{appt}</Text>
                            ))}
                        </View>
                    )}
                />

                )
            }

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity style={styles.modalBackground} onPress={() => setModalVisible(false)}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View  style={styles.modalContainer} >
                            <Text style={styles.modalHeading}>
                                Neuer Termin am {selectedDate.toString().slice(8,10)}.{selectedDate.toString().slice(5,7)}.{selectedDate.toString().slice(0,4)}
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
                        </View>

                    </TouchableWithoutFeedback>
                </TouchableOpacity>
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
        color: "#ffffff",
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 10,
        textAlign: "center",
    },
    calendar: {
        width: "90%",
        alignSelf: "center",
        borderRadius: 15,
        borderWidth: 2,
        borderColor: "#2a2a2a",
        backgroundColor: "#141414",
        padding: 10,
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
        borderColor: "#2a2a2a",
        backgroundColor: "#141414",
        borderRadius: 15,
    },
    dateText: {
        color: "#ffffff",
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
        backgroundColor: "#000000",
        borderRadius: 10,
        padding: 20,
    },
    modalHeading: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: "#2a2a2a",
        backgroundColor: "#141414",
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

    listDefaultText: {
        color: "#ffffff",
        textAlign: "center",
    }
});