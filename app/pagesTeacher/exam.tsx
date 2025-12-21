import React, { useEffect, useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Text,
    StyleSheet,
    View,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    TextInput,
    FlatList,
    Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

export default function ExamPage() {
    const router = useRouter();
    const studentData: any = useLocalSearchParams();

    // modals & inputs
    const [addAlert, setAddAlert] = useState(false);
    const [newGrade, setNewGrade] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [currentType, setCurrentType] = useState<string | null>(null);

    // delete modal
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteItemName, setDeleteItemName] = useState("");
    const [deleteItemIndex, setDeleteItemIndex] = useState<number | null>(null);
    const [deleteType, setDeleteType] = useState<string | null>(null);

    // lists
    const [examList, setExamList] = useState<any[]>([]);
    const [oralList, setOralList] = useState<any[]>([]);
    const [otherList, setOtherList] = useState<any[]>([]);

    // averages
    const [examAvr, setExamAvr] = useState("-");
    const [oralAvr, setOralAvr] = useState("-");
    const [otherAvr, setOtherAvr] = useState("-");
    const [totalAvr, setTotalAvr] = useState("-");

    // weights modal
    const [weightsModalVisible, setWeightsModalVisible] = useState(false);
    const [weightExam, setWeightExam] = useState<number>(50);
    const [weightOral, setWeightOral] = useState<number>(30);
    const [weightOther, setWeightOther] = useState<number>(20);

    // --- Helper: calculate average (simple arithmetic mean) ---
    const calculateAverage = (list: any[]) => {
        if (!list || list.length === 0) return "-";
        const validGrades = list
            .map((it) => {
                // allow comma decimal like "1,5"
                const parsed = parseFloat(String(it.grade).replace(",", "."));
                return isNaN(parsed) ? null : parsed;
            })
            .filter((n) => n !== null) as number[];
        if (validGrades.length === 0) return "-";
        const avg = validGrades.reduce((a, b) => a + b, 0) / validGrades.length;
        return avg.toFixed(2);
    };

    // --- Load lists & weights on mount ---
    useEffect(() => {
        const loadAll = async () => {
            try {
                const examKey = `examList/${studentData.student}/${studentData.subject}`;
                const oralKey = `oralList/${studentData.student}/${studentData.subject}`;
                const otherKey = `otherList/${studentData.student}/${studentData.subject}`;

                const [examStored, oralStored, otherStored, wExam, wOral, wOther] = await Promise.all([
                    AsyncStorage.getItem(examKey),
                    AsyncStorage.getItem(oralKey),
                    AsyncStorage.getItem(otherKey),
                    AsyncStorage.getItem(`${studentData.student}/${studentData.subject}/weightExam`),
                    AsyncStorage.getItem(`${studentData.student}/${studentData.subject}/weightOral`),
                    AsyncStorage.getItem(`${studentData.student}/${studentData.subject}/weightOther`),
                ]);

                const examParsed = examStored ? JSON.parse(examStored) : [];
                const oralParsed = oralStored ? JSON.parse(oralStored) : [];
                const otherParsed = otherStored ? JSON.parse(otherStored) : [];

                setExamList(examParsed);
                setOralList(oralParsed);
                setOtherList(otherParsed);

                // weights: if present use, else defaults kept
                if (wExam) setWeightExam(Number(wExam));
                if (wOral) setWeightOral(Number(wOral));
                if (wOther) setWeightOther(Number(wOther));
            } catch (e) {
                console.error("Fehler beim Laden aus AsyncStorage:", e);
            }
        };
        loadAll();
    }, []);

    // --- Recompute averages whenever lists or weights change ---
    useEffect(() => {
        const e = calculateAverage(examList);
        const o = calculateAverage(oralList);
        const ot = calculateAverage(otherList);
        setExamAvr(e);
        setOralAvr(o);
        setOtherAvr(ot);

        // compute weighted total (handle "-" placeholders)
        const exNum = e === "-" ? null : parseFloat(String(e).replace(",", "."));
        const orNum = o === "-" ? null : parseFloat(String(o).replace(",", "."));
        const otNum = ot === "-" ? null : parseFloat(String(ot).replace(",", "."));

        // if all null => "-"
        if (exNum === null && orNum === null && otNum === null) {
            setTotalAvr("-");
            return;
        }

        // compute weighted sum but only include categories that have a numeric average.
        // We'll compute effective total weight = sum of weights of present categories.
        let weightedSum = 0;
        let effectiveWeight = 0;
        if (exNum !== null) {
            weightedSum += exNum * weightExam;
            effectiveWeight += weightExam;
        }
        if (orNum !== null) {
            weightedSum += orNum * weightOral;
            effectiveWeight += weightOral;
        }
        if (otNum !== null) {
            weightedSum += otNum * weightOther;
            effectiveWeight += weightOther;
        }

        if (effectiveWeight === 0) {
            setTotalAvr("-");
        } else {
            const tot = weightedSum / effectiveWeight;
            setTotalAvr(tot.toFixed(2));
        }
    }, [examList, oralList, otherList, weightExam, weightOral, weightOther]);

    // --- Add item to chosen category ---
    const addItem = async () => {
        if (!newTitle || !newGrade) return;
        const trimmedTitle = newTitle.trim();
        const trimmedGrade = newGrade.trim();
        if (!currentType) return;

        const key = `${currentType}List/${studentData.student}/${studentData.subject}`;
        try {
            const stored = await AsyncStorage.getItem(key);
            const parsed = stored ? JSON.parse(stored) : [];
            const newList = [...parsed, { title: trimmedTitle, grade: trimmedGrade }];
            await AsyncStorage.setItem(key, JSON.stringify(newList));

            if (currentType === "exam") setExamList(newList);
            if (currentType === "oral") setOralList(newList);
            if (currentType === "other") setOtherList(newList);

            setNewTitle("");
            setNewGrade("");
            setAddAlert(false);
            setCurrentType(null);
        } catch (e) {
            console.error("Fehler beim Speichern:", e);
        }
    };

    // --- Long press handler opens delete modal ---
    const handleLongPress = (item: any, index: number, type: string) => {
        setDeleteItemName(item.title);
        setDeleteItemIndex(index);
        setDeleteType(type);
        setDeleteModalVisible(true);
    };

    // --- Delete confirmed ---
    const handleDelete = async () => {
        if (deleteItemIndex === null || !deleteType) return;
        const key = `${deleteType}List/${studentData.student}/${studentData.subject}`;

        const currentList =
            deleteType === "exam"
                ? [...examList]
                : deleteType === "oral"
                    ? [...oralList]
                    : [...otherList];

        currentList.splice(deleteItemIndex, 1);

        try {
            await AsyncStorage.setItem(key, JSON.stringify(currentList));
        } catch (e) {
            console.error("Fehler beim Speichern nach Löschen:", e);
        }

        if (deleteType === "exam") setExamList(currentList);
        if (deleteType === "oral") setOralList(currentList);
        if (deleteType === "other") setOtherList(currentList);

        setDeleteModalVisible(false);
        setDeleteItemIndex(null);
        setDeleteType(null);
    };

    // --- Render item (wrapped in TouchableOpacity for long press) ---
    const renderItem = ({ item, index, type }: any) => (
        <TouchableOpacity
            onLongPress={() => handleLongPress(item, index, type)}
            delayLongPress={500}
        >
            <View style={styles.listItem}>
                <View style={styles.leftItem}>
                    <Text style={styles.itemText}>{item.title}</Text>
                </View>
                <View style={styles.rightItem}>
                    <Text style={styles.itemText}>{item.grade}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    // --- Weights modal helpers ---
    const changeWeight = (which: "exam" | "oral" | "other", delta: number) => {
        // adjust but avoid sum exceeding 100 or negative values
        const newExam = which === "exam" ? Math.min(Math.max(0, weightExam + delta), 100) : weightExam;
        const newOral = which === "oral" ? Math.min(Math.max(0, weightOral + delta), 100) : weightOral;
        const newOther = which === "other" ? Math.min(Math.max(0, weightOther + delta), 100) : weightOther;

        // if sum > 100, reject this change (simple approach)
        const sum = newExam + newOral + newOther;
        if (sum > 100) {
            // try to reduce others proportionally to keep sum 100
            // but to keep simple and predictable, just prevent the change and show a short alert
            Alert.alert("Ungültig", "Die Summe der Gewichtungen darf nicht über 100% liegen.");
            return;
        }

        setWeightExam(newExam);
        setWeightOral(newOral);
        setWeightOther(newOther);
    };

    const saveWeights = async () => {
        const sum = weightExam + weightOral + weightOther;
        if (sum !== 100) {
            Alert.alert("Summe ≠ 100", "Die Gewichtungen müssen insgesamt 100% ergeben.");
            return;
        }
        try {
            await Promise.all([
                AsyncStorage.setItem(`${studentData.student}/${studentData.subject}/weightExam`, String(weightExam)),
                AsyncStorage.setItem(`${studentData.student}/${studentData.subject}/weightOral`, String(weightOral)),
                AsyncStorage.setItem(`${studentData.student}/${studentData.subject}/weightOther`, String(weightOther)),
            ]);
            setWeightsModalVisible(false);
        } catch (e) {
            console.error("Fehler beim Speichern der Gewichtungen:", e);
        }
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

                <TouchableOpacity
                    style={{ position: "absolute", right: 16 }}
                    onPress={() => setWeightsModalVisible(true)}
                >
                    <Ionicons name="options" size={26} color="#22c55e" />
                </TouchableOpacity>
            </View>

            <Text style={styles.avrGes}>Gesamt Ø {totalAvr}</Text>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.cardContainer}
                showsHorizontalScrollIndicator={false}
                horizontal
            >
                <View style={styles.cardContainer}>
                    <View style={styles.card}>
                        <Text style={styles.cardHeading}>Schriftlich   Ø {examAvr}</Text>

                        <FlatList
                            data={examList}
                            renderItem={({ item, index }) => renderItem({ item, index, type: "exam" })}
                            keyExtractor={(item, index) => index.toString()}
                        />

                        <TouchableOpacity
                            style={styles.cardAddButton}
                            onPress={() => { setCurrentType("exam"); setAddAlert(true); }}
                        >
                            <Text style={styles.cardAddButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardHeading}>Mündlich   Ø {oralAvr}</Text>

                        <FlatList
                            data={oralList}
                            renderItem={({ item, index }) => renderItem({ item, index, type: "oral" })}
                            keyExtractor={(item, index) => index.toString()}
                        />

                        <TouchableOpacity
                            style={styles.cardAddButton}
                            onPress={() => { setCurrentType("oral"); setAddAlert(true); }}
                        >
                            <Text style={styles.cardAddButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardHeading}>Sonstiges   Ø {otherAvr}</Text>

                        <FlatList
                            data={otherList}
                            renderItem={({ item, index }) => renderItem({ item, index, type: "other" })}
                            keyExtractor={(item, index) => index.toString()}
                        />

                        <TouchableOpacity
                            style={styles.cardAddButton}
                            onPress={() => { setCurrentType("other"); setAddAlert(true); }}
                        >
                            <Text style={styles.cardAddButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <Text style={styles.footerText}>. . .</Text>

            {/* Add item modal */}
            <Modal transparent animationType={"fade"} visible={addAlert}>
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setAddAlert(false)}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.heading}>
                                {currentType === "exam" ? "Schriftliche Note" : currentType === "oral" ? "Mündliche Note" : "Sonstige Note"}
                            </Text>
                            <TextInput
                                style={styles.modalTextInput}
                                value={newTitle}
                                onChangeText={setNewTitle}
                                placeholder={"Titel"}
                                placeholderTextColor={"#22c55e"}
                            />
                            <TextInput
                                style={styles.modalTextInput}
                                value={newGrade}
                                onChangeText={setNewGrade}
                                placeholder={"Note"}
                                placeholderTextColor={"#22c55e"}
                                keyboardType={"numeric"}
                            />
                            <TouchableOpacity style={styles.modalButton} onPress={() => addItem()}>
                                <Text style={styles.modalButtonText}>Hinzufügen</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

            {/* Delete confirmation modal */}
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

            {/* Weights modal (3-way) */}
            <Modal transparent animationType="fade" visible={weightsModalVisible}>
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setWeightsModalVisible(false)}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.heading}>Gewichtung einstellen</Text>

                            <View style={styles.weightRow}>
                                <Text style={styles.weightLabel}>Schriftlich</Text>
                                <View style={styles.weightControls}>
                                    <TouchableOpacity style={styles.weightButton} onPress={() => changeWeight("exam", -5)}>
                                        <Text style={styles.weightButtonText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.weightValue}>{weightExam}%</Text>
                                    <TouchableOpacity style={styles.weightButton} onPress={() => changeWeight("exam", +5)}>
                                        <Text style={styles.weightButtonText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.weightRow}>
                                <Text style={styles.weightLabel}>Mündlich</Text>
                                <View style={styles.weightControls}>
                                    <TouchableOpacity style={styles.weightButton} onPress={() => changeWeight("oral", -5)}>
                                        <Text style={styles.weightButtonText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.weightValue}>{weightOral}%</Text>
                                    <TouchableOpacity style={styles.weightButton} onPress={() => changeWeight("oral", +5)}>
                                        <Text style={styles.weightButtonText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.weightRow}>
                                <Text style={styles.weightLabel}>Sonstiges</Text>
                                <View style={styles.weightControls}>
                                    <TouchableOpacity style={styles.weightButton} onPress={() => changeWeight("other", -5)}>
                                        <Text style={styles.weightButtonText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.weightValue}>{weightOther}%</Text>
                                    <TouchableOpacity style={styles.weightButton} onPress={() => changeWeight("other", +5)}>
                                        <Text style={styles.weightButtonText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={{ marginTop: 14, alignItems: "center" }}>
                                <Text style={{ color: "#fff" }}>Summe: {weightExam + weightOral + weightOther}%</Text>
                            </View>

                            <TouchableOpacity style={[styles.modalButton, { marginTop: 16 }]} onPress={saveWeights}>
                                <Text style={styles.modalButtonText}>Speichern</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
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

    heading: {
        fontSize: 26,
        color: "#22c55e",
        fontWeight: "bold",
    },

    avrGes: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
        marginVertical: 10,
        textAlign: "center",
    },

    scrollView: {
        width: "100%",
    },

    cardContainer: {
        alignItems: "center",
        paddingBottom: 25,
        flexDirection: "row",
    },

    card: {
        width: screenWidth * 0.85,
        height: screenHeight * 0.6,
        borderWidth: 2,
        borderColor: "#0d4d4f",
        backgroundColor: "#0d2d2f",
        borderRadius: 15,
        marginTop: 50,
        padding: 16,
        marginHorizontal: 10,
    },

    cardHeading: {
        fontSize: 23,
        color: "#ffffff",
        fontWeight: "bold",
        marginBottom: 15,
    },

    cardAddButton: {
        height: 40,
        width: 40,
        borderRadius: 20,
        backgroundColor: "#22c55e",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        bottom: 20,
        right: 20,
    },

    cardAddButtonText: {
        fontSize: 20,
        color: "#ffffff",
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        alignItems: "center",
        justifyContent: "center",
    },

    modalContainer: {
        width: "95%",
        alignItems: "center",
        backgroundColor: "#0d1d1f",
        borderRadius: 15,
        padding: 16,
    },

    modalTextInput: {
        fontSize: 20,
        padding: 16,
        color: "#22c55e",
        borderWidth: 2,
        borderColor: "#0d4d4f",
        backgroundColor: "#0d2d2f",
        borderRadius: 15,
        width: "90%",
        marginTop: 20,
    },

    modalButton: {
        padding: 13,
        backgroundColor: "#22c55e",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15,
        marginTop: 20,
    },

    modalButtonText: {
        fontSize: 20,
        color: "#ffffff",
    },

    listItem: {
        width: "95%",
        flexDirection: "row",
        padding: 10,
        marginTop: 10,
        backgroundColor: "#0d3d3f",
        borderColor: "#0d5d5f",
        borderWidth: 2,
        borderRadius: 15,
        alignSelf: "center",
    },

    leftItem: {
        width: "75%",
        height: 60,
        borderWidth: 2,
        borderColor: "#0d4d4f",
        borderRadius: 30,
        marginRight: 5,
        paddingLeft: 15,
        alignItems: "flex-start",
        justifyContent: "center",
    },

    rightItem: {
        height: 60,
        width: 60,
        borderWidth: 2,
        borderColor: "#0d4d4f",
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
    },

    itemText: {
        color: "#ffffff",
        fontSize: 20,
    },

    footerText: {
        color: "#22c55e",
        fontSize: 40,
        alignSelf: "center",
    },

    // delete modal
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

    // weight modal specifics
    weightRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
        paddingHorizontal: 10,
    },
    weightLabel: {
        color: "#fff",
        fontSize: 18,
    },
    weightControls: {
        flexDirection: "row",
        alignItems: "center",
    },
    weightButton: {
        borderWidth: 1,
        borderColor: "#0d4d4f",
        backgroundColor: "#0d2d2f",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: "50%",
        marginHorizontal: 8,
    },
    weightButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    weightValue: {
        color: "#fff",
        fontSize: 16,
        minWidth: 48,
        textAlign: "center",
    },
});