import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    SafeAreaView,
    Text,
    FlatList,
    View,
    TouchableOpacity,
    Modal,
    TextInput, Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRouter} from "expo-router";
import {Ionicons} from "@expo/vector-icons";

export default function HomeStudent() {
    const router = useRouter();
    const [addAlert, setAddAlert] = useState(false);
    const [searchAlert, setSearchAlert] = useState(false);
    const [deleteAlert, setDeleteAlert] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
    const [searchSubjects, setSearchSubjects] = useState("");

    const [newSubject, setNewSubject] = useState("");
    const [subjects, setSubjects] = useState<{ subject: string; avr: string }[]>([]);
    const [avrGesMap, setAvrGesMap] = useState<{ [key: string]: string }>({});
    const [overallAverage, setOverallAverage] = useState<string>("-");
    const filteredSubjects = subjects.filter(s => s.subject.toLowerCase().includes(searchSubjects.toLowerCase()));


    const calculateOverallAverage = (list: { avr: string }[]) => {
        const numericAvrs = list
            .map(s => parseFloat(s.avr))
            .filter(v => !isNaN(v));
        if (numericAvrs.length === 0) return "-";
        const sum = numericAvrs.reduce((acc, curr) => acc + curr, 0);
        return (sum / numericAvrs.length).toFixed(2);
    };

    // Laden der gespeicherten Subjects und avrGes
    useEffect(() => {
        const load = async () => {
            try {
                const storedSubjects = await AsyncStorage.getItem("subjects");
                if (storedSubjects) {
                    const parsed = JSON.parse(storedSubjects);
                    setSubjects(parsed);

                    const map: { [key: string]: string } = {};
                    for (const item of parsed) {
                        const value = await AsyncStorage.getItem(`${item.subject}/avrGes`);
                        map[item.subject] = value || "-";
                    }
                    setAvrGesMap(map);
                }
            } catch (e) {
                console.error("Error loading subjects:", e);
            }
        };
        load();
    }, []);

    useEffect(() => {
        const listWithAvrs = subjects.map(s => ({
            ...s,
            avr: avrGesMap[s.subject] || "-",
        }));
        setOverallAverage(calculateOverallAverage(listWithAvrs));
    }, [subjects, avrGesMap]);

    const addSubject = async (subject: string) => {
        if (!subject.trim()) return;

        const newSubjectsList = [...subjects, { subject, avr: "-" }];
        try {
            await AsyncStorage.setItem("subjects", JSON.stringify(newSubjectsList));
            setSubjects(newSubjectsList);

            setAvrGesMap(prev => ({ ...prev, [subject]: "-" }));

            setNewSubject("");
            setAddAlert(false);
        } catch (e) {
            console.error("Error saving subjects:", e);
        }
    };

    const confirmDeleteSubject = (subject: string) => {
        setSubjectToDelete(subject);
        setDeleteAlert(true);
    };

    const deleteSubject = async () => {
        if (!subjectToDelete) return;
        try {
            const newSubjectsList = subjects.filter(s => s.subject !== subjectToDelete);
            await AsyncStorage.setItem("subjects", JSON.stringify(newSubjectsList));
            setSubjects(newSubjectsList);

            const newAvrMap = { ...avrGesMap };
            delete newAvrMap[subjectToDelete];
            setAvrGesMap(newAvrMap);

            await AsyncStorage.removeItem(`${subjectToDelete}/avrGes`);
            await AsyncStorage.removeItem(`${subjectToDelete}/exam`);
            await AsyncStorage.removeItem(`${subjectToDelete}/mund`);
            await AsyncStorage.removeItem(`${subjectToDelete}/examsAvr`);
            await AsyncStorage.removeItem(`${subjectToDelete}/mundAvr`);
            await AsyncStorage.removeItem(`${subjectToDelete}/avrGes`);

            setSubjectToDelete(null);
            setDeleteAlert(false);
        } catch (e) {
            console.error("Error deleting subject:", e);
        }
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() =>
                router.replace({
                    pathname: "/pagesstudent/choose",
                    params: { subject: item.subject },
                })
            }
            onLongPress={() => confirmDeleteSubject(item.subject)}
        >
            <View style={styles.itemLeft}>
                <Text style={styles.buText}>{item.subject}</Text>
            </View>
            <View style={styles.itemRight}>
                <Text style={styles.buText}>{avrGesMap[item.subject]}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.addButtonTop} onPress={() => setAddAlert(true)}>
                    <Ionicons name="add" size={30} color="#22c55e" />
                </TouchableOpacity>
                <Text style={styles.heading}>Splan</Text>
                <TouchableOpacity style={styles.searchButton} onPress={() => setSearchAlert(true)}>
                    <Ionicons name="search" size={26} color="#d4d4d4" />
                </TouchableOpacity>
            </View>
            <Text style={styles.text}>{"Ø "} {overallAverage}</Text>



            <FlatList
                style={styles.list}
                data={subjects}
                renderItem={renderItem}
                keyExtractor={(item) => item.subject}
                contentContainerStyle={{paddingBottom: 80}}
                showsVerticalScrollIndicator={false}
            />

            {/* Add Modal */}
            <Modal transparent animationType="fade" visible={addAlert}>
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
                        <Text style={[styles.heading, {marginTop: 20}]}>Add A Subject</Text>
                        <TextInput
                            value={newSubject}
                            onChangeText={setNewSubject}
                            style={styles.textInput}
                            placeholder="Subject"
                            placeholderTextColor="#333333"
                        />
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => addSubject(newSubject)}
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
                        <Text style={styles.deleteTitle}>Delete Subject?</Text>
                        <Text style={styles.deleteText}>
                            {`Do you really want to delete "${subjectToDelete}"?`}
                        </Text>
                        <View style={styles.deleteButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setDeleteAlert(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={deleteSubject}
                            >
                                <Text style={styles.deleteTextButton}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal transparent animationType="fade" visible={searchAlert} onRequestClose={() => setAddAlert(false)}>
                <TouchableOpacity
                    style={styles.searchOverlay}
                    activeOpacity={1}
                    onPress={() => setSearchAlert(false)}
                >
                    <View>
                        <TextInput
                            style={styles.searchInput}
                            value={searchSubjects}
                            onChangeText={setSearchSubjects}
                            placeholder={"Search..."}
                            placeholderTextColor={"#2a2a2a"}
                        />

                        <FlatList
                            style={styles.list}
                            data={filteredSubjects}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.subject}
                            contentContainerStyle={{paddingBottom: 80}}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#000000", alignItems: "center" },
    searchButton: {
        position: "absolute",
        right: 10,
        padding: 8,
    },

    addButtonTop: {
        position: "absolute",
        left: 10,
        padding: 8,
    },

    heading: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#ffffff",
        textAlign: "center",
    },
    buText: { fontSize: 22, color: "#fff" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: Platform.OS === "ios" ? 20 : 30,
        paddingHorizontal: 16,
        position: "relative",
        width: "100%",
    },

    text: {
        marginVertical: 20,
        fontSize: 25,
        color: "#d4d4d4",
        textAlign: "center",
        lineHeight: 24,
    },

    item: {
        alignSelf: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "95%",
        marginVertical: 10,
        paddingHorizontal: 16,
        padding: 10,
        backgroundColor: "#141414",
        borderColor: "#333333",
        borderRadius: 15,
        borderWidth: 2,
    },
    itemLeft: {
        flex: 1,
        backgroundColor: "#1c1c1c",
        borderColor: "#2a2a2a",
        borderRadius: 25,
        borderWidth: 2,
        height: 50,
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    itemRight: {
        backgroundColor: "#1c1c1c",
        height: 50,
        width: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: "#2a2a2a",
        marginLeft: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    button: {
        backgroundColor: "#22c55e",
        width: 60,
        height: 60,
        borderRadius: 30,
        position: "absolute",
        right: 30,
        bottom: 30,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 80,
    },

    sheetOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },

    sheetsContainer: {
        backgroundColor: "#141414",
        borderRadius: 20,
        width: "90%",
        alignItems: "center",
    },

    textInput: {
        marginTop: 50,
        backgroundColor: "#1c1c1c",
        borderColor: "#333333",
        borderRadius: 15,
        borderWidth: 2,
        padding: 14,
        width: "80%",
        color: "#fff",
    },

    addButton: {
        marginTop: 40,
        marginBottom: 20,
        backgroundColor: "#22c55e",
        borderRadius: 15,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: "center",
    },
    addButtonText: { fontSize: 17, color: "#fff", fontWeight: "600" },
    list: { marginBottom: 80 },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    deleteModal: {
        backgroundColor: "#111",
        borderRadius: 15,
        padding: 20,
        width: "80%",
        alignItems: "center",
    },
    deleteTitle: { fontSize: 22, fontWeight: "bold", color: "#ffffff", marginBottom: 10 },
    deleteText: { fontSize: 18, color: "#fff", marginBottom: 20, textAlign: "center" },
    deleteButtons: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
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
    cancelText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    deleteTextButton: { color: "#fff", fontSize: 16, fontWeight: "600" },

    searchOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        alignItems: "center",
        paddingTop: 160,
    },

    searchInput: {
        minWidth: "90%",
        maxWidth: "90%",
        padding: 10,
        borderRadius: 25,
        backgroundColor: "#1c1c1c",
        borderColor: "#2a2a2a",
        borderWidth: 2,
        color: "#fff",
        marginBottom: 10,
    },
});
