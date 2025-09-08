import React, {useEffect, useState} from "react"
import {StyleSheet, SafeAreaView, Text, FlatList, View, TouchableOpacity, Modal, TextInput} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRouter} from "expo-router";

export default function HomeStudent() {
const router = useRouter()

    const logout = async() => {
        const role = await AsyncStorage.setItem("role", "null")
        router.replace("/")
    }

    return(
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Account</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutLink}>Logout</Text>
            </TouchableOpacity>
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

    logoutButton: {
        alignItems: "center",
        marginTop: 120,
    },

    logoutLink: {
        fontSize: 22,
        color: "#22c55e",
        marginTop: 20,
        textAlign: "center",
    },


})