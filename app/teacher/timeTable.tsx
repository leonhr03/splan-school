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
    TouchableWithoutFeedback, Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import TimePickerModal from "../../components/TimePickerModal";

export default function TimeTable() {
    const [editModal, setEditModal] = useState(false);
    const [addAlert, setAddAlert] = useState(false);
    const [editItemModal, setEditItemModal] = useState(false);

    const [newStartTime, setNewStartTime] = useState("");
    const [newEndTime, setNewEndTime] = useState("");
    const [newSubject, setNewSubject] = useState("");
    const [editIndex, setEditIndex] = useState<number | null>(null);

    // Separate Picker States
    const [showAddStartPicker, setShowAddStartPicker] = useState(false);
    const [showAddEndPicker, setShowAddEndPicker] = useState(false);
    const [showEditStartPicker, setShowEditStartPicker] = useState(false);
    const [showEditEndPicker, setShowEditEndPicker] = useState(false);

    const [plan, setPlan] = useState<{ timeStart: string; timeEnd: string; subject: string }[]>([]);
    const [days] = useState(["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"]);
    const [dayIndex, setDayIndex] = useState(0);
    const currentKey = `plan_${days[dayIndex]}`;

    useEffect(() => {
        loadPlan();
    }, [dayIndex]);

    const loadPlan = async () => {
        try {
            const stored = await AsyncStorage.getItem(currentKey);
            if (stored) setPlan(JSON.parse(stored));
            else setPlan([]);
        } catch (e) {
            console.log("Fehler beim Laden:", e);
        }
    };

    const savePlan = async (newPlan: any[]) => {
        try {
            await AsyncStorage.setItem(currentKey, JSON.stringify(newPlan));
        } catch (e) {
            console.log("Fehler beim Speichern:", e);
        }
    };

    const addSubject = async () => {
        if (!newStartTime || !newEndTime || !newSubject.trim()) return;
        const newPlanList = [...plan, { timeStart: newStartTime, timeEnd: newEndTime, subject: newSubject }];
        setPlan(newPlanList);
        await savePlan(newPlanList);
        setNewStartTime("");
        setNewEndTime("");
        setNewSubject("");
        setAddAlert(false);
    };

    const deleteSubject = async (index: number) => {
        const updatedPlan = plan.filter((_, i) => i !== index);
        setPlan(updatedPlan);
        await savePlan(updatedPlan);
    };

    const startEditItem = (index: number) => {
        setEditIndex(index);
        const item = plan[index];
        setNewStartTime(item.timeStart);
        setNewEndTime(item.timeEnd);
        setNewSubject(item.subject);
        setEditItemModal(true);
    };

    const saveEditedItem = async () => {
        if (editIndex === null) return;
        const updated = [...plan];
        updated[editIndex] = { timeStart: newStartTime, timeEnd: newEndTime, subject: newSubject };
        setPlan(updated);
        await savePlan(updated);
        setEditIndex(null);
        setEditItemModal(false);
        setNewStartTime("");
        setNewEndTime("");
        setNewSubject("");
    };

    const flatListItem = ({ item }: any) => {
        const isPause = item.subject.trim().toLowerCase() === "pause";
        if (isPause) {
            return (
                <View style={styles.pauseContainer}>
                    <View style={styles.pauseLine} />
                </View>
            );
        }
        return (
            <View style={styles.cardContainer}>
                <View style={styles.itemLeft}>
                    <Text style={styles.timeTextStart}>{item.timeStart} -</Text>
                    <Text style={styles.timeTextEnd}>{item.timeEnd}</Text>
                </View>
                <View style={styles.itemRight}>
                    <Text style={styles.itemText}>{item.subject}</Text>
                </View>
            </View>
        );
    };

    const renderItem = ({ item, index }: any) => (
        <TouchableOpacity style={styles.cardContainer} onLongPress={() => deleteSubject(index)}>
            <View style={styles.itemLeft}>
                <Text style={styles.timeTextStart}>{item.timeStart} -</Text>
                <Text style={styles.timeTextEnd}>{item.timeEnd}</Text>
            </View>
            <View style={styles.itemRight}>
                <Text style={styles.itemText}>{item.subject}</Text>
            </View>
            <View style={styles.itemButtons}>
                <TouchableOpacity onPress={() => startEditItem(index)}>
                    <Ionicons name="pencil" size={20} color="#d4d4d4" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const dayBefore = () => {
        if (dayIndex > 0) setDayIndex(dayIndex - 1); };

    const nextDay = () => {
        if (dayIndex < days.length - 1) setDayIndex(dayIndex + 1); };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>Stundenplan</Text>
                <TouchableOpacity style={styles.edit} onPress={() => setEditModal(true)}>
                    <Ionicons name={"pencil"} color={"#d4d4d4"} size={26} />
                </TouchableOpacity>
            </View>

            <View style={styles.topRow}>
                <TouchableOpacity style={styles.buttonLeft} onPress={dayBefore}>
                    <Ionicons name={"arrow-back"} color={"#fff"} size={20} />
                </TouchableOpacity>
                <Text style={styles.dayText}>{days[dayIndex]}</Text>
                <TouchableOpacity style={styles.buttonRight} onPress={nextDay}>
                    <Ionicons name={"arrow-forward"} color={"#fff"} size={20} />
                </TouchableOpacity>
            </View>

            <FlatList
                style={styles.planList}
                data={plan}
                renderItem={flatListItem}
                keyExtractor={(_, i) => i.toString()}
            />



            {/* Edit Modal */}
            <Modal transparent animationType="slide" visible={editModal}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={() => setEditModal(false)}>
                        <View style={StyleSheet.absoluteFillObject} />
                    </TouchableWithoutFeedback>
                    <View style={styles.modalContainer}>
                        <Text style={[styles.heading, {marginTop: 20}]}>{days[dayIndex]}</Text>
                        <View style={styles.listCard}>
                            <FlatList
                                data={plan}
                                renderItem={renderItem}
                                keyExtractor={(_, i) => i.toString()}
                            />
                            <TouchableOpacity style={styles.addFab} onPress={() => { setNewStartTime(""), setNewEndTime(""), setNewSubject(""), setAddAlert(true) }}>
                                <Text style={styles.fabText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Add Subject Modal */}
                <Modal transparent animationType="fade" visible={addAlert}>
                    <View style={styles.alertOverlay}>
                        <TouchableWithoutFeedback onPress={() => setAddAlert(false)}>
                            <View style={StyleSheet.absoluteFillObject} />
                        </TouchableWithoutFeedback>
                        <View style={styles.alertContainer}>
                            <Text style={[styles.heading, {marginTop: 20}]}>Neue Stunde</Text>
                            <View style={styles.timeRow}>
                                <TouchableOpacity style={styles.textInputRow} onPress={() => setShowAddStartPicker(true)}>
                                    <Text style={{ color: "#d4d4d4", textAlign: "center" }}>
                                        {newStartTime || "Startzeit wählen"}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.textInputRow} onPress={() => setShowAddEndPicker(true)}>
                                    <Text style={{ color: "#d4d4d4", textAlign: "center" }}>
                                        {newEndTime || "Endzeit wählen"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.textInput}
                                value={newSubject}
                                onChangeText={setNewSubject}
                                placeholder="Fach"
                                placeholderTextColor="#a3a3a3"
                            />
                            <TouchableOpacity style={styles.addButton} onPress={addSubject}>
                                <Text style={styles.buttonText}>Hinzufügen</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* TimePickers */}
                    <TimePickerModal
                        visible={showAddStartPicker}
                        onClose={() => setShowAddStartPicker(false)}
                        onConfirm={(time) => setNewStartTime(time)}
                    />
                    <TimePickerModal
                        visible={showAddEndPicker}
                        onClose={() => setShowAddEndPicker(false)}
                        onConfirm={(time) => setNewEndTime(time)}
                    />
                </Modal>

                {/* Edit Subject Modal */}
                <Modal transparent animationType="fade" visible={editItemModal}>
                    <View style={styles.alertOverlay}>
                        <TouchableWithoutFeedback onPress={() => setEditItemModal(false)}>
                            <View style={StyleSheet.absoluteFillObject} />
                        </TouchableWithoutFeedback>
                        <View style={styles.alertContainer}>
                            <Text style={[styles.heading, {marginTop: 20}]}>Stunde bearbeiten</Text>
                            <View style={styles.timeRow}>
                                <TouchableOpacity style={styles.textInputRow} onPress={() => setShowEditStartPicker(true)}>
                                    <Text style={{ color: "#d4d4d4", textAlign: "center" }}>
                                        {newStartTime || "Startzeit wählen"}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.textInputRow} onPress={() => setShowEditEndPicker(true)}>
                                    <Text style={{ color: "#d4d4d4", textAlign: "center" }}>
                                        {newEndTime || "Endzeit wählen"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.textInput}
                                value={newSubject}
                                onChangeText={setNewSubject}
                                placeholder="Fach"
                                placeholderTextColor="#a3a3a3"
                            />
                            <TouchableOpacity style={styles.addButton} onPress={saveEditedItem}>
                                <Text style={styles.buttonText}>Speichern</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TimePickerModal
                        visible={showEditStartPicker}
                        onClose={() => setShowEditStartPicker(false)}
                        onConfirm={(time) => setNewStartTime(time)}
                    />
                    <TimePickerModal
                        visible={showEditEndPicker}
                        onClose={() => setShowEditEndPicker(false)}
                        onConfirm={(time) => setNewEndTime(time)}
                    />
                </Modal>

            </Modal>


        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#000000",
        alignItems: "center",
    },

    itemButtons: {
        flexDirection: "row",
        gap: 10,
        position: "absolute",
        right: 15,
    },

    heading: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#ffffff",
        textAlign: "center",
    },

    edit: {
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        right: 20,
    },

    editIcon: {
        fontSize: 20,
        color: "#fff",
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        marginTop: 25,
        marginBottom: 20,
        width: "95%",
        borderWidth: 2,
        borderColor: "#2a2a2a",
        backgroundColor: "#141414",
        borderRadius: 20,
        padding: 10,
    },

    dayText: {
        alignSelf: "center",
        color: "#ffffff",
        fontSize: 23,
    },

    buttonLeft: {
        position: "absolute",
        left: 40,
        width: 30,
        height: 30,
        backgroundColor: "#22c55e",
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },

    buttonRight: {
        position: "absolute",
        right: 40,
        width: 30,
        height: 30,
        backgroundColor: "#22c55e",
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },

    planList: {
        marginBottom: 70,
    },

    cardContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "center",
        borderWidth: 2,
        height: 60,
        width: "95%",
        marginVertical: 10,
        borderColor: "#2a2a2a",
        backgroundColor: "#141414",
        borderRadius: 30,
        padding: 10,

    },

    itemLeft: {
        alignSelf: "flex-start",
        flexDirection: "column",
        marginLeft: 10,
    },

    itemRight: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    timeTextStart: {
        color: "#666"
    },

    timeTextEnd: {
        color: "#666"
    },

    itemText: {
        alignSelf: "flex-start",
        fontSize: 20,
        color: "#ffffff",
        marginLeft: 30,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        alignItems: "center",
        justifyContent: "flex-end",
    },

    modalContainer: {
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "flex-end",
        width: "100%",
        backgroundColor: "#000000",
        borderColor: "#1c1c1c",
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },

    listCard: {
        borderWidth: 2,
        borderColor: "#2a2a2a",
        backgroundColor: "#141414",
        borderRadius: 15,
        padding: 10,
        width: "95%",
        height: 300,
        marginTop: 20,
        marginBottom: 20,
    },

    addFab: {
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

    fabText: {
        fontSize: 20,
        color: "#fff"
    },

    alertOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        alignItems: "center",
        justifyContent: "center",
    },

    alertContainer: {
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        width: "95%",
        backgroundColor: "#000000",
        borderColor: "#1c1c1c",
        padding: 16,
        borderRadius: 20,
    },

    timeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    textInputRow: {
        padding: 10,
        color: "#ffffff",
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#2a2a2a",
        backgroundColor: "#141414",
        width: "45%",
        marginHorizontal: 5,
        marginTop: 20,
    },

    textInput: {
        padding: 10,
        color: "#ffffff",
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#2a2a2a",
        backgroundColor: "#141414",
        width: "95%",
        marginHorizontal: 5,
        marginTop: 20,
    },

    addButton: {
        backgroundColor: "#22c55e",
        borderRadius: 15,
        padding: 10,
        width: "95%",
        marginTop: 20,
        alignItems: "center",
        justifyContent: "center",
    },

    buttonText: {
        color: "#ffffff",
        fontSize: 20,
    },

    pauseContainer: {
        width: "30%",
        alignSelf: "center",
        alignItems: "center",
        marginVertical: 10,
    },
    pauseLine: {
        width: "90%",
        height: 2,
        backgroundColor: "#2a2a2a",
        borderRadius: 1,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: Platform.OS === "ios" ? 20 : 30,
        paddingHorizontal: 16,
        position: "relative",
        width: "100%",
    },

})