import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

type Weekday = "Mo" | "Di" | "Mi" | "Do" | "Fr";
type TimeSlot = string;

interface Schedule {
    [day: string]: {
        [time: string]: string;
    };
}

export default function TeacherSchedule() {
    const weekdays: Weekday[] = ["Mo", "Di", "Mi", "Do", "Fr"];

    const [schedule, setSchedule] = useState<Schedule>({});
    const [times, setTimes] = useState<TimeSlot[]>([
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
    ]);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState<Weekday | "">("");
    const [selectedTime, setSelectedTime] = useState<TimeSlot | "">("");
    const [subject, setSubject] = useState<string>("");

    const [timeModalVisible, setTimeModalVisible] = useState(false);

    const [timeInputs, setTimeInputs] = useState<string[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const scheduleJson = await AsyncStorage.getItem("schedule");
                if (scheduleJson) setSchedule(JSON.parse(scheduleJson));

                const timesJson = await AsyncStorage.getItem("times");
                if (timesJson) {
                    setTimes(JSON.parse(timesJson));
                }
            } catch (e) {
                console.log("Fehler beim Laden:", e);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        setTimeInputs(times);
    }, [times, timeModalVisible]);

    const openModal = (day: Weekday, time: TimeSlot) => {
        setSelectedDay(day);
        setSelectedTime(time);
        setSubject(schedule[day]?.[time] || "");
        setModalVisible(true);
    };

    const saveSubject = async () => {
        if (!subject.trim()) {
            Alert.alert("Fehler", "Bitte eine Stunde eingeben!");
            return;
        }

        const newSchedule = { ...schedule };
        if (!newSchedule[selectedDay!]) newSchedule[selectedDay!] = {};
        newSchedule[selectedDay!][selectedTime!] = subject;

        setSchedule(newSchedule);
        setModalVisible(false);

        try {
            await AsyncStorage.setItem("schedule", JSON.stringify(newSchedule));
        } catch (e) {
            console.log("Fehler beim Speichern des Stundenplans:", e);
        }
    };

    const saveTimes = async (newTimes: string[]) => {
        setTimes(newTimes);
        setTimeModalVisible(false);
        try {
            await AsyncStorage.setItem("times", JSON.stringify(newTimes));
        } catch (e) {
            console.log("Fehler beim Speichern der Zeiten:", e);
        }
    };

    const addTime = () => {
        const newArr = [...timeInputs, ""];
        setTimeInputs(newArr);
    };

    const removeTime = (index: number) => {
        const newArr = [...timeInputs];
        newArr.splice(index, 1);
        setTimeInputs(newArr);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerLayout}>
                <Text style={styles.heading}>Stundenplan</Text>
                <TouchableOpacity
                    style={{ position: "absolute", right: 16 }}
                    onPress={() => setTimeModalVisible(true)}
                >
                    <Ionicons name="options" size={26} color="#22c55e" />
                </TouchableOpacity>
            </View>

            <ScrollView horizontal>
                <View>
                    {/* Header */}
                    <View style={styles.row}>
                        <View style={styles.timeCell} />
                        {weekdays.map((day) => (
                            <View key={day} style={styles.headerCell}>
                                <Text style={styles.headerText}>{day}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Stunden */}
                    {times.map((time, timeIndex) => (
                        <View key={time + timeIndex} style={styles.row}>
                            <View style={styles.timeCell}>
                                <Text style={styles.timeText}>{time}</Text>
                            </View>

                            {weekdays.map((day) => {
                                const isThickBorder = (timeIndex + 1) % 2 === 0;
                                return (
                                    <TouchableOpacity
                                        key={day + time}
                                        style={[
                                            styles.cell,
                                            isThickBorder && { borderBottomWidth: 4 },
                                        ]}
                                        onPress={() => openModal(day, time)}
                                    >
                                        <Text style={styles.cellText}>
                                            {schedule[day]?.[time] || ""}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Modal Fach eintragen */}
            <Modal animationType="slide" transparent visible={modalVisible}>
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalHeading}>
                            {selectedDay} - {selectedTime}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Fach eingeben"
                            placeholderTextColor="#888"
                            value={subject}
                            onChangeText={setSubject}
                        />
                        <TouchableOpacity style={styles.button} onPress={saveSubject}>
                            <Text style={styles.buttonText}>Speichern</Text>
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

            {/* Modal Zeiten bearbeiten */}
            <Modal animationType="slide" transparent visible={timeModalVisible}>
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalHeading}>Zeiten einstellen</Text>

                        <ScrollView style={{ maxHeight: 400 }}>
                            {timeInputs.map((t, index) => (
                                <View key={index} style={styles.timeEditRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.timeLabel}>Zeit {index + 1}</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={t}
                                            onChangeText={(text) => {
                                                const newArr = [...timeInputs];
                                                newArr[index] = text;
                                                setTimeInputs(newArr);
                                            }}
                                            placeholder="z.B. 08:00"
                                            placeholderTextColor="#888"
                                        />
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => removeTime(index)}
                                        style={styles.deleteButton}
                                    >
                                        <Ionicons name="trash" size={22} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={addTime}
                            >
                                <Ionicons name="add" size={22} color="#000" />
                                <Text style={styles.addButtonText}>Zeit hinzufügen</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => saveTimes(timeInputs)}
                        >
                            <Text style={styles.buttonText}>Speichern</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => setTimeModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Abbrechen</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const CELL_HEIGHT = 60;
const CELL_WIDTH = 100;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000", padding: 16 },
    headerLayout: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        marginBottom: 40,
    },
    heading: { fontSize: 26, fontWeight: "bold", color: "#22c55e", textAlign: "center", flex: 1 },
    row: { flexDirection: "row" },
    timeCell: {
        width: CELL_WIDTH / 2,
        height: CELL_HEIGHT,
        borderWidth: 1,
        borderColor: "#22c55e",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1f1f1f",
    },
    headerCell: {
        width: CELL_WIDTH,
        height: CELL_HEIGHT,
        borderWidth: 1,
        borderColor: "#22c55e",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1f1f1f",
    },
    headerText: { color: "#22c55e", fontWeight: "bold", textAlign: "center" },
    timeText: { color: "#fff", fontWeight: "bold" },
    cell: {
        width: CELL_WIDTH,
        height: CELL_HEIGHT,
        borderWidth: 1,
        borderColor: "#22c55e",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
    },
    cellText: { color: "#fff", textAlign: "center" },
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
    modalHeading: { color: "#22c55e", fontSize: 18, fontWeight: "bold", marginBottom: 15 },
    input: {
        borderWidth: 1,
        borderColor: "#22c55e",
        borderRadius: 8,
        padding: 10,
        color: "#fff",
        marginBottom: 10,
    },
    button: {
        backgroundColor: "#22c55e",
        borderRadius: 8,
        paddingVertical: 10,
        marginTop: 10,
    },
    cancelButton: { backgroundColor: "#555" },
    buttonText: { color: "#000", fontWeight: "bold", textAlign: "center" },
    timeEditRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    deleteButton: {
        marginLeft: 8,
        backgroundColor: "#c0392b",
        padding: 10,
        borderRadius: 8,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#22c55e",
        padding: 10,
        borderRadius: 8,
        justifyContent: "center",
        marginTop: 10,
    },
    addButtonText: { color: "#000", fontWeight: "bold", marginLeft: 6 },
    timeLabel: { color: "#22c55e", marginBottom: 5 },
});