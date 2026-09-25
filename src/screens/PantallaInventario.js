import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { InventarioContext } from '../context/InventarioContext';
import { Ionicons } from '@expo/vector-icons';

export default function PantallaInventario() {
  const { productos, eliminarProducto, editarProducto } = useContext(InventarioContext);

  // =========================================================
  // RETO 2.1: ESTADOS DEL MODAL
  // =========================================================
  const [modalVisible, setModalVisible] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editPrecio, setEditPrecio] = useState('');
  const [editVendedor, setEditVendedor] = useState('');
  const [editCategoria, setEditCategoria] = useState('');
  // =========================================================

  // =========================================================
  // RETO 2.2: FUNCIÓN DE APERTURA DEL MODAL
  // =========================================================
  const abrirModalEdicion = (producto) => {
    setIdEditando(producto.id);
    setEditNombre(producto.nombre);
    setEditPrecio(producto.precio.toString()); // Convertido a texto para el TextInput
    setEditVendedor(producto.vendedor);
    setEditCategoria(producto.categoria);
    setModalVisible(true);
  };
  // =========================================================

  const guardarEdicion = () => {
    if (!editNombre || !editPrecio || !editVendedor) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    editarProducto(idEditando, editNombre, editPrecio, editCategoria, editVendedor);
    setModalVisible(false);
    Alert.alert('Éxito', 'Producto actualizado correctamente');
  };

  return (
    <View style={styles.contenedor}>
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <View style={styles.infoContainer}>
              <Text style={styles.nombreProducto}>{item.nombre}</Text>
              
              {/* ========================================================= */}
              {/* RETO 2.3: DATOS EN LA TARJETA                             */}
              {/* ========================================================= */}
              <Text style={styles.textoDetalle}>Precio: ${Number(item.precio).toFixed(2)}</Text>
              <Text style={styles.textoDetalle}>Categoría: {item.categoria}</Text>
              <Text style={styles.textoDetalle}>Vendedor: {item.vendedor}</Text>
              {/* ========================================================= */}
            </View>

            <View style={styles.accionesContainer}>
              <TouchableOpacity style={styles.botonEditar} onPress={() => abrirModalEdicion(item)}>
                <Ionicons name="pencil" size={20} color="#FFF" />
              </TouchableOpacity>

              {/* ========================================================= */}
              {/* RETO 2.4: BOTÓN ELIMINAR                                  */}
              {/* ========================================================= */}
              <TouchableOpacity style={styles.botonEliminar} onPress={() => eliminarProducto(item.id)}>
                <Ionicons name="trash" size={20} color="#FFF" />
              </TouchableOpacity>
              {/* ========================================================= */}
            </View>
          </View>
        )}
      />

      {/* VENTANA EMERGENTE (MODAL) PARA EDITAR */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContenido}>
            <Text style={styles.modalTitulo}>Editar Producto</Text>

            <Text style={styles.label}>Nombre:</Text>
            <TextInput 
              style={styles.input} 
              value={editNombre} 
              onChangeText={setEditNombre} 
            />

            {/* ========================================================= */}
            {/* RETO 2.5: INPUTS DEL MODAL                                */}
            {/* ========================================================= */}
            <Text style={styles.label}>Precio:</Text>
            <TextInput 
              style={styles.input} 
              value={editPrecio} 
              onChangeText={setEditPrecio} 
              keyboardType="numeric"
            />

            <Text style={styles.label}>Vendedor:</Text>
            <TextInput 
              style={styles.input} 
              value={editVendedor} 
              onChangeText={setEditVendedor} 
            />
            {/* ========================================================= */}

            <View style={styles.modalBotones}>
              <TouchableOpacity style={[styles.botonModal, styles.botonCancelar]} onPress={() => setModalVisible(false)}>
                <Text style={styles.textoBotonModal}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.botonModal, styles.botonGuardarModal]} onPress={guardarEdicion}>
                <Text style={styles.textoBotonModal}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#0A0A0A', padding: 15 },
  tarjeta: { backgroundColor: '#1A1A1A', padding: 15, borderRadius: 10, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoContainer: { flex: 1 },
  nombreProducto: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  textoDetalle: { color: '#AAA', fontSize: 14, marginBottom: 2 },
  accionesContainer: { flexDirection: 'row', gap: 10 },
  botonEditar: { backgroundColor: '#A259FF', padding: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  botonEliminar: { backgroundColor: '#FF5959', padding: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContenido: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 10, width: '90%' },
  modalTitulo: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  label: { color: '#CCC', marginBottom: 5, fontSize: 14 },
  input: { backgroundColor: '#333', color: '#FFF', padding: 10, borderRadius: 8, marginBottom: 15 },
  modalBotones: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  botonModal: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  botonCancelar: { backgroundColor: '#444' },
  botonGuardarModal: { backgroundColor: '#A259FF' },
  textoBotonModal: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});