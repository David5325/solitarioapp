import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzI5Fj0smLTTJVKs05KikPmMYxgzshJdg",
  authDomain: "solitario-f45af.firebaseapp.com",
  projectId: "solitario-f45af",
  storageBucket: "solitario-f45af.appspot.com",
  messagingSenderId: "759489206850",
  appId: "1:759489206850:web:3f1af70a3bbf956b43abdb",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const generateDeck = () => {
  const deck = [];
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      deck.push({ rank, suit });
    });
  });
  return deck.sort(() => Math.random() - 0.5);
};

export default function App() {
  const [columns, setColumns] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const shuffledDeck = generateDeck();
    const newColumns = Array.from({ length: 7 }, (_, i) =>
      shuffledDeck.slice((i * (i + 1)) / 2, ((i + 1) * (i + 2)) / 2)
    );
    setColumns(newColumns);
  }, []);

  const handleCardClick = (colIndex, cardIndex) => {
    const card = columns[colIndex][cardIndex];
    if (selectedCard) {
      const newColumns = [...columns];
      newColumns[selectedCard.colIndex].splice(selectedCard.cardIndex, 1);
      newColumns[colIndex].push(card);
      setColumns(newColumns);
      setSelectedCard(null);
    } else {
      setSelectedCard({ card, colIndex, cardIndex });
    }
  };

  const saveCardToFirestore = async (card) => {
    try {
      await addDoc(collection(db, "cartas"), {
        rank: card.rank,
        suit: card.suit,
        timestamp: new Date(),
      });
      console.log("✅ Carta guardada en Firestore");
    } catch (error) {
      console.error("❌ Error guardando carta:", error);
    }
  };

  const renderCard = (card, colIndex, cardIndex) => (
    <TouchableOpacity
      key={cardIndex}
      onPress={() => {
        handleCardClick(colIndex, cardIndex);
        saveCardToFirestore(card);
      }}
      style={[
        styles.card,
        { borderColor: selectedCard?.card === card ? "yellow" : "transparent" },
      ]}
    >
      <Text style={[styles.cardText, { color: ["♥", "♦"].includes(card.suit) ? "red" : "black" }]}>
        {`${card.rank}${card.suit}`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solitario</Text>
      <ScrollView contentContainerStyle={styles.columnsContainer}>
        {columns.map((column, colIndex) => (
          <View key={colIndex} style={styles.column}>
            {column.map((card, cardIndex) => renderCard(card, colIndex, cardIndex))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2e8b57",
    paddingTop: 20,
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  columnsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  column: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  card: {
    width: 60,
    height: 90,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 5,
    elevation: 5,
    borderWidth: 2,
  },
  cardText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
