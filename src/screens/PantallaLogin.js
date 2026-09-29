import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
// importamos nuestra variable auth ya configurada
import { auth } from '../credenciales/firebaseConfig';
// importamos la funcion de firebase exclusiva para iniciar sesion
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function PantallaLogin({ navigation }) {
  // estados temporales para capturar lo que el usuario escribe
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  // esta funcion se activa al presionar el boton "ingresar"
  const iniciarSesion = async () => {
    // validacion basica: evitamos enviar datos vacios a la nube
    if (correo === '' || password === '') {
      Alert.alert('error', 'todos los campos son obligatorios');
      return;
    }

    try {
      // abrimos un bloque try-catch porque la comunicacion con la nube puede fallar
      // (ej. no hay internet, credenciales incorrectas)

      // =========================================================
      // reto 3: iniciar sesion
      // =========================================================
      // instrucciones: utiliza la funcion signInWithEmailAndPassword
      // esta funcion necesita tres ingredientes: la variable auth, el correo y el password.
      // al ser una operacion en la nube, es asincrona. no olvides la palabra await.
      
      await signInWithEmailAndPassword(auth, correo, password);
      
      // =========================================================
      
      Alert.alert('exito', 'sesion iniciada correctamente');
    } catch (error) {
      // si firebase rechaza el inicio de sesion, cachamos el error y lo mostramos
      Alert.alert('error al iniciar sesion', error.message);
    }
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>iniciar sesion</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="correo electronico" 
        placeholderTextColor="#666" 
        keyboardType="email-address"
        autoCapitalize="none"
        value={correo} 
        onChangeText={setCorreo} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="contraseña" 
        placeholderTextColor="#666" 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword} 
      />

      <TouchableOpacity style={styles.botonPrincipal} onPress={iniciarSesion}>
        <Text style={styles.textoBoton}>ingresar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('PantallaRegistro')} style={{ marginTop: 20 }}>
        <Text style={styles.textoSecundario}>no tengo cuenta. registrarme</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#0a0a0a', padding: 20, justifyContent: 'center' },
  titulo: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { backgroundColor: '#1a1a1a', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 15 },
  botonPrincipal: { backgroundColor: '#a259ff', padding: 15, borderRadius: 10, alignItems: 'center' },
  textoBoton: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  textoSecundario: { color: '#a259ff', textAlign: 'center' }
});