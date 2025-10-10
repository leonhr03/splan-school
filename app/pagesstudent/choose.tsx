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
    TouchableWithoutFeedback,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function ChooseGrade() {
    const router = useRouter();
    const { subject } = useLocalSearchParams();

    // Schriftlich
    const [exams, setExams] = useState<{ exam: string; grade: string; type: string }[]>([]);
    const [avrExams, setAvrExams] = useState("-");
    const [newExam, setNewExam] = useState("");
    const [newExamGrade, setNewExamGrade] = useState("");
    const [newExamType, setNewExamType] = useState("test");
    const [showExamModal, setShowExamModal] = useState(false);
    const [weightExam, setWeightExam] = useState(50);
    const [editExamAlert, setEditExamAlert] = useState(false);

    // Mündlich
    const [mund, setMund] = useState<{ mund: string; grade: string }[]>([]);
    const [avrMund, setAvrMund] = useState("-");
    const [newMund, setNewMund] = useState("");
    const [newMundGrade, setNewMundGrade] = useState("");
    const [showMundModal, setShowMundModal] = useState(false);
    const [weightMund, setWeightMund] = useState(50);
    const [editMundAlert, setEditMundAlert] = useState(false);

    // Gesamt
    const [avrGes, setAvrGes] = useState("-");

    // 🔥 Delete-Modal States
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteType, setDeleteType] = useState<"exam" | "mund" | null>(null);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
    const [deleteItemName, setDeleteItemName] = useState<string>("");

    // Laden
    useEffect(() => {
        const load = async () => {
            const storedExams = await AsyncStorage.getItem(`${subject}/exam`);
            const storedMund = await AsyncStorage.getItem(`${subject}/mund`);
            const storedWeightExam = await AsyncStorage.getItem(`${subject}/weightExam`);
            const storedWeightMund = await AsyncStorage.getItem(`${subject}/weightMund`);

            if (storedWeightExam) setWeightExam(parseFloat(storedWeightExam));
            if (storedWeightMund) setWeightMund(parseFloat(storedWeightMund));

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

            const storedAvrGes = await AsyncStorage.getItem(`${subject}/avrGes`);
            if (storedAvrGes) setAvrGes(storedAvrGes);
        };
        load();
    }, []);

    useEffect(() => {
        calcGes(avrExams, avrMund);
    }, [avrExams, avrMund, weightExam, weightMund]);

    // Durchschnitt Schriftlich
    const updateAverageExam = async (list: { grade: string; type: string }[], recalc = true) => {
        if (list.length === 0) {
            setAvrExams("-");
            if (recalc) calcGes("-", avrMund);
            return;
        }
        let totalWeight = 0;
        let weightedSum = 0;
        list.forEach((item) => {
            const g = parseFloat(item.grade.replace(",", "."));
            const weight = item.type === "arbeit" ? 2 : 1;
            weightedSum += g * weight;
            totalWeight += weight;
        });
        const avg = (weightedSum / totalWeight).toFixed(1);
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
        const sum = list.reduce((acc, curr) => acc + parseFloat(curr.grade.replace(",", ".")), 0);
        const avg = (sum / list.length).toFixed(1);
        setAvrMund(avg);
        await AsyncStorage.setItem(`${subject}/mundAvr`, avg);
        if (recalc) calcGes(avrExams, avg);
    };


    // Gesamt Durchschnitt
    const calcGes = async (examVal?: string | number, mundVal?: string | number) => {
        const exStr = examVal?.toString().replace(",", ".") ?? "";
        const muStr = mundVal?.toString().replace(",", ".") ?? "";

        const ex = isNaN(parseFloat(exStr)) ? null : parseFloat(exStr);
        const mu = isNaN(parseFloat(muStr)) ? null : parseFloat(muStr);

        let ges = "-";

        if (ex !== null && mu !== null) {
            const totalWeight = weightExam + weightMund;
            ges = ((ex * weightExam + mu * weightMund) / totalWeight).toFixed(1);
        } else if (ex !== null) {
            ges = ex.toFixed(1);
        } else if (mu !== null) {
            ges = mu.toFixed(1);
        }

        setAvrGes(ges);
        await AsyncStorage.setItem(`${subject}/avrGes`, ges);
    };

    // Schriftlich hinzufügen
    const addExam = async () => {
        if (!newExam.trim() || !newExamGrade.trim()) return;
        const newList = [...exams, { exam: newExam, grade: newExamGrade, type: newExamType }];
        setExams(newList);
        await AsyncStorage.setItem(`${subject}/exam`, JSON.stringify(newList));
        await updateAverageExam(newList);
        setNewExam("");
        setNewExamGrade("");
        setNewExamType("test");
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

    // 🔥 Öffnet Lösch-Modal
    const confirmDelete = (type: "exam" | "mund", index: number, name: string) => {
        setDeleteType(type);
        setDeleteIndex(index);
        setDeleteItemName(name);
        setDeleteModalVisible(true);
    };

    // 🔥 Löschen durchführen
    const handleDelete = async () => {
        if (deleteType === "exam" && deleteIndex !== null) {
            const newList = exams.filter((_, i) => i !== deleteIndex);
            setExams(newList);
            await AsyncStorage.setItem(`${subject}/exam`, JSON.stringify(newList));
            await updateAverageExam(newList);
        }
        if (deleteType === "mund" && deleteIndex !== null) {
            const newList = mund.filter((_, i) => i !== deleteIndex);
            setMund(newList);
            await AsyncStorage.setItem(`${subject}/mund`, JSON.stringify(newList));
            await updateAverageMund(newList);
        }
        setDeleteModalVisible(false);
        setDeleteType(null);
        setDeleteIndex(null);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>{subject}</Text>
            <Text style={styles.gesHeading}>Gesamt Ø {avrGes}</Text>

            <View style={styles.cardLayout}>
                {/* Schriftlich */}
                <View style={styles.card}>
                    <Text style={styles.text}>Schriftlich Ø {avrExams}</Text>
                    <TouchableOpacity style={styles.editButton} onPress={() => setEditExamAlert(true)}>
                        <Ionicons name="pencil" size={20} color="#fff" />
                    </TouchableOpacity>

                    <FlatList
                        data={exams}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                style={styles.listItem}
                                onLongPress={() => confirmDelete("exam", index, item.exam)}
                            >
                                <Text style={styles.listText}>{item.exam} ({item.type})</Text>
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
                    <Text style={styles.text}>Mündlich Ø {avrMund}</Text>
                    <TouchableOpacity style={styles.editButton} onPress={() => setEditMundAlert(true)}>
                        <Ionicons name="pencil" size={20} color="#fff" />
                    </TouchableOpacity>

                    <FlatList
                        data={mund}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                style={styles.listItem}
                                onLongPress={() => confirmDelete("mund", index, item.mund)}
                            >
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

            {/* Lösch-Modal */}
            <Modal transparent animationType="fade" visible={deleteModalVisible}>
                <View style={styles.overlay}>
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
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={handleDelete}
                            >
                                <Text style={styles.deleteTextButton}>Löschen</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Schriftlich Modal */}
            <Modal transparent animationType="slide" visible={showExamModal}>
                <TouchableOpacity style={styles.overlay} onPress={() => setShowExamModal(false)}>
                    <TouchableWithoutFeedback  onPress={() => setShowExamModal(true)}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.heading}>Schriftlich hinzufügen</Text>
                            <TextInput
                                value={newExam}
                                onChangeText={setNewExam}
                                style={styles.input}
                                placeholder="Prüfung/Test"
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
                            <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 15 }}>
                                <TouchableOpacity
                                    style={[styles.typeButton, newExamType === "test" && styles.typeButtonActive]}
                                    onPress={() => setNewExamType("test")}
                                >
                                    <Text style={styles.typeButtonText}>Test</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeButton, newExamType === "arbeit" && styles.typeButtonActive]}
                                    onPress={() => setNewExamType("arbeit")}
                                >
                                    <Text style={styles.typeButtonText}>Arbeit</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.saveButton} onPress={addExam}>
                                <Text style={styles.saveButtonText}>Speichern</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/* Mündlich Modal */}
            <Modal transparent animationType="slide" visible={showMundModal}>
                <TouchableOpacity style={styles.overlay} onPress={() => setShowMundModal(false)}>
                    <TouchableWithoutFeedback style={styles.modalContainer} onPress={() => setShowMundModal(true)}>
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
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/* Schriftlich Gewichtung */}
            <Modal transparent animationType="fade" visible={editExamAlert}>
                <TouchableOpacity style={styles.overlay} onPress={() => setEditExamAlert(false)}>
                    <TouchableWithoutFeedback  onPress={() => setEditExamAlert(true)}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.heading}>Gewichtung Schriftlich</Text>
                            <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 20 }}>
                                <TouchableOpacity
                                    style={styles.typeButton}
                                    onPress={() => setWeightExam((prev) => Math.max(0, prev - 5))}
                                >
                                    <Text style={styles.typeButtonText}>-</Text>
                                </TouchableOpacity>
                                <Text style={[styles.typeButtonText, { alignSelf: "center" }]}>{weightExam}%</Text>
                                <TouchableOpacity
                                    style={styles.typeButton}
                                    onPress={() => setWeightExam((prev) => Math.min(100, prev + 5))}
                                >
                                    <Text style={styles.typeButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={[styles.saveButton, { marginTop: 30 }]}
                                onPress={async () => {
                                    await AsyncStorage.setItem(`${subject}/weightExam`, weightExam.toString());
                                    await AsyncStorage.setItem(`${subject}/weightMund`, (100 - weightExam).toString());
                                    setWeightMund(100 - weightExam);
                                    setEditExamAlert(false);
                                    calcGes(avrExams, avrMund);
                                }}
                            >
                                <Text style={styles.saveButtonText}>Fertig</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/* Mündlich Gewichtung */}
            <Modal transparent animationType="fade" visible={editMundAlert}>
                <TouchableOpacity style={styles.overlay} onPress={() => setEditMundAlert(false)}>
                    <TouchableWithoutFeedback  onPress={() => setEditMundAlert(true)}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.heading}>Gewichtung Mündlich</Text>
                            <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 20 }}>
                                <TouchableOpacity
                                    style={styles.typeButton}
                                    onPress={() => setWeightMund((prev) => Math.max(0, prev - 5))}
                                >
                                    <Text style={styles.typeButtonText}>-</Text>
                                </TouchableOpacity>
                                <Text style={[styles.typeButtonText, { alignSelf: "center" }]}>{weightMund}%</Text>
                                <TouchableOpacity
                                    style={styles.typeButton}
                                    onPress={() => setWeightMund((prev) => Math.min(100, prev + 5))}
                                >
                                    <Text style={styles.typeButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={[styles.saveButton, { marginTop: 30 }]}
                                onPress={async () => {
                                    await AsyncStorage.setItem(`${subject}/weightMund`, weightMund.toString());
                                    await AsyncStorage.setItem(`${subject}/weightExam`, (100 - weightMund).toString());
                                    setWeightExam(100 - weightMund);
                                    setEditMundAlert(false);
                                    calcGes(avrExams, avrMund);
                                }}
                            >
                                <Text style={styles.saveButtonText}>Fertig</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>


            {/* Zurück */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/student/home")}>
                <Text style={styles.buText}>{"<-"}</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000", padding: 16 },
    heading: { fontSize: 22, fontWeight: "bold", color: "#22c55e", marginTop: 20, textAlign: "center" },
    gesHeading: { fontSize: 20, fontWeight: "bold", color: "#fff", marginVertical: 10, textAlign: "center" },
    editButton: { position: "absolute", right: 20, top: 20 },
    cardLayout: { flex: 1, marginBottom: 80 },
    card: { flex: 1, marginVertical: 10, marginHorizontal: 20, padding: 16, borderRadius: 15, borderWidth: 2, borderColor: "#22c55e" },
    text: { color: "#fff", fontSize: 20, marginBottom: 10, fontWeight: "bold" },
    listItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
    listText: { color: "#fff", fontSize: 18 },
    listGrade: { borderColor: "#22c55e", borderWidth: 2, height: 40, width: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    addButton: { marginTop: 10, backgroundColor: "#22c55e", width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" },
    addButtonText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    deleteModal: { backgroundColor: "#111", borderRadius: 15, padding: 20, width: "80%", alignItems: "center" },
    deleteTitle: { fontSize: 22, fontWeight: "bold", color: "#22c55e", marginBottom: 10 },
    deleteText: { fontSize: 18, color: "#fff", marginBottom: 20, textAlign: "center" },
    deleteButtons: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
    cancelButton: { flex: 1, marginRight: 10, backgroundColor: "#333", padding: 12, borderRadius: 10, alignItems: "center" },
    deleteButton: { flex: 1, marginLeft: 10, backgroundColor: "#e11d48", padding: 12, borderRadius: 10, alignItems: "center" },
    cancelText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    deleteTextButton: { color: "#fff", fontSize: 16, fontWeight: "600" },
    backButton: { backgroundColor: "#22c55e", width: 60, height: 60, borderRadius: 30, position: "absolute", left: 30, bottom: 30, alignItems: "center", justifyContent: "center" },
    buText: { fontSize: 22, color: "#fff" },
    modalContainer: { backgroundColor: "#111", borderRadius: 20, padding: 20, width: "90%" },
    input: { marginTop: 15, backgroundColor: "#000", borderColor: "#22c55e", borderWidth: 2, borderRadius: 10, padding: 10, color: "#fff" },
    saveButton: { marginTop: 20, backgroundColor: "#22c55e", padding: 12, borderRadius: 10, alignItems: "center" },
    saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    typeButton: { padding: 10, borderRadius: 10, borderWidth: 2, borderColor: "#22c55e", alignItems: "center", justifyContent: "center" },
    typeButtonActive: { backgroundColor: "#22c55e" },
    typeButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

});
