import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    SafeAreaView,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Modal,
    TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Ionicons} from "@expo/vector-icons";

export default function ChooseGrade() {
    const router = useRouter();
    const { subject } = useLocalSearchParams();
    const [commingSoon, setCommingSoon] = useState(false)

    // Schriftlich
    const [exams, setExams] = useState<{ exam: string; grade: string }[]>([]);
    const [avrExams, setAvrExams] = useState("-");
    const [newExam, setNewExam] = useState("");
    const [newExamGrade, setNewExamGrade] = useState("");
    const [showExamModal, setShowExamModal] = useState(false);
    const [deleteExamAlert, setDeleteExamAlert] = useState(false)
    const [examToDelete, setExamToDelete] = useState<string | null>(null);

    // Mündlich
    const [mund, setMund] = useState<{ mund: string; grade: string }[]>([]);
    const [avrMund, setAvrMund] = useState("-");
    const [newMund, setNewMund] = useState("");
    const [newMundGrade, setNewMundGrade] = useState("");
    const [showMundModal, setShowMundModal] = useState(false);
    const [deleteMundAlert, setDeleteMundAlert] = useState(false)
    const [mundToDelete, setMundToDelete] = useState<string | null>(null);

    // Gesamt
    const [avrGes, setAvrGes] = useState(AsyncStorage.getItem(`${subject}/avrGes`));

    // Laden
    useEffect(() => {
        const load = async () => {
            const storedExams = await AsyncStorage.getItem(`${subject}/exam`);
            const storedMund = await AsyncStorage.getItem(`${subject}/mund`);

            if (storedExams) {
                const list = JSON.parse(storedExams);
                setExams(list);
                await updateAverageExam(list, false);
            }

            if (storedMund) {
                const list = JSON.parse(storedMund);
                setMund(list);
                await updateAverageMund(list, false);
            }
        };
        load();
    }, []);

// Gesamtdurchschnitt neu berechnen, sobald Schriftlich oder Mündlich da ist
    useEffect(() => {
        calcGes(avrExams, avrMund);
    }, [avrExams, avrMund]);

    // Durchschnitt Schriftlich
    const updateAverageExam = async (list: { grade: string }[], recalc = true) => {
        if (list.length === 0) {
            setAvrExams("-");
            if (recalc) calcGes("-", avrMund);
            return;
        }
        const sum = list.reduce((acc, curr) => acc + parseFloat(curr.grade), 0);
        const avg = (sum / list.length).toFixed(1);
        setAvrExams(avg);
        await AsyncStorage.setItem(`${subject}/examsAvr`, avg);
        if (recalc) calcGes(avg, avrMund);
    };

    // Durchschnitt Mündlich
    const updateAverageMund = async (list: { grade: string }[], recalc = true) => {
        if (list.length === 0) {
            setAvrMund("-");
            if (recalc) calcGes(avrExams, "-");
            return;
        }
        const sum = list.reduce((acc, curr) => acc + parseFloat(curr.grade), 0);
        const avg = (sum / list.length).toFixed(1);
        setAvrMund(avg);
        await AsyncStorage.setItem(`${subject}/mundAvr`, avg);
        if (recalc) calcGes(avrExams, avg);
    };

    // Gesamt Durchschnitt berechnen
    const calcGes = async (examVal?: string | number, mundVal?: string | number) => {
        const ex = parseFloat(examVal?.toString() ?? "");
        const mu = parseFloat(mundVal?.toString() ?? "");

        let ges = "-";
        if (!isNaN(ex) && !isNaN(mu)) {
            ges = ((ex + mu) / 2).toFixed(1);
        } else if (!isNaN(ex)) {
            ges = ex.toFixed(1);
        } else if (!isNaN(mu)) {
            ges = mu.toFixed(1);
        }

        // @ts-ignore
        setAvrGes(ges);
        await AsyncStorage.setItem(`${subject}/avrGes`, ges);
    };

    // Schriftlich hinzufügen
    const addExam = async () => {
        if (!newExam.trim() || !newExamGrade.trim()) return;
        const newList = [...exams, { exam: newExam, grade: newExamGrade }];
        setExams(newList);
        await AsyncStorage.setItem(`${subject}/exam`, JSON.stringify(newList));
        await updateAverageExam(newList);
        setNewExam("");
        setNewExamGrade("");
        setShowExamModal(false);
    };

    // Mündlich hinzufügen
    const addMund = async () => {
        if (!newMund.trim() || !newMundGrade.trim()) return;
        const newList = [...mund, { mund: newMund, grade: newMundGrade }];
        setMund(newList);
        await AsyncStorage.setItem(`${subject}/mund`, JSON.stringify(newList));
        await updateAverageMund(newList);
        setNewMund("");
        setNewMundGrade("");
        setShowMundModal(false);
    };

    // Schriftlich Löschen

    const deleteExam = (exam: string) => {
        setExamToDelete(exam)
        setDeleteExamAlert(true)
    }

    const deleteExamConfirm = async () => {
        const newExamsList = exams.filter(s => s.exam !== examToDelete);
        await AsyncStorage.setItem(`${subject}/exam`, JSON.stringify(newExamsList));
        setExams(newExamsList);

        // Durchschnitt neu berechnen
        await updateAverageExam(newExamsList);

        // Modal schließen
        setDeleteExamAlert(false);
        setExamToDelete(null);
    };

    // Mündlich Löschen

    const deleteMund = (exam: string) => {
        setMundToDelete(exam)
        setDeleteMundAlert(true)
    }

    const deleteMundConfirm = async () => {
        const newMundsList = mund.filter(s => s.mund !== mundToDelete);
        await AsyncStorage.setItem(`${subject}/mund`, JSON.stringify(newMundsList));
        setMund(newMundsList);

        // Durchschnitt neu berechnen
        await updateAverageMund(newMundsList);

        // Modal schließen
        setDeleteMundAlert(false);
        setMundToDelete(null);
    };


    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>{subject}</Text>

            <Text style={styles.gesHeading}>Gesamt Ø {avrGes}</Text>

            <View style={styles.cardLayout}>
                {/* Schriftlich */}
                <View style={styles.card}>
                    <Text style={styles.text}>Schriftlich {"Ø "}{avrExams}</Text>
                    <TouchableOpacity style={styles.editButton} onPress={() => setCommingSoon(true)}>
                        <Ionicons name="pencil" size={20} color="#fff" />
                    </TouchableOpacity>

                    <FlatList
                        data={exams}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.listItem} onLongPress={() => deleteExam(item.exam)}>
                                <Text style={styles.listText}>{item.exam}</Text>
                                <View style={styles.listGrade}>
                                    <Text style={styles.listText}>{item.grade}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(_, index) => index.toString()}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={() => setShowExamModal(true)}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                {/* Mündlich */}
                <View style={styles.card}>
                    <Text style={styles.text}>Mündlich {"Ø "}{avrMund}</Text>
                    <TouchableOpacity style={styles.editButton} onPress={() => setCommingSoon(true)}>
                        <Ionicons name="pencil" size={20} color="#fff" />
                    </TouchableOpacity>

                    <FlatList
                        data={mund}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.listItem} onLongPress={() => deleteMund(item.mund)}>
                                <Text style={styles.listText}>{item.mund}</Text>
                                <View style={styles.listGrade}>
                                    <Text style={styles.listText}>{item.grade}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(_, index) => index.toString()}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={() => setShowMundModal(true)}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Schriftlich Modal */}
            <Modal transparent animationType="slide" visible={showExamModal}>
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowExamModal(false)}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.heading}>Schriftlich hinzufügen</Text>
                        <TextInput
                            value={newExam}
                            onChangeText={setNewExam}
                            style={styles.input}
                            placeholder="Prüfung"
                            placeholderTextColor="#aaa"
                        />
                        <TextInput
                            value={newExamGrade}
                            onChangeText={setNewExamGrade}
                            style={styles.input}
                            placeholder="Note"
                            keyboardType="numeric"
                            placeholderTextColor="#aaa"
                        />
                        <TouchableOpacity style={styles.saveButton} onPress={addExam}>
                            <Text style={styles.saveButtonText}>Speichern</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Mündlich Modal */}
            <Modal transparent animationType="slide" visible={showMundModal}>
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowMundModal(false)}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.heading}>Mündlich hinzufügen</Text>
                        <TextInput
                            value={newMund}
                            onChangeText={setNewMund}
                            style={styles.input}
                            placeholder="Thema"
                            placeholderTextColor="#aaa"
                        />
                        <TextInput
                            value={newMundGrade}
                            onChangeText={setNewMundGrade}
                            style={styles.input}
                            placeholder="Note"
                            keyboardType="numeric"
                            placeholderTextColor="#aaa"
                        />
                        <TouchableOpacity style={styles.saveButton} onPress={addMund}>
                            <Text style={styles.saveButtonText}>Speichern</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Schriftlich Delete */}
            <Modal transparent animationType="fade" visible={deleteExamAlert}>
                <View style={styles.centeredView}>
                    <View style={styles.deleteModal}>
                        <Text style={styles.deleteTitle}>Delete Subject?</Text>
                        <Text style={styles.deleteText}>
                            {`Do you really want to delete "${examToDelete}"?`}
                        </Text>
                        <View style={styles.deleteButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setDeleteExamAlert(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={deleteExamConfirm}
                            >
                                <Text style={styles.deleteTextButton}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Mündlich delete */}
            <Modal transparent animationType="fade" visible={deleteMundAlert}>
                <View style={styles.centeredView}>
                    <View style={styles.deleteModal}>
                        <Text style={styles.deleteTitle}>Delete Subject?</Text>
                        <Text style={styles.deleteText}>
                            {`Do you really want to delete "${mundToDelete}"?`}
                        </Text>
                        <View style={styles.deleteButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setDeleteMundAlert(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={deleteMundConfirm}
                            >
                                <Text style={styles.deleteTextButton}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal transparent animationType="fade" visible={commingSoon}>
                <View style={styles.centeredView}>
                    <View style={styles.deleteModal}>
                        <Text style={styles.deleteTitle}>Comming soon</Text>
                        <Text style={styles.deleteText}>This function comming soon</Text>
                        <TouchableOpacity style={styles.cancelButton}onPress={() => setCommingSoon(false)} >
                            <Text style={styles.cancelText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Zurück */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.replace("/student/home")}
            >
                <Text style={styles.buText}>{"<-"}</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000", padding: 16 },
    heading: { fontSize: 22, fontWeight: "bold", color: "#22c55e", marginTop: 20, textAlign: "center" },
    gesHeading: { fontSize: 20, fontWeight: "bold", color: "#fff", marginVertical: 10, textAlign: "center" },
    editButton: {
        position: "absolute",
        right: 20,
        top: 20,
    },
    cardLayout: { flex: 1, marginBottom: 80 },
    card: {
        flex: 1,
        marginVertical: 10,
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: "#22c55e",
    },
    text: { color: "#fff", fontSize: 20, marginBottom: 10, fontWeight: "bold" },
    listItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
    listText: { color: "#fff", fontSize: 18 },
    listGrade: { borderColor: "#22c55e", borderWidth: 2, height: 40, width: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    addButton: {
        marginTop: 10,
        backgroundColor: "#22c55e",
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "flex-end",
    },
    addButtonText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalContainer: { backgroundColor: "#111", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: "60%" },
    input: {
        marginTop: 15,
        backgroundColor: "#000",
        borderColor: "#22c55e",
        borderWidth: 2,
        borderRadius: 10,
        padding: 10,
        color: "#fff",
    },
    saveButton: {
        marginTop: 20,
        backgroundColor: "#22c55e",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    backButton: {
        backgroundColor: "#22c55e",
        width: 60,
        height: 60,
        borderRadius: 30,
        position: "absolute",
        left: 30,
        bottom: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    buText: { fontSize: 22, color: "#fff" },

    // Delete Modal
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
    deleteTitle: { fontSize: 22, fontWeight: "bold", color: "#22c55e", marginBottom: 10 },
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
});
