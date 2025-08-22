import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    SafeAreaView,
    Text,
    FlatList,
    View,
    TouchableOpacity,
    Modal,
    TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ExamsStudent() {
    const router = useRouter();
    const [addAlert, setAddAlert] = useState(false);
    const [newExam, setNewExam] = useState("");
    const [newGrade, setNewGrade] = useState("");
    const { subject } = useLocalSearchParams();
    const [exams, setExams] = useState<{ exam: string; grade: string }[]>([]);
    const [average, setAverage] = useState<string>("-");

    const calculateAverage = (list: { grade: string }[]) => {
        if (list.length === 0) return "-";
        const sum = list.reduce((acc, curr) => acc + parseFloat(curr.grade), 0);
        return (sum / list.length).toFixed(2);
    };

    const updateAverage = async (list: { exam: string; grade: string }[]) => {
        const avr = calculateAverage(list);
        setAverage(avr);

        // Durchschnitt im Fach speichern
        const subjectsRaw = await AsyncStorage.getItem("subjects");
        const subjectsList = subjectsRaw ? JSON.parse(subjectsRaw) : [];
        const updatedSubjects = subjectsList.map((s: any) =>
            s.subject === subject ? { ...s, avr } : s
        );
        await AsyncStorage.setItem("subjects", JSON.stringify(updatedSubjects));
    };

    useEffect(() => {
        const load = async () => {
            try {
                const storedExams = await AsyncStorage.getItem(`${subject}/exam`);
                if (storedExams) {
                    const parsedList = JSON.parse(storedExams);
                    setExams(parsedList);
                    await updateAverage(parsedList);
                }
            } catch (e) {
                console.error("Error loading exams:", e);
            }
        };
        load();
    }, []);

    const addExam = async () => {
        if (!newExam.trim() || !newGrade.trim()) return;

        const newExamsList = [...exams, { exam: newExam, grade: newGrade }];
        try {
            await AsyncStorage.setItem(`${subject}/exam`, JSON.stringify(newExamsList));
            setExams(newExamsList);

            await updateAverage(newExamsList);

            setNewExam("");
            setNewGrade("");
            setAddAlert(false);
        } catch (e) {
            console.error("Error saving exam:", e);
        }
    };

    const renderItem = ({ item }: any) => {
        return (
            <TouchableOpacity style={styles.item}>
                <View style={styles.itemLeft}>
                    <Text style={styles.buText}>{item.exam}</Text>
                </View>
                <View style={styles.itemRight}>
                    <Text style={styles.buText}>{item.grade}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>{subject}</Text>
            <Text style={styles.text}>{"Ø "} {average}</Text>

            <FlatList
                style={styles.list}
                data={exams}
                renderItem={renderItem}
                keyExtractor={(_, index) => index.toString()}
            />
            <TouchableOpacity style={styles.button} onPress={() => setAddAlert(true)}>
                <Text style={styles.buText}>+</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.replace("/student/home")}
            >
                <Text style={styles.buText}>{"<-"}</Text>
            </TouchableOpacity>

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
                        <Text style={styles.heading}>Add Exam</Text>
                        <TextInput
                            value={newExam}
                            onChangeText={setNewExam}
                            style={styles.textInput}
                            placeholder="Exam"
                            placeholderTextColor="#fff"
                        />
                        <TextInput
                            value={newGrade}
                            onChangeText={setNewGrade}
                            style={styles.textInput}
                            placeholder="Grade"
                            placeholderTextColor="#fff"
                            keyboardType="numeric"
                        />

                        <TouchableOpacity style={styles.addButton} onPress={addExam}>
                            <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#000", alignItems: "center" },
    heading: { fontSize: 26, fontWeight: "bold", color: "#22c55e", marginTop: 20 },
    buText: { fontSize: 22, color: "#fff" },
    item: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginVertical: 10,
        paddingHorizontal: 16,
    },
    itemLeft: {
        flex: 1,
        backgroundColor: "#111",
        borderColor: "#22c55e",
        borderRadius: 12,
        borderWidth: 2,
        padding: 10,
        alignItems: "center",
    },
    itemRight: {
        backgroundColor: "#111",
        height: 50,
        width: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: "#22c55e",
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
    },
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

    text: {
        marginVertical: 20,
        fontSize: 25,
        color: "#e5e5e5",
        textAlign: "center",
        lineHeight: 24,
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
        marginTop: 30,
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
    list: { marginBottom: 80 },

    // NEW: Average box
    averageBox: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 15,
        backgroundColor: "#111",
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#22c55e",
    },
    averageLabel: { fontSize: 20, color: "#fff", marginRight: 10 },
    averageValue: { fontSize: 22, color: "#22c55e", fontWeight: "bold" },
});
