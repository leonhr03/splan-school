import React, { useEffect, useState } from "react";
import {
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,

} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NotesPage() {
    const router = useRouter();
    const studentData: any = useLocalSearchParams();

    const [notes, setNotes] = useState<any[]>([]);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
    const [deleteItemName, setDeleteItemName] = useState<string>("");

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

    const renderItem = ({ item }: any) => {
        return (
            <View style={styles.itemContainer}>
                <TouchableOpacity
                    style={styles.border}
                    onPress={() => {
                        router.replace({pathname: "/pagesTeacher/noteDetail", params: {student: studentData.student, subject: studentData.subject, heading: item.heading, content: item.content}});
                    }}
                    onLongPress={() => {
                        setDeleteIndex(notes.indexOf(item));
                        setDeleteItemName(item.heading);
                        setDeleteModalVisible(true);
                    }}
                >
                    <Text style={styles.itemHeading}>
                        {item.heading}
                    </Text>

                    <Text style={styles.itemContent} numberOfLines={3} ellipsizeMode="tail">
                        {item.content}
                    </Text>
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
                <TouchableOpacity style={styles.addFab} onPress={() => router.replace({pathname: "/pagesTeacher/noteDetail", params: { subject: studentData.subject, student: studentData.student } })}>
                    <Ionicons name={"add"} size={35} color={"#22e55c"}/>
                </TouchableOpacity>
            </View>

            <FlatList
                style={styles.list}
                data={notes}
                renderItem={renderItem}
                keyExtractor={(_, index) => index.toString()}
            />

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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0d1d1f",
        padding: 16,
        alignItems: "center",
    },

    heading: {
        fontSize: 26,
        color: "#22c55e",
        fontWeight: "bold",
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
        position: "absolute",
        left: 20,
        alignItems: "center",
        justifyContent: "center",
    },

    addFab: {
        position: "absolute",
        right: 20,
    },

    list: {
        marginTop: 20,
        width: "100%",
    },

    itemContainer: {
        marginBottom: 20,
        alignItems: "center",
    },

    border: {
        width: "90%",
        padding: 20,
        borderWidth: 2,
        borderColor: "#0d4d4f",
        backgroundColor: "#0d2d2f",
        borderRadius: 20,
    },

    itemHeading: {
        fontSize: 20,
        color: "#22c55e",
        fontWeight: "bold",
        marginBottom: 8,
    },

    itemContent: {
        fontSize: 16,
        color: "#a7f3d0",
        lineHeight: 22,
    },

    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
    },

    deleteModal: {
        backgroundColor: "#0d1d1f",
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