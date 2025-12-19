import React, { useState, useRef, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from "react-native";

interface Props {
    visible: boolean;
    onClose: () => void;
    onConfirm: (time: string) => void;
    initialTime?: string; // "HH:MM"
}

const ITEM_HEIGHT = 40;

const TimePickerModal: React.FC<Props> = ({ visible, onClose, onConfirm, initialTime }) => {
    const visibleItems = 3;
    const middleIndex = Math.floor(visibleItems / 2); // 2


    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

    const initialHour = initialTime ? parseInt(initialTime.split(":")[0]) : 0;
    const initialMinute = initialTime ? parseInt(initialTime.split(":")[1]) : 0;

    const [hour, setHour] = useState(initialHour);
    const [minute, setMinute] = useState(initialMinute);

    const hourRef = useRef<ScrollView>(null);
    const minuteRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (visible) {
            // kleine Verzögerung, bis die ScrollView gemountet ist
            setTimeout(() => {
                if (hourRef.current) {
                    const offsetHour = Math.max(0, initialHour * ITEM_HEIGHT - ITEM_HEIGHT * 2);
                    hourRef.current.scrollTo({ y: offsetHour, animated: false });
                }
                if (minuteRef.current) {
                    const minuteIndex = minutes.indexOf(initialMinute);
                    const offsetMinute = Math.max(0, minuteIndex * ITEM_HEIGHT - ITEM_HEIGHT * 2);
                    minuteRef.current.scrollTo({ y: offsetMinute, animated: false });
                }
            }, 50);
        }
    }, [visible]);

    const onHourScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
        setHour(index);
        hourRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
    };

    const onMinuteScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
        const snappedMinute = minutes[Math.min(index, minutes.length - 1)];
        setMinute(snappedMinute);
        minuteRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
    };

    const handleConfirm = () => {
        onConfirm(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
        onClose();
    };

    return (
        <Modal transparent animationType="slide" visible={visible}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.heading}>Uhrzeit wählen</Text>
                    <View style={styles.pickersRow}>

                        <ScrollView
                            ref={hourRef}
                            style={styles.picker}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={ITEM_HEIGHT}
                            decelerationRate="fast"
                            contentContainerStyle={{ paddingTop: ITEM_HEIGHT * middleIndex, paddingBottom: ITEM_HEIGHT * middleIndex }}
                            onMomentumScrollEnd={onHourScrollEnd}
                        >
                            {hours.map((h) => (
                                <View key={h} style={{ height: ITEM_HEIGHT, justifyContent: "center" }}>
                                    <Text style={[styles.timeText, hour === h && styles.selected]}>
                                        {h.toString().padStart(2, "0")}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>

                        <ScrollView
                            ref={minuteRef}
                            style={styles.picker}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={ITEM_HEIGHT}
                            decelerationRate="fast"
                            contentContainerStyle={{ paddingTop: ITEM_HEIGHT * middleIndex, paddingBottom: ITEM_HEIGHT * middleIndex }}
                            onMomentumScrollEnd={onMinuteScrollEnd}
                        >
                            {minutes.map((m) => (
                                <View key={m} style={{ height: ITEM_HEIGHT, justifyContent: "center" }}>
                                    <Text style={[styles.timeText, minute === m && styles.selected]}>
                                        {m.toString().padStart(2, "0")}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleConfirm}>
                        <Text style={styles.buttonText}>Bestätigen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonCancel} onPress={onClose}>
                        <Text style={styles.buttonText}>Abbrechen</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default TimePickerModal;

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" },
    container: { backgroundColor: "#0d1d1f", width: "80%", borderRadius: 20, padding: 20, alignItems: "center" },
    heading: { color: "#22c55e", fontSize: 20, marginBottom: 10 },
    pickersRow: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
    picker: { flex: 1, height: ITEM_HEIGHT * 3, maxHeight: ITEM_HEIGHT * 3 },
    timeText: { color: "#22c55e", fontSize: 20, textAlign: "center" },
    selected: { fontWeight: "bold", fontSize: 24, color: "#fff" },
    button: { marginTop: 20, backgroundColor: "#22c55e", padding: 10, borderRadius: 15, width: "80%", alignItems: "center" },
    buttonCancel: { marginTop: 10, backgroundColor: "#555", padding: 10, borderRadius: 15, width: "80%", alignItems: "center" },
    buttonText: { color: "#fff", fontSize: 18 },
});