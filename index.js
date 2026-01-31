// Importujemy potrzebne paczki
import { Client, GatewayIntentBits } from "discord.js";  // dla bota Discord
import admin from "firebase-admin";                     // dla Firestore
import fs from "fs";                                    // do czytania pliku JSON z kluczem Firebase

// --- Firebase Admin SDK ---
const serviceAccount = JSON.parse(fs.readFileSync("serviceAccountKey.json", "utf-8")); // Twój plik JSON z Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();            // dostęp do Firestore
const messagesRef = db.collection("messages"); // kolekcja z wiadomościami

// --- Discord Bot ---
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const DISCORD_CHANNEL_ID = "1464921931730911358";  // ID kanału Discord, gdzie będą wysyłane wiadomości
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;   // token bota zapisany w zmiennych środowiskowych

// Gdy bot się zaloguje
client.once("ready", () => {
  console.log(`Bot Discord zalogowany jako ${client.user.tag}`);

  // Nasłuchiwanie nowych wiadomości w Firestore
  messagesRef.orderBy("time").onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") { // tylko nowe wiadomości
        const msg = change.doc.data();
        const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);
        if (channel) channel.send(`**${msg.user}**: ${msg.text}`);
      }
    });
  });
});

// Logowanie bota do Discorda
client.login(DISCORD_TOKEN);
