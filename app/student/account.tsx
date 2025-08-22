import React, {useEffect, useState} from "react"
import {StyleSheet, SafeAreaView, Text, FlatList, View, TouchableOpacity, Modal, TextInput} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeStudent() {

    return(
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Account</Text>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#000000",
        alignItems: "center",
    },

    heading: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#22c55e",
        marginTop: 20,
        textAlign: "center",
    },


})