import React, {useEffect, useState} from "react";
import {
    StyleSheet,
    SafeAreaView,
    Text,
    TouchableOpacity,
    FlatList,
    View,
    Modal,
    TouchableWithoutFeedback,
    TextInput
} from "react-native";
import {useLocalSearchParams, useRouter} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Ionicons} from "@expo/vector-icons";

export default function Students() {

    const router = useRouter();
    const heading: any = useLocalSearchParams();
    const [students, setStudents] = useState<{student: string}[]>([{student: "Max Mustermann"}]);
    const [newStudent, setNewStudent] = useState("");
    const [currentStudent, setCurrentStudent] = useState("");

    // Delete state
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState<string>("");

    // Alerts
    const [addStudentAlert, setAddStudentAlert] = useState(false);
    const [chooseAction, setChooseAction] = useState(false);

    useEffect(() => {
        const load = async() => {
            const storedStudents = await AsyncStorage.getItem(`students/${heading.subject}`);
            const parsed = storedStudents ? JSON.parse(storedStudents) : [];
            setStudents(parsed);
        }
        load();
    }, []);

    const addStudent = async() => {
        try {
            const storedStudents = await AsyncStorage.getItem(`students/${heading.subject}`);
            const parsed = storedStudents ? JSON.parse(storedStudents) : [];
            const newStudentList = [...parsed, {student: newStudent}];
            await AsyncStorage.setItem(`students/${heading.subject}`, JSON.stringify(newStudentList));
            setStudents(newStudentList);
            setNewStudent("");
            setAddStudentAlert(false);
        } catch (e) {
            console.error("Error in adding student", e);
        }
    }

    const deleteStudent = (index: number, name: string) => {
        setDeleteIndex(index);
        setDeleteName(name);
        setDeleteModalVisible(true);
    }

    const confirmDelete = async () => {
        if (deleteIndex !== null) {
            const newList = [...students];
            newList.splice(deleteIndex, 1);
            setStudents(newList);
            await AsyncStorage.setItem(`students/${heading.subject}`, JSON.stringify(newList));
        }
        setDeleteIndex(null);
        setDeleteName("");
        setDeleteModalVisible(false);
    }

    const renderItem = ({item, index}: any) => (
        <View style={styles.itemContainer}>
            <TouchableOpacity
                style={styles.border}
                onPress={() => { setCurrentStudent(item.student); setChooseAction(true) }}
                onLongPress={() => deleteStudent(index, item.student)}
                delayLongPress={300}
            >
                <Text style={styles.text}>{item.student}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.headerLayout}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace({pathname: "/teacher/home"})}>
                    <Ionicons name="arrow-back" size={30} color="#22c55e" />
                </TouchableOpacity>
                <Text style={styles.heading}>{heading.subject}</Text>
                <TouchableOpacity style={styles.addFab} onPress={() => setAddStudentAlert(true)}>
                    <Ionicons name="add" size={35} color="#22c55e" />
                </TouchableOpacity>
            </View>

            {/* Students List */}
            <FlatList
                style={styles.studentsList}
                data={students}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
            />


            {/* Add Student Modal */}
            <Modal transparent animationType="fade" visible={addStudentAlert}>
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setAddStudentAlert(false)}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={styles.addAlertContainer}>
                            <Text style={styles.addAlertHeading}>Schüler Hinzufügen</Text>
                            <TextInput
                                style={styles.addAlertTextInput}
                                value={newStudent}
                                onChangeText={setNewStudent}
                                placeholder={"Schüler"}
                                placeholderTextColor={"#22c55e"}
                            />
                            <TouchableOpacity style={styles.addAlertButton} onPress={addStudent}>
                                <Text style={styles.addAlertButtonText}>Hinzufügen</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/* Choose Action Modal */}
            <Modal transparent animationType="fade" visible={chooseAction}>
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setChooseAction(false)}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={styles.addAlertContainer}>
                            <Text style={styles.addAlertHeading}>Was willst du tun?</Text>
                            <TouchableOpacity style={styles.chooseItem}
                                              onPress={() =>
                                                  router.replace({
                                                      pathname: "/pagesTeacher/notes",
                                                      params: { student: currentStudent, subject: heading.subject }
                                                  })
                                              }>
                                <Text style={styles.chooseText}>Notizen</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.chooseItem}
                                              onPress={() =>
                                                  router.replace({
                                                      pathname: "/pagesTeacher/exam",
                                                      params: { student: currentStudent, subject: heading.subject }
                                                  })
                                              }>
                                <Text style={styles.chooseText}>Noten</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal transparent animationType="fade" visible={deleteModalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.addAlertContainer}>
                        <Text style={styles.addAlertHeading}>Schüler löschen</Text>
                        <Text style={{color: "#fff", fontSize: 18, marginVertical: 10}}>
                            Willst du wirklich {deleteName} löschen?
                        </Text>
                        <View style={{flexDirection: "row", marginTop: 10}}>
                            <TouchableOpacity
                                style={[styles.addAlertButton, {backgroundColor: "#333", marginRight: 10}]}
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Text style={styles.addAlertButtonText}>Abbrechen</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.addAlertButton, {backgroundColor: "#e11d48"}]}
                                onPress={confirmDelete}
                            >
                                <Text style={styles.addAlertButtonText}>Löschen</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0d1d1f", padding: 16, alignItems: "center" },
    heading: { fontSize: 26, color: "#22c55e", fontWeight: "bold" },
    addFab: { position: "absolute", right: 20 },
    fabText: { fontSize: 22, color: "#fff" },
    itemContainer: { flex: 1, justifyContent: "center", marginBottom: 20, backgroundColor: "#0d2d2f", borderColor: "#0d4d4f" ,borderRadius: 15, borderWidth: 2,padding: 16 , width: "95%", alignSelf: "center"},
    border: { width: "90%", height: 60, borderWidth: 2, backgroundColor: "#0d3d3f" , borderColor: "#0d4d4f", borderRadius: 30, alignItems: "center", justifyContent: "center", marginHorizontal: 20 },
    text: { fontSize: 25, color: "#22c55e" },
    studentsList: { marginTop: 20, width: "100%" },
    modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.6)" },
    addAlertContainer: { width: "95%", alignItems: "center", backgroundColor: "#0d1d1f", borderRadius: 15, padding: 16 },
    addAlertHeading: { fontSize: 25, color: "#22c55e", marginTop: 20, marginBottom: 20, fontWeight: "bold" },
    addAlertTextInput: { backgroundColor: "#0d2d2f", borderColor: "#0d4d4f", borderRadius: 15, borderWidth: 2, padding: 14, width: "80%", color: "#fff" },
    addAlertButton: { backgroundColor: "#22c55e", borderRadius: 15, height: 50, alignItems: "center", justifyContent: "center", padding: 10, marginTop: 20, marginBottom: 20 },
    addAlertButtonText: { fontSize: 20, color: "#ffffff", fontWeight: "bold" },
    chooseItem: { borderWidth: 2, borderColor: "#0d4d4f", backgroundColor: "#0d2d2f", borderRadius: 15, padding: 16, alignItems: "center", justifyContent: "center", width: "80%", marginBottom: 20 },
    chooseText: { fontSize: 20, color: "#ffffff" },
    headerLayout: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 20, marginBottom: 10 },
    backButton: { alignItems: "center", justifyContent: "center", position: "absolute", left: 20 },
});