import React, {useEffect, useState} from "react"
import {
    Button,
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text, TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRouter} from "expo-router";

export default function TeacherHome() {

    const router = useRouter();
    const [avrGes, setAvrGes] = useState("--")
    const [classList, setClassList] = useState<{class: string}[]>([])
    const [newClass, setNewClass] = useState("")
    const [currentClass, setCurrentClass] = useState("")
    const [subjects, setSubjects] = useState<{subject: string}[]>([])
    const [newSubject, setNewSubject] = useState("")
    const [deleteType, setDeleteType] = useState<"class" | "subject" | null>(null);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState<string>("");

    // alerts
    const [addAlert, setAddAlert] = useState(false)
    const [addSubjectAlert, setAddSubjectAlert] = useState(false)
    const [addSubjectSheet, setAddSubjectSheet] = useState(false)
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    useEffect(() => {
        const Load = async () => {
            const StoredClassList = await AsyncStorage.getItem("ClassList")
            if (StoredClassList != null) {
                setClassList(JSON.parse(StoredClassList))
            }
        }
        Load()
    })

    const addClass = async () => {
        if (!newClass) return;
        const StoredClassList = await AsyncStorage.getItem("ClassList")
        const newStoredClassList = [...classList, {class: newClass.trim()}]
        await AsyncStorage.setItem("ClassList", JSON.stringify(newStoredClassList))
        setNewClass("")
        setAddAlert(false)
    }

    const addSubject = async () => {
        try {
            const stored = await AsyncStorage.getItem(`SubjectsList/${currentClass}`)
            const parsed = stored ? JSON.parse(stored) : []
            const updated = [...parsed, { subject: newSubject }]
            await AsyncStorage.setItem(`SubjectsList/${currentClass}`, JSON.stringify(updated))
            setNewSubject("")
            setAddSubjectAlert(false)
            setSubjects(updated)
        } catch (err) {
            console.error("Error while adding subject:", err)
        }
    }

    const deleteItem = (index: number, name: string) => {
        setDeleteType("class");
        setDeleteIndex(index);
        setDeleteName(name);
        setDeleteModalVisible(true);
    };

    const deleteSubject = (index: number, name: string) => {
        setDeleteType("subject");
        setDeleteIndex(index);
        setDeleteName(name);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (deleteType === "class" && deleteIndex !== null) {
            const newList = [...classList];
            const removed = newList.splice(deleteIndex, 1)[0];
            setClassList(newList);
            await AsyncStorage.setItem("ClassList", JSON.stringify(newList));
            // Optional: alle Fächer der gelöschten Klasse löschen
            await AsyncStorage.removeItem(`SubjectsList/${removed.class}`);
        }

        if (deleteType === "subject" && deleteIndex !== null && currentClass) {
            const newList = [...subjects];
            newList.splice(deleteIndex, 1);
            setSubjects(newList);
            await AsyncStorage.setItem(`SubjectsList/${currentClass}`, JSON.stringify(newList));
        }

        setDeleteModalVisible(false);
        setDeleteIndex(null);
        setDeleteType(null);
        setDeleteName("");
    };

    const renderItem = ({item, index}: any) => {
        return(
            <View style={styles.itemContainer}>
                <TouchableOpacity style={styles.border} onLongPress={() => deleteItem(index, item.class)} onPress={async () => {
                    setCurrentClass(item.class)
                    const storedSubjectsList: any = await AsyncStorage.getItem(`SubjectsList/${item.class}`)
                    const parsed = storedSubjectsList ? JSON.parse(storedSubjectsList) : []
                    setSubjects(parsed)
                    setAddSubjectSheet(true)
                }}>
                    <Text style={styles.text}>{item.class}</Text>
                </TouchableOpacity>

            </View>
        )
    }

    const subjectsListItem = ({item, index}: any) => {
        return (
            <View style={styles.itemContainer}>
                <TouchableOpacity
                    style={styles.border}
                    onLongPress={() => deleteSubject(index, item.subject)}
                    onPress={() =>
                        router.replace({
                            pathname: "/pagesTeacher/students",
                            params: { subject: `${currentClass} - ${item.subject}` }
                        })
                    }
                >
                    <Text style={styles.text}>{item.subject}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Splan for Teachers</Text>
            <FlatList
                style={styles.classList}
                data={classList}
                renderItem={renderItem}
                keyExtractor={(item) => item.class}/>

            <TouchableOpacity style={styles.addFab} onPress={() => setAddAlert(true)}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/*add Alert*/}
            <Modal transparent animationType={"fade"} visible={addAlert}>
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setAddAlert(false)}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={styles.addAlertContainer} >
                            <Text style={styles.addAlertHeading}>Hinzufügen</Text>
                            <TextInput
                                style={styles.addAlertTextInput}
                                value={newClass}
                                onChangeText={setNewClass}
                                placeholder={"Klasse"}
                                placeholderTextColor={"#22c55e"}/>

                            <TouchableOpacity style={styles.addAlertButton} onPress={addClass}>
                                <Text style={styles.addAlertButtonText}>Hinzufügen</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/*add Subjects*/}
            <Modal transparent animationType={"slide"} visible={addSubjectSheet}  pointerEvents="box-none">
                <TouchableOpacity style={styles.modalSheetOverlay} onPress={() => setAddSubjectSheet(false)}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={styles.addSubjectSheetContainer}>
                            <Text style={styles.addAlertHeading}>{currentClass}</Text>
                            <View style={styles.listCard}>
                                <FlatList
                                    data={subjects}
                                    renderItem={subjectsListItem}
                                    keyExtractor={(_, i) => i.toString()}
                                />
                                <TouchableOpacity style={styles.addFabAlert} onPress={() => setAddSubjectAlert(true)}>
                                    <Text style={styles.fabTextAlert}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>

                <Modal transparent animationType="fade" visible={deleteModalVisible}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.addAlertContainer}>
                            <Text style={styles.addAlertHeading}>Löschen bestätigen</Text>
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


                {/*add Alert*/}
                <Modal transparent animationType={"fade"} visible={addSubjectAlert}>
                    <TouchableOpacity style={styles.modalOverlay} onPress={() => setAddSubjectAlert(false)}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.addAlertContainer} >
                                <Text style={styles.addAlertHeading}> Fach Hinzufügen</Text>
                                <TextInput
                                    style={styles.addAlertTextInput}
                                    value={newSubject}
                                    onChangeText={setNewSubject}
                                    placeholder={"Fach"}
                                    placeholderTextColor={"#22c55e"}/>

                                <TouchableOpacity style={styles.addAlertButton} onPress={addSubject}>
                                    <Text style={styles.addAlertButtonText}>Hinzufügen</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </TouchableOpacity>
                </Modal>
            </Modal>


            <Modal transparent animationType="fade" visible={deleteModalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.addAlertContainer}>
                        <Text style={styles.addAlertHeading}>Löschen bestätigen</Text>
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
    container: {
        flex: 1,
        backgroundColor: "#000000",
        alignItems: "center",
        padding: 16,
    },

    heading: {
        fontSize: 26,
        color: "#22c55e",
        fontWeight: "bold",
        marginTop: 20,
    },

    avrText: {
        fontSize: 25,
        color: "#ffffff",
        marginTop: 20,
    },

    itemContainer: {
        flex: 1,
        justifyContent: "center",
        marginBottom: 20,
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

    text: {
        fontSize: 25,
        color: "#22c55e",
    },

    classList: {
        marginTop: 20,
        width: "100%",
    },

    addFab: {
        position: "absolute",
        right: 30,
        bottom: 110,
        height: 60,
        width: 60,
        borderRadius: 30,
        backgroundColor: "#22c55e",
        alignItems: "center",
        justifyContent: "center",
    },

    fabText: {
        fontSize: 22,
        color: "#fff"
    },

    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)"
    },

    modalSheetOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)"
    },

    addAlertContainer: {
        width: "95%",
        alignItems: "center",
        backgroundColor: "#111111",
        borderRadius: 15
    },

    addAlertHeading: {
        fontSize: 25,
        color: "#22c55e",
        marginTop: 20,
        marginBottom: 20,
        fontWeight: "bold",
    },

    addAlertTextInput: {
        backgroundColor: "#111",
        borderColor: "#22c55e",
        borderRadius: 15,
        borderWidth: 2,
        padding: 14,
        width: "80%",
        color: "#fff",
    },

    addAlertButton: {
        backgroundColor: "#22c55e",
        borderRadius: 15,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        marginTop: 20,
        marginBottom: 20,
    },

    addAlertButtonText: {
        fontSize: 20,
        color: "#ffffff",
        fontWeight: "bold",
    },

    addSubjectSheetContainer: {
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
        backgroundColor: "#111111",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 16,
    },

    listCard: {
        borderWidth: 2,
        borderColor: "#22c55e",
        borderRadius: 15,
        padding: 10,
        width: "95%",
        height: 300,
        marginTop: 20,
        marginBottom: 60,
    },

    addFabAlert: {
        position: "absolute",
        right: 10,
        bottom: 10,
        backgroundColor: "#22c55e",
        height: 50,
        width: 50,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
    },

    fabTextAlert: {
        fontSize: 20,
        color: "#fff"
    },
})