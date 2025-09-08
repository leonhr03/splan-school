import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    SafeAreaView,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Dates() {
    const [appt, setAppt] = useState<{ subject: string; date: string; content: string }[]>([]);
    const [addAlert, setAddAlert] = useState(false);
    const [newExam, setNewExam] = useState("");
    const [newDate, setNewDate] = useState("");
    const [newContent, setNewContent] = useState("");

    // für delete modal
    const [deleteAlert, setDeleteAlert] = useState(false);
    const [apptToDelete, setApptToDelete] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            const storedList = await AsyncStorage.getItem("apptList");
            if (storedList) {
                setAppt(JSON.parse(storedList));
            }
        };
        load();
    }, []);

    const addAppt = async (subject: string, date: string, content: string) => {
        const trimmedExam = subject.trim();
        const trimmedDate = date.trim();
        const trimmedContent = content.trim();

        if (trimmedExam && trimmedDate && trimmedContent) {
            const newApptList = [
                ...appt,
                { subject: trimmedExam, date: trimmedDate, content: trimmedContent },
            ];
            await AsyncStorage.setItem("apptList", JSON.stringify(newApptList));
            // @ts-ignore
            setAppt(newApptList);
            setNewExam("");
            setNewDate("");
            setNewContent("");
            setAddAlert(false);
        } else {
            console.log("add failed");
        }
    };

    const confirmDeleteAppt = (item: any) => {
        setApptToDelete(item);
        setDeleteAlert(true);
    };

    const deleteAppt = async () => {
        if (!apptToDelete) return;
        const newApptList = appt.filter(
            (a) =>
                !(
                    a.subject === apptToDelete.subject &&
                    a.date === apptToDelete.date &&
                    a.content === apptToDelete.content
                )
        );
        await AsyncStorage.setItem("apptList", JSON.stringify(newApptList));
        setAppt(newApptList);
        setApptToDelete(null);
        setDeleteAlert(false);
    };

    const renderItem = ({ item }: any) => {
        return (
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
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Termine</Text>

            <FlatList
                data={appt}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ paddingBottom: 30 }}
                showsVerticalScrollIndicator={false}
            />

            {/* Add Button */}
            <TouchableOpacity style={styles.addFab} onPress={() => setAddAlert(true)}>
                <Text style={styles.addText}>+</Text>
            </TouchableOpacity>

            {/* Add Modal */}
            <Modal transparent animationType="slide" visible={addAlert}>
                <TouchableOpacity
                    style={styles.sheetOverlay}
                    activeOpacity={1}
                    onPress={() => setAddAlert(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.sheetsContainer}
                        onPress={() => {}}
                    >
                        <Text style={styles.heading}>Add A Subject</Text>
                        <TextInput
                            value={newExam}
                            onChangeText={setNewExam}
                            style={styles.textInput}
                            placeholder="Titel"
                            placeholderTextColor="#fff"
                        />
                        <TextInput
                            value={newDate}
                            onChangeText={setNewDate}
                            style={styles.textInput}
                            placeholder="Datum"
                            placeholderTextColor="#fff"
                        />
                        <TextInput
                            value={newContent}
                            onChangeText={setNewContent}
                            style={styles.textInput}
                            placeholder="Inhalt"
                            placeholderTextColor="#fff"
                        />
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => addAppt(newExam, newDate, newContent)}
                        >
                            <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Delete Modal */}
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
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#000000",
    },
    heading: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#22c55e",
        marginTop: 20,
        alignSelf: "center",
    },
    card: {
        backgroundColor: "#111111",
        padding: 18,
        marginVertical: 8,
        marginHorizontal: 10,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 4,
        width: "95%",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    subject: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#22e55c",
    },
    date: {
        fontSize: 14,
        color: "#9ca3af",
    },
    content: {
        fontSize: 16,
        color: "#ffffff",
        lineHeight: 22,
    },
    addFab: {
        backgroundColor: "#22c55e",
        borderRadius: 30,
        width: 60,
        height: 60,
        position: "absolute",
        bottom: 30,
        right: 30,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 80,
    },
    addText: {
        color: "#ffffff",
        fontSize: 24,
    },
    sheetOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.1)",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    sheetsContainer: {
        backgroundColor: "#111",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        width: "100%",
        height: "60%",
        alignItems: "center",
    },
    textInput: {
        marginTop: 50,
        backgroundColor: "#111",
        borderColor: "#22c55e",
        borderRadius: 15,
        borderWidth: 2,
        padding: 16,
        width: "80%",
        color: "#fff",
    },
    addButton: {
        marginTop: 40,
        backgroundColor: "#22c55e",
        borderRadius: 15,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: "center",
    },
    addButtonText: { fontSize: 17, color: "#fff", fontWeight: "600" },

    // delete modal styles
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    deleteModal: {
        backgroundColor: "#111",
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
    deleteText: {
        fontSize: 16,
        color: "#fff",
        marginBottom: 20,
        textAlign: "center",
    },
    deleteButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
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
});
