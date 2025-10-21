import React, { useEffect, useState } from "react";
import {
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NotesPage() {
    const router = useRouter();
    const studentData: any = useLocalSearchParams();

    const [notes, setNotes] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [editableContent, setEditableContent] = useState("");
    const [detailView, setDetailView] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
    const [deleteItemName, setDeleteItemName] = useState<string>("");
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [newHeading, setNewHeading] = useState("");
    const [newContent, setNewContent] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const storedList: any = await AsyncStorage.getItem(
                    `notesList/${studentData.student}/${studentData.subject}`
                );
                const parsedList = storedList ? JSON.parse(storedList) : [];
                setNotes(parsedList);
            } catch (err) {
                alert(`Fehler beim Laden: ${err}`);
            }
        };
        load();
    }, []);

    const deleteItem = async () => {
        if (deleteIndex === null) return;
        try {
            const updatedNotes = notes.filter((_, index) => index !== deleteIndex);
            setNotes(updatedNotes);
            await AsyncStorage.setItem(
                `notesList/${studentData.student}/${studentData.subject}`,
                JSON.stringify(updatedNotes)
            );
            setDeleteModalVisible(false);
            setDeleteIndex(null);
            setDeleteItemName("");
        } catch (err) {
            alert(`Fehler beim Löschen: ${err}`);
        }
    };

    const saveEditedNote = async () => {
        if (!selectedItem) return;
        try {
            const updatedNotes = notes.map((note) =>
                note.heading === selectedItem.heading
                    ? { ...note, content: editableContent }
                    : note
            );
            setNotes(updatedNotes);
            await AsyncStorage.setItem(
                `notesList/${studentData.student}/${studentData.subject}`,
                JSON.stringify(updatedNotes)
            );
            setDetailView(false);
        } catch (err) {
            alert(`Fehler beim Speichern: ${err}`);
        }
    };

    const addNote = async () => {
        if (!newHeading.trim()) {
            alert("Bitte gib einen Titel ein!");
            return;
        }

        try {
            const newNote = { heading: newHeading.trim(), content: newContent.trim() };
            const updatedNotes = [...notes, newNote];
            setNotes(updatedNotes);

            await AsyncStorage.setItem(
                `notesList/${studentData.student}/${studentData.subject}`,
                JSON.stringify(updatedNotes)
            );

            setNewHeading("");
            setNewContent("");
            setAddModalVisible(false);
        } catch (err) {
            alert(`Fehler beim Hinzufügen: ${err}`);
        }
    };

    const renderItem = ({ item }: any) => {
        return (
            <View style={styles.itemContainer}>
                <TouchableOpacity
                    style={styles.border}
                    onPress={() => {
                        setSelectedItem(item);
                        setEditableContent(item.content || "");
                        setDetailView(true);
                    }}
                    onLongPress={() => {
                        setDeleteIndex(notes.indexOf(item));
                        setDeleteItemName(item.heading);
                        setDeleteModalVisible(true);
                    }}
                >
                    <Text style={styles.itemText}>{item.heading}</Text>
                    <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#22c55e"
                        style={styles.arrowForward}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerLayout}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() =>
                        router.replace({
                            pathname: "/pagesTeacher/students",
                            params: { subject: studentData.subject },
                        })
                    }
                >
                    <Ionicons name="arrow-back" size={30} color="#22c55e" />
                </TouchableOpacity>
                <Text style={styles.heading}>{studentData.student}</Text>
            </View>

            <FlatList
                style={styles.list}
                data={notes}
                renderItem={renderItem}
                keyExtractor={(_, index) => index.toString()}
            />

            <TouchableOpacity style={styles.addFab} onPress={() => setAddModalVisible(true)}>
                <Text style={styles.addFabText}>+</Text>
            </TouchableOpacity>

            <Modal transparent animationType="fade" visible={detailView}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                    >
                        <SafeAreaView style={styles.modalContainer}>
                            <Text style={styles.modalHeading}>{selectedItem?.heading}</Text>

                            <ScrollView
                                style={styles.modalScrollLarge}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                showsVerticalScrollIndicator={false}
                            >
                                <TextInput
                                    style={styles.modalContentInputLarge}
                                    value={editableContent}
                                    onChangeText={setEditableContent}
                                    multiline
                                    placeholder="Notiz schreiben..."
                                    placeholderTextColor="#555"
                                    textAlignVertical="top"
                                />
                            </ScrollView>

                            <View style={styles.modalButtonRow}>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: "#333" }]}
                                    onPress={() => setDetailView(false)}
                                >
                                    <Text style={styles.modalButtonText}>Abbrechen</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: "#22c55e" }]}
                                    onPress={saveEditedNote}
                                >
                                    <Text style={styles.modalButtonText}>Speichern</Text>
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            <Modal transparent animationType="fade" visible={deleteModalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.deleteModal}>
                        <Text style={styles.deleteTitle}>Eintrag löschen?</Text>
                        <Text style={styles.deleteText}>
                            Willst du wirklich {deleteItemName} löschen?
                        </Text>
                        <View style={styles.deleteButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Text style={styles.cancelText}>Abbrechen</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteButton} onPress={deleteItem}>
                                <Text style={styles.deleteTextButton}>Löschen</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal transparent animationType="fade" visible={addModalVisible}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                    >
                        <SafeAreaView style={styles.modalContainer}>
                            <Text style={styles.modalHeading}>Neue Notiz</Text>

                            <ScrollView
                                style={styles.modalScrollLarge}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                showsVerticalScrollIndicator={false}
                            >
                                <TextInput
                                    style={[
                                        styles.modalContentInputLarge,
                                        { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
                                    ]}
                                    placeholder="Titel..."
                                    placeholderTextColor="#555"
                                    value={newHeading}
                                    onChangeText={setNewHeading}
                                />

                                <TextInput
                                    style={styles.modalContentInputLarge}
                                    placeholder="Inhalt..."
                                    placeholderTextColor="#555"
                                    value={newContent}
                                    onChangeText={setNewContent}
                                    multiline
                                />
                            </ScrollView>

                            <View style={styles.modalButtonRow}>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: "#333" }]}
                                    onPress={() => setAddModalVisible(false)}
                                >
                                    <Text style={styles.modalButtonText}>Abbrechen</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: "#22c55e" }]}
                                    onPress={addNote}
                                >
                                    <Text style={styles.modalButtonText}>Hinzufügen</Text>
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>
                    </KeyboardAvoidingView>
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
        alignItems: "center",
    },
    heading: {
        fontSize: 26,
        color: "#22c55e",
        fontWeight: "bold",
    },
    itemContainer: {
        flex: 1,
        justifyContent: "center",
        marginBottom: 20,
    },
    arrowForward: {
        position: "absolute",
        right: 20,
    },
    list: {
        marginTop: 20,
        width: "100%",
    },
    border: {
        width: "90%",
        height: 60,
        borderWidth: 2,
        borderColor: "#22c55e",
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 20,
    },
    itemText: {
        fontSize: 20,
        color: "#22c55e",
        position: "absolute",
        left: 20,
    },
    addFab: {
        position: "absolute",
        right: 30,
        bottom: 30,
        height: 60,
        width: 60,
        borderRadius: 30,
        backgroundColor: "#22c55e",
        alignItems: "center",
        justifyContent: "center",
    },
    addFabText: {
        fontSize: 22,
        color: "#fff",
    },
    headerLayout: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        marginBottom: 10,
    },
    backButton: {
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        left: 20,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    modalContainer: {
        width: "90%",
        height: "80%",
        backgroundColor: "#111111",
        borderRadius: 20,
        padding: 20,
        justifyContent: "flex-start",
    },
    modalHeading: {
        fontSize: 26,
        color: "#22c55e",
        fontWeight: "bold",
        textAlign: "left",
        marginBottom: 5,
        marginTop: 20,
        marginHorizontal: 20,
    },
    modalScrollLarge: {
        flex: 1,
        marginTop: 5,
        marginBottom: 10,
        marginHorizontal: 10,
    },
    modalContentInputLarge: {
        color: "#22c55e",
        fontSize: 18,
        textAlign: "left",
        lineHeight: 26,
        minHeight: 100,
        paddingHorizontal: 10,
    },
    modalButtonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 10,
        marginBottom: 20,
        marginHorizontal: 20,
    },
    modalButton: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        marginHorizontal: 5,
    },
    modalButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    deleteModal: {
        backgroundColor: "#111",
        borderRadius: 15,
        padding: 20,
        width: "80%",
        alignItems: "center",
    },
    deleteTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#22c55e",
        marginBottom: 10,
    },
    deleteText: {
        fontSize: 18,
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
        marginRight: 10,
        backgroundColor: "#333",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    deleteButton: {
        flex: 1,
        marginLeft: 10,
        backgroundColor: "#e11d48",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    cancelText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    deleteTextButton: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});