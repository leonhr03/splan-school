import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    SafeAreaView,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput, Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Ionicons} from "@expo/vector-icons";

type Appointment = {
    subject: string;
    date: string; // TT.MM.JJJJ
    content: string;
};

export default function Dates() {
    const [appt, setAppt] = useState<Appointment[]>([]);
    const [addAlert, setAddAlert] = useState(false);
    const [newExam, setNewExam] = useState("");
    const [newDate, setNewDate] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newDay, setNewDay] = useState("");
    const [newMonth, setNewMonth] = useState("");
    const [newYear, setNewYear] = useState("");

    // Delete Modal
    const [deleteAlert, setDeleteAlert] = useState(false);
    const [apptToDelete, setApptToDelete] = useState<Appointment | null>(null);

    /* ---------------- SORTIERFUNKTION ---------------- */
    const sortAppointmentsByDate = (list: Appointment[]) => {
        return [...list].sort((a, b) => {
            const [dA, mA, yA] = a.date.split(".").map(Number);
            const [dB, mB, yB] = b.date.split(".").map(Number);

            const dateA = new Date(yA, mA - 1, dA).getTime();
            const dateB = new Date(yB, mB - 1, dB).getTime();

            return dateA - dateB; // älteste zuerst
            // return dateB - dateA; // neueste zuerst
        });
    };

    /* ---------------- LOAD ---------------- */
    useEffect(() => {
        const load = async () => {
            const storedList = await AsyncStorage.getItem("apptList");
            if (storedList) {
                const parsed: Appointment[] = JSON.parse(storedList);
                setAppt(sortAppointmentsByDate(parsed));
            }
        };
        load();
    }, []);


    const addAppt = async () => {
        const subject = newExam.trim();
        const content = newContent.trim();

        const day = newDay.padStart(2, "0");
        const month = newMonth.padStart(2, "0");
        const year = newYear;

        if (!subject || !content || !day || !month || !year) return;

        const date = `${day}.${month}.${year}`;

        // einfache Validierung
        const d = new Date(Number(year), Number(month) - 1, Number(day));
        if (
            d.getDate() !== Number(day) ||
            d.getMonth() !== Number(month) - 1 ||
            d.getFullYear() !== Number(year)
        ) {
            console.log("Ungültiges Datum");
            return;
        }

        const newList = sortAppointmentsByDate([
            ...appt,
            { subject, date, content },
        ]);

        await AsyncStorage.setItem("apptList", JSON.stringify(newList));
        setAppt(newList);

        // reset
        setNewExam("");
        setNewContent("");
        setNewDay("");
        setNewMonth("");
        setNewYear("");
        setAddAlert(false);
    };

    const confirmDeleteAppt = (item: Appointment) => {
        setApptToDelete(item);
        setDeleteAlert(true);
    };

    const deleteAppt = async () => {
        if (!apptToDelete) return;

        const newList = appt.filter(
            (a) =>
                !(
                    a.subject === apptToDelete.subject &&
                    a.date === apptToDelete.date &&
                    a.content === apptToDelete.content
                )
        );

        await AsyncStorage.setItem("apptList", JSON.stringify(newList));
        setAppt(newList);
        setApptToDelete(null);
        setDeleteAlert(false);
    };


    const renderItem = ({ item }: { item: Appointment }) => (
        <TouchableOpacity onLongPress={() => confirmDeleteAppt(item)}>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.subject}>{item.subject}</Text>
                    <Text style={styles.date}>{item.date}</Text>
                </View>
                <Text style={styles.content}>{item.content}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>Termine</Text>
                <TouchableOpacity style={styles.addButtonTop} onPress={() => setAddAlert(true)}>
                    <Ionicons name="add" size={30} color="#22e55c" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={appt}
                renderItem={renderItem}
                keyExtractor={(_, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            />


            {/* ADD MODAL */}
            <Modal transparent animationType="fade" visible={addAlert}>
                <TouchableOpacity
                    style={styles.sheetOverlay}
                    activeOpacity={1}
                    onPress={() => setAddAlert(false)}
                >
                    <TouchableOpacity style={styles.sheetsContainer} activeOpacity={1}>
                        <Text style={[styles.heading, {marginTop: 20}]}>Termin hinzufügen</Text>

                        <TextInput
                            value={newExam}
                            onChangeText={setNewExam}
                            style={styles.textInput}
                            placeholder="Titel"
                            placeholderTextColor="#aaa"
                        />
                        <View style={styles.dateRow}>
                            <TextInput
                                value={newDay}
                                onChangeText={setNewDay}
                                style={styles.dateInput}
                                placeholder="TT"
                                placeholderTextColor="#aaa"
                                keyboardType="numeric"
                            />
                            <TextInput
                                value={newMonth}
                                onChangeText={setNewMonth}
                                style={styles.dateInput}
                                placeholder="MM"
                                placeholderTextColor="#aaa"
                                keyboardType="numeric"
                            />
                            <TextInput
                                value={newYear}
                                onChangeText={setNewYear}
                                style={styles.dateInput}
                                placeholder="JJJJ"
                                placeholderTextColor="#aaa"
                                keyboardType="numeric"
                            />
                        </View>

                        <TextInput
                            value={newContent}
                            onChangeText={setNewContent}
                            style={styles.textInput}
                            placeholder="Inhalt"
                            placeholderTextColor="#aaa"
                        />

                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => addAppt()}
                        >
                            <Text style={styles.addButtonText}>Hinzufügen</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* DELETE MODAL */}
            <Modal transparent animationType="fade" visible={deleteAlert}>
                <View style={styles.centeredView}>
                    <View style={styles.deleteModal}>
                        <Text style={styles.deleteTitle}>Termin löschen?</Text>
                        <Text style={styles.deleteText}>
                            Willst du den Termin{" "}
                            <Text style={{ fontWeight: "bold" }}>
                                {apptToDelete?.subject}
                            </Text>{" "}
                            am {apptToDelete?.date} wirklich löschen?
                        </Text>
                        <View style={styles.deleteButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setDeleteAlert(false)}
                            >
                                <Text style={styles.cancelText}>Abbrechen</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={deleteAppt}
                            >
                                <Text style={styles.deleteTextButton}>Löschen</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#0d1d1f" },
    heading: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#22c55e",
        alignSelf: "center",
    },

    addButtonTop: {
        position: "absolute",
        right: 10,
        padding: 8,
    },
    card: {
        backgroundColor: "#0d2d2f",
        borderColor: "#0d4d4f",
        borderWidth: 2,
        padding: 18,
        marginVertical: 8,
        borderRadius: 16,
        width: "90%",
        alignSelf: "center",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    subject: { fontSize: 18, fontWeight: "bold", color: "#22e55c" },
    date: { fontSize: 14, color: "#0d7d7f" },
    content: { fontSize: 16, color: "#fff" },
    addText: { fontSize: 26, color: "#fff" },

    sheetOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    sheetsContainer: {
        backgroundColor: "#0d1d1f",
        borderRadius: 15,
        width: "90%",
        alignItems: "center",
        paddingBottom: 20,
    },
    textInput: {
        marginTop: 15,
        backgroundColor: "#0d2d2f",
        borderColor: "#0d3d3f",
        borderWidth: 2,
        borderRadius: 15,
        padding: 14,
        width: "80%",
        color: "#fff",
    },

    dateRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        width: "95%",
    },

    dateInput: {
        marginTop: 15,
        backgroundColor: "#0d2d2f",
        borderColor: "#0d3d3f",
        borderWidth: 2,
        borderRadius: 15,
        padding: 14,
        width: "20%",
        color: "#fff",
    },
    addButton: {
        marginTop: 30,
        backgroundColor: "#22c55e",
        borderRadius: 15,
        paddingVertical: 12,
        paddingHorizontal: 30,
    },
    addButtonText: { color: "#fff", fontSize: 17, fontWeight: "600" },

    centeredView: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    deleteModal: {
        backgroundColor: "#0d1d1f",
        borderRadius: 20,
        padding: 25,
        width: "80%",
        alignItems: "center",
    },
    deleteTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#22c55e",
        marginBottom: 15,
    },
    deleteText: { fontSize: 16, color: "#fff", textAlign: "center", marginBottom: 20 },
    deleteButtons: { flexDirection: "row", width: "100%" },
    cancelButton: {
        flex: 1,
        backgroundColor: "#444",
        padding: 12,
        marginRight: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    cancelText: { color: "#fff", fontSize: 16 },
    deleteButton: {
        flex: 1,
        backgroundColor: "#ef4444",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    deleteTextButton: { color: "#fff", fontSize: 16, fontWeight: "bold" },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: Platform.OS === "ios" ? 20 : 30,
        paddingHorizontal: 16,
        position: "relative",
        width: "100%",
    },


});